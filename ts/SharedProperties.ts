import { Vector3Component } from "metaverse-api";

export interface ISceneryProps
{
	position: Vector3Component,
	rotation: Vector3Component,
}

export enum BaitType
{
	Cheese,
	Catnip,
}

export interface IBaitProps
{
	position: Vector3Component,
	isVisible: boolean,
	baitType: BaitType,
}

export enum Animation
{
	Idle,
	Walk,
	Sit,
	Drink
}

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
	moveDuration: number,
	lookAtPosition: Vector3Component,
	animationWeights: { animation: Animation, weight: number }[],
	isDead: boolean,
}

export function getAnimationWeights(animalProps: IAnimalProps): { idle: number, walk: number, sit: number, drink: number }
{
	let idle = 0;
	let walk = 0;
	let sit = 0;
	let drink = 0;
	for (const animation of animalProps.animationWeights)
	{
		switch (animation.animation)
		{
			case Animation.Idle:
				idle = animation.weight;
				break;
			case Animation.Walk:
				walk = animation.weight;
				break;
			case Animation.Sit:
				sit = animation.weight;
				break;
			case Animation.Drink:
				drink = animation.weight;
				break;
		}
	}

	return { idle, walk, sit, drink };
}

