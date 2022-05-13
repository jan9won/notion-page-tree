import { DotenvParseOutput } from 'dotenv';
import { writeFile } from 'fs/promises';
import { EOL } from 'os';

export const appendToDotEnv = async (
	envFilePath: string,
	newEnv: DotenvParseOutput,
	env?: DotenvParseOutput
) => {
	console.log(`Writing new variables to ${envFilePath}`);

	await writeFile(
		envFilePath,
		Object.entries({
			...env,
			...newEnv
		}).reduce((concat, env) => `${concat}${EOL}${env[0]}=${env[1]}`, '')
	);
};
