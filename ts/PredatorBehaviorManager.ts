const config = require('../config.json');
import { Vector3Component, EventSubscriber } from "metaverse-api";
import { IAnimalProps } from "./SharedProperties";
import * as MathHelper from './MathHelper';
import * as SceneHelper from './SceneHelper';
import { BehaviorManager } from "./BehaviorManager";
import { clearInterval, setInterval } from "timers";

export class PredatorBehaviorManager extends BehaviorManager
{
	preyList: IAnimalProps[];
	predatorInterval: NodeJS.Timer | null = null;
	startingPosition: Vector3Component;

	constructor(eventSubscriber: EventSubscriber, grid: boolean[][], entity: IAnimalProps, onStateChange: () => void, preyList: IAnimalProps[])
	{
		super(eventSubscriber, grid, entity, onStateChange);
		this.preyList = preyList;
		this.startingPosition = entity.position;
		this.patrol();
	}

	patrol()
	{
		let targetPosition: Vector3Component;
		do
		{
			targetPosition = SceneHelper.randomPosition();
		} while (!SceneHelper.isInBounds(targetPosition) || SceneHelper.isSceneryPosition(targetPosition)
			|| MathHelper.lengthSquared(MathHelper.subtract(this.startingPosition, targetPosition)) > config.patrolRadius * config.patrolRadius);

		const patrolAgain = async () =>
		{
			this.stop();
			await MathHelper.sleep(1500);
			this.patrol();
		}
		this.followPath(() => targetPosition, 500, patrolAgain, patrolAgain);

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
		for (const prey of this.preyList)
		{
			if (prey.animalType == this.animalProps.animalType)
			{
				continue;
			}
			const distanceSquared = MathHelper.lengthSquared(MathHelper.subtract(prey.position, this.animalProps.position));
			if (distanceSquared <= radius * radius)
			{
				return prey;
			}
		}

		return null;
	}

	chase(entity: IAnimalProps)
	{
		this.eventSubscriber.emit("chase", entity);
		this.followPath(() => entity.position, 300, () =>
		{
			this.eventSubscriber.emit("caught", entity);
		}, () =>
			{ // It got away
				this.patrol()
			});
	}
}
