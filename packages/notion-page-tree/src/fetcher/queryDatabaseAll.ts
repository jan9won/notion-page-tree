import { Entity } from '../types';
import { RequestParameters } from '../types';

/**
 * Get all entities (with properties) from the database.
 */
export const queryDatabaseAll = async (
	{ entry_id, entry_key, client }: RequestParameters,
	parent: Entity,
	_entity_list: Entity[] = [],
	_cursor: string | undefined = undefined
) => {
	const { results, next_cursor } = await client.databases.query({
		database_id: entry_id,
		auth: entry_key,
		start_cursor: _cursor
	});

	const combinedResults = [
		..._entity_list,
		...results.map(
			result =>
				({
					id: result.id,
					type: 'page',
					metadata: result,
					blockContentPlainText: '',
					children: [],
					depth: parent.depth + 1
				} as Entity)
		)
	] as Entity[];

	next_cursor &&
		queryDatabaseAll(
			{ entry_id, entry_key, client },
			parent,
			combinedResults,
			next_cursor
		);
	return combinedResults;
};
