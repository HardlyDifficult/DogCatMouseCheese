import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const Fence = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id="Fence"
			position={props.position}
			src="assets/Fence.gltf"
			rotation={props.rotation}
		/>
	)
}