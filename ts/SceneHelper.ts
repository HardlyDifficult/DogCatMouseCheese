import { ISceneryProps } from './SharedProperties';
import { add } from 'ts/MathHelper';
import { Grid } from 'ts/Grid';

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
export const groundProps: ISceneryProps = {
	position: { x: 15, y: 0, z: 15 },
	rotation: { x: 90, y: 0, z: 0 }
};
export const fenceProps: ISceneryProps[] = [];
for (let x = 10; x < 25; x += 2)
{ // Front 
	if (x == 12)
	{
		continue;
	}
	fenceProps.push({
		position: { x, y: 0, z: 14.5 },
		rotation: { x: 0, y: 180, z: 0 }
	});
}
for (let x = 10; x < 25; x += 2)
{ // Back 
	if (x == 16)
	{
		continue;
	}
	fenceProps.push({
		position: { x, y: 0, z: 3.5 },
		rotation: { x: 0, y: 0, z: 0 }
	});
}
for (let z = 5; z < 15; z += 2)
{ // Right
	fenceProps.push({
		position: { x: 25, y: 0, z },
		rotation: { x: 0, y: 270, z: 0 }
	});
}
for (let z = 5; z < 15; z += 2)
{ // Left
	if (z == 11)
	{
		continue;
	}
	fenceProps.push({
		position: { x: 9, y: 0, z },
		rotation: { x: 0, y: 90, z: 0 }
	});
}

export function updateGridWithStaticScenery()
{
	for (const fence of fenceProps)
	{
		Grid.set(fence.position, true);
		if (fence.rotation.y == 0 || fence.rotation.y == 180)
		{
			Grid.set(add(fence.position, { x: 1, y: 0, z: 0 }), true);
			Grid.set(add(fence.position, { x: -1, y: 0, z: 0 }), true);
		}
		else
		{
			Grid.set(add(fence.position, { x: 0, y: 0, z: 1 }), true);
			Grid.set(add(fence.position, { x: 0, y: 0, z: -1 }), true);
		}
	}
	for (let x = -1; x <= 1; x++)
	{
		for (let z = -1; z <= 1; z++)
		{
			if (x == 0 && z == 0 || z == -1 && x == 0)
			{
				continue;
			}
			Grid.set(add(houseProps.position, { x, y: 0, z }), true);
		}
	}
	for (let x = 0; x < 2; x++)
	{
		for (let z = -2; z <= 2; z++)
		{
			if (x == 0 && z == 0)
			{
				continue;
			}
			Grid.set(add(exitProps.position, { x, y: 0, z }), true);
		}
	}
	for (let x = -1; x <= 0; x++)
	{
		for (let z = -1; z <= 1; z++)
		{
			if (x == 0 && z == 0)
			{
				continue;
			}
			Grid.set(add(entranceProps.position, { x, y: 0, z }), true);
		}
	}
}