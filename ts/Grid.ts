import { Vector3Component } from "metaverse-api";
import { add } from "ts/MathHelper";
import { EventManager } from "ts/EventManager";

export namespace Grid
{
	const grid: boolean[][] = [];

	export function init(width: number, depth: number)
	{
		grid.length = 0;
		for (let x = 0; x < width; x++)
		{
			grid.push([]);
			for (let y = 0; y < depth; y++)
			{
				grid[x].push(false);
			}
		}
	}

	export function set(position: Vector3Component, canBeOccupiedAlready: boolean = false)
	{
		EventManager.emit("gridCellSet", position);
		const x = Math.round(position.x);
		const z = Math.round(position.z);
		if (grid[x][z] && !canBeOccupiedAlready)
		{
			throw new Error("Grid cell is already set");
		}
		grid[x][z] = true;
	}

	export function clear(position: Vector3Component, canBeEmpty: boolean = false)
	{
		const x = Math.round(position.x);
		const z = Math.round(position.z);
		if (!grid[x][z] && !canBeEmpty)
		{
			throw new Error("Grid cell wasn't set");
		}
		grid[x][z] = false;
	}

	export function isAvailable(position: Vector3Component)
	{
		const x = Math.round(position.x);
		const z = Math.round(position.z);
		if (x < 0 || z < 0 || grid.length <= x || grid[x].length <= z)
		{
			return false;
		}
		return !grid[x][z];
	}

	export function randomPosition(border: number = 1, mustBeAvailable: boolean = true): Vector3Component
	{
		let position;
		do
		{
			position = {
				x: Math.random() * (grid.length - border * 2) + border,
				y: 0,
				z: Math.random() * (grid[0].length - border * 2) + border
			};
		} while (!isAvailable(position) && mustBeAvailable);

		return position;
	}

	export function getNeighbors(startingPosition: Vector3Component): Vector3Component[]
	{
		let neighbors: Vector3Component[] = [];

		for (const neighborDirection of [
			{ x: 1, y: 0, z: 0 },
			{ x: -1, y: 0, z: 0 },
			{ x: 0, y: 0, z: 1 },
			{ x: 0, y: 0, z: -1 },
			//If enabling diag, update the 'distance' above with a formula
			//{ x: 1, y: 0, z: 1 },
			//{ x: -1, y: 0, z: -1 },
			//{ x: -1, y: 0, z: 1 },
			//{ x: 1, y: 0, z: -1 },
		])
		{
			let position = add(startingPosition, neighborDirection);
			if (!isAvailable(position))
			{
				continue;
			}
			neighbors.push(position);
		}

		return neighbors;
	}

	export function hasClearance(position: Vector3Component, range: number): boolean
	{
		if (!isAvailable(position))
		{
			return false;
		}
		const neighbors = getNeighbors(position);
		if (neighbors.length < 4)
		{
			return false;
		}

		if (range > 1)
		{
			for (const neighbor of neighbors)
			{
				if (!hasClearance(neighbor, range - 1))
				{
					return false;
				}
			}
		}

		return true;
	}
}