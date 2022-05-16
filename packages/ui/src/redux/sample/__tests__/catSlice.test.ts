import catReducer, {
	fetchFailed,
	fetchRequested,
	fetchSucceed
} from '../catSlice';

describe('catSlice', () => {
	const state_1 = catReducer(undefined, { type: undefined });

	it('sets initial state', () => {
		expect(state_1).toStrictEqual({
			cats: [],
			fetchStatus: 'idle',
			limit: 10,
			page: 0
		});
	});
	const state_2 = catReducer(state_1, fetchRequested());

	it('fetchRequested() requests 10 cat images', () => {
		expect(state_2.fetchStatus).toStrictEqual('fetching');
	});
	const state_3 = catReducer(
		state_2,
		fetchSucceed([
			{
				url: 'url1',
				breeds: [{}, {}],
				categories: [{}, {}],
				id: '1'
			}
		])
	);

	it('fetchSucceed() sets cats and fetchStatus', () => {
		expect(state_3).toStrictEqual({
			cats: [
				{
					breeds: [{}, {}],
					categories: [{}, {}],
					id: '1',
					url: 'url1'
				}
			],
			fetchStatus: 'succeed',
			limit: 10,
			page: 0
		});
	});
	const state_4 = catReducer(state_3, fetchFailed());

	it('fetchFailed() sets fetchStatus', () => {
		expect(state_4).toStrictEqual({
			cats: [
				{
					breeds: [{}, {}],
					categories: [{}, {}],
					id: '1',
					url: 'url1'
				}
			],
			fetchStatus: 'errored',
			limit: 10,
			page: 0
		});
	});
});
