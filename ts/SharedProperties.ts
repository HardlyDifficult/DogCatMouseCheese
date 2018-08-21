import { Vector3Component } from "metaverse-api";

export interface ISceneryProps
{
	position: Vector3Component,
	rotation: Vector3Component,
	scale?: Vector3Component
}

export enum BaitType
{
	Cheese,
	Catnip,
}

export interface IBaitProps
{
	id: string,
	position: Vector3Component,
	isVisible: boolean,
	baitType: BaitType,
}

export enum Animation
{
	Idle,
	Walk,
	Run,
	Sit,
	Drink,
	Dead
}

export enum AnimalType
{
	Dog = "Dog",
	Cat = "Cat",
	Mouse = "Mouse",
}

export interface IAnimalProps
{
	id: string,
	animalType: AnimalType,
	position: Vector3Component,
	moveDuration: number,
	lookAtPosition: Vector3Component,
	animationWeights: { animation: Animation, weight: number }[], // copy
	isDead: boolean,// remove
	scale: number,
}

