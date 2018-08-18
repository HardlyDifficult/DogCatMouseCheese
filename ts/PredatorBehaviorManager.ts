const config = require('../config.json');
import { Vector3Component, EventSubscriber } from "metaverse-api";
import { IAnimalProps, Animation } from "./SharedProperties";
import * as MathHelper from './MathHelper';
import * as SceneHelper from './SceneHelper';
import { BehaviorManager } from "./BehaviorManager";
import { clearInterval, setInterval } from "timers";
import { changeAnimation } from "ts/Actions";

export class PredatorBehaviorManager extends BehaviorManager
{
	getPreyList: () => IAnimalProps[];
	startingPosition: Vector3Component;
	predatorInterval: NodeJS.Timer | null = null;

	constructor(eventSubscriber: EventSubscriber,
		grid: boolean[][],
		entity: IAnimalProps,
		onStateChange: () => void,
		getPreyList: () => IAnimalProps[])
	{
		super(eventSubscriber, grid, entity, onStateChange);
		this.getPreyList = getPreyList;
		this.startingPosition = entity.position;
		this.patrol();
	}

	patrol()
	{
		let targetPosition: Vector3Component;
		do
		{
			targetPosition = SceneHelper.randomPosition();
		} while (!SceneHelper.isPositionAvailable(this.grid, targetPosition)
			|| MathHelper.lengthSquared(MathHelper.subtract(this.startingPosition, targetPosition)) > config.patrolRadius * config.patrolRadius);

		const patrolAgain = async () =>
		{
			if (this.walkInterval)
			{
				clearInterval(this.walkInterval);
			}
			this.walkInterval = changeAnimation(this.animalProps, Animation.Sit);
			await MathHelper.sleep(1500);
			this.patrol();
		}
		this.followPath(() => targetPosition, config.speeds.predatorPatrol, patrolAgain, patrolAgain, 2);

		if (this.predatorInterval)
		{
			clearInterval(this.predatorInterval);
		}
		this.predatorInterval = setInterval(() =>
		{
			const preyInSight = this.lookForPrey(10);
			if (preyInSight)
			{
				if (this.predatorInterval)
				{
					clearInterval(this.predatorInterval);
				}
				this.chase(preyInSight);
			}
		}, 3000);
	}

	lookForPrey(radius: number): IAnimalProps | null
	{
		for (const prey of this.getPreyList())
		{
			if (prey.animalType == this.animalProps.animalType)
			{
				continue;
			}
			const distanceSquared = MathHelper.lengthSquared(MathHelper.subtract(prey.position, this.animalProps.position));
			if (distanceSquared <= radius * radius)
			{
				console.log("Spotted!");
				return prey;
			}
		}

		return null;
	}

	chase(animal: IAnimalProps)
	{
		this.eventSubscriber.emit("startChasingPrey", animal);
		this.followPath(() =>
		{
			if (animal.isDead)
			{
				return null;
			}
			console.log(animal.position);
			return animal.position;
		}, config.speeds.predatorAttack, () =>
		{
			console.log("caught prey");
			this.eventSubscriber.emit("caughtPrey", animal);
		}, () =>
			{ // It got away
			console.log("got away");
			this.patrol()
			}, 2);
	}

	stop()
	{
		super.stop();
		if (this.predatorInterval)
		{
			clearInterval(this.predatorInterval);
		}
	}
}
