import { Vector3Component } from "metaverse-api";
import { IEntityProps } from "SharedProperties";
import * as MathHelper from './mathHelper';
import * as SceneHelper from './sceneHelper';
import { walkTowards, stopWalking } from "Actions";
import { setInterval, clearInterval } from 'timers';

// TODO stop walking at the bowl

export enum PredatorBehaviour
{
	Patrol,
	Chase,
}

export enum PreyBehaviour
{
	Sneak,
	Sprint,
}

function sleep(ms: number): Promise<void> 
{
	return new Promise(resolve => setTimeout(resolve, ms));
} 

export class BehaviorManager
{
	grid: boolean[][];
	entity: IEntityProps;
	
	onStateChange: () => void;
	pathInterval: NodeJS.Timer | null = null;
	walkInterval: NodeJS.Timer | null = null;

	constructor(grid: boolean[][], entity: IEntityProps, onStateChange: () => void)
	{
		this.grid = grid;
		this.entity = entity;
		this.onStateChange = onStateChange;
	}

	followPath(targetPosition: Vector3Component, moveSpeed: number, onFinalStep: (() => void) | null, onArrive: () => void)
	{
		const path = MathHelper.calcPath(this.entity.position, targetPosition, (position: Vector3Component) =>
		{
			return SceneHelper.isInBounds(position) && !this.grid[position.x][position.z];
		});

		if (this.pathInterval)
		{
			clearInterval(this.pathInterval);
		}
		let pathIndex = 0;
		this.pathInterval = setInterval(() =>
		{
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
			console.log(path.length + " " + pathIndex);
			this.walkInterval = walkTowards(this.entity, target, this.grid);
			this.onStateChange();
			pathIndex++;
			if (pathIndex == path.length - 1 && onFinalStep)
			{
				onFinalStep();
			}
			else if (pathIndex >= path.length)
			{
				if (this.pathInterval)
				{
					console.log("get REKT");
					clearInterval(this.pathInterval);
				}
				onArrive();
			}
		}, moveSpeed);
	}

	onClick() { }
}

export class PreyBehaviorManager extends BehaviorManager
{
	targetPosition: Vector3Component;
	exitPosition: Vector3Component;
	hasTarget = false;

	constructor(grid: boolean[][], entity: IEntityProps, targetPosition: Vector3Component, exitPosition: Vector3Component, onStateChange: () => void)
	{
		super(grid, entity, onStateChange);
		this.targetPosition = targetPosition;
		this.exitPosition = exitPosition;
		this.prey(false);
	}

	prey(shouldRun: boolean)
	{
		if (this.hasTarget)
		{
			return this.exit(shouldRun);
		}

		this.followPath(this.targetPosition, shouldRun ? 30 : 500, async () =>
		{
			if (this.walkInterval)
			{
				clearInterval(this.walkInterval);
			}
			this.walkInterval = stopWalking(this.entity);
		},
		async () =>
		{
			// TODO Animate mouse and despawn cheese
			await sleep(5000);
			this.hasTarget = true;
			this.exit(shouldRun);
		});
	}

	exit(shouldRun: boolean)
	{
		this.followPath(this.exitPosition, shouldRun ? 30 : 500, null, () =>
		{
			// TODO despawn
		});
	}

	onSpotted()
	{
		this.prey(true);
	}

	onClick()
	{
		this.onSpotted();
	}
}
