import { EOL } from 'os';
export const stdout = (message: string) => {
	process.stdout.write(`${EOL}[notion-page-tree] ${message}${EOL}${EOL}`);
};
export const stderr = (message: string) => {
	process.stderr.write(`${EOL}[notion-page-tree] ${message}${EOL}${EOL}`);
};
