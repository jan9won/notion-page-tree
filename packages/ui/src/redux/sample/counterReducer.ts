import { Action } from 'redux';
import { INCREASE, DECREASE, RESET, WAIT, RESOLVE } from './counterActions';

const initialState = {
	count: 0,
	operations: 0,
	waiting: false
};

export default function counterReducer(state = initialState, action: Action) {
	switch (action.type) {
		case INCREASE:
			return {
				...state,
				count: state.count + 1,
				operations: state.operations + 1
			};
		case DECREASE:
			return {
				...state,
				count: state.count - 1,
				operations: state.operations + 1
			};
		case RESET:
			return {
				...state,
				count: 0,
				operations: state.operations + 1
			};
		case WAIT:
			return {
				...state,
				waiting: true
			};
		case RESOLVE:
			return {
				...state,
				waiting: false
			};
		default:
			return state; // no update
	}
}
