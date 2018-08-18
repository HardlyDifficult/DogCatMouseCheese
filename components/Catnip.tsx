import * as DCL from 'metaverse-api'
import { IBaitProps } from 'ts/SharedProperties';

function renderBase(props: IBaitProps)
{
	if (!props.isVisible)
	{
		return;
	}

	return (
		<box scale={{ x: 1, y: .1, z: 1 }} color="#009900" />
	);
}

export const Catnip = (props: IBaitProps) =>
{
	return (
		<entity
			id="CatnipParent"
			position={props.position}
		>
			{renderBase(props)}
			<gltf-model
				id="Catnip"
				src="assets/BlockDogBowl.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
			/>
		</entity>
	)
}