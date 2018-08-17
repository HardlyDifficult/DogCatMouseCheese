const config = require('../config.json');
import { Vector3Component, EventSubscriber } from "metaverse-api";
import * as MathHelper from "./MathHelper";
import { IAnimalProps } from "./SharedProperties";
import { BehaviorManager } from "./BehaviorManager";

export class PreyBehaviorManager extends BehaviorManager
{
	targetPosition: Vector3Component;
	exitPosition: Vector3Component;
	hasTarget = false;

	constructor(eventSubscriber: EventSubscriber, grid: boolean[][], entity: IAnimalProps, targetPosition: Vector3Component, exitPosition: Vector3Component, onStateChange: () => void)
	{
		super(eventSubscriber, grid, entity, onStateChange);
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

		this.followPath(() => this.getTargetPosition(), shouldRun ? config.speeds.preySprint : config.speeds.preySneak, async () =>
		{
			this.stop();
			await MathHelper.sleep(1500);
			this.hasTarget = true;
			this.eventSubscriber.emit("captureCheese");
			await MathHelper.sleep(500);
			this.exit(shouldRun);
		}, async () =>
			{
				this.exit(shouldRun);
			});
	}

	getTargetPosition(): Vector3Component | null
	{
		for (const position of [
			MathHelper.add(this.targetPosition, { x: 1, y: 0, z: 0 }),
			MathHelper.add(this.targetPosition, { x: 1, y: 0, z: 1 }),
			MathHelper.add(this.targetPosition, { x: 1, y: 0, z: -1 }),
			MathHelper.add(this.targetPosition, { x: 0, y: 0, z: 1 }),
			MathHelper.add(this.targetPosition, { x: 0, y: 0, z: -1 }),
			MathHelper.add(this.targetPosition, { x: -1, y: 0, z: 0 }),
			MathHelper.add(this.targetPosition, { x: -1, y: 0, z: 1 }),
			MathHelper.add(this.targetPosition, { x: -1, y: 0, z: -1 }),
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
		this.followPath(() => this.exitPosition, shouldRun ? 30 : 500, () =>
		{
			this.eventSubscriber.emit("mouseEscape", this.animalProps);
		}, async () =>
			{
				await MathHelper.sleep(1000);
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
