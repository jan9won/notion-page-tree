import NotionPageTree from '../src';
import path from 'path';

async function main() {
	const notionPageTree = new NotionPageTree({
		fetchIntervalMinutes: 5,
		private_file_path: path.resolve('./sample/')
	});

	notionPageTree.parseCachedDocument();
	// Look for cached documents in `private_file_path`, assign to Page Data Variables.

	await notionPageTree.fetchOnce();
	// Fetch pages asynchronously, assign results to variables.

	const server = notionPageTree.setupServer({ port: 8888 });
	// Setup servers

	notionPageTree.startFetchLoop();
	// Create asynchronouse fetch loop, which waits for `fetchIntervalMinutes` after each fetch.

	setTimeout(() => {
		console.log('Stopping fetch loop after current fetch resolves.');
		notionPageTree.stopFetchLoop();
		console.log('stopping servers immediately.');
		server.close();
	}, 15 * 1000);
}
main();
