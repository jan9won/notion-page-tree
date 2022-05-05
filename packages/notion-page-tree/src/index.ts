import { createFetcher } from './fetcher';
import { createPageSearchIndex } from './search/createSearchIndex';
import { writeFile } from 'fs/promises';
import path from 'path';
import express from 'express';
const app = express();

async function main() {
	// Page Fetcher
	let initialFetch = false;
	const fetcherLoop = async () => {
		// fetch pages
		const fetcher = await createFetcher();

		// write to local files
		await writeFile(
			path.resolve('./src/private/tree.json'),
			JSON.stringify(fetcher.root)
		);
		await writeFile(
			path.resolve('./src/private/collection.json'),
			JSON.stringify(fetcher.page_collection)
		);

		// create search index
		createPageSearchIndex;

		initialFetch = true;
		setTimeout(fetcherLoop, 1000);
	};
	fetcherLoop();

	// Create Servers
	if (initialFetch) {
		app.get('/page', (req, res) => {
			//
		});
		app.get('/page/list', (req, res) => {
			res.sendStatus(200);
		});
		app.get('/page/searchcontent', (req, res) => {
			//
		});
	}
}
main();
