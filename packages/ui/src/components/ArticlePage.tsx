import React, { useEffect, useState } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { ExtendedRecordMap } from 'notion-types';
import { fetchRecordMap } from '../apis/fetchRecordMap';
import { useParams } from 'react-router-dom';

const ArticlePage = () => {
	const params = useParams();
	const [recordMap, setRecordMap] = useState<ExtendedRecordMap>();
	const fetchAndSetRecordMap = async () => {
		const recordMap = await fetchRecordMap(params.id);
		console.log(recordMap);
		setRecordMap(recordMap);
	};
	useEffect(() => {
		fetchAndSetRecordMap();
		return () => {
			//
		};
	}, [params.id]);

	return recordMap ? (
		<NotionRenderer
			recordMap={recordMap}
			fullPage={true}
			darkMode={true}
			mapPageUrl={pageId => `/page/${pageId}`}
			disableHeader={true}
		></NotionRenderer>
	) : (
		<div>loading</div>
	);
};

export default ArticlePage;
