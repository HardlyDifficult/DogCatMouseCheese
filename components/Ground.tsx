import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

const roughness: number = 1;

export const Ground = (props: ISceneryProps) =>
{
	return (
		<entity>
			<material
				id="groundMat"
				albedoTexture="assets/TestGrass.png"
				roughness={roughness}
			/>
			<plane
				id="Ground"
				material="#groundMat"
				position={props.position}
				scale={29.99}
				rotation={props.rotation}
			/>
		</entity>
	)
}