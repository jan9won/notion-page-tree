import { type Router } from 'express';
import { createFetchQueueReturnType } from '../../fetcher';
import { convertNotionId } from '../utils/convertNotionId';
export const pageServerHandler = (
	app: Router,
	page_collection: createFetchQueueReturnType['page_collection'] | undefined
) => {
	app.get<{ id: string }>('/page/:id', (req, res) => {
		const convertedId = convertNotionId(req.params.id, 'dashed');
		page_collection
			? req.params.id && convertedId
				? res.send(page_collection[convertedId])
				: res.sendStatus(502)
			: res.sendStatus(503);
	});
};
