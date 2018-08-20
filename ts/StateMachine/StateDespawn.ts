import { AnimalState } from "ts/StateMachine/AnimalState";
import { IAnimalProps, Animation } from "ts/SharedProperties";
import { EventManager } from "ts/EventManager";

export interface IStateDespawnConfig
{
	delay?: number;
}

export class StateDespawn extends AnimalState
{
	config: IStateDespawnConfig;
	timeout?: NodeJS.Timer = undefined;

	constructor(animal: IAnimalProps, config: IStateDespawnConfig)
	{
		super(animal);
		this.config = config;
	}

	start()
	{
		this.animate([{ animation: Animation.Dead, for: this.config.delay || 0 }], () => this.despawn());
	}

	despawn()
	{
		EventManager.emit("despawn", this.animalProps.id);
	}

	processMessage(message: string): boolean
	{
		return true;
	}
}



