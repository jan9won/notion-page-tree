import counterReducer, {
	increase,
	decrease,
	reset,
	waiting,
	resolved
} from '../counterSlice';

describe('counter slice', () => {
	const state_1 = counterReducer(undefined, {
		type: undefined,
		payload: undefined
	});
	it('sets initial state', () => {
		expect(state_1).toStrictEqual({
			count: 0,
			operations: 0,
			waiting: false
		});
	});
	const state_2 = counterReducer(state_1, increase(2));
	it('increase 2 counts', () => {
		expect(state_2).toStrictEqual({
			count: 2,
			operations: 1,
			waiting: false
		});
	});
	const state_3 = counterReducer(state_2, decrease(1));
	it('decrease 2 counts', () => {
		expect(state_3).toStrictEqual({
			count: 1,
			operations: 2,
			waiting: false
		});
	});
	const state_4 = counterReducer(state_3, reset());
	it('reset counts', () => {
		expect(state_4).toStrictEqual({
			count: 0,
			operations: 3,
			waiting: false
		});
	});
	const state_5 = counterReducer(state_4, waiting());
	it('set waiting state to true', () => {
		expect(state_5).toStrictEqual({
			count: 0,
			operations: 3,
			waiting: true
		});
	});
	const state_6 = counterReducer(state_5, resolved());
	it('set waiting state to false', () => {
		expect(state_6).toStrictEqual({
			count: 0,
			operations: 3,
			waiting: false
		});
	});
});
