import { Vector3Component } from 'metaverse-api';
import * as MathHelper from './MathHelper';
import { ISceneryProps } from './SharedProperties';

export const houseProps: ISceneryProps = {
	position: { x: 15, y: 0, z: 25 },
	rotation: { x: 0, y: 0, z: 0 }
};
export const entranceProps: ISceneryProps = {
	position: { x: 2, y: 0, z: 3 },
	rotation: { x: 0, y: 270, z: 0 }
};
export const exitProps: ISceneryProps = {
	position: { x: 28, y: 0, z: 20 },
	rotation: { x: 0, y: 90, z: 0 }
};
// TODO lay out fence: generate three walls around the house with 3 doors
export const fenceProps: ISceneryProps[] = [
	{
		position: { x: 28, y: 0, z: 18 },
		rotation: { x: 0, y: 90, z: 0 }
	},
	{
		position: { x: 28, y: 0, z: 16 },
		rotation: { x: 0, y: 90, z: 0 }
	},
	{
		position: { x: 28, y: 0, z: 14 },
		rotation: { x: 0, y: 90, z: 0 }
	},
];

export function isInBounds(position: Vector3Component): boolean
{
	return position.x > .5 && position.x < 29.5
		&& position.z > .5 && position.z < 29.5;
}

export function isSceneryPosition(position: Vector3Component)
{
	return MathHelper.inSphere(position, houseProps.position, 5)
		|| MathHelper.inSphere(position, entranceProps.position, 3)
		|| MathHelper.inSphere(position, exitProps.position, 3);
}

export function randomPosition(): Vector3Component
{
	return { x: Math.random() * 29 + .5, y: 0, z: Math.random() * 29 + .5 };
}

export function updateGridWithStaticScenery(grid: boolean[][])
{
	// TODO fill in for all scenery
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 4, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 3, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 2, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 1, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -1, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -2, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -3, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -4, y: 0, z: 0 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 4, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 3, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 2, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 1, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: 0, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -4, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -3, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -2, y: 0, z: 1 }));
	setGridCell(grid, MathHelper.add(houseProps.position, { x: -1, y: 0, z: 1 }));
}

export function setGridCell(grid: boolean[][], position: Vector3Component)
{
	grid[position.x][position.z] = true;
}