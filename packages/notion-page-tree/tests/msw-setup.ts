// import '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import fetch from 'cross-fetch';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

// set global fetch to node fetch
global.fetch = fetch;

const handlers = [
	// mocking createChildrenRequest.fetchDatabaseAll();
	rest.post<{ filter: QueryDatabaseParameters['filter'] }>(
		'https://api.notion.com/v1/databases/:id/query',
		(req, res, ctx) => {
			req.body.filter;
			return res(ctx.delay(1000), ctx.text('10'));
		}
	),
	// mocking createChildrenRequest.getBlockChildrenAll();
	rest.get<undefined, { id: string }>(
		'https://api.notion.com/v1/blocks/:id/children',
		(req, res, ctx) => {
			req.params.id;
			return res(ctx.delay(1000), ctx.text('10'));
		}
	)
];

// create server instance
const server = setupServer(...handlers);

// Start server before each test suite.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests.
afterEach(() => server.resetHandlers());

// Stop server after each test suite.
afterAll(() => server.close());
