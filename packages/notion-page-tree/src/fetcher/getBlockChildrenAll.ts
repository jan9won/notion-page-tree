import { normalizeBlockType } from '.';
import {
	Entity,
	RequestParameters,
	GetBlockResponseWithMetadata
} from '../types';

/**
 * Get all entities (with properties) from the database.
 */
export const getBlockChildrenAll = async (
	{ entry_id, entry_key, client }: RequestParameters,
	parent: Entity,
	_entity_list: Entity[] = [],
	_cursor: string | undefined = undefined
) => {
	const { results, next_cursor } = await client.blocks.children.list({
		block_id: entry_id,
		auth: entry_key,
		start_cursor: _cursor
	});

	const resultsWithMetadata = results as GetBlockResponseWithMetadata[];

	const combinedResults = [
		..._entity_list,
		...resultsWithMetadata.map(
			result =>
				({
					id: result.id,
					type: normalizeBlockType(result.type),
					metadata: result,
					blockContentPlainText: '',
					children: [],
					depth: parent.depth + 1
				} as Entity)
		)
	] as Entity[];

	next_cursor &&
		getBlockChildrenAll(
			{ entry_id, entry_key, client },
			parent,
			combinedResults,
			next_cursor
		);
	return combinedResults;
};
