import React from 'react';
import { fetchPageTree } from '../apis/fetchPageTree';
import { SubTreeEntity } from 'notion-page-tree/dist/types';
import {
	Stack,
	Card,
	CardActionArea,
	CardHeader,
	CardMedia,
	CardContent,
	CardActions,
	IconButton,
	Avatar
} from '@mui/material';
import { Share } from '@mui/icons-material';
import ArticleModal from './ArticleModal';
import { useEffect, useState } from 'react';

const ArticleList = ({ rootId }: { rootId: string }) => {
	const [rootArticleList, setRootArticleList] = useState([] as SubTreeEntity[]);
	const fetchAndSetRootArticleList = async () => {
		const fetchResult = await fetchPageTree(rootId, 2);
		setRootArticleList(fetchResult.children as SubTreeEntity[]);
	};
	useEffect(() => {
		fetchAndSetRootArticleList();
		return () => {
			//
		};
	}, []);

	const [modalOpen, setModalOpen] = useState(false);
	const [modalId, setModalId] = useState<string>(undefined);
	const handleOpen = (id: string) => {
		setModalId(id);
		setModalOpen(true);
	};
	const handleClose = () => setModalOpen(false);

	return (
		<>
			{modalId && (
				<ArticleModal
					articleId={modalId}
					open={modalOpen}
					handleClose={handleClose}
				></ArticleModal>
			)}
			<Stack spacing={2}>
				{rootArticleList.map(
					article =>
						article.type === 'page' &&
						article.metadata.properties['title'].type === 'title' &&
						article.metadata.properties['title'].title
							.reduce((acc, richText) => acc + richText.plain_text, '')
							.trim() !== '' && (
							<Card key={article.id}>
								<CardHeader
									avatar={
										article.metadata.icon ? (
											article.metadata.icon.type === 'emoji' ? (
												<Avatar>
													{article.metadata.icon.emoji.toString()}
												</Avatar>
											) : article.metadata.icon.type === 'external' ? (
												<Avatar
													src={article.metadata.icon.external.url}
												></Avatar>
											) : article.metadata.icon.type === 'file' ? (
												<Avatar src={article.metadata.icon.file.url}></Avatar>
											) : (
												''
											)
										) : (
											<Avatar>
												{
													article.metadata.properties['title'].title.reduce(
														(acc, richText) => acc + richText.plain_text,
														''
													)[0]
												}
											</Avatar>
										)
									}
									title={article.metadata.properties['title'].title.reduce(
										(acc, richText) => acc + richText.plain_text,
										''
									)}
								></CardHeader>
								<CardActionArea onClick={() => handleOpen(article.id)}>
									{article.metadata.properties['description'].type ===
									'rich_text' ? (
										article.metadata.properties['description'].rich_text
											.reduce((acc, richText) => acc + richText.plain_text, '')
											.trim() !== '' ? (
											<CardContent>
												{article.metadata.properties[
													'description'
												].rich_text.reduce(
													(acc, richText) => acc + richText.plain_text,
													''
												)}
											</CardContent>
										) : (
											''
										)
									) : (
										''
									)}
									{article.metadata.cover && (
										<CardMedia
											component='img'
											height='140'
											src={
												article.metadata.cover.type === 'external'
													? article.metadata.cover.external.url
													: article.metadata.cover.file.url
											}
										></CardMedia>
									)}
								</CardActionArea>
								<CardActions>
									<IconButton>
										<Share></Share>
									</IconButton>
								</CardActions>
							</Card>
						)
				)}
			</Stack>
		</>
	);
};

export { ArticleList };
