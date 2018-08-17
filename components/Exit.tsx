import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const Exit = (props: ISceneryProps) =>
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