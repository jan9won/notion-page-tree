import { createFetchQueue, createFetchQueueWatcher } from './fetcher';
import { createPageSearchIndex } from './server/utils/createPageSearchIndex';
import { writeFile, readFile, readdir } from 'fs/promises';
import path from 'path';
import { setupServer } from './server/setupServer';
import lunr from 'lunr';
import { createRequestParameters } from './fetcher/utils';
import { Entity, FlatEntity } from './types';
// import { createHash } from 'crypto';

const fetchIntervalMinutes = 5;
const file_path = path.resolve('./src/private/');
(async function main() {
	let page_collection: Record<string, FlatEntity>;
	let root: Entity;
	let search_index: lunr.Index;
	let search_suggestion: string[];

	// Parse Cached Document to Serve Immediately
	const filePath = await readdir(file_path);
	const treeFileExists = filePath.some(fileName => fileName === 'tree.json');
	const collectionFileExists = filePath.some(
		fileName => fileName === 'collection.json'
	);
	if (treeFileExists && collectionFileExists) {
		page_collection = JSON.parse(
			(await readFile(path.resolve(file_path, 'collection.json'))).toString()
		);
		root = JSON.parse(
			(await readFile(path.resolve(file_path, 'tree.json'))).toString()
		);
		const { idx, tkn } = createPageSearchIndex(page_collection, [
			'description',
			'curation'
		]);
		search_index = idx;
		search_suggestion = tkn;

		setupServer({
			page_collection: page_collection,
			root: root,
			search_index: search_index,
			search_suggestion: search_suggestion
		});
	} else {
		console.log(
			'No previously fetched file. Server is not started until the first fetch is completed'
		);
	}

	// Create Page Fetcher
	const fetcherLoop = async () => {
		console.log('Initiating new fetch interval...');

		const requestParameters = await createRequestParameters({
			prompt: false, // prompt if
			writeToEnvFile: false,
			forceRewrite: false
		});

		const fetchQueue = createFetchQueue({
			requestParameters,
			rootType: 'database',
			maxConcurrency: 3, // Current official rate limit is 3 requests per second. Notion api will throw error when you increase this value.
			maxRetry: 3, // "rate_limited" error will not be retried and process will be exited immediately.
			maxRequestDepth: 3, // depth applied to all the entities.
			maxBlockDepth: 3, // depth. applied to blocks (not page or database)
			databaseQueryFilter: {
				// optional database filter
				property: 'isPublished',
				checkbox: {
					equals: true
				}
			}
		});

		const fetchResult = await createFetchQueueWatcher(fetchQueue);
		page_collection = fetchResult.page_collection;
		root = fetchResult.root;

		// write fetch results to local disk for caching
		await writeFile(path.resolve(file_path, 'tree.json'), JSON.stringify(root));
		await writeFile(
			path.resolve(file_path, 'collection.json'),
			JSON.stringify(page_collection)
		);

		const { idx, tkn } = createPageSearchIndex(page_collection, [
			'description',
			'curation'
		]);
		search_index = idx;
		search_suggestion = tkn;

		// sleep and refresh
		console.log(
			`Waiting ${fetchIntervalMinutes} minutes for the next fetch interval.`
		);
		setTimeout(fetcherLoop, 1000 * 60 * fetchIntervalMinutes);
	};
	fetcherLoop();
})();
