export type QueryablePromise<T, E> = Promise<T> &
	queryablePromiseProperties<T, E>;

interface queryablePromiseProperties<T, E> {
	isPending: () => boolean;
	isRejected: () => boolean;
	isFulfilled: () => boolean;
	getResolvedValue: () => T;
	getRejectedValue: () => E;
	getPayloadValue: () => unknown;
}

export function makeQueryablePromise<T, E>(
	promise: Promise<T>,
	payload?: unknown
) {
	// Don't modify any promise that has been already modified.
	// if (promise.isFulfilled) return promise;

	// Set initial state
	let isPending = true;
	let isRejected = false;
	let isFulfilled = false;
	let resolvedValue: T;
	let rejectedValue: E;
	const payloadValue = payload;

	// Observe the promise, saving the fulfillment in a closure scope.
	const result = promise
		.then(v => {
			isFulfilled = true;
			isPending = false;
			resolvedValue = v;
			return v;
		})
		.catch(e => {
			isRejected = true;
			isPending = false;
			rejectedValue = e;
			return e.code;
		}) as QueryablePromise<T, E>;

	result.isFulfilled = () => {
		return isFulfilled;
	};
	result.isPending = () => {
		return isPending;
	};
	result.isRejected = () => {
		return isRejected;
	};
	result.getResolvedValue = () => {
		return resolvedValue;
	};
	result.getRejectedValue = () => {
		return rejectedValue;
	};
	result.getPayloadValue = () => {
		return payloadValue;
	};
	return result;
}
