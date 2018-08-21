import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const Exit = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id="Exit"
			position={props.position}
			src="assets/DirtMound.gltf"
			rotation={props.rotation}
		/>
	)
}