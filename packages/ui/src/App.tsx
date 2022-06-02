import React, { useEffect, useState } from 'react';
import { ArticleList } from './components/ArticleList';
import ArticlePage from './components/ArticlePage';
import { Routes, Route } from 'react-router-dom';

const App = () => {
	return (
		<Routes>
			<Route path='/page/:id' element={<ArticlePage></ArticlePage>}></Route>
			<Route
				path='/'
				element={
					<ArticleList
						rootId={'2345a2ce-3cdd-48f1-83cc-a1f6d1ae25ca'}
					></ArticleList>
				}
			></Route>
		</Routes>
		// <ArticleList rootId={'2345a2ce-3cdd-48f1-83cc-a1f6d1ae25ca'}></ArticleList>
	);
};

export default App;
