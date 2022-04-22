// Redux Core Libraries
import { applyMiddleware, configureStore } from '@reduxjs/toolkit';
import { combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Reducers
import counterReducer, { waiting, resolved, reset } from './counterSlice';
import catReducer from './catSlice';

// Middlewares
import { createDelayActionMiddleware } from './delayActionMiddleware';
import thunkMiddleware, { ThunkDispatch } from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import fetchCatSaga from './fetchCatSaga';
import { createEpicMiddleware } from 'redux-observable';

const delayResetMiddleware = createDelayActionMiddleware({
	onAction: reset(),
	beforeDelayAction: waiting(),
	afterDelayAction: resolved(),
	delayLength: 2000
});

const sagaMiddleware = createSagaMiddleware();

const epicMiddleware = createEpicMiddleware();

// export const store = createStore(
// 	combineReducers({ counter: counterReducer, cat: catReducer }),
// 	composeWithDevTools(
// 		applyMiddleware(
// 			delayResetMiddleware,
// 			sagaMiddleware,
// 			thunkMiddleware,
// 			epicMiddleware
// 		)
// 	)
// );

export const store = configureStore({
	reducer: {
		counter: counterReducer,
		cat: catReducer
	},
	// https://stackoverflow.com/questions/67453208/property-type-is-missing-in-type-asyncthunkactiondevice-number-dispatch
	// middleware: getDefaultMiddleware =>
	// 	getDefaultMiddleware().concat([
	// 		delayResetMiddleware,
	// 		sagaMiddleware,
	// 		thunkMiddleware
	// 	])
	// middleware: [
	// 	delayResetMiddleware,
	// 	sagaMiddleware,
	// 	thunkMiddleware,
	// 	epicMiddleware
	// ],
	enhancers: [
		applyMiddleware(
			delayResetMiddleware,
			sagaMiddleware,
			thunkMiddleware,
			epicMiddleware
		)
	]
});

sagaMiddleware.run(fetchCatSaga);

export type AppGetState = typeof store.getState;
export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
