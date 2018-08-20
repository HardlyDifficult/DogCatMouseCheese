import { AnimalStateMachine } from "ts/StateMachine/AnimalStateMachine";
import { AnimalState } from "ts/StateMachine/AnimalState";
import { Vector3Component } from "metaverse-api";
import { IAnimalProps, AnimalType } from "ts/SharedProperties";
import { lengthSquared, subtract, inSphere } from "ts/MathHelper";
import { StateEat, IStateEatConfig } from "ts/StateMachine/StateEat";
import { StateIdle, IStateIdleConfig } from "ts/StateMachine/StateIdle";
import { StateGoTo, IStateGoToConfig } from "ts/StateMachine/StateGoTo";
import { Grid } from "ts/Grid";

interface IStatePatrolConfig
{
	eatConfig: IStateEatConfig,
	idleConfig: IStateIdleConfig,
	wanderConfig: IStateGoToConfig,

	minRadius: number,
	maxRadius: number,
	chanceOfMoving: number,

	preyType: AnimalType,
	scanRadius: number,
}

export class StatePatrol extends AnimalState
{
	config: IStatePatrolConfig;
	patrolAround: { position: Vector3Component };

	constructor(animal: IAnimalProps, patrolAround: { position: Vector3Component }, config: IStatePatrolConfig)
	{
		super(animal);
		this.config = config;
		this.patrolAround = patrolAround;

		if (!this.config.eatConfig)
		{
			throw new Error("Missing eatConfig")
		}
	}

	start()
	{
		let prey = this.lookForPrey()
		if (prey)
		{ // Hunt
			AnimalStateMachine.pushState(new StateEat(this.animalProps, prey, this.config.eatConfig));
		}
		else if (Math.random() < this.config.chanceOfMoving)
		{ // Move
			let targetPosition;
			do
			{
				targetPosition = Grid.randomPosition();
			} while (!inSphere(targetPosition, this.patrolAround.position, this.config.maxRadius)
				|| inSphere(targetPosition, this.patrolAround.position, this.config.minRadius));

			AnimalStateMachine.pushState(new StateGoTo(this.animalProps, { position: targetPosition }, this.config.wanderConfig));
		}
		else
		{ // Idle
			AnimalStateMachine.pushState(new StateIdle(this.animalProps, this.config.idleConfig))
		}
	}

	lookForPrey(): IAnimalProps | null
	{
		for (const prey of AnimalStateMachine.getAnimals((a) => a.animalProps.animalType == this.config.preyType && !a.animalProps.isDead))
		{
			const distanceSquared = lengthSquared(subtract(prey.animalProps.position, this.animalProps.position));
			if (distanceSquared <= this.config.scanRadius * this.config.scanRadius)
			{
				return prey.animalProps;
			}
		}

		return null;
	}

	processMessage(message: string): boolean
	{ 
		return true;
	}
}
