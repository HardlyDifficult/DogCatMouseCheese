import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const House = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id="House"
			position={props.position}
			src="assets/Archway/StoneArchway.gltf"
			rotation={props.rotation}
			scale={3}
		/>
	)
}