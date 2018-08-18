import { Vector3Component } from 'metaverse-api';
const aStar = require('a-star'); 

// Vector3 
export function add(a: Vector3Component, b: Vector3Component): Vector3Component
{
	return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
export function subtract(a: Vector3Component, b: Vector3Component): Vector3Component
{
	return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
export function lengthSquared(a: Vector3Component): number
{
	return a.x * a.x + a.y * a.y + a.z * a.z;
}
export function isZero(a: Vector3Component): boolean
{
	return Math.abs(a.x) <= 0.01 && Math.abs(a.y) <= 0.01 && Math.abs(a.z) <= 0.01;
}
export function equals(a: Vector3Component | null, b: Vector3Component | null): boolean
{
	if (a == null || b == null)
	{
		return false;
	}
	return a.x == b.x && a.y == b.y && a.z == b.z;
}
export function approxEquals(a: Vector3Component, b: Vector3Component): boolean
{
	return a.x - b.x < 1 && a.y - b.y < 1 && a.z - b.z < 1;
}
export function round(a: Vector3Component): Vector3Component
{
	return { x: Math.round(a.x), y: Math.round(a.y), z: Math.round(a.z) };
}
export function div(a: Vector3Component, b: number): Vector3Component
{
	return { x: a.x / b, y: a.y / b, z: a.z / b };
}
export function inSphere(position: Vector3Component, target: Vector3Component, radius: number): boolean
{
	const delta = subtract(target, position);
	return lengthSquared(delta) <= radius * radius;
}

// Pathfinding
export function calcPath(startingPosition: Vector3Component, targetPosition: Vector3Component,
	isValidPosition: (position: Vector3Component) => boolean, maxDistanceFromEnd: number): Vector3Component[]
{
	targetPosition = round(targetPosition);
	const results = aStar({
		start: round(startingPosition),
		isEnd: (n: Vector3Component): boolean =>
		{
			return inSphere(n, targetPosition, maxDistanceFromEnd + 1);
		},
		neighbor: (x: Vector3Component): Vector3Component[] =>
		{
			return getNeighbors(x, isValidPosition);
		},
		distance: (a: Vector3Component, b: Vector3Component): number =>
		{
			return 1;
		},
		heuristic: (x: Vector3Component): number =>
		{
			return lengthSquared(subtract(x, targetPosition));
		},
		hash: (x: Vector3Component): string =>
		{
			return JSON.stringify(x);
		},
	});
	if (results.status == "success")
	{
		return results.path;
	}

	return [];
}
function getNeighbors(startingPosition: Vector3Component,
	isValidPosition: (position: Vector3Component) => boolean): Vector3Component[]
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
		if (!isValidPosition(position))
		{
			continue;
		}
		neighbors.push(position);
	}

	return neighbors;
}

// Other
export function sleep(ms: number): Promise<void> 
{
	return new Promise(resolve => setTimeout(resolve, ms));
}