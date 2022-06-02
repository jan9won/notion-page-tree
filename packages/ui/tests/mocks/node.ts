// import '@testing-library/react';
import { setupServer } from 'msw/node';
import { treeHandler } from './handlers';
import fetch from 'cross-fetch';
global.fetch = fetch;

// create server instance
const server = setupServer(...[treeHandler]);

// Start server before each test suite.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests.
afterEach(() => server.resetHandlers());

// Stop server after each test suite.
afterAll(() => server.close());
