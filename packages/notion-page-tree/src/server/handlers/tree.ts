import { type Router } from 'express';
import { createFetchQueueReturnType } from '../../fetcher';
import { convertNotionId } from '../utils/convertNotionId';
export const treeServerHandler = (
	router: Router,
	root: createFetchQueueReturnType['rootEntity']
) => {
	router.get<{ id: string }>('/tree/:id', (req, res) => {
		!root && res.sendStatus(503);
		const convertedId = convertNotionId(req.params.id, 'dashed');
		!req.params.id || convertedId === false
			? res.sendStatus(502)
			: res.send(JSON.stringify(findSubtreeRecursively(root, convertedId)));
	});
};

const findSubtreeRecursively = (
	root: createFetchQueueReturnType['rootEntity'],
	id: string
) => {
	const subRoot = root.children.find(entity => entity.id === id);
	if (subRoot === undefined) {
		root.children.forEach(child => {
			findSubtreeRecursively(child, id);
		});
	} else {
		return subRoot;
	}
};
