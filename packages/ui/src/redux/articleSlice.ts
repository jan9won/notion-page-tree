import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	FlatEntity,
	type SubTreeEntity,
	type Entity
} from 'notion-page-tree/dist/types';

const initialState: InitialStateType = {
	endpointURI: 'localhost:8888',
	rootId: '2345a2ce-3cdd-48f1-83cc-a1f6d1ae25ca',
	tree: {} as SubTreeEntity,
	collection: []
};

interface InitialStateType {
	endpointURI?: string;
	tree: SubTreeEntity;
	collection: FlatEntity[];
	rootId: string;
}

createSlice({
	initialState: initialState,
	name: 'article',
	reducers: {
		setEntpoint(state, action: PayloadAction<{ endpointURI: string }>) {
			return {
				...state,
				endpointURI: action.payload.endpointURI
			};
		},

		setRootId(state, action: PayloadAction<{ rootId: string }>) {
			return {
				...state,
				rootId: action.payload.rootId
			};
		},

		getRecentPages(
			state,
			action: PayloadAction<{ cursor: number; length: number }>
		) {
			//
		},

		getPageTree(
			state,
			action: PayloadAction<{ pageId: string; depth: number }>
		) {
			//
		},

		addToCollection(
			state,
			action: PayloadAction<{ entityObjectArray: FlatEntity[] }>
		) {
			return {
				...state,
				collection: [...state.collection, ...action.payload.entityObjectArray]
			};
		},

		removeFromCollection(
			state,
			action: PayloadAction<{ entityIdArray: string[] }>
		) {
			return {
				...state,
				collection: state.collection.filter(
					entity => !action.payload.entityIdArray.includes(entity.id)
				)
			};
		}
	}
});
