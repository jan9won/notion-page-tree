import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import {
	Entity,
	RequestParameters,
	GetBlockResponseWithMetadata
} from '../../types';

const createChildrenRequest = (
	parent: Entity,
	requestParameters: RequestParameters,
	databaseQueryFilter: QueryDatabaseParameters['filter']
) =>
	parent.type === 'database'
		? queryDatabaseAll({
				requestParameters: {
					...requestParameters,
					entry_id: parent.id,
					entry_type: 'database'
				},
				parent,
				filter: databaseQueryFilter
		  })
		: getBlockChildrenAll({
				requestParameters: {
					...requestParameters,
					entry_id: parent.id,
					entry_type: 'block'
				},
				parent
		  });

interface queryDatabaseAllParameters {
	requestParameters: RequestParameters;
	parent: Entity;
	filter?: QueryDatabaseParameters['filter'];
	_entity_list?: Entity[];
	_cursor?: string;
}

/**
 * Get all entities (with properties) from the database.
 */
const queryDatabaseAll = async ({
	requestParameters,
	parent,
	filter,
	_entity_list = [],
	_cursor = undefined
}: queryDatabaseAllParameters) => {
	if (!requestParameters.entry_id || !requestParameters.entry_key) {
		throw Error(`RequestParameters are incorrect. 
		Please check if the integration key is added to sharing configuration of the database.
		id: ${requestParameters.entry_id}
		key: ${requestParameters.entry_key}`);
	}
	const { results, next_cursor } =
		await requestParameters.client.databases.query({
			database_id: requestParameters.entry_id,
			auth: requestParameters.entry_key,
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
			requestParameters,
			parent,
			_entity_list: combinedResults,
			_cursor: next_cursor,
			filter: filter
		});
	return combinedResults;
};

interface getBlockChildrenAllParameters {
	requestParameters: RequestParameters;
	parent: Entity;
	_entity_list?: Entity[];
	_cursor?: string;
}

/**
 * Get all entities (with properties) from the database.
 */
export const getBlockChildrenAll = async ({
	requestParameters,
	parent,
	_entity_list = [],
	_cursor = undefined
}: getBlockChildrenAllParameters) => {
	if (!requestParameters.entry_id || !requestParameters.entry_key) {
		throw Error(`RequestParameters are incorrect. 
		Please check if the integration key is added to sharing configuration of the database.
		id: ${requestParameters.entry_id}
		key: ${requestParameters.entry_key}`);
	}
	const { results, next_cursor } =
		await requestParameters.client.blocks.children.list({
			block_id: requestParameters.entry_id,
			auth: requestParameters.entry_key,
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
			requestParameters,
			parent,
			_entity_list: combinedResults,
			_cursor: next_cursor
		});
	return combinedResults;
};

/**
 * Reduce block types into three types : page, database and block (all the others)
 */
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

export default createChildrenRequest;
