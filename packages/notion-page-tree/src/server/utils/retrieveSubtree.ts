import { Entity, SubTreeEntity } from '../../types';
/**
 * Find child with id and retrieve its subtree to some depth.
 * @param root Root entity to search from.
 * @param id Id of target child to search for.
 * @param maxDepth Depth of target child's own children. If undefined, retrieve the full subtree.
 * @returns Subtree from child to some depth/
 */
export const retrieveSubtree = (
	root: Entity,
	id: string,
	maxDepth?: number
) => {
	// find subtree
	const subTree = findSubtreeWithId(root, id);
	// console.log('subtree', subTree?.id, subTree?.children);

	const result = subTree
		? maxDepth === undefined
			? subTree
			: cutSubtreeToDepth(subTree as SubTreeEntity, maxDepth)
		: root;
	// console.log('result', result.id, result.children);
	return result;
};

const findSubtreeWithId = (root: Entity, id: string) => {
	// BFS
	const search_queue: Entity[] = [];
	let subtree: Entity | undefined = undefined;
	search_queue.push(root);
	while (search_queue.length > 0 && subtree === undefined) {
		const current = search_queue.splice(0, 1)[0];
		if (current.id === id) return (subtree = current);
		search_queue.push(...current.children);
	}
	return subtree;
};

export const cutSubtreeToDepth = (
	root: SubTreeEntity,
	maxDepth: number,
	_currentDepth = 0
) => {
	// DFS
	if (_currentDepth >= maxDepth) {
		root.children = root.children.map(ownChild =>
			typeof ownChild === 'string' ? ownChild : ownChild.id
		);
	} else {
		root.children &&
			root.children.forEach(child => {
				cutSubtreeToDepth(child as SubTreeEntity, maxDepth, _currentDepth + 1);
			});
	}
	return root;
};
