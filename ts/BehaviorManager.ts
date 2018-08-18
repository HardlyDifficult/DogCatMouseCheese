import { Vector3Component } from "metaverse-api";
import { IAnimalProps, Animation } from "./SharedProperties";
import * as SceneHelper from './SceneHelper';
import { subToUpdate, unsubToUpdate } from "EventManager";
import { calcPath, equals, subtract, isZero, lengthSquared, mul, div, add } from "ts/MathHelper";

export class BehaviorManager
{
	grid: boolean[][];
	animalProps: IAnimalProps;
	onStateChange: () => void;

	constructor(grid: boolean[][], entity: IAnimalProps, onStateChange: () => void)
	{
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
		if (this.animalProps.isDead)
		{
			return;
		}
		this.animalProps.moveDuration = moveSpeed * 1000 / 50; // Smooth motion
		const targetPosition = getTargetPosition();
		if (!targetPosition)
		{
			return onFail();
		}
		const path = calcPath(this.animalProps.position, targetPosition,
			(p) => SceneHelper.isPositionAvailable(this.grid, p), maxDistanceFromEnd);
		if (!path || path.length <= 0)
		{
			return onFail();
		}

		let pathIndex = 0;
		subToUpdate(this.animalProps.id, "move", (callCount) =>
		{
			if (callCount % moveSpeed != 0)
			{
				return;
			}

			let target = path[pathIndex];
			if (pathIndex < path.length - 1)
			{ // Smooth diag movement
				target = add(target, path[pathIndex + 1]);
				target = div(target, 2);
			}
			try
			{
				this.walkTowards(this.animalProps, target);
			}
			catch (e)
			{
				unsubToUpdate(this.animalProps.id, "move");
				return this.followPath(getTargetPosition, moveSpeed, onArrive, onFail, maxDistanceFromEnd);
			}
			this.onStateChange();

			if (!equals(getTargetPosition(), targetPosition))
			{ // The target moved
				unsubToUpdate(this.animalProps.id, "move");
				return this.followPath(getTargetPosition, moveSpeed, onArrive, onFail, maxDistanceFromEnd);
			}

			pathIndex++;
			if (pathIndex >= path.length)
			{
				unsubToUpdate(this.animalProps.id, "move");
				onArrive();
			}
		});
	}

	onClick() { }

	walkTowards(animal: IAnimalProps, targetPosition: Vector3Component)
	{
		const toTarget = subtract(targetPosition, animal.position);
		if (isZero(toTarget))
		{ // Already there
			this.changeAnimation(Animation.Idle);
			return;
		}

		this.grid[Math.round(animal.position.x)][Math.round(animal.position.z)] = false;
		if (this.grid[Math.round(targetPosition.x)][Math.round(targetPosition.z)])
		{
			throw new Error("Space occupied, can't walk there.");
		}
		animal.position = targetPosition;
		this.grid[Math.round(animal.position.x)][Math.round(animal.position.z)] = true;
		if (lengthSquared(toTarget) > .1)
		{
			// DCL: Look past the target.  If this is near targetPosition it may not render
			animal.lookAtPosition = add(targetPosition, mul(toTarget, 10));
		}
		this.changeAnimation(Animation.Walk);
	}

	changeAnimation(animation: Animation)
	{
		if (this.animalProps.isDead)
		{
			return;
		}
		const animationDeltaPerFrame = .25 / (1000 / 60);
		subToUpdate(this.animalProps.id, "changeAnimation", () =>
		{
			let isDone = true;
			for (let animationWeight of this.animalProps.animationWeights)
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

				this.onStateChange();
			}
			if (isDone)
			{
				unsubToUpdate(this.animalProps.id, "changeAnimation");
			}
		});
	}
}