import { setupWorker } from 'msw';
import { treeHandler } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(treeHandler);
