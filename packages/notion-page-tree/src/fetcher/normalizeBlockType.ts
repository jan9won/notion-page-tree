import { Entity, GetBlockResponseWithMetadata } from '../types';

export const normalizeBlockType = (
	entity_type: GetBlockResponseWithMetadata['type']
) => {
	const type: Entity['type'] =
		entity_type === 'child_database'
			? 'database'
			: entity_type === 'child_page'
			? 'page'
			: 'block';
	return type;
};
