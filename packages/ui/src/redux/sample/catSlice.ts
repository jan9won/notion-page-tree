import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface catType {
	breeds: Record<string, unknown>[];
	categories: Record<string, unknown>[];
	id: string;
	url: string;
}

interface initialStateType {
	fetchStatus: 'idle' | 'fetching' | 'errored' | 'succeed';
	cats: catType[];
	page: number;
	limit: number;
}

const initialState = {
	fetchStatus: 'idle',
	cats: [],
	page: 0,
	limit: 10
} as initialStateType;

const catSlice = createSlice({
	name: 'cat',
	initialState: initialState,
	reducers: {
		fetchRequested: state => {
			return {
				...state,
				fetchStatus: 'fetching'
			};
		},
		fetchSucceed: (state, action: PayloadAction<catType[]>) => {
			return {
				...state,
				fetchStatus: 'succeed',
				cats: action.payload
			};
		},
		fetchFailed: state => {
			return {
				...state,
				fetchStatus: 'errored'
			};
		}
	}
});
export default catSlice.reducer;
export const { fetchFailed, fetchRequested, fetchSucceed } = catSlice.actions;
