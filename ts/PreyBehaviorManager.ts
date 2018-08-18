const config = require('../config.json');
import { Vector3Component } from "metaverse-api";
import { IAnimalProps, Animation } from "./SharedProperties";
import { BehaviorManager } from "./BehaviorManager";
import { emitEvent, unsubToUpdateForObject } from "EventManager";
import { sleep, add } from "ts/MathHelper";

export class PreyBehaviorManager extends BehaviorManager
{
	targetPosition: Vector3Component;
	exitPosition: Vector3Component;
	hasTarget = false;

	constructor(grid: boolean[][], entity: IAnimalProps, targetPosition: Vector3Component, exitPosition: Vector3Component, onStateChange: () => void)
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

		this.followPath(() => this.getTargetPosition(), shouldRun ? config.prey.sprintSpeed : config.prey.sneakSpeed, async () =>
		{
			unsubToUpdateForObject(this.animalProps.id);
			this.animalProps.lookAtPosition = this.targetPosition;
			this.changeAnimation(Animation.Drink);
			await sleep(1500 * (shouldRun ? .5 : 1));
			this.hasTarget = true;
			emitEvent("captureCheese");
			await sleep(500 * (shouldRun ? .5 : 1));
			this.exit(shouldRun);
		}, async () =>
			{
				this.exit(shouldRun);
			});
	}

	getTargetPosition(): Vector3Component | null
	{
		for (const position of [
			add(this.targetPosition, { x: -1, y: 0, z: 0 }),
			add(this.targetPosition, { x: -1, y: 0, z: 1 }),
			add(this.targetPosition, { x: -1, y: 0, z: -1 }),
			add(this.targetPosition, { x: 0, y: 0, z: 1 }),
			add(this.targetPosition, { x: 0, y: 0, z: -1 }),
			add(this.targetPosition, { x: 1, y: 0, z: 0 }),
			add(this.targetPosition, { x: 1, y: 0, z: 1 }),
			add(this.targetPosition, { x: 1, y: 0, z: -1 }),
		])
		{
			if (!this.grid[Math.round(position.x)][Math.round(position.z)])
			{
				return position;
			}
		}

		return null;
	}

	exit(shouldRun: boolean)
	{
		this.followPath(() => this.exitPosition, shouldRun ? config.prey.sprintSpeed : config.prey.sneakSpeed, () =>
		{
			emitEvent("preyExit", this.animalProps);
		}, async () =>
			{
				await sleep(1000);
				this.exit(shouldRun);
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
