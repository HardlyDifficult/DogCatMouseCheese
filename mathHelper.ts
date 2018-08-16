import { Vector3Component } from 'metaverse-api';

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
	return a.x == 0 && a.y == 0 && a.z == 0;
}

