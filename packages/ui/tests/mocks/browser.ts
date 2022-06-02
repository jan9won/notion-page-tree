import { setupWorker } from 'msw';
import handlers from './handlers';
// import fetch from 'cross-fetch';
// global.fetch = fetch;
// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);
