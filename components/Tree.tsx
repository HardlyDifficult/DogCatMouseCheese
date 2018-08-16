import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';

export interface ITreeProps
{
	position: Vector3Component,
	rotation: Vector3Component,
}

export const Tree = (props: ITreeProps) =>
{
	return (
		<gltf-model
			id="Tree"
			position={props.position}
			src="assets/BlobMonster/BlobMonster.gltf"
			rotation={props.rotation}
		/>
	)
}