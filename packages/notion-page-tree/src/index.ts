import path from 'path';
import { createFetchQueue, createFetchQueueWatcher } from './fetcher';
import { createPageSearchIndex } from './server/utils/createPageSearchIndex';
import { writeFile, readFile, readdir, lstat, mkdir } from 'fs/promises';
import { setupServer } from './server/setupServer';
import { createRequestParameters } from './fetcher/utils';
import { type Entity, type FlatEntity } from './types';
import type lunr from 'lunr';
import fsExists from './utils/fsExists';
import delay from './utils/delay';
// import { createHash } from 'crypto';

export default class NotionPageTree {
	// Variables holding page data
	page_collection: Record<string, FlatEntity> | undefined;
	root: Entity | undefined;
	search_index: lunr.Index | undefined;
	search_suggestion: string[] | undefined;
	continueLoop: boolean;

	// Request parameters
	fetchIntervalMinutes: number;
	private_file_path: string;
	root_id?: string;
	root_key?: string;

	constructor({
		fetchIntervalMinutes,
		private_file_path,
		root_id,
		root_key
	}: {
		fetchIntervalMinutes: number;
		private_file_path: string;
		root_id?: string;
		root_key?: string;
	}) {
		this.fetchIntervalMinutes = fetchIntervalMinutes;
		this.private_file_path = private_file_path;
		this.root_id = root_id;
		this.root_key = root_key;
		this.continueLoop = true;
	}

	/**
	 * Find Cached Document to Serve Immediately
	 */
	async parseCachedDocument() {
		// If directory doesn't exist, create
		(await fsExists(this.private_file_path))
			? (await lstat(this.private_file_path)).isDirectory()
				? true
				: () => {
						throw new Error(
							`Path ${this.private_file_path} is not a directory.`
						);
				  }
			: await mkdir(this.private_file_path);

		// Look for files
		const readFilePath = await readdir(this.private_file_path);
		const treeFileExists = readFilePath.some(
			fileName => fileName === 'tree.json'
		);
		const collectionFileExists = readFilePath.some(
			fileName => fileName === 'collection.json'
		);

		// If files exist
		if (treeFileExists && collectionFileExists) {
			// Read and parse files
			this.page_collection = JSON.parse(
				(
					await readFile(
						path.resolve(this.private_file_path, 'collection.json')
					)
				).toString()
			) as Record<string, FlatEntity>;
			this.root = JSON.parse(
				(
					await readFile(path.resolve(this.private_file_path, 'tree.json'))
				).toString()
			) as Entity;

			// create search index
			const { idx, tkn } = createPageSearchIndex(this.page_collection, [
				'description',
				'curation'
			]);
			this.search_index = idx;
			this.search_suggestion = tkn;
			await writeFile(
				path.resolve(this.private_file_path, 'search-suggestion.json'),
				JSON.stringify(
					JSON.parse(JSON.stringify(idx.toJSON())).invertedIndex.map(
						(tokenSet: [string, unknown]) => tokenSet[0]
					)
				)
			);
		} else {
			console.log(
				'No previously fetched file. Page data variables will be undefined until the first fetch is completed'
			);
		}
	}

	async fetchOnce() {
		// Create Page Fetcher
		const requestParameters = await createRequestParameters({
			prompt: false, // prompt if parameters don't exist
			writeToEnvFile: false, // write new parameters to local .env file
			forceRewrite: false // prompt and rewrite .env file even if they alread exist
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
		this.page_collection = fetchResult.page_collection;
		this.root = fetchResult.root;

		// write fetch results to local disk for caching
		await writeFile(
			path.resolve(this.private_file_path, 'collection.json'),
			JSON.stringify(this.page_collection)
		);
		await writeFile(
			path.resolve(this.private_file_path, 'tree.json'),
			JSON.stringify(this.root)
		);

		// create search index and write to local disk
		const { idx, tkn } = createPageSearchIndex(this.page_collection, [
			'description',
			'curation'
		]);
		this.search_index = idx;
		this.search_suggestion = tkn;
		await writeFile(
			path.resolve(this.private_file_path, 'search-suggestion.json'),
			JSON.stringify(
				JSON.parse(JSON.stringify(idx.toJSON())).invertedIndex.map(
					(tokenSet: [string, unknown]) => tokenSet[0]
				)
			)
		);
	}

	/**
	 * Create asynchronouse loop, which waits for `fetchIntervalMinutes` after each fetch is completed.
	 */
	async startFetchLoop() {
		while (this.continueLoop) {
			await this.fetchOnce();
			console.log(
				`Waiting ${this.fetchIntervalMinutes} minutes for the next fetch.`
			);
			await delay(1000 * 60 * this.fetchIntervalMinutes);
		}
	}

	/**
	 * Stops fetch loop after current fetch resolves.
	 */
	stopFetchLoop() {
		this.continueLoop = false;
	}

	/**
	 * Setup servers for fetched pages and its search indexes
	 */
	setupServer({ port }: { port: number }) {
		// create server
		return setupServer({
			port: port,
			page_collection: this.page_collection,
			root: this.root,
			search_index: this.search_index,
			search_suggestion: this.search_suggestion
		});
	}
}
