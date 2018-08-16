import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';

export interface IEntranceProps
{
	position: Vector3Component,
	rotation: Vector3Component,
}

export const Entrance = (props: IEntranceProps) =>
{
	return (
		<gltf-model
			id="Entrance"
			position={props.position}
			src="assets/Archway/StoneArchway.gltf"
			rotation={props.rotation}
		/>
	)
}