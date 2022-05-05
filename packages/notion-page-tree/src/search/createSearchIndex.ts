import lunr from 'lunr';
import { Entity } from '../types';

export const createPageSearchIndex = (pages: Entity[]) => {
	const idx = lunr(function () {
		this.pipeline.reset();
		this.pipeline.add(lunr.stopWordFilter, lunr.stemmer);
		this.ref('id');
		this.field('title');
		this.field('description');
		this.field('tags');
		this.field('chapterList');

		pages.forEach(page => {
			this.add({});
		}, this);
	});
	return idx;
};

export type SearchIndexType = ReturnType<typeof createPageSearchIndex>;
