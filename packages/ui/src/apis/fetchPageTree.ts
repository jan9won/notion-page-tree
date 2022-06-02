import { SubTreeEntity } from 'notion-page-tree/dist/types';
import { serverAddress } from './config';

export const fetchPageTree = async (
	id: string,
	depth: number
): Promise<SubTreeEntity> => {
	//
	const response = await fetch(`${serverAddress}/tree/${id}?depth=${depth}`);

	if (response.status !== 200)
		throw new Error(`API ERROR ${response.status.toString()}`);
	else return (await response.json()) as SubTreeEntity;
};
