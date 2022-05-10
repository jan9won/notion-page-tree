import { type Router } from 'express';
import { createFetchQueueReturnType } from '../../fetcher';
import { convertNotionId } from '../utils/convertNotionId';
export const pageServerHandler = (
	app: Router,
	page_collection: createFetchQueueReturnType['page_collection']
) => {
	app.get<{ id: string }>('/page/:id', (req, res) => {
		!page_collection && res.sendStatus(503);
		const convertedId = convertNotionId(req.params.id, 'dashed');
		!req.params.id || convertedId === false
			? res.sendStatus(502)
			: res.send(page_collection[convertedId]);
	});
};
