import express from 'express';
import { pageServerHandler } from './handlers/page';
import { searchServerHandler } from './handlers/search';
import { treeServerHandler } from './handlers/tree';
import { suggestionServerHandler } from './handlers/suggestion';
import { stdout } from '../utils/log';
import { NotionPageTreeDataSet } from '..';
const app = express();

export const setupServer = (port: number, data_set: NotionPageTreeDataSet) => {
	pageServerHandler(app, data_set);
	treeServerHandler(app, data_set);
	searchServerHandler(app, data_set);
	suggestionServerHandler(app, data_set);

	return app.listen(port, () => stdout(`Express server listening ${[port]}.`));
};
