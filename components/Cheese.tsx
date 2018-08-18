import * as DCL from 'metaverse-api'
import { IBaitProps } from 'ts/SharedProperties';

function renderBase(props: IBaitProps)
{
	if (!props.isVisible)
	{
		return;
	}

	return (
		<box scale={{ x: 1, y: .1, z: 1 }} />
	);
}

export const Cheese = (props: IBaitProps) =>
{
	return (
		<entity
			id="CheeseParent"
			position={props.position}
		>
			{renderBase(props)}
			<gltf-model
				id="Cheese"
				src="assets/BlockDogBowl.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
			/>
		</entity>
	)
}