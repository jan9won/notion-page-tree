import NotionPageTree from '../src';
import path from 'path';

(async function main() {
	// Create main class instance.
	const notionPageTree = new NotionPageTree({
		private_file_path: path.resolve('./sample/'),
		createFetchQueueOptions: {
			maxConcurrency: 3, // Current official rate limit is 3 requests per second. Notion api will throw error when you increase this value.
			maxRetry: 2, // "rate_limited" error will not be retried and process will be exited immediately.
			maxRequestDepth: 3, // Depth applied to all the entities.
			maxBlockDepth: 2, // Depth applied to blocks (relative to nearest parent page).
			databaseQueryFilter: {
				// Database query filter.
				property: 'isPublished',
				checkbox: {
					equals: true
				}
			}
		}
	});

	notionPageTree.parseCachedDocument();
	// Look for cached documents in `private_file_path`, assign to Page Data Variables.

	const requestParameters = await notionPageTree.setRequestParameters({
		forceRewrite: false,
		prompt: true
	});
	console.log(
		'Requesting',
		requestParameters.entry_type,
		'with id',
		requestParameters.entry_id
	);
	// Set environment variables that are needed for Notion API.

	const server = notionPageTree.setupServer({ port: 8888 });
	// Setup servers for listing and searching pages. (will respond 503 if pages are undefined)

	await notionPageTree.fetchOnce();
	// Fetch pages asynchronously, then assign results to variables.

	const fetchLoop = notionPageTree.startFetchLoop(1000 * 60 * 5); // 5 minutes
	// Create asynchronouse fetch loop, which waits for some milliseconds between each fetch.

	setTimeout(() => {
		console.log('stopping fetch loop');
		clearInterval(fetchLoop);
		// Stopping fetch loop after current fetch resolves.
		console.log('closing servers');
		server.close();
		// Stopping servers immediately.
	}, 15 * 1000);
})();
