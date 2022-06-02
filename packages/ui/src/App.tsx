import React from 'react';
import { ArticleList } from './components/ArticleList';

import ArticlePage from './components/ArticlePage';

const App = () => {
	return (
		<div>
			<ArticleList
				rootId={'2345a2ce-3cdd-48f1-83cc-a1f6d1ae25ca'}
			></ArticleList>
		</div>
	);
};

export default App;
