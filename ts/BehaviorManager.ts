import { Vector3Component, EventSubscriber } from "metaverse-api";
import { IAnimalProps } from "./SharedProperties";
import * as MathHelper from './MathHelper';
import * as SceneHelper from './SceneHelper';
import { walkTowards, stopWalking } from "./Actions";
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

	followPath(getTargetPosition: () => Vector3Component | null, moveSpeed: number, onArrive: () => void, onFail: () => void)
	{
		const targetPosition = getTargetPosition();
		if (!targetPosition)
		{
			return onFail();
		}
		const path = MathHelper.calcPath(this.animalProps.position, targetPosition, (position: Vector3Component) =>
		{
			return SceneHelper.isInBounds(position) && !this.grid[position.x][position.z];
		});
		if (!path || path.length == 0)
		{
			return onFail();
		}

		if (this.pathInterval)
		{
			clearInterval(this.pathInterval);
		}

		let pathIndex = 0;
		this.pathInterval = setInterval(() =>
		{
			if (!MathHelper.equals(getTargetPosition(), targetPosition))
			{
				return this.followPath(getTargetPosition, moveSpeed, onArrive, onFail);
			}

			let target = path[pathIndex];
			if (pathIndex < path.length - 1)
			{
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
				return this.followPath(getTargetPosition, moveSpeed, onArrive, onFail);
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
		}, moveSpeed);
	}

	stop()
	{
		if (this.walkInterval) 
		{
			clearInterval(this.walkInterval);
		}
		this.walkInterval = stopWalking(this.animalProps);
	}

	onClick() { }
}

