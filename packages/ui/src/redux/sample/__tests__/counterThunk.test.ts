import { store } from '../store';
import {
	increaseRandomNumber_helper,
	increaseRandomNumber
} from '../counterThunk';
import { increase } from '../counterSlice';

describe('counterThunk', () => {
	it('requests for random number', async () => {
		await store.dispatch(increaseRandomNumber({ min: 10, max: 20 }));
		expect(store.getState().counter.count).toStrictEqual(10);
	});
});
