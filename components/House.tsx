import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const House = (props: ISceneryProps) =>
{
	return (
		<gltf-model
			id="House"
			position={props.position}
			src="assets/DogHouse.gltf"
			rotation={props.rotation}
		/>
	)
}