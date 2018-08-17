import { Vector3Component } from "metaverse-api";
import { Animation } from "./Animation";

export enum AnimalType
{
	Dog,
	Cat,
	Mouse,
}

export interface IAnimalProps
{
	id: string,
	animalType: AnimalType,
	position: Vector3Component,
	lookAtPosition: Vector3Component,
	animationWeights: { animation: Animation, weight: number }[],
}

export interface ISceneryProps
{
	position: Vector3Component,
	rotation: Vector3Component,
}