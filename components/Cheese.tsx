import * as DCL from 'metaverse-api'
import { IBaitProps } from 'ts/SharedProperties';

function renderBase(props: IBaitProps)
{
	if (!props.isVisible)
	{
		return;
	}

	return (
		<entity>
		<gltf-model
			id="Cheese"
			src="assets/Cheese.gltf"
			rotation={{ x: 0, y: 0, z: 0 }}
			position={{ x: -.2, y: 0, z: 0 }}
			scale={.3}
		/>
		<gltf-model
			id="Cheese"
			src="assets/Cheese.gltf"
			rotation={{ x: 0, y: 25, z: 0 }}
			position={{ x: -.1, y: 0, z: .1 }}
			scale={.3}
		/>
		<gltf-model
			id="Cheese"
			src="assets/Cheese.gltf"
			rotation={{ x: 0, y: 60, z: 0 }}
			position={{ x: -.2, y: 0, z: -.1 }}
			scale={.3}
		/>
		</entity>
	);
}

export const Cheese = (props: IBaitProps) =>
{
	return (
		<entity
			id="CheeseParent"
			position={props.position}
			scale={1.5}
		>
			{renderBase(props)}
			<gltf-model
				id="Cheese"
				src="assets/Cheese.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
			/>
		</entity>
	)
}