import * as MathHelper from './mathHelper';
import { IEntityProps } from "SharedProperties";
import { Animation } from "Animation";
import { Vector3Component } from 'metaverse-api';
import { setInterval, clearInterval } from 'timers';

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

export function walkTowards(entity: IEntityProps, targetPosition: Vector3Component, grid: boolean[][]): NodeJS.Timer | null
{
	const toTarget = MathHelper.subtract(targetPosition, entity.position);
	if (MathHelper.isZero(toTarget))
	{ // Already there
		return changeAnimation(entity, Animation.Idle);
	}

	grid[Math.round(entity.position.x)][Math.round(entity.position.z)] = false;
	if (grid[Math.round(targetPosition.x)][Math.round(targetPosition.z)])
	{ // TODO collision (throw exception?)
		entity.position.y = 2;
		return changeAnimation(entity, Animation.Idle);
	}
	entity.position = targetPosition;
	grid[Math.round(entity.position.x)][Math.round(entity.position.z)] = true;
	// Look past the target
	entity.lookAtPosition = MathHelper.add(targetPosition, toTarget);
	return changeAnimation(entity, Animation.Walk);
}

export function stopWalking(entity: IEntityProps): NodeJS.Timer | null
{
	return changeAnimation(entity, Animation.Idle);
}

function changeAnimation(entity: IEntityProps, animation: Animation): NodeJS.Timer | null
{
	//console.log(animation.toString());
	// x seconds = fps * delta;
	const animationDeltaPerFrame = .01;
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