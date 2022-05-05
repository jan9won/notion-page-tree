import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

type FilterType = QueryDatabaseParameters['filter'];
type SortsType = QueryDatabaseParameters['sorts'];
export const asFilterCollection = <T>(arg: Record<keyof T, FilterType>) => arg;
export const asSortsCollection = <T extends Record<string, SortsType>>(
	arg: T
) => arg;
// const asSortsCollection = <T>(arg: Record<keyof T,SortsType>) => arg;

export const filters = asFilterCollection({
	isPublished: {
		property: 'isPublished',
		checkbox: {
			equals: true
		}
	},
	curated: {
		property: 'curation',
		select: {
			is_not_empty: true
		}
	}
});

export const sorts = asSortsCollection({
	curationName: [
		{
			property: 'curation',
			direction: 'ascending'
		}
	],
	timeDescending: [
		{
			timestamp: 'last_edited_time',
			direction: 'descending'
		},
		{
			property: 'timePublished',
			direction: 'descending'
		}
	]
});
