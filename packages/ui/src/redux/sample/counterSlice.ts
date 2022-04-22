import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { increaseRandomNumber_helper } from './counterThunk';

const initialState = {
	count: 0,
	operations: 0,
	waiting: false
};

const counterSlice = createSlice({
	name: 'counter',
	initialState: initialState,
	reducers: {
		increase: (state, action: PayloadAction<number>) => ({
			...state,
			count: state.count + action.payload,
			operations: state.operations + 1
		}),
		decrease: (state, action: PayloadAction<number>) => ({
			...state,
			count: state.count - action.payload,
			operations: state.operations + 1
		}),
		reset: state => ({
			...state,
			count: 0,
			operations: state.operations + 1
		}),
		waiting: state => ({
			...state,
			waiting: true
		}),
		resolved: state => ({
			...state,
			waiting: false
		})
	},
	// adding case reducer for thunk action creator
	extraReducers: builder => {
		builder.addCase(increaseRandomNumber_helper.fulfilled, (state, action) => ({
			...state,
			count: state.count + action.payload,
			waiting: false
		}));
	}
});

export const { increase, decrease, reset, waiting, resolved } =
	counterSlice.actions;
export default counterSlice.reducer;
