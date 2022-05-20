import path from 'path';
import {
	createFetchQueue,
	CreateFetchQueueOptions,
	createFetchQueueWatcher
} from './fetcher';
import { createPageSearchIndex } from './server/utils/createPageSearchIndex';
import { writeFile, readFile, readdir, lstat, mkdir } from 'fs/promises';
import { setupServer } from './server/setupServer';
import {
	NormalizedEntryType,
	type Entity,
	type FlatEntity,
	type RequestParameters
} from './types';
import type lunr from 'lunr';
import fsExists from './utils/fsExists';
import { Client } from '@notionhq/client';
import { askInput, askSelect } from './utils';
import { appendToDotEnv } from './utils/appendToDotEnv';
import dotenv from 'dotenv';
import { EOL } from 'os';
import { stderr, stdout } from './utils/log';
// import { createHash } from 'crypto';

export interface NotionPageTreeParameters {
	private_file_path?: string;
	createFetchQueueOptions?: CreateFetchQueueOptions;
	searchIndexing?: boolean;
}

export interface NotionPageTreeDataSet {
	// Variables holding page data
	page_collection: Record<string, FlatEntity> | undefined;
	root: Entity | undefined;
	search_index: lunr.Index | undefined;
	search_suggestion: string[] | undefined;
}

export default class NotionPageTree {
	// Variables holding page data
	data_set: NotionPageTreeDataSet;

	// constructor initiated variables
	private_file_path: string;
	requestParameters: RequestParameters = {
		client: new Client(),
		entry_id: undefined,
		entry_key: undefined,
		entry_type: undefined
	};
	createFetchQueueOptions: CreateFetchQueueOptions;
	searchIndexing: boolean;
	fetchLoopTimer?: NodeJS.Timeout;

	constructor(options?: NotionPageTreeParameters) {
		this.private_file_path = options?.private_file_path || './';
		this.createFetchQueueOptions = options?.createFetchQueueOptions || {};
		this.searchIndexing = options?.searchIndexing || true;
		this.data_set = {
			page_collection: undefined,
			root: undefined,
			search_index: undefined,
			search_suggestion: undefined
		};
	}

	/**
	 * Find cached documents to serve immediately.
	 */
	async parseCachedDocument() {
		// If directory doesn't exist, create
		(await fsExists(this.private_file_path))
			? (await lstat(this.private_file_path)).isDirectory()
				? true
				: () => {
						throw new Error(
							`Path ${this.private_file_path} is not a directory.`
						);
				  }
			: await mkdir(this.private_file_path);

		// Look for files
		const readFilePath = await readdir(this.private_file_path);
		const treeFileExists = readFilePath.some(
			fileName => fileName === 'tree.json'
		);
		const collectionFileExists = readFilePath.some(
			fileName => fileName === 'collection.json'
		);

		// If files exist
		if (treeFileExists && collectionFileExists) {
			// Read and parse files
			this.data_set.page_collection = JSON.parse(
				(
					await readFile(
						path.resolve(this.private_file_path, 'collection.json')
					)
				).toString()
			) as Record<string, FlatEntity>;
			this.data_set.root = JSON.parse(
				(
					await readFile(path.resolve(this.private_file_path, 'tree.json'))
				).toString()
			) as Entity;

			// create search index
			if (this.searchIndexing) {
				const { idx, tkn } = createPageSearchIndex(
					this.data_set.page_collection,
					['description', 'curation']
				);
				this.data_set.search_index = idx;
				this.data_set.search_suggestion = tkn;
				await writeFile(
					path.resolve(this.private_file_path, 'search-suggestion.json'),
					JSON.stringify(
						JSON.parse(JSON.stringify(idx.toJSON())).invertedIndex.map(
							(tokenSet: [string, unknown]) => tokenSet[0]
						)
					)
				);
			}
		} else {
			stdout(
				`No previously fetched file. Page data variables will be undefined until the first fetch is completed.`
			);
		}
	}

	/**
	 * Look for environment variables that are needed to fetch page tree.
	 * If they don't exist, ask for it.
	 */
	/**
	 * Look for environment variables that are needed to fetch page tree.
	 * @param prompt If variables are missing, prompt user with interactive CLI.
	 * @param forceRewrite Prompt user with interactive CLI even if variables exist.
	 * @returns
	 * client: Notion API client instance.
	 *
	 * entry_id: Root entry's id (any block is allowed).
	 *
	 * entry_key: Root entry's integration key. Create one here (https://www.notion.so/my-integrations). ⚠️ Must be added to the entry block's "share" settings.
	 *
	 * entry_type: 'page' | 'database' | 'block'(all the others)
	 */
	async setRequestParameters({ prompt = false, forceRewrite = false }) {
		// Try to set local .env file.
		const envFilePath = path.resolve('.env');
		const envFile = dotenv.config({ path: envFilePath, override: true }).parsed;

		// Try to read from process.env.
		process.env.NOTION_ENTRY_ID &&
			(this.requestParameters.entry_id = process.env.NOTION_ENTRY_ID);
		process.env.NOTION_ENTRY_KEY &&
			(this.requestParameters.entry_key = process.env.NOTION_ENTRY_KEY);
		process.env.NOTION_ENTRY_TYPE &&
			(this.requestParameters.entry_type = process.env
				.NOTION_ENTRY_TYPE as NormalizedEntryType);

		// If some env does not exist and prompt option is true,
		// Or forceRewrite option is true,
		// Ask for user input.
		if (forceRewrite || prompt) {
			this.requestParameters.entry_id === undefined &&
				prompt &&
				(this.requestParameters.entry_id = await askInput(
					'entry_id',
					"Enter root block's id",
					true
				));
			this.requestParameters.entry_key === undefined &&
				(this.requestParameters.entry_key = await askInput(
					'entry_key',
					"Enter root block's key",
					true
				));
			this.requestParameters.entry_type === undefined &&
				(this.requestParameters.entry_type =
					await askSelect<NormalizedEntryType>(
						['database', 'page', 'block'],
						'select entry block"s type'
					));
			// write new variables to package's .env file
			this.requestParameters.entry_id &&
				this.requestParameters.entry_key &&
				this.requestParameters.entry_type &&
				appendToDotEnv(
					envFilePath,
					{
						NOTION_ENTRY_ID: this.requestParameters.entry_id,
						NOTION_ENTRY_KEY: this.requestParameters.entry_key,
						NOTION_ENTRY_TYPE: this.requestParameters.entry_type
					},
					envFile ? envFile : undefined
				);
			stdout(
				`Reqparams written in .env file${EOL}id : ${this.requestParameters.entry_id}${EOL}key : ${this.requestParameters.entry_key}${EOL}type : ${this.requestParameters.entry_type}`
			);
		}

		// if still doesn't exist, throw
		if (
			this.requestParameters.entry_id === undefined ||
			this.requestParameters.entry_key === undefined ||
			this.requestParameters.entry_type === undefined
		) {
			throw new Error(
				`Can't find environment variables.${EOL}Set ${
					this.requestParameters.entry_id === '' ? `NOTION_ENTRY_ID${EOL}` : ''
				}${
					this.requestParameters.entry_key === ''
						? `NOTION_ENTRY_KEY${EOL}`
						: ''
				}${
					this.requestParameters.entry_type === ''
						? `NOTION_ENTRY_TYPE${EOL}`
						: ''
				}in .env file.${EOL}${EOL}`
			);
		} else {
			// else, return
			return this.requestParameters;
		}
	}

	/**
	 * Fetch pages asynchronously, and then assign results to variables.
	 */
	async fetchOnce() {
		if (
			this.requestParameters.entry_id === undefined ||
			this.requestParameters.entry_key === undefined ||
			this.requestParameters.entry_type === undefined
		) {
			await this.setRequestParameters({ prompt: false, forceRewrite: false });
		}

		const fetchQueue = createFetchQueue({
			...this.createFetchQueueOptions,
			requestParameters: this.requestParameters
		});

		const fetchResult = await createFetchQueueWatcher(fetchQueue);
		this.data_set.page_collection = fetchResult.page_collection;
		this.data_set.root = fetchResult.root;

		// write fetch results to local disk for caching
		await writeFile(
			path.resolve(this.private_file_path, 'collection.json'),
			JSON.stringify(this.data_set.page_collection)
		);
		await writeFile(
			path.resolve(this.private_file_path, 'tree.json'),
			JSON.stringify(this.data_set.root)
		);

		// create search index
		if (this.searchIndexing) {
			const { idx, tkn } = createPageSearchIndex(
				this.data_set.page_collection,
				['description', 'curation']
			);
			this.data_set.search_index = idx;
			this.data_set.search_suggestion = tkn;
			await writeFile(
				path.resolve(this.private_file_path, 'search-suggestion.json'),
				JSON.stringify(
					JSON.parse(JSON.stringify(idx.toJSON())).invertedIndex.map(
						(tokenSet: [string, unknown]) => tokenSet[0]
					)
				)
			);
		}
	}

	/**
	 * Create asynchronouse fetch loop, which waits for `fetchIntervalMinutes` after each fetch is completed.
	 */
	async startFetchLoop(fetchInterval: number) {
		await this.fetchOnce();
		stdout(`Waiting ${fetchInterval} milliseconds for the next fetch.`);
		this.fetchLoopTimer = setTimeout(() => {
			this.startFetchLoop(fetchInterval);
		}, fetchInterval);
	}

	/**
	 * Stop the fetch loop after current fetch is resolved.
	 */
	stopFetchLoop() {
		this.fetchLoopTimer
			? clearTimeout(this.fetchLoopTimer)
			: stderr('fetch loop is not started yet');
	}

	/**
	 * Setup servers that serves fetched pages and its search indexes. See details in readme.
	 */
	setupServer({ port }: { port: number }) {
		// create server
		return setupServer(port, this.data_set);
	}
}
