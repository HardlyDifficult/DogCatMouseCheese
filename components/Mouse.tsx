import * as DCL from 'metaverse-api'
import { IAnimalProps, AnimationType } from '../ts/SharedProperties';

export const Mouse = (props: IAnimalProps) =>
{
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
				src="assets/BlockMouse.gltf"
				rotation={{ x: 0, y: -90, z: 0 }}
				scale={props.scale}
				skeletalAnimation={[
					//{ no idle
					//	clip: "Walking",
					//	weight: (props.animationWeights.find(a => a.animation == AnimationType.Idle) || {weight: 0}).weight
					//},
					{
						clip: "Walking",
						weight: (props.animationWeights.find(a => a.animation == AnimationType.Walk) || { weight: 0 }).weight
					},
					{
						clip: "Running",
						weight: (props.animationWeights.find(a => a.animation == AnimationType.Run) || { weight: 0 }).weight
					},
					{
						clip: "Sitting",
						weight: (props.animationWeights.find(a => a.animation == AnimationType.Sit) || { weight: 0 }).weight
					},
					{
						clip: "Eating",
						weight: (props.animationWeights.find(a => a.animation == AnimationType.Drink) || { weight: 0 }).weight + (props.animationWeights.find(a => a.animation == AnimationType.Sit) || { weight: 0 }).weight
					},
					{
						clip: "Deaded",
						weight: (props.animationWeights.find(a => a.animation == AnimationType.Dead) || { weight: 0 }).weight,
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