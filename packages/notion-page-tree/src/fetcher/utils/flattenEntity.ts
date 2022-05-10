import { Entity, FlatEntity } from '../../types';
/**
 * @param entity entity whose children and parnt are the reference to block.
 * @returns entity whose children and parent are the id of block.
 */
export const flattenEntity = (entity: Entity) =>
	({
		...entity,
		parent: entity.parent?.id,
		children: entity.children?.map(child => child.id)
	} as FlatEntity);
