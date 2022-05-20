import { retrieveSubtree } from '../retrieveSubtree';
import { Entity } from '../../../types';
import tree from './mockData/tree.json';

describe('retrieveSubtree', () => {
	it('', () => {
		const subTree = retrieveSubtree(
			tree as unknown as Entity,
			'7d4bffca-f28a-49bf-b50f-ccad48896958',
			2
		);
		expect(subTree).toStrictEqual({
			id: '7d4bffca-f28a-49bf-b50f-ccad48896958',
			type: 'page',
			metadata: {
				object: 'block',
				id: '7d4bffca-f28a-49bf-b50f-ccad48896958',
				created_time: '2022-03-03T09:46:00.000Z',
				last_edited_time: '2022-04-27T17:06:00.000Z',
				created_by: {
					object: 'user',
					id: '89111f52-edc4-4251-9faf-37135f42a092'
				},
				last_edited_by: {
					object: 'user',
					id: '89111f52-edc4-4251-9faf-37135f42a092'
				},
				has_children: true,
				archived: false,
				type: 'child_page',
				child_page: { title: 'Deeply Nested' }
			},
			blockContentPlainText: '',
			children: [
				{
					id: '657b80c9-b1bf-4111-9bbd-3b2972d4dbb9',
					type: 'page',
					metadata: {
						object: 'block',
						id: '657b80c9-b1bf-4111-9bbd-3b2972d4dbb9',
						created_time: '2022-04-26T10:34:00.000Z',
						last_edited_time: '2022-05-19T07:05:00.000Z',
						created_by: {
							object: 'user',
							id: '89111f52-edc4-4251-9faf-37135f42a092'
						},
						last_edited_by: {
							object: 'user',
							id: '89111f52-edc4-4251-9faf-37135f42a092'
						},
						has_children: true,
						archived: false,
						type: 'child_page',
						child_page: { title: 'More Nested Page 1' }
					},
					blockContentPlainText: '',
					children: [
						{
							id: '125c5e60-86ac-4f2f-89dc-d441372262a3',
							type: 'page',
							metadata: {
								object: 'block',
								id: '125c5e60-86ac-4f2f-89dc-d441372262a3',
								created_time: '2022-05-19T07:05:00.000Z',
								last_edited_time: '2022-05-19T07:05:00.000Z',
								created_by: {
									object: 'user',
									id: '89111f52-edc4-4251-9faf-37135f42a092'
								},
								last_edited_by: {
									object: 'user',
									id: '89111f52-edc4-4251-9faf-37135f42a092'
								},
								has_children: true,
								archived: false,
								type: 'child_page',
								child_page: { title: 'More More Nested Page' }
							},
							blockContentPlainText: '',
							children: ['6f9a73d2-c47f-4356-a0d0-62dd00863309'],
							depth: 4
						}
					],
					depth: 3
				},
				{
					id: '4b32bea4-c5e0-43ee-bbec-4b241187d731',
					type: 'page',
					metadata: {
						object: 'block',
						id: '4b32bea4-c5e0-43ee-bbec-4b241187d731',
						created_time: '2022-04-26T10:34:00.000Z',
						last_edited_time: '2022-04-26T10:34:00.000Z',
						created_by: {
							object: 'user',
							id: '89111f52-edc4-4251-9faf-37135f42a092'
						},
						last_edited_by: {
							object: 'user',
							id: '89111f52-edc4-4251-9faf-37135f42a092'
						},
						has_children: true,
						archived: false,
						type: 'child_page',
						child_page: { title: 'More Nested Page 2' }
					},
					blockContentPlainText: '',
					children: [],
					depth: 3
				}
			],
			depth: 2
		});
	});
});
