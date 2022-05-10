import { Client } from '@notionhq/client';
import { config, DotenvParseOutput } from 'dotenv';
import { resolve } from 'path';
import { EOL } from 'os';
import { askInput, askSelect } from '../../utils/prompt';
import { writeFile } from 'fs/promises';

interface createRequestParametersParameters {
	prompt?: boolean;
	writeToEnvFile?: boolean;
	forceRewrite?: boolean;
}

export type RequestParameters = Awaited<
	ReturnType<typeof createRequestParameters>
>;

export const createRequestParameters = async ({
	prompt = false,
	forceRewrite = false
}: createRequestParametersParameters) => {
	// Try to set local .env file.
	const envFilePath = resolve('.env');
	const envFile = config({ path: envFilePath, override: true }).parsed;

	// Try to read from process.env.
	let NOTION_ENTRY_ID = process.env.NOTION_ENTRY_ID;
	let NOTION_ENTRY_KEY = process.env.NOTION_ENTRY_KEY;
	let NOTION_ENTRY_TYPE = process.env.NOTION_ENTRY_TYPE;

	// If some env does not exist and prompt option is true, or forceRewrite is set to true, ask for user input.
	if (
		forceRewrite ||
		((NOTION_ENTRY_ID === undefined ||
			NOTION_ENTRY_KEY === undefined ||
			NOTION_ENTRY_TYPE === undefined) &&
			prompt)
	) {
		NOTION_ENTRY_ID === undefined &&
			(NOTION_ENTRY_ID = await askInput(
				'entry_id',
				"Enter root block's id",
				true
			));
		NOTION_ENTRY_KEY === undefined &&
			(NOTION_ENTRY_KEY = await askInput(
				'entry_key',
				"Enter root block's key",
				true
			));
		NOTION_ENTRY_TYPE === undefined &&
			(NOTION_ENTRY_TYPE = await askSelect(
				['database', 'page', 'other block'],
				'select entry block"s type'
			));
		// write new variables to package's .env file
		appendToDotEnv(
			envFilePath,
			{ NOTION_ENTRY_ID, NOTION_ENTRY_KEY, NOTION_ENTRY_TYPE },
			envFile ? envFile : undefined
		);
	}

	// if still doesn't exist, throw
	if (
		NOTION_ENTRY_ID === undefined ||
		NOTION_ENTRY_KEY === undefined ||
		NOTION_ENTRY_TYPE === undefined
	) {
		console.log(NOTION_ENTRY_ID, NOTION_ENTRY_KEY, NOTION_ENTRY_TYPE);

		throw new Error("Still can't find env variables.");
	} else {
		// else, return
		return {
			entry_id: NOTION_ENTRY_ID,
			entry_key: NOTION_ENTRY_KEY,
			entry_type: NOTION_ENTRY_TYPE,
			client: new Client()
		};
	}
};

export const appendToDotEnv = async (
	envFilePath: string,
	newEnv: DotenvParseOutput,
	envFile?: DotenvParseOutput
) => {
	console.log(`Writing new variables to ${envFilePath}`);

	await writeFile(
		envFilePath,
		Object.entries({
			...envFile,
			...newEnv
		}).reduce((concat, env) => `${concat}${EOL}${env[0]}=${env[1]}`, '')
	);
};
