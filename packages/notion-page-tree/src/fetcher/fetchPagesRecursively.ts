import { Entity, PlainEntity, RequestParameters } from '../types';
import {
	getBlockChildrenAll,
	queryDatabaseAll,
	extractPlainTextFromBlock,
	blocksWithoutChildren
} from '.';
import { makeQueryablePromise, QueryablePromise } from '../utils';
import { EOL } from 'os';

interface fetchPagesRecursivelyProperties {
	requestParameters: RequestParameters;
	root: Entity;
	maxConcurrency?: number;
	maxRequestDepth?: number;
	maxBlockDepth?: number;
	maxRetry?: number;
	pagePropertyNamesToExtract?: string[];
}

/*============================================================================*/
// Main Function
/*============================================================================*/

/**
 * @param maxBlockDepth try to keep it to 1, and read following.
 * This is a relative depth between parent page and a block inside it.
 * Increasing this value will result in better search indexing and nested child page discovery,
 * but it will also increase request count (more than) EXPONENTIALLY.
 * Notion API may throw error as it has broader request rate limits.
 * So if you want to discover nested pages, don't put them under plain blocks, rather put them on the plain level of the parent page.
 * And if you want better search indexing, put search keywords on the root level of the page or put them on the page property.
 */
export const fetchPagesRecursively = ({
	requestParameters,
	root,
	maxConcurrency = 3,
	maxRequestDepth = 5,
	maxBlockDepth = 1,
	maxRetry = 3
}: fetchPagesRecursivelyProperties) => {
	let currentMaxDepth = 0;
	let currentRequestCount = 0;

	// initiate collections
	const request_ready_queue = [] as Array<{
		parentToAssign: Entity;
		parentToRequest: Entity;
		retry: number;
	}>;
	const request_promise_queue = [] as Array<{
		parentToAssign: Entity;
		parentToRequest: Entity;
		children: QueryablePromise<Entity[]>;
		retry: number;
	}>;
	const page_collection = {} as Record<string, PlainEntity>;

	// add root to ready queue
	request_ready_queue.push({
		parentToAssign: root,
		parentToRequest: root,
		retry: 0
	});

	// add root to page collection
	page_collection[root.id] = flattenEntity(root);

	/*============================================================================*/
	// Macro Job 1 : ready queue => promise queue
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
				children: makeQueryablePromise(
					createChildrenRequest(request.parentToRequest, requestParameters)
				),
				retry: 0
			}));
			currentRequestCount += new_promises.length;
			request_promise_queue.push(...new_promises);
		}
	}, 350); // Rate limit : 3 requests per second

	/*============================================================================*/
	// Macro Job 2 : promise queue => handle setteled
	/*============================================================================*/

	const requestPromiseRoutine = setInterval(() => {
		if (request_promise_queue.length > 0) {
			// for each responded child
			request_promise_queue.forEach((promise, idx) => {
				// handle [ rejected ]
				if (promise.children.isRejected()) {
					console.error('Handling rejected request.');
					promise.retry < maxRetry
						? request_ready_queue.unshift({
								parentToAssign: promise.parentToAssign,
								parentToRequest: promise.parentToRequest,
								retry: promise.retry + 1
						  })
						: console.error(
								'Max retry count reached requesting children of',
								promise.parentToRequest.type,
								promise.parentToRequest.id
						  );
					// remove from promise queue
					request_promise_queue.splice(idx, 1);
				}

				// handle [ fulfilled ]
				if (promise.children.isFulfilled()) {
					promise.children.getResolvedValue().forEach(child => {
						// update max depth, report
						if (currentMaxDepth < child.depth) {
							currentMaxDepth = child.depth;
							console.log(
								`${EOL}Request depth reached ${currentMaxDepth}, with ${
									Object.keys(page_collection).length
								} pages traversed, ${currentRequestCount} requests made, and ${
									request_ready_queue.length
								} left to be requested.${EOL}`
							);
						}

						// when child is page or database
						if (child.type === 'database' || child.type === 'page') {
							// push child to parent
							promise.parentToAssign.children.push(child);
							// assign child's id to parent in page collection
							page_collection[promise.parentToAssign.id].children.push(
								child.id
							);
							// add flat child to page collection
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
							// extract plain text from blocks
							const plainText = extractPlainTextFromBlock(child.metadata);
							promise.parentToAssign.blockContentPlainText += `${plainText} `; // add to nearest parent page
							page_collection[
								promise.parentToAssign.id
							].blockContentPlainText += `${plainText} `; // add to parent in page collection

							// push new requests
							// console.log(child.depth - promise.parentToAssign.depth);
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
		root
	};
};

/*============================================================================*/
// Sub Functions
/*============================================================================*/

const createChildrenRequest = (
	parent: Entity,
	requestParameters: RequestParameters
) =>
	parent.type === 'database'
		? queryDatabaseAll(
				{
					...requestParameters,
					entry_id: parent.id
				},
				parent
		  )
		: getBlockChildrenAll(
				{
					...requestParameters,
					entry_id: parent.id
				},
				parent
		  );

/**
 * @param entity entity whose children and parnt are the reference to block.
 * @returns entity whose children and parent are the id of block.
 */
const flattenEntity = (entity: Entity) =>
	({
		...entity,
		parent: entity.parent?.id,
		children: entity.children?.map(child => child.id)
	} as PlainEntity);
