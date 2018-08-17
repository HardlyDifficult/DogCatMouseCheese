import * as DCL from 'metaverse-api'
import { Animation } from '../ts/Animation';
import { IAnimalProps } from '../ts/SharedProperties';

export const Dog = (props: IAnimalProps) =>
{
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
				id="Dog"
				src="assets/BlockDog.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
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