import React from 'react';
import {
	Slide,
	Modal,
	Backdrop,
	Card,
	CardActionArea,
	CardHeader,
	CardMedia,
	CardContent,
	CardActions,
	IconButton,
	Avatar,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemAvatar
} from '@mui/material';
import { SubTreeEntity } from 'notion-page-tree/dist/types';
import { useEffect, useState } from 'react';
import { fetchPageTree } from '../apis/fetchPageTree';
import { Link } from 'react-router-dom';
import { convertNotionId } from 'notion-page-tree/src/server/utils/convertNotionId';

const modalStyle = {
	position: 'fixed' as const,
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100%',
	height: '100%',
	border: '2px solid #000'
};

const cardStyle = {
	position: 'fixed' as const,
	bottom: '0',
	width: '90vw',
	left: '5vw'
};

const ArticleModal = ({
	open,
	handleClose,
	articleId
}: {
	open: boolean;
	handleClose: () => void;
	articleId: string;
}) => {
	const [articleModal, setArticleModal] = useState({} as SubTreeEntity);
	const fetchAndSetArticleModal = async () => {
		const fetchResult = await fetchPageTree(articleId, 2);
		console.log(fetchResult);
		setArticleModal(fetchResult as SubTreeEntity);
	};
	useEffect(() => {
		fetchAndSetArticleModal();
		return () => {
			//
		};
	}, [articleId]);

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby='modal-modal-title'
			aria-describedby='modal-modal-description'
			sx={modalStyle}
		>
			{articleModal.type === 'page' ? (
				<Slide direction='up' in={open}>
					<Card sx={cardStyle}>
						<CardHeader
							avatar={
								articleModal.metadata.icon ? (
									articleModal.metadata.icon.type === 'emoji' ? (
										<Avatar>
											{articleModal.metadata.icon.emoji.toString()}
										</Avatar>
									) : articleModal.metadata.icon.type === 'external' ? (
										<Avatar
											src={articleModal.metadata.icon.external.url}
										></Avatar>
									) : articleModal.metadata.icon.type === 'file' ? (
										<Avatar src={articleModal.metadata.icon.file.url}></Avatar>
									) : (
										''
									)
								) : (
									<Avatar>
										{articleModal.metadata.properties['title']?.type ===
											'title' &&
											articleModal.metadata.properties['title'].title[0]
												.plain_text[0]}
									</Avatar>
								)
							}
							title={
								articleModal.metadata.properties['title']?.type === 'title' &&
								articleModal.metadata.properties['title'].title.reduce(
									(acc, richText) => acc + richText.plain_text,
									''
								)
							}
						></CardHeader>
						{articleModal.metadata.properties['description']?.type ===
						'rich_text' ? (
							<CardContent>
								{' '}
								{articleModal.metadata.properties[
									'description'
								].rich_text.reduce(
									(acc, richText) => acc + richText.plain_text,
									''
								)}{' '}
							</CardContent>
						) : (
							<></>
						)}
						{articleModal.children && (
							<List>
								{(articleModal.children as SubTreeEntity[]).map(child => (
									<ListItem key={child.id} id={child.id}>
										<Link to={`/page/${child.id.split('-').join('')}`}>
											<ListItemButton>
												<ListItemText>
													{child.metadata.object === 'block'
														? child.metadata.type === 'child_page'
															? child.metadata.child_page.title
															: ''
														: child.metadata.object === 'page'
														? child.metadata.properties['title'].type ===
														  'title'
															? child.metadata.properties['title'].title.reduce(
																	(acc, richText) => acc + richText.plain_text,
																	''
															  )
															: ''
														: child.metadata.title.reduce(
																(acc, richText) => acc + richText.plain_text,
																''
														  )}
												</ListItemText>
											</ListItemButton>
										</Link>
									</ListItem>
								))}
							</List>
						)}
					</Card>
				</Slide>
			) : (
				<></>
			)}
		</Modal>
	);
};

export default ArticleModal;
