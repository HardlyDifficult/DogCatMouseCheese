import { Vector3Component } from 'metaverse-api';

export function isInBounds(position: Vector3Component): boolean
{
	return position.x > .5 && position.x < 29.5
		&& position.z > .5 && position.z < 29.5;
}