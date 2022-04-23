import { GetPagePropertyResponse } from '@notionhq/client/build/src/api-endpoints';
import { Client } from '@notionhq/client';
import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';

export interface Page {
	pageId: string;
	pageProps: GetPagePropertyResponse[];
	pageRecursiveBlocks: BlockObjectResponse[];
	pagePlainText: string;
	pageChildren: Page[];
}

export interface EntryRequestParameters {
	entry_id: string;
	entry_key: string;
	client: Client;
}
export type BlockObjectResponse = Extract<GetBlockResponse, { type: string }>;
export type RichTextItemResponse = Extract<
	BlockObjectResponse,
	{ type: 'paragraph' }
>['paragraph']['rich_text'][0];

interface syncOptions {
	interval: number;
	retryCount: number;
	fetchPageChildren: boolean;
}

export class NotionServer {
	// rootPage: Page;

	buildPageTree() {
		console.log('buildPageTree');
	}
	sync(options: syncOptions) {
		options.interval ? console.log('sync-interval') : console.log('sync');
	}
}
const notionServer = new NotionServer();
notionServer.buildPageTree();
