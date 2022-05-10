import { GetPageResponseWithMetadata } from '../../types';

type RichTextItemResponse = Extract<
	GetPageResponseWithMetadata['properties'][0],
	{ type: 'title' }
>['title'][0];

const flattenRichText = (richTextItemResponse: RichTextItemResponse[]) =>
	richTextItemResponse.reduce(
		(flatText, richTextObject) => `${flatText} ${richTextObject.plain_text} `,
		''
	);

export const extractPlainTextFromPageProperty = (
	property: GetPageResponseWithMetadata['properties'][0]
): string => {
	switch (property.type) {
		case 'checkbox':
			return '';
		case 'created_by':
			return '';
		case 'created_time':
			return '';
		case 'date':
			return '';
		case 'email':
			return property.email?.toString() || '';
		case 'files':
			return property.files.reduce((acc, file) => acc + file.name, '');
		case 'formula':
			return '';
		case 'last_edited_by':
			return '';
		case 'last_edited_time':
			return property.last_edited_time;
		case 'multi_select':
			return property.multi_select.reduce(
				(acc, select) => acc + select.name,
				''
			);
		case 'number':
			return property.number?.toString() || '';
		case 'people':
			return '';
		case 'phone_number':
			return property.phone_number?.toString() || '';
		case 'relation':
			return '';
		case 'rich_text':
			return flattenRichText(property.rich_text);
		case 'rollup':
			return '';
		case 'select':
			return property.select?.name || '';
		case 'title':
			return flattenRichText(property.title);
		case 'url':
			return '';
	}
	return '';
};
