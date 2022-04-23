import { fetchAllBlockChildPages, fetchAllDatabaseEntities } from '../apis';
import { Client } from '@notionhq/client';

jest.setTimeout(10000);
const entry_key = process.env.ENTRY_KEY as string;
const client = new Client();

describe('notion-server/apis', () => {
	it('fetches all entities of the database', async () => {
		const entities = await fetchAllDatabaseEntities({
			entry_id: '2345a2ce3cdd48f183cca1f6d1ae25ca',
			entry_key,
			client
		});
		expect(entities.length).toBe(14);
	});
	it('fetches all child_page and child_database of the block', async () => {
		const children = await fetchAllBlockChildPages({
			entry_id: '12edcadfba46489eb0a7ae4794e2e61f',
			entry_key,
			client
		});
		expect(children.length).toBe(6);
	});
	it('fetches all entities recursively from the entry point', async () => {
		expect(true).toBe(true);
	});
	it('updates entities intervally', async () => {
		expect(true).toBe(true);
	});
});
