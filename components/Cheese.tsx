import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';

export interface ICheeseProps
{
	position: Vector3Component,
	isVisible: boolean
}

export const Cheese = (props: ICheeseProps) =>
{
	if (!props.isVisible)
	{
		return;
	}

	return (
		<gltf-model
			id="Cheese"
			src="assets/BlockDogBowl.gltf"
			rotation={{ x: 0, y: 90, z: 0 }}
			position={props.position}
		/>
	)
}