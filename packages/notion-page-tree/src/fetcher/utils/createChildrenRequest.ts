import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import {
	Entity,
	RequestParameters,
	GetBlockResponseWithMetadata
} from '../../types';

export const createChildrenRequest = (
	parent: Entity,
	requestParameters: RequestParameters,
	databaseQueryFilter: QueryDatabaseParameters['filter']
) =>
	parent.type === 'database'
		? queryDatabaseAll({
				RequestParameters: {
					...requestParameters,
					entry_id: parent.id
				},
				parent,
				filter: databaseQueryFilter
		  })
		: getBlockChildrenAll({
				RequestParameters: {
					...requestParameters,
					entry_id: parent.id
				},
				parent
		  });

interface queryDatabaseAllParameters {
	RequestParameters: RequestParameters;
	parent: Entity;
	filter?: QueryDatabaseParameters['filter'];
	_entity_list?: Entity[];
	_cursor?: string;
}

/**
 * Get all entities (with properties) from the database.
 */
const queryDatabaseAll = async ({
	RequestParameters: { entry_id, entry_key, client, entry_type },
	parent,
	filter,
	_entity_list = [],
	_cursor = undefined
}: queryDatabaseAllParameters) => {
	const { results, next_cursor } = await client.databases.query({
		database_id: entry_id,
		auth: entry_key,
		start_cursor: _cursor,
		filter: filter
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
		queryDatabaseAll({
			RequestParameters: { entry_id, entry_key, client, entry_type },
			parent,
			_entity_list: combinedResults,
			_cursor: next_cursor,
			filter: filter
		});
	return combinedResults;
};

interface getBlockChildrenAllParameters {
	RequestParameters: RequestParameters;
	parent: Entity;
	_entity_list?: Entity[];
	_cursor?: string;
}

/**
 * Get all entities (with properties) from the database.
 */
export const getBlockChildrenAll = async ({
	RequestParameters: { entry_id, entry_key, client, entry_type },
	parent,
	_entity_list = [],
	_cursor = undefined
}: getBlockChildrenAllParameters) => {
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
		getBlockChildrenAll({
			RequestParameters: { entry_id, entry_key, client, entry_type },
			parent,
			_entity_list: combinedResults,
			_cursor: next_cursor
		});
	return combinedResults;
};

const normalizeBlockType = (
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
