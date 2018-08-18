const config = require('../config.json');
import { Vector3Component } from "metaverse-api";
import { IAnimalProps, Animation } from "./SharedProperties";
import * as SceneHelper from './SceneHelper';
import { BehaviorManager } from "./BehaviorManager";
import { subToUpdate, emitEvent, unsubToUpdateForObject } from "EventManager";
import { sleep, lengthSquared, subtract, inSphere } from "./MathHelper";

export class PredatorBehaviorManager extends BehaviorManager
{
	getPreyList: () => IAnimalProps[];
	startingPosition: Vector3Component;

	constructor(grid: boolean[][],
		entity: IAnimalProps,
		onStateChange: () => void,
		getPreyList: () => IAnimalProps[])
	{
		super(grid, entity, onStateChange);
		this.getPreyList = getPreyList;
		this.startingPosition = entity.position;
		this.patrol();
	}

	patrol()
	{
		if (this.animalProps.isDead)
		{
			return;
		}
		let targetPosition: Vector3Component;
		do
		{
			targetPosition = SceneHelper.randomPosition();
		} while (!SceneHelper.isPositionAvailable(this.grid, targetPosition)
			|| lengthSquared(subtract(this.startingPosition, targetPosition)) > config.predator.patrolRadius * config.predator.patrolRadius
			|| inSphere(targetPosition, this.startingPosition, 3));

		const patrolAgain = async () =>
		{
			this.changeAnimation(Animation.Idle);
			await sleep(1500 + Math.random() * 2000);
			this.changeAnimation(Animation.Sit);
			await sleep(1500 + Math.random() * 6000);
			this.changeAnimation(Animation.Idle);
			await sleep(1500);
			this.patrol();
		}
		this.followPath(() => targetPosition, config.predator.patrolSpeed, patrolAgain, patrolAgain, 2);

		subToUpdate(this.animalProps.id, "behavior", (callCount) =>
		{
			if (callCount % config.predator.lookAroundSpeed != 0)
			{
				return;
			}
			const preyInSight = this.lookForPrey(config.predator.lookRadius);
			if (preyInSight)
			{
				this.chase(preyInSight);
			}
		});
	}

	lookForPrey(radius: number): IAnimalProps | null
	{
		for (const prey of this.getPreyList())
		{
			if (prey.animalType == this.animalProps.animalType || prey.isDead)
			{
				continue;
			}
			const distanceSquared = lengthSquared(subtract(prey.position, this.animalProps.position));
			if (distanceSquared <= radius * radius)
			{
				return prey;
			}
		}

		return null;
	}

	chase(animal: IAnimalProps)
	{
		emitEvent("startChasingPrey", animal);
		this.followPath(() =>
		{
			if (animal.isDead)
			{
				return null;
			}
			return animal.position;
		}, config.predator.attackSpeed, async () =>
		{
			unsubToUpdateForObject(this.animalProps.id);
			emitEvent("caughtPrey", animal);
			this.animalProps.lookAtPosition = animal.position;
			this.changeAnimation(Animation.Drink);
			await sleep(2000);
			this.changeAnimation(Animation.Idle);
			await sleep(500);
			this.patrol();
		}, () =>
			{ // It got away
			this.patrol()
			}, 1);
	}
}
