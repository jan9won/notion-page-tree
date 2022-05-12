import {
	GetPageResponse,
	GetDatabaseResponse,
	GetBlockResponse,
	QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints';
import { createRequestParameters } from './fetcher/utils';

// Arguments for every API request
export type RequestParameters = Awaited<
	ReturnType<typeof createRequestParameters>
>;

// Plain page without recursive reference link.
export type FlatEntity = FlatCommons & (Page | Database | Block);
export interface FlatCommons {
	id: string;
	depth: number;
	blockContentPlainText: string;
	parent?: string;
	children: string[];
}
// Entity type
// (Union of Page, Database and All Other Blocks)
export type Entity = Commons & (Page | Database | Block);
export interface Commons {
	id: string;
	depth: number;
	blockContentPlainText: string;
	parent?: Entity;
	children: Entity[];
}

// Page types
export type GetPageResponseWithMetadata = Extract<
	GetPageResponse,
	{ last_edited_time: string }
>;
export interface Page {
	type: 'page';
	metadata: GetPageResponseWithMetadata;
}
export type QueryDatabaseResponseWithProperties = Extract<
	QueryDatabaseResponse['results'][0],
	{ properties: unknown }
>;

// Database Types
export type GetDatabaseResponseWithMetadata = Extract<
	GetDatabaseResponse,
	{ last_edited_time: string }
>;
export interface Database {
	type: 'database';
	metadata: GetDatabaseResponseWithMetadata;
}

// Block Types
export type GetBlockResponseWithMetadata = Extract<
	GetBlockResponse,
	{ type: string }
>;
export interface Block {
	type: 'block';
	metadata: GetBlockResponseWithMetadata;
}
