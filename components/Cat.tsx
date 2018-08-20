import * as DCL from 'metaverse-api'
import { IAnimalProps, Animation } from '../ts/SharedProperties';

export const Cat = (props: IAnimalProps) =>
{
	// DCL: why does this fail without an ID on the parent 'entity'?
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
				id={props.id}
				src="assets/BlockCat.gltf"
				rotation={{ x: 0, y: -90, z: 0 }}
				scale={props.scale}
				skeletalAnimation={[
					//{ no idle
					//	clip: "Walking",
					//	weight: (props.animationWeights.find(a => a.animation == Animation.Idle) || {weight: 0}).weight
					//},
					{
						clip: "Walking",
						weight: (props.animationWeights.find(a => a.animation == Animation.Walk) || { weight: 0 }).weight
					},
					{
						clip: "Running", 
						weight: (props.animationWeights.find(a => a.animation == Animation.Run) || {weight: 0}).weight 
					},
					{
						clip: "Sitting",
						weight: (props.animationWeights.find(a => a.animation == Animation.Sit) || { weight: 0 }).weight + (props.animationWeights.find(a => a.animation == Animation.Idle) || { weight: 0 }).weight
					},
					{
						clip: "Eating",
						weight: (props.animationWeights.find(a => a.animation == Animation.Drink) || {weight: 0}).weight
					},
					{
						clip: "Deaded", 
						weight: (props.animationWeights.find(a => a.animation == Animation.Dead) || { weight: 0 }).weight, 
					}
				]}
				transition={{
					scale: {
						duration: 2000
					}
				}}
			/>
		</entity>
	)
}