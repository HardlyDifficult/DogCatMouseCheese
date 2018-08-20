import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const FenceCorner = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id={"FenceCorner" + props.position.x + props.position.z}
			position={props.position}
			src="assets/FenceCorner.gltf"
			rotation={props.rotation}
		/>
	)
}