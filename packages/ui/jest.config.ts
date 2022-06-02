import type { Config } from '@jest/types';
import path from 'path';

export default async (): Promise<Config.InitialOptions> => {
	return {
		testEnvironment: 'jsdom',
		globalSetup: path.resolve('./tests/globalSetup.js'),
		globalTeardown: path.resolve('./tests/globalTeardown.js'),
		// preset: 'ts-jest',
		setupFilesAfterEnv: [path.resolve('./tests/mocks/node.ts')],
		transform: {
			// "^.+\\.tsx?$": "ts-jest",
			'^.+\\.[tj]sx?$': 'babel-jest'
		},
		globals: {
			// 'ts-jest': {
			// tsconfig: './src/tests/tsconfig.json',
			// useESM: true
			// },
			// 'babel-jest': {
			// 	babelrcFile: './tests/babel.config.js'
			// }
		},
		transformIgnorePatterns: [
			'/node_modules/(?!node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)'
		]
	};
};
