import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';

export interface ICheeseProps
{
	position: Vector3Component,
}

export const Cheese = (props: ICheeseProps) =>
{
	return (
		<gltf-model
			id="Cheese"
			src="art/BlockDogBowl.gltf"
			rotation={{ x: 0, y: 90, z: 0 }}
			position={props.position}
		/>
	)
}