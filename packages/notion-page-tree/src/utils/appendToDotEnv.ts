import { DotenvParseOutput } from 'dotenv';
import { writeFile } from 'fs/promises';
import { EOL } from 'os';
import { stdout } from './log';

export const appendToDotEnv = async (
	envFilePath: string,
	newEnv: DotenvParseOutput,
	env?: DotenvParseOutput
) => {
	stdout(`Writing new env variables to ${envFilePath}`);

	await writeFile(
		envFilePath,
		Object.entries({
			...env,
			...newEnv
		}).reduce((concat, env) => `${concat}${EOL}${env[0]}=${env[1]}`, '')
	);
};
