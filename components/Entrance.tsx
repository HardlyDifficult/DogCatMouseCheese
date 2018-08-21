import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const Entrance = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id="Entrance"
			position={props.position}
			src="assets/DirtMound.gltf"
			rotation={props.rotation}
		/>
	)
}