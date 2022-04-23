import { EntryRequestParameters } from '../';

/**
 * Fetches all child_page and child_database of the page.
 * @param block_key Authorized workspace key of the block.
 * @param block_id Block id without dash(-), found at the end of the database page's url path.
 * @param _children (Internal) Store variable for recursive page fetch.
 * @param _cursor (Internal) Store variable for recursive page fetch.
 * @returns All entities of the database.
 */
export const fetchAllBlockChildPages = async (
	{ entry_id, entry_key, client }: EntryRequestParameters,
	_children: Array<unknown> = [],
	_cursor: string | undefined = undefined
) => {
	const { results, next_cursor } = await client.blocks.children.list({
		block_id: entry_id,
		auth: entry_key,
		start_cursor: _cursor
	});
	next_cursor &&
		fetchAllBlockChildPages(
			{ client, entry_id, entry_key },
			[
				..._children,
				...results.filter(
					result =>
						'type' in result &&
						['child_page', 'child_database'].some(
							type => type === result['type']
						)
				)
			],
			next_cursor
		);
	return [
		..._children,
		...results.filter(
			result =>
				'type' in result &&
				['child_page', 'child_database'].some(type => type === result['type'])
		)
	];
};
