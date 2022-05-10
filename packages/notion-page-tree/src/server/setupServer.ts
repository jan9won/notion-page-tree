import express from 'express';
import { pageServerHandler } from './handlers/page';
import { searchServerHandler } from './handlers/search';
import { treeServerHandler } from './handlers/tree';
import { suggestionServerHandler } from './handlers/suggestion';
import { type createFetchQueueReturnType } from '../fetcher';
import { type Entity } from '../types';
import type lunr from 'lunr';
const app = express();
const PORT = 8888;

interface setupServerParameters {
	page_collection: createFetchQueueReturnType['page_collection'];
	root: Entity;
	search_index: lunr.Index;
	search_suggestion: string[];
}

export const setupServer = ({
	page_collection,
	root,
	search_index,
	search_suggestion
}: setupServerParameters) => {
	pageServerHandler(app, page_collection);
	treeServerHandler(app, root);
	searchServerHandler(app, search_index);
	suggestionServerHandler(app, search_suggestion);

	app.listen(PORT, () => console.log(`app listening ${PORT}`));
};
