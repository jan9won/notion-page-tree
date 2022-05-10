import { prompt } from 'enquirer';
import { EOL } from 'os';

export const askInput = async (
	name: string,
	description: string,
	checkValidity = false
) => {
	// ask input
	const answer = (
		await prompt<{ [name: string]: string }>({
			type: 'input',
			name: name,
			message: description
		})
	)[name];

	// check validity, retry if invalid
	checkValidity &&
		(await askYesOrNo(
			`Please confirm if ${description} is valid.${EOL}${EOL}${answer}${EOL}`
		)) === 'no' &&
		(await askInput(name, description, true));

	// else return
	return answer;
};

export const askYesOrNo = async (message: string) =>
	(
		await prompt<{ confirm: 'yes' | 'no' }>([
			{
				type: 'select',
				name: 'confirm',
				choices: ['yes', 'no'],
				message: message
			}
		])
	).confirm;

export const askSelect = async (answers: string[], message: string) =>
	(
		await prompt<{ answer: string }>([
			{
				type: 'select',
				name: 'answer',
				choices: answers,
				message: message
			}
		])
	).answer;
