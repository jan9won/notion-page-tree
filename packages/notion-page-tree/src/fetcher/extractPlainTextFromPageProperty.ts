import { GetPageResponseWithMetadata } from '../types';

export type RichTextItemResponse = Extract<
	GetPageResponseWithMetadata['properties'][0],
	{ type: 'title' }
>['title'][0];

export const flattenRichText = (richTextItemResponse: RichTextItemResponse[]) =>
	richTextItemResponse.reduce(
		(flatText, richTextObject) => `${flatText} ${richTextObject.plain_text} `,
		''
	);
interface extractPlainTextFromPagePropertyProperties {
	pagePropertyEntry: [
		keyof GetPageResponseWithMetadata['properties'],
		GetPageResponseWithMetadata['properties'][0]
	];
	pagePropertyNamesToExtract: string[];
}
export const extractPlainTextFromPageProperty = ({
	pagePropertyEntry,
	pagePropertyNamesToExtract
}: extractPlainTextFromPagePropertyProperties): string => {
	const property = pagePropertyEntry;
	if (property[0] in pagePropertyNamesToExtract) {
		switch (property[1].type) {
			case 'checkbox':
				return '';
			case 'created_by':
				return '';
			case 'created_time':
				return '';
			case 'date':
				return '';
			case 'email':
				return property[1].email?.toString() || '';
			case 'files':
				return property[1].files.reduce((acc, file) => acc + file.name, '');
			case 'formula':
				return '';
			case 'last_edited_by':
				return '';
			case 'last_edited_time':
				return property[1].last_edited_time;
			case 'multi_select':
				return property[1].multi_select.reduce(
					(acc, select) => acc + select.name,
					''
				);
			case 'number':
				return property[1].number?.toString() || '';
			case 'people':
				return '';
			case 'phone_number':
				return property[1].phone_number?.toString() || '';
			case 'relation':
				return '';
			case 'rich_text':
				return flattenRichText(property[1].rich_text);
			case 'rollup':
				return '';
			case 'select':
				return property[1].select?.name || '';
			case 'title':
				return flattenRichText(property[1].title);
			case 'url':
				return '';
		}
	}
	return '';
};
