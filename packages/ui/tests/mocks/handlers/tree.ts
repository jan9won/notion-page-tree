import { rest } from 'msw';
import { retrieveSubtree } from 'notion-page-tree/src/server/utils/retrieveSubtree';
import { buildPageTreeToDepth } from 'notion-page-tree/src/server/utils/buildPageTreeToDepth';
import { convertNotionId } from 'notion-page-tree/src/server/utils/convertNotionId';
import { Entity, FlatEntity } from 'notion-page-tree/dist/types';
import tree from '../../../../notion-page-tree/sample/tree.json';
import collection from '../../../../notion-page-tree/sample/collection.json';

export const treeHandler = rest.get<undefined, { id: string }>(
	'http://localhost:8000/tree/:id',
	(req, res, ctx) => {
		const convertedId = convertNotionId(req.params.id, 'dashed');
		let treeDepth;
		try {
			treeDepth = req.url.searchParams.get('depth')
				? parseInt(req.url.searchParams.get('depth'))
				: undefined;
		} catch (e) {
			return res(
				ctx.status(400),
				ctx.text(
					`Query parameter 'depth' should be an integer. Provided ${req.url.searchParams.get(
						'depth'
					)}.`
				)
			);
		}

		return collection
			? req.params.id
				? res(
						ctx.json(
							buildPageTreeToDepth(
								collection as unknown as Record<string, FlatEntity>,
								convertedId,
								treeDepth
							)
						)
				  )
				: res(ctx.status(502))
			: res(ctx.status(503));
	}
);
