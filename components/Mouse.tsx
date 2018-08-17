import * as DCL from 'metaverse-api'
import { Animation } from 'Animation';
import { IEntityProps } from 'SharedProperties';

export const Mouse = (props: IEntityProps) =>
{
	// TODO is this copy paste too?
	let idleWeight = 0;
	let walkWeight = 0;
	let sitWeight = 0;
	for (const animation of props.animationWeights)
	{
		switch (animation.animation)
		{
			case Animation.Idle:
				idleWeight = animation.weight;
				break;
			case Animation.Walk:
				walkWeight = animation.weight;
				break;
		}
	}

	return (
		<entity
			id={props.id + "parent"}
			position={props.position}
			lookAt={props.lookAtPosition}
			transition={{
				position: {
					duration: 500
				},
				lookAt: {
					duration: 250
				}
			}}>
			<gltf-model
				id={props.id}
				src="assets/BlockDog.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
				scale={1}
				skeletalAnimation={[
					{
						clip: "Idle",
						weight: idleWeight,
					},
					{
						clip: "Walking",
						weight: walkWeight,
					},
					{
						clip: "Sitting",
						weight: sitWeight,
					},
				]}
			/>
		</entity>
	)
}