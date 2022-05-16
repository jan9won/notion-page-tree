import NotionPageTree from '../src';
import path from 'path';

async function simple_use() {
	const notionPageTree = new NotionPageTree();
	// construct main class instance

	const server = notionPageTree.setupServer({ port: 8889 });
	// Setup servers for listing and searching pages. (will respond 503 if pages are not fetched yet)

	await notionPageTree.parseCachedDocument();
	// Look for cached documents in private_file_path.

	await notionPageTree.setRequestParameters({ prompt: true });
	// Set environment variables that are needed for requesting Notion API.

	await notionPageTree.fetchOnce();
	// Fetch pages once asynchronously.

	notionPageTree.startFetchLoop(1000 * 10);
	// Create an asynchronouse fetch loop. Wait for some milliseconds between each fetch.

	setTimeout(() => {
		notionPageTree.stopFetchLoop();
		// Stopping fetch loop immediately.

		server.close();
		// Stopping servers immediately.
	}, 1000 * 30);
}
simple_use();

async function use_more_options() {
	const notionPageTree = new NotionPageTree({
		private_file_path: path.resolve('./results/'), // path to save serialized page data

		searchIndexing: false, // turn off search indexing

		createFetchQueueOptions: {
			maxConcurrency: 3,
			// Current official rate limit is 3 requests per second. Notion api would likely to throw error when you increase this value.

			maxRetry: 2,
			// How many times errored request are retried ("rate_limited" error will wait some minutes before retrying)

			maxRequestDepth: 3,
			// Search depth applied to all the entities.

			maxBlockDepth: 2,
			// Search depth applied only to plain blocks (not page or database, relative depth to the nearest parent page).

			databaseQueryFilter: {
				// Use filters when querying databases (Find details in official notion API).
				property: 'isPublished',
				checkbox: {
					equals: true
				}
			}
		}
	});

	await notionPageTree.parseCachedDocument();
	const server = notionPageTree.setupServer({ port: 8888 });

	await notionPageTree.setRequestParameters({
		prompt: true,
		// Prompt and rewrite .env if parameters don't exist.

		forceRewrite: false
		// Prompt and rewrite .env even if parameters exist.
	});
	await notionPageTree.fetchOnce();

	notionPageTree.startFetchLoop(1000 * 10);

	setTimeout(() => {
		notionPageTree.stopFetchLoop();
		server.close();
	}, 1000 * 30);
}
