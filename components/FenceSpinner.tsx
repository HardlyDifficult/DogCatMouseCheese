import * as DCL from 'metaverse-api'
import { ISceneryProps } from '../ts/SharedProperties';

export enum SpinState
{
	None,
	Enter,
	Exit
}

export interface IFenceProps
{
	id: number,
	sceneProps: ISceneryProps,
	spinState: SpinState
}

export const FenceSpinner = (props: IFenceProps) =>
{
	return (
		<gltf-model
			id={"FenceSpinner" + props.id + props.sceneProps.position.x + props.sceneProps.position.z}
			position={props.sceneProps.position}
			src="assets/FenceSpinner.gltf"
			rotation={props.sceneProps.rotation}
			skeletalAnimation={[
				{
					clip: "SpinningA",
					playing: props.spinState == SpinState.Enter,
					loop: false
				},
				{
					clip: "SpinningB",
					playing: props.spinState == SpinState.Exit,
					loop: false
				},
			]}
		/>
	)
}