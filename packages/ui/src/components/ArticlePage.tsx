import React, { useEffect, useState } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { NotionAPI } from 'notion-client';

/**
 * @param flatId Notion's page id without hyphen(-).
 */
interface ArticleProps {
	flatId: string;
}

const ArticlePage = ({ flatId }: ArticleProps) => {
	const [recordMap, setRecordMap] = useState(
		{} as Awaited<ReturnType<typeof notion.getPage>>
	);
	const notion = new NotionAPI();
	useEffect(() => {
		notion.getPage(flatId).then(value => setRecordMap(value));
		return () => {
			//
		};
	}, [recordMap]);

	return (
		<NotionRenderer
			recordMap={recordMap}
			fullPage={true}
			darkMode={true}
		></NotionRenderer>
	);
};

export default ArticlePage;
