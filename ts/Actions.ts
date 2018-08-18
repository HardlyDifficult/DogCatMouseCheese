import * as MathHelper from './MathHelper';
import { IAnimalProps, Animation } from "./SharedProperties";
import { Vector3Component } from 'metaverse-api';
import { setInterval, clearInterval } from 'timers';

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

export function changeAnimation(animal: IAnimalProps, animation: Animation): NodeJS.Timer | null
{
	const animationDeltaPerFrame = .25 / (1000/60);
	const interval = setInterval(() =>
	{
		let isDone = true;
		for (let animationWeight of animal.animationWeights)
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