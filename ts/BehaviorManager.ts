import { Vector3Component, EventSubscriber } from "metaverse-api";
import { IAnimalProps, Animation } from "./SharedProperties";
import * as MathHelper from './MathHelper';
import * as SceneHelper from './SceneHelper';
import { walkTowards, changeAnimation } from "./Actions";
import { setInterval, clearInterval } from 'timers';

export class BehaviorManager
{
	grid: boolean[][];
	animalProps: IAnimalProps;
	eventSubscriber: EventSubscriber;
	onStateChange: () => void;
	pathInterval: NodeJS.Timer | null = null;
	walkInterval: NodeJS.Timer | null = null;

	constructor(eventSubscriber: EventSubscriber, grid: boolean[][], entity: IAnimalProps, onStateChange: () => void)
	{
		this.eventSubscriber = eventSubscriber;
		this.grid = grid;
		this.animalProps = entity;
		this.onStateChange = onStateChange;
	}

	followPath(getTargetPosition: () => Vector3Component | null,
		moveSpeed: number,
		onArrive: () => void,
		onFail: () => void,
		maxDistanceFromEnd: number = 0)
	{
		const targetPosition = getTargetPosition();
		if (!targetPosition)
		{
			return onFail();
		}
		const path = MathHelper.calcPath(this.animalProps.position, targetPosition, (position: Vector3Component) =>
		{
			return SceneHelper.isPositionAvailable(this.grid, position);
		}, maxDistanceFromEnd);
		if (!path || path.length <= 1)
		{
			return onFail();
		}

		if (this.pathInterval)
		{
			clearInterval(this.pathInterval);
		}

		let pathIndex = 1;
		this.pathInterval = setInterval(() =>
		{
			let target = path[pathIndex];
			if (pathIndex < path.length - 1)
			{ // Smooth diag movement
				target = MathHelper.add(target, path[pathIndex + 1]);
				target = MathHelper.div(target, 2);
			}
			if (this.walkInterval)
			{
				clearInterval(this.walkInterval);
			}
			try
			{
				this.walkInterval = walkTowards(this.animalProps, target, this.grid); 
			}
			catch (e)
			{
				return this.followPath(getTargetPosition, moveSpeed, onArrive, onFail, maxDistanceFromEnd);
			}
			this.onStateChange();
			pathIndex++;
			if (pathIndex >= path.length)
			{
				if (this.pathInterval)
				{
					clearInterval(this.pathInterval);
				}
				onArrive();
			}

			if (!MathHelper.equals(getTargetPosition(), targetPosition))
			{ // The target moved
				if (this.pathInterval)
				{
					clearInterval(this.pathInterval);
				}
				return this.followPath(getTargetPosition, moveSpeed, onArrive, onFail, maxDistanceFromEnd);
			}
		}, moveSpeed);
	}

	changeAnimationTo(animation: Animation)
	{
		if (this.walkInterval) 
		{
			clearInterval(this.walkInterval);
		}
		this.walkInterval = changeAnimation(this.animalProps, animation);
	}

	onClick() { }

	stop()
	{
		if (this.walkInterval)
		{
			clearInterval(this.walkInterval);
		}
		if (this.pathInterval)
		{
			clearInterval(this.pathInterval);
		}
	}
}

