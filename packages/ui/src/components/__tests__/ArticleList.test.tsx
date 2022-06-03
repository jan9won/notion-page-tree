import React from 'react';
import { render } from '../../../tests/utils';
import { ArticleList } from '../ArticleList';

describe('ArticleList', () => {
	it('Renders correctly.', async () => {
		//
		const ArticleListRendered = render(
			<ArticleList rootId='2345a2ce-3cdd-48f1-83cc-a1f6d1ae25ca'></ArticleList>
		);
		const TestArticle = await ArticleListRendered.findByText(
			'Test Article B1 (with Deeply Nested Children)'
		);
		expect(TestArticle.innerHTML).toBe(
			'Test Article B1 (with Deeply Nested Children)'
		);
	});
});
