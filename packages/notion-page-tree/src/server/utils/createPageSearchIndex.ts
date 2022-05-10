import lunr from 'lunr';
import { createFetchQueueWatcher } from '../../fetcher';
import { extractPlainTextFromPageProperty } from '../../fetcher/utils/extractPlainTextFromPageProperty';
import { writeFile } from 'fs/promises';

export const createPageSearchIndex = (
	page_collection: Awaited<
		ReturnType<typeof createFetchQueueWatcher>
	>['page_collection'],
	propertyNames: string[]
) => {
	const idx = lunr(function () {
		this.pipeline.reset();
		this.pipeline.add(lunr.stopWordFilter, lunr.stemmer);
		this.ref('id');
		this.field('title');
		this.field('plainText');
		propertyNames.forEach(propertyName => {
			this.field(propertyName);
		});

		Object.values(page_collection).forEach(page => {
			page.type === 'page' &&
				page.metadata.properties &&
				this.add({
					id: page.id,
					title: page.metadata.properties['title']
						? extractPlainTextFromPageProperty(
								page.metadata.properties?.['title']
						  )
						: '',
					plainText: page.blockContentPlainText,
					...propertyNames.map(propertyName => ({
						[propertyName]: page.metadata.properties?.[propertyName]
							? extractPlainTextFromPageProperty(
									page.metadata.properties?.[propertyName]
							  )
							: ''
					}))
				});
		});
	});
	writeFile(
		'./src/private/search-suggestion.json',
		JSON.stringify(
			JSON.parse(JSON.stringify(idx.toJSON())).invertedIndex.map(
				(tokenSet: [string, unknown]) => tokenSet[0]
			)
		)
	);
	return {
		idx: idx,
		tkn: JSON.parse(JSON.stringify(idx.toJSON())).invertedIndex.map(
			(tokenSet: [string, unknown]) => tokenSet[0]
		)
	};
};

export type SearchIndexType = ReturnType<typeof createPageSearchIndex>;
