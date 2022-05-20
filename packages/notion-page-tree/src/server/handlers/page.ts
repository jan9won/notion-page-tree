import { type Router } from 'express';
import { NotionPageTreeDataSet } from '../..';
import { convertNotionId } from '../utils/convertNotionId';
export const pageServerHandler = (
	app: Router,
	data_set: NotionPageTreeDataSet
) => {
	app.get<{ id: string }>('/page/:id', (req, res) => {
		// console.log(page_collection);
		const convertedId = convertNotionId(req.params.id, 'dashed');
		data_set.page_collection
			? req.params.id && convertedId
				? res.send(data_set.page_collection[convertedId])
				: res.sendStatus(502)
			: res.sendStatus(503);
	});
};
