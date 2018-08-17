import * as MathHelper from './MathHelper';
import { IAnimalProps } from "./SharedProperties";
import { Animation } from "./Animation";
import { Vector3Component } from 'metaverse-api';
import { setInterval, clearInterval } from 'timers';

// TODO animation speeds

export enum Action
{
	Idle,
	Sit,
	Walk,
	Sneak,
	Run,
	Grab,
	Kill,
}

export function walkTowards(entity: IAnimalProps, targetPosition: Vector3Component, grid: boolean[][]): NodeJS.Timer | null
{
	const toTarget = MathHelper.subtract(targetPosition, entity.position);
	if (MathHelper.isZero(toTarget))
	{ // Already there
		return changeAnimation(entity, Animation.Idle);
	}

	grid[Math.round(entity.position.x)][Math.round(entity.position.z)] = false;
	if (grid[Math.round(targetPosition.x)][Math.round(targetPosition.z)])
	{ 
		throw new Error("Space occupied, can't walk there.");
	}
	entity.position = targetPosition;
	grid[Math.round(entity.position.x)][Math.round(entity.position.z)] = true;
	// Look past the target
	entity.lookAtPosition = MathHelper.add(targetPosition, toTarget);
	return changeAnimation(entity, Animation.Walk);
}

export function stopWalking(entity: IAnimalProps): NodeJS.Timer | null
{
	return changeAnimation(entity, Animation.Idle);
}

function changeAnimation(entity: IAnimalProps, animation: Animation): NodeJS.Timer | null
{
	const animationDeltaPerFrame = .5 / (1000/60);
	const interval = setInterval(() =>
	{
		let isDone = true;
		for (let animationWeight of entity.animationWeights)
		{
			if (animationWeight.animation == animation)
			{
				animationWeight.weight += animationDeltaPerFrame;
				if (animationWeight.weight >= 1)
				{
					animationWeight.weight = 1;
				}
				else
				{
					isDone = false;
				}
			}
			else
			{
				animationWeight.weight -= animationDeltaPerFrame;
				if (animationWeight.weight <= 0)
				{
					animationWeight.weight = 0;
				}
				else
				{
					isDone = false;
				}
			}
		}

		if (isDone && interval)
		{
			clearInterval(interval);
		}
	}, 1000 / 60);

	return interval;
}