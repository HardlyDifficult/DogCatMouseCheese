import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const Fence = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id={"Fence" + props.position.x + props.position.z}
			position={props.position}
			src="assets/Fence.gltf"
			rotation={props.rotation}
		/>
	)
}