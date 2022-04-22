import { PayloadAction, AnyAction } from '@reduxjs/toolkit';
import {
	call,
	put,
	takeEvery,
	takeLatest,
	debounce,
	CallEffect,
	PutEffect
} from 'redux-saga/effects';
import { fetchCatImages } from '../../apis/sample/fetchCatImages';
import { fetchRequested, fetchFailed, fetchSucceed, catType } from './catSlice';

function* fetchCat(
	action: PayloadAction<number>
): Generator<
	CallEffect<catType[] | Error> | PutEffect<AnyAction>,
	void,
	catType[]
> {
	const response = yield call(fetchCatImages, action.payload);
	typeof response === typeof Error
		? yield put(fetchFailed())
		: yield put(fetchSucceed(response));
}

function* fetchCatSaga() {
	yield takeLatest(fetchRequested().type, fetchCat);
}

export default fetchCatSaga;
