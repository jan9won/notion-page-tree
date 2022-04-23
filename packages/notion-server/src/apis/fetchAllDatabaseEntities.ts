import { EntryRequestParameters } from '../';

/**
 * Fetches all entities of the database.
 * @param { entry_id } EntryRequestParameters.entry_id Database id without dash(-), found at the end of the database page's url path.
 * @param { entry_key } EntryRequestParameters.entry_key Authorized workspace key of the database.
 * @param { client } EntryRequestParameters.client notion client instance
 * @param _entity_list (Internal) Store variable for recursive page fetch.
 * @param _cursor (Internal) Store variable for recursive page fetch.
 * @returns All entities of the database.
 */
export const fetchAllDatabaseEntities = async (
	{ entry_id, entry_key, client }: EntryRequestParameters,
	_entity_list: Array<unknown> = [],
	_cursor: string | undefined = undefined
) => {
	client.databases
		.query({
			database_id: entry_id,
			auth: entry_key,
			start_cursor: _cursor
		})
		.catch(err => err);
	const { results, next_cursor } = await client.databases.query({
		database_id: entry_id,
		auth: entry_key,
		start_cursor: _cursor
	});
	next_cursor &&
		fetchAllDatabaseEntities(
			{ entry_id, entry_key, client },
			[..._entity_list, ...results],
			next_cursor
		);
	return [..._entity_list, ...results];
};
