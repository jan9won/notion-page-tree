import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppState, AppDispatch, AppGetState } from './store';
import { increase, resolved, waiting } from './counterSlice';
import { getRandomNumberWithRange } from '../../apis/sample/getRandomNumberWithRange';

// thunk action creator (using createAsyncThunk)
export const increaseRandomNumber_helper = createAsyncThunk<
	number, // thunk funcion's return type.
	{ min: number; max: number }, // thunk function's parameter.
	{ state: AppState } //
>(
	// name of action
	'counter/increaseRandom',
	// thunk function
	async ({ min, max }, ThunkAPI) => {
		ThunkAPI.dispatch(waiting());
		return getRandomNumberWithRange(min, max);
	},
	// options
	{
		condition: (arg, api) => {
			const state = api.getState();
			return state.counter.count < 20;
		}
	}
);

// thunk action creator (using existing action creators)
export const increaseRandomNumber =
	(props: { min: number; max: number }) =>
	// thunk function
	async (dispatch: AppDispatch, getState: AppGetState) => {
		const state = getState();
		if (state.counter.count > 20) return;
		dispatch(waiting());
		try {
			const randomNumber = await getRandomNumberWithRange(props.min, props.max);
			dispatch(increase(randomNumber));
		} catch (error) {
			if (error instanceof Error) {
				return {
					errormessage: `Things exploded (${error.message})`
				};
			}
		} finally {
			dispatch(resolved());
		}
	};
