import { DotenvParseOutput } from 'dotenv';
import { writeFile } from 'fs/promises';
import { EOL } from 'os';

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
