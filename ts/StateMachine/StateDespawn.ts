import { AnimalState } from "ts/StateMachine/AnimalState";
import { IAnimalProps } from "ts/SharedProperties";
import { setTimeout, clearTimeout } from "timers";
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
		this.timeout = setTimeout(() => this.despawn(), this.config.delay || 0);
	}

	stop()
	{
		if (this.timeout)
		{
			clearTimeout(this.timeout);
		}
	}

	despawn()
	{
		EventManager.emit("despawn", this.animalProps.id);
	}
}



