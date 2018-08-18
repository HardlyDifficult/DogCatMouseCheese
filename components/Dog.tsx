import * as DCL from 'metaverse-api'
import { IAnimalProps, getAnimationWeights } from '../ts/SharedProperties';

export const Dog = (props: IAnimalProps) =>
{
	const weights = getAnimationWeights(props);

	return (
		<entity
			id={props.id + "parent"}
			position={props.position}
			lookAt={props.lookAtPosition}
			transition={{
				position: {
					duration: props.moveDuration
				},
				lookAt: {
					duration: props.moveDuration / 2
				}
			}}>
			<gltf-model
				id="Dog"
				src="assets/BlockDog.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
				skeletalAnimation={[
					{
						clip: "Idle",
						weight: weights.idle,
					},
					{
						clip: "Walking",
						weight: weights.walk,
					},
					{
						clip: "Sitting",
						weight: weights.sit,
					},
					{
						clip: "Drinking",
						weight: weights.drink,
					}
				]}
			/>
		</entity>
	)
}