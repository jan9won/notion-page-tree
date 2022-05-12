import { type Router } from 'express';
import { createFetchQueueReturnType } from '../../fetcher';
import { convertNotionId } from '../utils/convertNotionId';
export const treeServerHandler = (
	router: Router,
	root: createFetchQueueReturnType['rootEntity'] | undefined
) => {
	router.get<{ id: string }>('/tree/:id', (req, res) => {
		const convertedId = convertNotionId(req.params.id, 'dashed');
		root
			? req.params.id && convertedId !== false
				? res.send(JSON.stringify(findSubtreeRecursively(root, convertedId)))
				: res.sendStatus(502)
			: res.sendStatus(503);
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
