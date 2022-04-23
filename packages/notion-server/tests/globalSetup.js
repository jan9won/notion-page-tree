import path from 'path';
import * as dotenv from 'dotenv';

module.exports = globalConfig => {
	global.__SOME_GLOBAL_VARIABLE__ = 'hello'; // setup global variable
	dotenv.config({ path: path.resolve('.test.env') });
};
