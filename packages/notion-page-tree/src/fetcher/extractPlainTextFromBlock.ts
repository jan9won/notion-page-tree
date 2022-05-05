import { GetBlockResponseWithMetadata } from '../types';

export type RichTextItemResponse = Extract<
	GetBlockResponseWithMetadata,
	{ type: 'paragraph' }
>['paragraph']['rich_text'][0];

export const flattenRichText = (richTextItemResponse: RichTextItemResponse[]) =>
	richTextItemResponse.reduce(
		(flatText, richTextObject) => `${flatText} ${richTextObject.plain_text} `,
		''
	);

export const extractPlainTextFromBlock = (
	block: GetBlockResponseWithMetadata
) => {
	switch (block.type) {
		case 'audio':
			return flattenRichText(block.audio.caption);
		case 'bookmark':
			return flattenRichText(block.bookmark.caption);
		case 'bulleted_list_item':
			return flattenRichText(block.bulleted_list_item.rich_text);
		case 'callout':
			return flattenRichText(block.callout.rich_text);
		case 'child_database':
			return block.child_database.title;
		case 'child_page':
			return block.child_page.title;
		case 'code':
			return flattenRichText(block.code.rich_text);
		case 'embed':
			return flattenRichText(block.embed.caption);
		case 'equation':
			return block.equation.expression;
		case 'file':
			return flattenRichText(block.file.caption);
		case 'heading_1':
			return flattenRichText(block.heading_1.rich_text);
		case 'heading_2':
			return flattenRichText(block.heading_2.rich_text);
		case 'heading_3':
			return flattenRichText(block.heading_3.rich_text);
		case 'image':
			return flattenRichText(block.image.caption);
		case 'numbered_list_item':
			return flattenRichText(block.numbered_list_item.rich_text);
		case 'paragraph':
			return flattenRichText(block.paragraph.rich_text);
		case 'pdf':
			return flattenRichText(block.pdf.caption);
		case 'quote':
			return flattenRichText(block.quote.rich_text);
		case 'table_row':
			return flattenRichText(block.table_row.cells.flat());
		case 'template':
			return flattenRichText(block.template.rich_text);
		case 'to_do':
			return flattenRichText(block.to_do.rich_text);
		case 'toggle':
			return flattenRichText(block.toggle.rich_text);
		case 'video':
			return flattenRichText(block.video.caption);
		default:
			return '';
	}
};
