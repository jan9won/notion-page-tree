// import { ExtendedRecordMap } from 'notion-types';s
// import { SubTreeEntity } from 'notion-page-tree/dist/types';
import { serverAddress } from './config';

export const fetchRecordMap = async (id: string) => {
	//
	console.log(id);
	// const response = await fetch(`${serverAddress}/recordmap/${id}`);
	const response = await fetch(`/recordmap/${id}`);

	if (response.status !== 200)
		throw new Error(`API ERROR ${response.status.toString()}`);
	else return await response.json();
};
