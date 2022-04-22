export const INCREASE = 'counter/increase';
export const DECREASE = 'counter/decrease';
export const RESET = 'counter/reset';
export const WAIT = 'counter/wait';
export const RESOLVE = 'counter/resolve';

export const increase = (amount: number) => ({
	type: 'counter/increase',
	payload: amount
});
export const decrease = (amount: number) => ({
	type: 'counter/decrease',
	payload: amount
});
export const reset = () => ({
	type: 'counter/reset'
});
export const waiting = (time: number) => ({
	type: 'counter/waiting',
	payload: time
});
export const resolved = () => ({
	type: 'counter/resolved'
});
