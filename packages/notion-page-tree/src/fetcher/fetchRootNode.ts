import {
	Entity,
	GetBlockResponseWithMetadata,
	RequestParameters
} from '../types';
import { normalizeBlockType } from './';

export async function fetchRootNode(entryRequestParameters: RequestParameters) {
	return await entryRequestParameters.client.blocks
		.retrieve({
			auth: entryRequestParameters.entry_key,
			block_id: entryRequestParameters.entry_id
		})
		.then(response => {
			const typedResponse = response as GetBlockResponseWithMetadata;
			return {
				id: typedResponse.id,
				depth: 0,
				type: normalizeBlockType(typedResponse.type),
				metadata: response,
				blockContentPlainText: '',
				children: []
			} as Entity;
		});
}
