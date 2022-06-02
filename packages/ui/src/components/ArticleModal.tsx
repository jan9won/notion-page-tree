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
import { fetchPageTree } from '../apis/fetchPageTree';

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
	const [articleModal, setArticleModal] = React.useState({} as SubTreeEntity);
	const fetchAndSetArticleModal = async () => {
		const fetchResult = await fetchPageTree(articleId, 3);
		// console.log(fetchResult);
		setArticleModal(fetchResult as SubTreeEntity);
	};
	React.useEffect(() => {
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
			{articleModal.type === 'page' &&
			articleModal.metadata.properties['title']?.type === 'title' &&
			articleModal.metadata.properties['title']?.title ? (
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
										{
											articleModal.metadata.properties['title'].title.reduce(
												(acc, richText) => acc + richText.plain_text,
												''
											)[0]
										}
									</Avatar>
								)
							}
							title={articleModal.metadata.properties['title'].title.reduce(
								(acc, richText) => acc + richText.plain_text,
								''
							)}
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
								{(articleModal.children as SubTreeEntity[]).map(
									child =>
										child.type === 'page' &&
										child.metadata.properties['title']?.type == 'rich_text' && (
											<ListItem key={child.id}>
												<ListItemButton>
													<ListItemAvatar></ListItemAvatar>
													<ListItemText>
														{child.metadata.properties[
															'title'
														].rich_text.reduce(
															(acc, richText) => acc + richText.plain_text,
															''
														)}
													</ListItemText>
												</ListItemButton>
											</ListItem>
										)
								)}
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
