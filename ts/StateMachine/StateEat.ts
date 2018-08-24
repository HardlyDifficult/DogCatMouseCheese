import { AnimalState } from "ts/StateMachine/AnimalState";
import { AnimalStateMachine } from "ts/StateMachine/AnimalStateMachine";
import { AnimationType, IAnimalProps } from "ts/SharedProperties";
import { lengthSquared, subtract } from "ts/MathHelper";
import { StateGoTo, IStateGoToConfig } from "ts/StateMachine/StateGoTo";
import { EventManager } from "ts/EventManager";
import { Vector3Component } from "metaverse-api";
import { IStateIdleConfig } from "ts/StateMachine/StateIdle";
import { StateDespawn } from "ts/StateMachine/StateDespawn";

export interface IStateEatConfig
{
	eatRange: number;
	huntConfig: IStateGoToConfig;
}

interface IPrey
{
	id: string,
	position: Vector3Component,
	isDead?: boolean
}

export class StateEat extends AnimalState
{
	prey: IPrey;
	config: IStateEatConfig;
	blockedConfig?: IStateIdleConfig;

	constructor(animal: IAnimalProps, prey: IPrey, config: IStateEatConfig, blockedConfig?: IStateIdleConfig)
	{
		super(animal);
		this.prey = prey;
		this.config = config;
		this.blockedConfig = blockedConfig;

		if (!this.config.huntConfig)
		{
			throw new Error("Missing huntConfig");
		}
	}

	start()
	{
		if (this.prey.isDead)
		{
			AnimalStateMachine.popState(this.animalProps.id);
		}
		else if (lengthSquared(subtract(this.prey.position, this.animalProps.position)) <= this.config.eatRange * this.config.eatRange)
		{
			if (this.prey.isDead !== undefined)
			{
				let animal = AnimalStateMachine.getAnimalProps(this.prey.id);
				if (animal)
				{
					AnimalStateMachine.pushState(new StateDespawn(animal, { delay: 1000 }))
				}
			}
			else
			{
				EventManager.emit("captureCheese", this.prey.id, 1000);
			}
			this.animalProps.lookAtPosition = this.prey.position;
			EventManager.emit("renderAnimals");
			this.animate([
				{ animation: AnimationType.Drink, for: 1500 },
				{ animation: AnimationType.Idle, for: 500 },
				{ animation: AnimationType.Sit, for: 2000 },
				{ animation: AnimationType.Idle, for: 500 },
			], () =>
				{
					AnimalStateMachine.popState(this.animalProps.id);
				});
		}
		else
		{
			if (this.prey.isDead !== undefined)
			{
				AnimalStateMachine.sendMessage(this.prey.id, "panic");
			}
			AnimalStateMachine.pushState(new StateGoTo(this.animalProps, this.prey, this.config.huntConfig, this.blockedConfig));
		}
	}
}