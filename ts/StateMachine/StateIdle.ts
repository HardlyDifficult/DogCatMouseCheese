import { AnimalState } from "ts/StateMachine/AnimalState";
import { AnimalStateMachine } from "ts/StateMachine/AnimalStateMachine";
import { AnimationType, IAnimalProps } from "ts/SharedProperties";

export interface IStateIdleConfig
{
	minLength: number;
	maxLength: number;
	oddsOfSitting: number;
}

export class StateIdle extends AnimalState
{
	config: IStateIdleConfig;

	constructor(animal: IAnimalProps, config: IStateIdleConfig)
	{
		if (!config)
		{
			throw new Error("Missing config");
		}
		super(animal);
		this.config = config;
	}

	start()
	{
		const howLong = Math.random() * (this.config.maxLength - this.config.minLength) + this.config.minLength;
		let steps;
		if (Math.random() < this.config.oddsOfSitting)
		{
			steps = [
				{ animation: AnimationType.Idle, for: 500 },
				{ animation: AnimationType.Sit, for: Math.max(500, howLong - 1000) },
				{ animation: AnimationType.Idle, for: 500 },
			];
		}
		else
		{
			steps = [
				{ animation: AnimationType.Idle, for: howLong },
			];
		}
		this.animate(steps, () =>
		{
			AnimalStateMachine.popState(this.animalProps.id);
		});
	}

	stop()
	{
		super.stop();
	}
}