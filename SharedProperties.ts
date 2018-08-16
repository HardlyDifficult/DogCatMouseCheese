import { Vector3Component } from "metaverse-api";
import { Animation } from "Animation";

export interface IEntityProps
{
	position: Vector3Component,
	lookAtPosition: Vector3Component,
	animationWeights: { animation: Animation, weight: number }[],
}