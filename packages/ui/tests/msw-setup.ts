// import '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import fetch from 'cross-fetch';

// set fetch
global.fetch = fetch;

// msw server handlers
const handlers = [
	rest.get('https://www.random.org/integers/', (req, res, ctx) => {
		return res(ctx.text('10'));
	})
];

// create server instance
const server = setupServer(...handlers);

// Start server before each test suite.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests.
afterEach(() => server.resetHandlers());

// Stop server after each test suite.
afterAll(() => server.close());
