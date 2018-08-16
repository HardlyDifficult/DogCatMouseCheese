import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';

export interface IExitProps
{
	position: Vector3Component,
	rotation: Vector3Component,
}

export const Exit = (props: IExitProps) =>
{
	return (
		<gltf-model
			id="Exit"
			position={props.position}
			src="assets/Archway/StoneArchway.gltf"
			rotation={props.rotation}
			scale={1.5}
		/>
	)
}