import { Animation, IAnimalProps } from "ts/SharedProperties";
import { AnimalStateMachine } from "ts/StateMachine/AnimalStateMachine";
import { setTimeout, clearTimeout } from "timers";

export class AnimalState
{
	animalProps: IAnimalProps;
	animationTimeout?: NodeJS.Timer = undefined;

	constructor(animal: IAnimalProps)
	{
		this.animalProps = animal;
	}

	start(): void
	{

	}

	stop(): void
	{
		if (this.animationTimeout)
		{
			clearTimeout(this.animationTimeout);
		}
	}

	processMessage(message: string): boolean
	{
		return false;
	}

	animate(steps: { animation: Animation, for: number }[], then: () => void, stepNumber: number = 0)
	{
		if (stepNumber >= steps.length)
		{
			then();
			return;
		}
		if (steps[stepNumber].for <= 0)
		{
			throw new Error("Invalid sleep time");
		}

		AnimalStateMachine.changeAnimation(this.animalProps.id, steps[stepNumber].animation);
		this.animationTimeout = setTimeout(() =>
		{
			this.animate(steps, then, ++stepNumber);
		}, steps[stepNumber].for);
	}
}