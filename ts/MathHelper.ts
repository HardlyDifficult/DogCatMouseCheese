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
	return lengthSquared(subtract(a, b)) < 1;
}
export function round(a: Vector3Component): Vector3Component
{
	return { x: Math.round(a.x), y: Math.round(a.y), z: Math.round(a.z) };
}
export function mul(a: Vector3Component, b: number): Vector3Component
{
	return { x: a.x * b, y: a.y * b, z: a.z * b };
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

export function sleep(ms: number): Promise<void> 
{
	return new Promise(resolve => setTimeout(resolve, ms));
}