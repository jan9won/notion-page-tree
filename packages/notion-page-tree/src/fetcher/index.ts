import { NotionClientError } from '@notionhq/client';
import { Entity, FlatEntity, RequestParameters } from '../types';
import { extractPlainTextFromBlock, blocksWithoutChildren } from './utils';
import { makeQueryablePromise, QueryablePromise } from '../utils';
import { flattenEntity } from './utils/flattenEntity';
import requestChildren from './utils/requestChildren';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { stderr, stdout } from '../utils/log';

export interface CreateFetchQueueOptions {
	maxConcurrency?: number;
	maxRequestDepth?: number;
	maxBlockDepth?: number;
	maxRetry?: number;
	databaseQueryFilter?: QueryDatabaseParameters['filter'];
}

export interface CreateFetchQueueParameters extends CreateFetchQueueOptions {
	requestParameters: RequestParameters;
}

/*============================================================================*/
// Fetcher
/*============================================================================*/

/**
 * @param maxBlockDepth
 * Try to keep this variable to 1.
 *
 * This is a relative depth between parent page and a block inside it.
 * Increasing this value will result in better search indexing and nested child page discovery,
 * but it will also increase request count (more than) EXPONENTIALLY.
 * Notion API may throw error as it has broader request rate limits.
 * So if you want to discover nested pages, don't put them under plain blocks, rather put them on the plain level of the parent page.
 * And if you want better search indexing, put search keywords on the root level of the page or put them on the page property.
 */
export const createFetchQueue = ({
	requestParameters,
	maxConcurrency = 3,
	maxRequestDepth = 3,
	maxBlockDepth = 2,
	maxRetry = 3,
	databaseQueryFilter = undefined
}: CreateFetchQueueParameters) => {
	let currentMaxDepth = 0;
	let currentRequestCount = 0;
	let errorTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	// initiate collections
	const request_ready_queue = [] as Array<{
		parentToAssign: Entity;
		parentToRequest: Entity;
		retry: number;
	}>;
	const request_promise_queue = [] as Array<{
		parentToAssign: Entity;
		parentToRequest: Entity;
		children: QueryablePromise<Entity[], NotionClientError>;
		retry: number;
	}>;
	const page_collection = {} as Record<string, FlatEntity>;

	const rootEntity = {
		id: requestParameters.entry_id,
		type: requestParameters.entry_type,
		depth: 0,
		blockContentPlainText: '',
		children: [] as Entity[]
	} as Entity;

	// add root to ready queue
	request_ready_queue.push({
		parentToAssign: rootEntity,
		parentToRequest: rootEntity,
		retry: 0
	});

	// add root to page collection
	page_collection[rootEntity.id] = flattenEntity(rootEntity);

	/*============================================================================*/
	// Job 1 : ready queue => promise queue
	/*============================================================================*/

	const requestReadyRoutine = setInterval(() => {
		if (
			request_ready_queue.length > 0 &&
			request_promise_queue.length < maxConcurrency
		) {
			const slots = maxConcurrency - request_promise_queue.length;
			const new_requests = request_ready_queue.splice(0, slots);
			const new_promises = new_requests.map(request => ({
				parentToAssign: request.parentToAssign,
				parentToRequest: request.parentToRequest,
				children: makeQueryablePromise<Entity[], NotionClientError>(
					requestChildren(
						request.parentToRequest,
						requestParameters,
						databaseQueryFilter
					)
				),
				retry: request.retry
			}));
			currentRequestCount += new_promises.length;
			request_promise_queue.push(...new_promises);
		}
	}, 350); // Rate limit : 3 requests per second

	/*============================================================================*/
	// Job 2 : promise queue => handle setteled
	/*============================================================================*/

	const requestPromiseRoutine = setInterval(() => {
		if (request_promise_queue.length > 0) {
			// for each responded child
			request_promise_queue.forEach((promise, idx) => {
				// handle [ rejected ]
				if (promise.children.isRejected()) {
					const rate_limited =
						promise.children.getRejectedValue().code === 'rate_limited';

					if (!rate_limited) {
						stdout(`Retrying rejected request.`);
						promise.retry < maxRetry
							? request_ready_queue.unshift({
									parentToAssign: promise.parentToAssign,
									parentToRequest: promise.parentToRequest,
									retry: promise.retry + 1
							  })
							: stderr(
									`Max retry count reached requesting children of ${promise.parentToRequest.type} ${promise.parentToRequest.id}.`
							  );
						// remove from promise queue
						request_promise_queue.splice(idx, 1);
					}

					if (rate_limited) {
						stdout(`Flushing promise queue and waiting 3 minutes from now...`);
						const previousConcurrency = maxConcurrency;
						maxConcurrency = 0;
						request_ready_queue.push(
							...request_promise_queue.splice(idx, 1).map(promise => ({
								parentToAssign: promise.parentToAssign,
								parentToRequest: promise.parentToRequest,
								retry: promise.retry
							}))
						);
						// reset error delay timer
						errorTimeout && clearTimeout(errorTimeout);
						errorTimeout = setTimeout(() => {
							stdout(`Restarting request...`);
							maxConcurrency = previousConcurrency;
						}, 1000 * 60 * 3);
					}
				}

				// handle [ fulfilled ]
				if (promise.children.isFulfilled()) {
					promise.children.getResolvedValue().forEach(child => {
						// update max depth, report
						if (currentMaxDepth < child.depth) {
							currentMaxDepth = child.depth;
							stdout(
								`Request depth reached ${currentMaxDepth}, with ${
									Object.keys(page_collection).length
								} pages traversed, ${currentRequestCount} requests made, and ${
									request_ready_queue.length
								} left to be requested.`
							);
						}

						// when child is page or database
						if (child.type === 'database' || child.type === 'page') {
							// push child to parent
							promise.parentToAssign.children.push(child);
							page_collection[promise.parentToAssign.id].children.push(
								child.id
							);
							// add to page collection
							page_collection[child.id] = flattenEntity(child);

							// push new requests
							child.depth < maxRequestDepth && // (if not reached page depth limit)
								request_ready_queue.push({
									parentToAssign: child,
									parentToRequest: child,
									retry: 0
								});
						}

						// when child is block (not page or database)
						if (child.type === 'block') {
							const plainText = extractPlainTextFromBlock(child.metadata);
							page_collection[
								promise.parentToAssign.id
							].blockContentPlainText += `${plainText} `;

							// push new requests
							child.depth - promise.parentToAssign.depth < maxBlockDepth && // (if not reached relative block depth limit)
								child.depth < maxRequestDepth && // (if not reached page depth limit)
								blocksWithoutChildren.some(
									type => type !== child.metadata.type
								) && // (if the block can have children)
								request_ready_queue.push({
									// block content should be assigned to the nearest parent
									parentToAssign: promise.parentToAssign,
									parentToRequest: child,
									retry: 0
								});
						}
					});
					// remove from promise queue
					request_promise_queue.splice(idx, 1);
				}
			});
		}
	});

	return {
		requestReadyRoutine,
		requestPromiseRoutine,
		request_ready_queue,
		request_promise_queue,
		page_collection,
		rootEntity
	};
};

export type createFetchQueueReturnType = ReturnType<typeof createFetchQueue>;

/*============================================================================*/
// Fetcher Watcher
/*============================================================================*/

export function createFetchQueueWatcher({
	requestReadyRoutine,
	requestPromiseRoutine,
	request_ready_queue,
	request_promise_queue,
	page_collection,
	rootEntity
}: createFetchQueueReturnType) {
	stdout(`Waiting for fetch queue to resolve...`);

	// check for routines
	return new Promise<{
		page_collection: typeof page_collection;
		root: Entity;
	}>(resolve => {
		const fetchQueueWatcher = setInterval(() => {
			if (
				request_promise_queue.length === 0 &&
				request_ready_queue.length === 0
			) {
				clearInterval(requestPromiseRoutine);
				clearInterval(requestReadyRoutine);
				clearInterval(fetchQueueWatcher);
				resolve({
					page_collection: page_collection,
					root: rootEntity
				});
			}
		}, 1000);
	});
}
