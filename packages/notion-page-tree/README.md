# Notion Page Tree
> Fetch nested Notion pages from the root page/database/block.

![npm](https://img.shields.io/npm/v/notion-page-tree)
![size](https://img.shields.io/bundlephobia/minzip/notion-page-tree)
![prettier](https://img.shields.io/badge/codestyle-prettier-brightgreen)

---

- [Notion Page Tree](#notion-page-tree)
	- [Why Would I Want This?](#why-would-i-want-this)
		- [🙌 Use the official Notion API.](#-use-the-official-notion-api)
		- [🕸 Fetch nested children pages.](#-fetch-nested-children-pages)
		- [🛠 Handle API Errors gracefully.](#-handle-api-errors-gracefully)
	- [Other Features](#other-features)
		- [💾 It saves fetch results to your local disk.](#-it-saves-fetch-results-to-your-local-disk)
		- [🥞 It builds basic page server.](#-it-builds-basic-page-server)
		- [🔎 It builds basic page search indexes.](#-it-builds-basic-page-search-indexes)
	- [Advices](#advices)
	- [Usage](#usage)
		- [`.env` File Configuration](#env-file-configuration)
		- [Basic Usage](#basic-usage)
		- [Usage with More Options](#usage-with-more-options)
	- [Entity Data Types](#entity-data-types)
		- [`Entity`](#entity)
		- [`PlainEntity`](#plainentity)
		- [`Page | Database | Block`](#page--database--block)
	- [Fetch Result Data Types](#fetch-result-data-types)
		- [`NotionPageTree.prototype.page_collection`](#notionpagetreeprototypepage_collection)
		- [`NotionPageTree.prototype.root`](#notionpagetreeprototyperoot)
		- [`NotionPageTree.prototype.search_index`](#notionpagetreeprototypesearch_index)
		- [`NotionPageTree.prototype.search_suggestion`](#notionpagetreeprototypesearch_suggestion)
	- [How It Creates Fetch Queue (Flowchart)](#how-it-creates-fetch-queue-flowchart)

---

## Why Would I Want This?
### 🙌 Use the official Notion API.
- Popular `/loadpagechunk/` endpoint is not public and may not be stable in future updates.
- Official API can be integrated with private key, so you can keep your database private.

### 🕸 Fetch nested children pages.
- Pages inside non-page blocks are also fetched.
- Max search-depth can be set in your preference.
- Main fetch loop uses nodejs timers, so it's safe from maxing out recursion depth.

### 🛠 Handle API Errors gracefully.
- Maximum fetch concurrency is set to avoid `rate_limited` error.
- On `rate_limited` error, it stops and waits for some minutes.
- Other errors are automatically retried. Max retry count can be set in your preference.

---

## Other Features
### 💾 It saves fetch results to your local disk.
- Set parameter `private_file_path` to your custom path.

### 🥞 It builds basic page server.
- `/page/:id/` endpoint for retrieving page and its childrens' id.
- `/tree/:id/` endpoint for retrieving all nested pages from the page.
  
### 🔎 It builds basic page search indexes.
- Uses lunr.js.
- Page's properties and chilren are converted into plain text for building search index.
- `/search?keyword=` endpoint for searching page properties and retrieving page ids.
- `/suggestion?keyword=` endpoint for looking for search index's tokens.

---

## Advices
⚠️ This library is not for fetching the whole nested page. 
- This library is for listing nested pages and their properties.
- If you want to render the whole page, use `react-notion-x`.

⚠️ I recommend to keep `maxRequestDepth` lower than 5 and `maxBlockDepth` lower than 2. 
- Increasing max request depth will increase request count exponentially
- If you want to fetch deeply nested pages, don't put them under plain blocks. Rather put them directly on the page's root level.

---

## Usage
> See `./sample/index.ts` for full example file.
	 

### `.env` File Configuration
Write directly on `<package_root>/.env`
```text
NOTION_ENTRY_ID = <root page/database/block's id>
NOTION_ENTRY_KEY = <root's integration key>
NOTION_ENTRY_TYPE = <page/database/block>
```

### Basic Usage
```js
import NotionPageTree from 'notion-page-tree';

async function simple_use() {
	const notionPageTree = new NotionPageTree();
	// construct main class instance

	const server = notionPageTree.setupServer({ port: 8889 });
	// Setup servers for listing and searching pages. (will respond 503 if pages are not fetched yet)

	await notionPageTree.parseCachedDocument();
	// Look for cached documents in private_file_path.

	await notionPageTree.setRequestParameters({ prompt: true });
	// Set environment variables that are needed for requesting Notion API.

	await notionPageTree.fetchOnce();
	// Fetch pages once asynchronously.

	notionPageTree.startFetchLoop(1000 * 10);
	// Create an asynchronouse fetch loop. Wait for some milliseconds between each fetch.

	setTimeout(() => {
		notionPageTree.stopFetchLoop();
		// Stopping fetch loop immediately.

		server.close();
		// Stopping servers immediately.
	}, 1000 * 30);
}
simple_use();
```

### Usage with More Options
```js
import NotionPageTree from 'notion-page-tree';
import path from 'path';

async function use_more_options() {
	const notionPageTree = new NotionPageTree({
		private_file_path: path.resolve('./results/'), // path to save serialized page data

		searchIndexing: false, // turn off search indexing

		createFetchQueueOptions: {
			maxConcurrency: 3,
			// Current official rate limit is 3 requests per second. Notion api would likely to throw error when you increase this value.

			maxRetry: 2,
			// How many times errored request are retried ("rate_limited" error will wait some minutes before retrying)

			maxRequestDepth: 3,
			// Search depth applied to all the entities.

			maxBlockDepth: 2,
			// Search depth applied only to plain blocks (not page or database, relative depth to the nearest parent page).

			databaseQueryFilter: {
				// Use filters when querying databases (Find details in official notion API).
				property: 'isPublished',
				checkbox: {
					equals: true
				}
			}
		}
	});

	await notionPageTree.parseCachedDocument();
	const server = notionPageTree.setupServer({ port: 8888 });

	await notionPageTree.setRequestParameters({
		prompt: true,
		// Prompt and rewrite .env if parameters don't exist.

		forceRewrite: false
		// Prompt and rewrite .env even if parameters exist.
	});
	await notionPageTree.fetchOnce();

	notionPageTree.startFetchLoop(1000 * 10);

	setTimeout(() => {
		notionPageTree.stopFetchLoop();
		server.close();
	}, 1000 * 30);
}
```

---

## Entity Data Types
### `Entity`
Entity that has `children` as direct reference.
```typescript
type Entity = Commons & (Page | Database | Block);
interface Commons {
	id: string;
	depth: number;
	blockContentPlainText: string;
	parent?: Entity;
	children: Entity[];
}
```
### `PlainEntity`
Entity that has `children` as id.
```typescript
type FlatEntity = FlatCommons & (Page | Database | Block);
interface FlatCommons {
	id: string;
	depth: number;
	blockContentPlainText: string;
	parent?: string;
	children: string[];
}
```

### `Page | Database | Block`
Notion API's fetch request result for each entity types, with typed properties included.
```ts
export interface Page {
	type: 'page';
	metadata: Extract<GetPageResponse, { last_edited_time: string }>;
}
export interface Database {
	type: 'database';
	metadata: Extract<GetDatabaseResponse, { last_edited_time: string }>;
}
export interface Block {
	type: 'block';
	metadata: Extract<GetBlockResponse, { type: string }>;
}
```

---
## Fetch Result Data Types

### `NotionPageTree.prototype.page_collection`
Key, value collection of `id` and `PlainEntity`
```ts
page_collection: Record<string, FlatEntity> | undefined;
```

### `NotionPageTree.prototype.root`
Root `Entity` that has nested children `Entity`s.
```ts
root: Entity | undefined;
```

### `NotionPageTree.prototype.search_index`
`lunr.Index` built with `page_collection` entities' `blockContentPlainText`.
```ts
search_index: lunr.Index | undefined;
```

### `NotionPageTree.prototype.search_suggestion`
Search tokens extracted from `lunr.Index`.
```ts
search_suggestion: string[] | undefined;
```

---
## How It Creates Fetch Queue (Flowchart)
<div style="overflow-x: scroll !important; white-space: pre-wrap !important; width: 100%">
<pre style="display: inline-block;">
<code>/******************************************************************************************************************************************************************************************************************************************************************************************************************************\
*                                                                                                                                                                                                                                                                                                                              *
*                                                                                                                                                                                                                                                                                                                              *
*                                                                                                                                                                                                                                                                                                                              *
*                                                                                                                                                                                                                                                                                                                              *
*    ┏━━━━━━━Main Routine━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓                                                                                                                                                *
*    ┃                                                                                                                                                                        ┃                                                                                                                                                *
*    ┃                                                                                                                                                                        ┃                                                                                                                                                *
*    ┃                                          ┌───────────────────────┐                                                           ┌───────────────────────┐                 ┃                                                                                                                                                *
*    ┃                                     ┌───▶│    page_collection    │                                        ┌clearTimeout()───▶│ Request Promise Timer │                 ┃                                                                                                                                                *
*    ┃                                     │    └───────────────────────┘                                        │                  └───────────────────────┘                 ┃                                                                                                                                                *
*    ┃                                     │                                                  Λ                  │                                                            ┃                                                                                                                                                *
*    ┃                                     │    ┌───────────────────────┐                    ╱ ╲                 │                  ┌───────────────────────┐                 ┃                                                                                                                                                *
*    ┃                                     ├───▶│       page_tree       │                   ╱   ╲                ├clearTimeout()───▶│  Request Ready Timer  │                 ┃                                                                                                                                                *
*    ┃                                     │    └───────────────────────┘                  ╱     ╲               │                  └───────────────────────┘                 ┃                                                                                                                                                *
*    ┃                                     │                                              ╱       ╲              │                                                            ┃                                                                                                                                                *
*    ┃                                     │    ┌───────────────────────┐                ╱  check  ╲             │                  ┌─────────────────┐                       ┃                                                                                                                                                *
*    ┃                                     ├───▶│ Request Promise Queue │──────┐        ╱  routine  ╲            │   ┌───update ───▶│ page_collection │                       ┃                                                                                                                                                *
*    ┃        ┌───────────────────────┐    │    └───────────────────────┘      │       ╱      ↻      ╲           │   │              └─────────────────┘                       ┃                                                                                                                                                *
*    ┃        │    Fetcher Routine    │────┤                                   ├─────▶▕  promise = 0  ▏──┬─true──┼───┤                                                        ┃                                                                                                                                                *
*    ┃        └───────────────────────┘    │    ┌───────────────────────┐      │       ╲  ready = 0  ╱   │       │   │              ┌─────────────────┐                       ┃                                                                                                                                                *
*    ┃                    ▲                ├───▶│  Request Ready Queue  │──────┘        ╲     ↻     ╱    │       │   └───update────▶│    page_tree    │                       ┃                                                                                                                                                *
*    ┃                    │                │    └───────────────────────┘                ╲   0ms   ╱     │       │                  └─────────────────┘                       ┃                                                                                                                                                *
*    ┃                    │                │                                              ╲       ╱      │       │                                                            ┃                                                                                                                                                *
*    ┃                    │                │    ┌───────────────────────┐                  ╲     ╱       │       │                                                            ┃                                                                                                                                                *
*    ┃                    │                ├───▶│ Request Promise Timer │                   ╲   ╱        │       └──────────────────▶ wait for some minutes ─ ─ ┐             ┃                                                                                                                                                *
*    ┃                    │                │    └───────────────────────┘                    ╲ ╱         │                                                                    ┃                                                                                                                                                *
*    ┃                    │                │                                                  V          │                                                      │             ┃                                                                                                                                                *
*    ┃                    │                │    ┌───────────────────────┐                     ▲          │                                                                    ┃                                                                                                                                                *
*    ┃                    │                └───▶│  Request Ready Timer  │                     └──false───┘                                                      │             ┃                                                                                                                                                *
*    ┃                    │                     └───────────────────────┘                                                                                                     ┃                                                                                                                                                *
*    ┃                    │                                                                                                                                     │             ┃                                                                                                                                                *
*    ┃                    │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  create new fetcher routine ◀ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─              ┃                                                                                                                                                *
*    ┃                                                                                                                                                                        ┃                                                                                                                                                *
*    ┗━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                                                                                                                                                *
*                                                                                                                                                                                                                                                                                                                              *
*                         │                                                                                                                                                                                                                                                                                                    *
*                                                                                                                                                                                                                                                                                                                              *
*                         │                                                                                                                                                                                                                                                                                                    *
*                                                                                                                                                                                                                                                                                                                              *
*     ┏━━━Fetcher Routine━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    *
*     ┃                                                                                                                                                                                                  ┌─.plaintext += plaintext────────────────────────────────────────────────────┐                                   ┃    *
*     ┃                                                                                                                                                                                                  │                                                                            │                                   ┃    *
*     ┃                                                                                                                                                                     ╔══════════════════════════╗ │                                      ╔══════════════════════╗              │                                   ┃    *
*     ┃                                                                                                                       ┌──false───┐                                  ║  Promise (resolved)      ║ ├─.children.push()┐                    ║Connector             ║              │                                   ┃    *
*     ┃                                                                                    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │          │                                  ║┌───────────────────────┐ ║ │                 │                    ║ ┌──────────────────┐ ║              │                                   ┃    *
*     ┃                                                                                    ┃   Request Promise Queue        ┃ │          │                                  ║│parentToAssign: Entity │◀──┘       ┌──────────────────┐           ║ │toAssigned: itself│ ║              │                                   ┃    *
*     ┃                                                                                    ┃ ╔══════════════════════════╗   ┃ │          Λ                                  ║└───────────────────────┘ ║   ┌────▶│ is Page/Database │──create──▶║ └──────────────────┘ ║──────────────│─────────────────┐                 ┃    *
*     ┃                                                                                    ┃ ║  Promise (pending)       ║   ┃ │         ╱ ╲                                 ║┌───────────────────────┐ ║   │     └──────────────────┘           ║┌────────────────────┐║              │                 │                 ┃    *
*     ┃       ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓                                          ┃ ║ ┌───────────────────────┐║   ┃ │        ╱   ╲                                ║│parentToRequest: Entity│ ║   │                      │             ║│toRequested: itself │║              │                 │                 ┃    *
*     ┃       ┃  New Requests                 ┌──────────────────────────────────────────────╬▶│parentToAssign: Entity │║   ┃ │       ╱     ╲            ┌──────────────┐   ║└───────────────────────┘ ║   │                      │             ║└────────────────────┘║              │                 │                 ┃    *
*     ┃       ┃ ╔═════════════════════════╗   │ ┃ ┌──────────────────────────────────────┐ ┃ ║ └───────────────────────┘║...┃ │      ╱       ╲       ┌──▶│ is Fulfilled │──▶║┌───────────────────────┐ ║   │                      │             ╚══════════════════════╝              │                 │                 ┃    *
*     ┃       ┃ ║┌───────────────────────┐║   │ ┃ │                                      │ ┃ ║ ┌───────────────────────┐║   ┃ │     ╱  set    ╲      │   └──────────────┘   ║│       children:       │ ║   │                      │                                                   │                 │                 ┃    *
*     ┃       ┃ ║│parentToAssign: Entity │╠───┘ ┃ │   ┌─────────────┐    List Block      └─╋─╬▶│parentToRequest: Entity│║   ┃ │    ╱ interval  ╲     │                      ║│   QueryablePromise    │─╬───┤                      │                                         ┌──────────────────┐        │                 ┃    *
*     ┃       ┃ ║└───────────────────────┘║     ┃ ├──▶│is Block/Page│───▶Children()─────┐  ┃ ║ └───────────────────────┘║   ┃ │   ╱      ↻      ╲    │                      ║│       Entity[]        │ ║   │                      │       extractPlainText                  │   Concatenated   │        │                 ┃    *
*     ┃       ┃ ║┌───────────────────────┐║ ... ┃ │   └─────────────┘                   │  ┃ ║ ┌───────────────────────┐║   ┃─┴─▶▕  promise > 0  ▏───┤                      ║└───────────────────────┘ ║   │                      │    ┌─▶   FromBlock    ────▶.reduce()───▶│    Plain Text    │        │                 ┃    *
*     ┃       ┃ ║│parentToRequest: Entity│╠───────┘                                 .push()┃ ║ │       children:       │║   ┃     ╲ isSetteled  ╱    │   ┌──────────────┐   ║┌───────────────────────┐ ║   │                      │    │                                    └──────────────────┘        │                 ┃    *
*     ┃       ┃ ║└───────────────────────┘║     ┃ │   ┌─────────────┐      Query        ┌────╬▶│   QueryablePromise    │║   ┃      ╲     ↻     ╱     └──▶│ is Rejected  │   ║│     retry: number     │ ║   │                      │    │                                                                │                 ┃    *
*     ┃       ┃ ║┌───────────────────────┐║     ┃ └──▶│ is Database │───▶Database()─────┘  ┃ ║ │       Entity[]        │║   ┃       ╲   0ms   ╱          └──────────────┘   ║└───────────────────────┘ ║   │     ┌────────────────│─┐  │                                                                │                 ┃    *
*     ┃       ┃ ║│     retry: number     │║     ┃     └─────────────┘                      ┃ ║ └───────────────────────┘║   ┃        ╲       ╱                    │         ╚══════════════════════════╝   └────▶│     is Block   │ │──┤                     ┌──────────────────┐                       │                 ┃    *
*     ┃       ┃ ║└───────────────────────┘║     ┃                                          ┃ ║ ┌───────────────────────┐║   ┃         ╲     ╱                     │                                              └────────────────│─┘  │                     │  is in Traverse  │                       │                 ┃    *
*     ┃       ┃ ╚═════════════════════════╝     ┃                                          ┃ ║ │     retry: number     │║   ┃          ╲   ╱                      │               set maxConcurrency to 0                         │    │               ┌────▶│  Exclusion List  │           ╔═══════════╬══════════╗      ┃    *
*     ┃       ┗━━━━━━━━━━━━━━▲━━━━━━━━━━━━━━━━━━┛                                          ┃ ║ └───────────────────────┘║   ┃           ╲ ╱                       ▼               empty promise_queue                             │    │               │     └──────────────────┘           ║Connector  │          ║      ┃    *
*     ┃                      │                                                             ┃ ╚══════════════════════════╝   ┃            V                  rate_limited──true──▶ move promises to ready_queue                    │    └─▶.filter()────┤     ┌──────────────────┐           ║ ┌─────────┴────────┐ ║      ┃    *
*     ┃                      │                                                             ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                                     │               wait for some minutes                           │                    │     │is NOT in Traverse│           ║ │toAssigned: PARENT│ ║      ┃    *
*     ┃                      │                                                                                                                                    │               set maxConcurrency to 3                         │                    └────▶│  Exclusion List  │──create──▶║ └─────────┬────────┘ ║      ┃    *
*     ┃                      │                                                                                      ╔═════════════════════════╗                 false                                                             │                          └──────────────────┘           ║┌──────────┴─────────┐║      ┃    *
*     ┃                      │                                                                                      ║┌───────────────────────┐║                   │                                                               │                                                         ║│toRequested: itself │║      ┃    *
*     ┃            .splice(concurrency -                                                                            ║│parentToAssign: Entity │║                   │                                                               │                                                         ║└──────────┬─────────┘║      ┃    *
*     ┃               promise.length)                                                                               ║└───────────────────────┘║                   ▼                                                               │                                                         ╚═══════════╬══════════╝      ┃    *
*     ┃                      │                                                                                      ║┌───────────────────────┐║               retry <                                                             │                                                                     │                 ┃    *
*     ┃                      │                                                                               ┌──────║│parentToRequest: Entity│║◀───true───── retryCount ──false──▶ console.error                                  │                                                                     │                 ┃    *
*     ┃                      │                                                                               │      ║└───────────────────────┘║                                                                                   │                                                                     │                 ┃    *
*     ┃                      │                                                                               │      ║┌───────────────────────┐║                                                                                   │                                                                     │                 ┃    *
*     ┃                      │                         ┌──false───┐                                          │      ║│      retry: +=1       │║                                                                                   │                                                                     │                 ┃    *
*     ┃                      │                         │          │                                          │      ║└───────────────────────┘║                                                                                   │                                                                     │                 ┃    *
*     ┃                      │                         │          │                                     .unshift()  ╚═════════════════════════╝                                                                                   │                                                                     │                 ┃    *
*     ┃                      │                         Λ          │                                          ▼                                                                                                                    │                                                                     │                 ┃    *
*     ┃                      │                        ╱ ╲         │            ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓                                                                                      │                                                                     │                 ┃    *
*     ┃                      │                       ╱   ╲        │            ┃  Request Ready Queue                                      ┃                                                                                      │                                                                     │                 ┃    *
*     ┃                      │                      ╱     ╲       │            ┃ ╔═════════════════════════╗ ╔═════════════════════════╗   ┃                                                                                      │                                                                     │                 ┃    *
*     ┃                      │                     ╱       ╲      │            ┃ ║┌───────────────────────┐║ ║┌───────────────────────┐║   ┃                                                                                      │                                                                     │                 ┃    *
*     ┃                      │                    ╱  check  ╲     │            ┃ ║│parentToAssign: Entity │║ ║│parentToAssign: Entity │║   ┃                                                                                      │                                                                     │                 ┃    *
*     ┃                      │                   ╱  routine  ╲    │            ┃ ║└───────────────────────┘║ ║└───────────────────────┘║   ┃                                                                                      │                                                                     │                 ┃    *
*     ┃                      │                  ╱      ↻      ╲   │            ┃ ║┌───────────────────────┐║ ║┌───────────────────────┐║...┃                                                                                      │                                                                     │                 ┃    *
*     ┃                      └──────true───────▕  ready > 0    ▏◀─┴────────────┃ ║│parentToRequest: Entity│║ ║│parentToRequest: Entity│║   ┃◀────────────.push()──────────────────────────────────────────────────────────────────│─────────────────────────────────────────────────────────────────────┘                 ┃    *
*     ┃                                         ╲ promise < 3 ╱                ┃ ║└───────────────────────┘║ ║└───────────────────────┘║   ┃                                                                                      │                                                                                       ┃    *
*     ┃                                          ╲           ╱                 ┃ ║┌───────────────────────┐║ ║┌───────────────────────┐║   ┃                                                                                      │                                                                                       ┃    *
*     ┃                                           ╲    ↻    ╱                  ┃ ║│       retry: 0        │║ ║│       retry: 0        │║   ┃                                                                                      │                                                                                       ┃    *
*     ┃                                            ╲ 250ms ╱                   ┃ ║└───────────────────────┘║ ║└───────────────────────┘║   ┃                                                                                      │                                                                                       ┃    *
*     ┃                                             ╲     ╱                    ┃ ╚═════════════════════════╝ ╚═════════════════════════╝   ┃                                                                                      │                                                                                       ┃    *
*     ┃                                              ╲   ╱                     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                                                                                      │                                                                                       ┃    *
*     ┃                                               ╲ ╱                                                    ▲                                                                                                                    │                                                                                       ┃    *
*     ┃                                                V                                                     │                    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓                                                                    │                                                                                       ┃    *
*     ┃                                                                                                   (init)                  ┃  Page Collection         ┃                                                                    │                                                                                       ┃    *
*     ┃                                                                                                      │                    ┃ ┌────╦═════════════════╗ ┃                                                                    │                                                                                       ┃    *
*     ┃                                                                                                      │                    ┃ │ id ║  page: Entity   ║ ┃                                                                    │                                                                                       ┃    *
*     ┃                                                                                                      │                    ┃ └────╩═════════════════╝ ┃                                                                    │                                                                                       ┃    *
*     ┃                                                                                            ┌──────────────────┐           ┃ ┌────╦═════════════════╗ ┃                                                                    │                                                                                       ┃    *
*     ┃                                                                                            │       ROOT       │───(init)─▶┃ │ id ║  page: Entity   ║ ┃◀────────────assign with key────────────────────────────────────────┘                                                                                       ┃    *
*     ┃                                                                                            └──────────────────┘           ┃ └────╩═════════════════╝ ┃                                                                                                                                                            ┃    *
*     ┃                                                                                                      │                    ┃ ┌────╦═════════════════╗ ┃                                                                                                                                                            ┃    *
*     ┃                                                                                                                           ┃ │ id ║  page: Entity   ║ ┃                                                                                                                                                            ┃    *
*     ┃                                                                                                      │                    ┃ └────╩═════════════════╝ ┃                                                                                                                                                            ┃    *
*     ┃                                                                                                                           ┃           ....           ┃                                                                                                                                                            ┃    *
*     ┃                                                                                                      │                    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛                                                                                                                                                            ┃    *
*     ┃                                                                                                                                         │                                                                                                                                                                         ┃    *
*     ┃                                                                                                      └ ─ ─ ─ ─ ─ ─ ─ ┬ ─ ─ ─ ─ ─ ─ ─ ─ ─                                                                                                                                                                          ┃    *
*     ┃                                                                                                                                                                                                                                                                                                                   ┃    *
*     ┃                                                                                                                      │                                                                                                                                                                                            ┃    *
*     ┃                                                                                                          ╔══════════════════════╗                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║ Entity               ║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║┌────────────────────┐║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│     id: string     │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║└────────────────────┘║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║┌────────────────────┐║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│   depth: number    │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║└────────────────────┘║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║┌────────────────────┐║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│       type:        │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│ 'page'|'database'| │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│      'block'       │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║└────────────────────┘║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║┌────────────────────┐║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│     metadata:      │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│GetBlockResponseWith│║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│      Metadata      │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║└────────────────────┘║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║┌────────────────────┐║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│     plainText:     │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│extractPlainText(...│║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│     children)      │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║└────────────────────┘║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║┌────────────────────┐║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║│ children: Entity[] │║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ║└────────────────────┘║                                                                                                                                                                                 ┃    *
*     ┃                                                                                                          ╚══════════════════════╝                                                                                                                                                                                 ┃    *
*     ┃                                                                                                                                                                                                                                                                                                                   ┃    *
*     ┃                                                                                                                                                                                                                                                                                                                   ┃    *
*     ┃                                                                                                                                                                                                                                                                                                                   ┃    *
*     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    *
*                                                                                                                                                                                                                                                                                                                              *
*                                                                                                                                                                                                                                                                                                                              *
*                                                                                                                                                                                                                                                                                                                              *
*                                                                                                                                                                                                                                                                                                                              *
\******************************************************************************************************************************************************************************************************************************************************************************************************************************/</code></pre>
</div>