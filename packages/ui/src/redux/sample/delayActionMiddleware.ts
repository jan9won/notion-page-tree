import { Action, Middleware } from 'redux';

interface createDelayActionMiddlewareProps {
	onAction: Action; // action to catch and delay
	beforeDelayAction: Action | undefined; // action dispated before delay
	afterDelayAction: Action | undefined; // action dispated after delay
	delayLength: number; // milliseconds to delay
}

export const createDelayActionMiddleware =
	({
		onAction,
		beforeDelayAction,
		afterDelayAction,
		delayLength
	}: createDelayActionMiddlewareProps): Middleware =>
	store =>
	next =>
	action => {
		if (action.type === onAction.type) {
			beforeDelayAction && store.dispatch(beforeDelayAction);
			setTimeout(() => {
				next(action);
				afterDelayAction && store.dispatch(afterDelayAction);
			}, delayLength);
			return;
		}
		return next(action);
	};
