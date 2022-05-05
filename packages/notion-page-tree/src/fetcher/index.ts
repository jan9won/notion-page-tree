export * from './blocksWithoutChildren';
export * from './createRequestParameters';
export * from './extractPlainTextFromBlock';
export * from './fetchPagesRecursively';
export * from './fetchRootNode';
export * from './getBlockChildrenAll';
export * from './normalizeBlockType';
export * from './queryDatabaseAll';

import { Entity } from '../types';
import { createRequestParameters } from './createRequestParameters';
import { fetchPagesRecursively } from './fetchPagesRecursively';
import { fetchRootNode } from './fetchRootNode';

export async function createFetcher() {
	// get parameters
	const requestParameters = await createRequestParameters({
		prompt: false,
		writeToEnvFile: false,
		forceRewrite: false
	});

	// request for root node
	console.log('Fetching the root node...');
	const root = await fetchRootNode(requestParameters).catch(async () => {
		throw new Error('Above error occured while fetching root node.');
	});
	console.log('Root node is successfully fetched.', `Id is ${root.id}.`);

	// create routines
	const {
		requestPromiseRoutine,
		requestReadyRoutine,
		request_promise_queue,
		request_ready_queue,
		page_collection
	} = fetchPagesRecursively({
		requestParameters,
		root,
		maxConcurrency: 3, // Current official rate limit is 3 requests per second. Notion api will throw error when you increase this value.
		maxRetry: 3, // "rate_limited" error will not be retried and process will be exited immediately.
		maxRequestDepth: 3, // depth applied to all the entities.
		maxBlockDepth: 2 // depth. applied to blocks (not page or database)
	});

	console.log('Fetching pages recursively...');

	// check for routines
	return new Promise<{
		page_collection: typeof page_collection;
		root: Entity;
	}>(resolve => {
		setInterval(() => {
			if (
				request_promise_queue.length === 0 &&
				request_ready_queue.length === 0
			) {
				clearInterval(requestPromiseRoutine);
				clearInterval(requestReadyRoutine);
				resolve({
					page_collection: page_collection,
					root: root
				});
			}
		}, 1000);
	});
}
