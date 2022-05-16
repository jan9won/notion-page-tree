import express from 'express';
import { pageServerHandler } from './handlers/page';
import { searchServerHandler } from './handlers/search';
import { treeServerHandler } from './handlers/tree';
import { suggestionServerHandler } from './handlers/suggestion';
import { EOL } from 'os';
import { type createFetchQueueReturnType } from '../fetcher';
import { type Entity } from '../types';
import type lunr from 'lunr';
import { stdout } from '../utils/log';
const app = express();

interface setupServerParameters {
	port: number;
	page_collection: createFetchQueueReturnType['page_collection'] | undefined;
	root: Entity | undefined;
	search_index: lunr.Index | undefined;
	search_suggestion: string[] | undefined;
}

export const setupServer = ({
	port,
	page_collection,
	root,
	search_index,
	search_suggestion
}: setupServerParameters) => {
	pageServerHandler(app, page_collection);
	treeServerHandler(app, root);
	searchServerHandler(app, search_index);
	suggestionServerHandler(app, search_suggestion);

	return app.listen(port, () => stdout(`Express server listening ${[port]}.`));
};
