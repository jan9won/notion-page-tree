import { type Router } from 'express';
import { NotionPageTreeDataSet } from '../..';
import { convertNotionId } from '../utils/convertNotionId';
import { retrieveSubtree } from '../utils/retrieveSubtree';
import { buildPageTreeToDepth } from '../utils/buildPageTreeToDepth';
export const treeServerHandler = (
	router: Router,
	data_set: NotionPageTreeDataSet
) => {
	router.get<{ id: string }, unknown, unknown, { depth?: string }>(
		'/tree/:id',
		(req, res) => {
			const convertedId = convertNotionId(req.params.id, 'dashed');
			let treeDepth;
			try {
				treeDepth = req.query.depth ? parseInt(req.query.depth) : undefined;
			} catch (e) {
				res
					.status(400)
					.send(
						`Query parameter 'depth' should be an integer. Provided ${req.query.depth}.`
					);
			}
			// data_set.root
			data_set.page_collection
				? req.params.id
					? res.send(
							// JSON.stringify(
							// 	retrieveSubtree(data_set.root, convertedId, treeDepth)
							// )
							JSON.stringify(
								buildPageTreeToDepth(
									data_set.page_collection,
									convertedId,
									treeDepth
								)
							)
					  )
					: res.sendStatus(502)
				: res.sendStatus(503);
		}
	);
};
