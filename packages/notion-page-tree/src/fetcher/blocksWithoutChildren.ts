import { GetBlockResponseWithMetadata } from '../types';

export const blocksWithoutChildren: GetBlockResponseWithMetadata['type'][] = [
	'heading_1',
	'heading_2',
	'heading_3',
	'code',
	'embed',
	'image',
	'video',
	'file',
	'pdf',
	'bookmark',
	'equation',
	'divider',
	'table_of_contents',
	'breadcrumb',
	'link_preview',
	'link_to_page',
	'table_row'
];
