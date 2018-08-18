import * as DCL from 'metaverse-api'
import { IAnimalProps, getAnimationWeights } from '../ts/SharedProperties';

export const Cat = (props: IAnimalProps) =>
{
	// TODO why does this fail without an ID on the parent 'entity'?
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
				id="Cat"
				src="assets/BlockDog.gltf"
				rotation={{ x: 0, y: 90, z: 0 }}
				scale={.35}
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