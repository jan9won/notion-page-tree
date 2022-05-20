import type { Config } from '@jest/types';
import path from 'path';

export default async (): Promise<Config.InitialOptions> => {
	return {
		testEnvironment: 'node',
		globalSetup: path.resolve('./tests/globalSetup.js'),
		globalTeardown: path.resolve('./tests/globalTeardown.js'),
		// setupFilesAfterEnv: [path.resolve('./tests/msw-setup.ts')],
		transform: {
			'^.+\\.[tj]sx?$': 'babel-jest'
		},
		testPathIgnorePatterns: ['dist']
	};
};
