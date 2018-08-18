import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export const Ground = (props: ISceneryProps) =>
{
	return (
		<plane
			position={props.position}
			scale={29.99}
			rotation={props.rotation}
			color="#66666"
		/>
	)
}