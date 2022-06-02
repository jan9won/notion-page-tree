import { FlatEntity, SubTreeEntity } from '../../types';

export const buildPageTreeToDepth = (
	collection: Record<string, FlatEntity>,
	rootId: string,
	maxDepth = Infinity
) => {
	const root = { ...collection[rootId] } as SubTreeEntity;
	const queue = [] as SubTreeEntity[];
	queue.push(root);
	while (queue.length > 0) {
		const currentNode = queue.shift();
		if (currentNode !== undefined && currentNode.children) {
			currentNode.children = currentNode.children.map(child => {
				if (collection[child as string].depth - root.depth < maxDepth) {
					const childRef = { ...collection[child as string] };
					queue.push(childRef);
					return childRef;
				} else {
					return child;
				}
			});
		}
	}
	return root;
};
