import { AnimationType, IAnimalProps } from "ts/SharedProperties";
import { setInterval, clearInterval } from "timers";
import { EventManager } from "ts/EventManager";
import { AnimalState } from "ts/StateMachine/AnimalState";

export namespace AnimalStateMachine
{
	interface AnimalStateObject
	{
		animalProps: IAnimalProps,
		stateStack: AnimalState[],
		animationInterval?: NodeJS.Timer 
	};
	const animalStates: AnimalStateObject[] = [];

	export function getAnimals(where: (a: AnimalStateObject) => boolean)
	{
		return animalStates.filter(where);
	}

	export function getAnimalProps(id: string): IAnimalProps | undefined
	{
		let state = animalStates.find(a => a.animalProps.id == id);
		if (state)
		{
			return state.animalProps;
		}

		return undefined;
	}

	export function pushState(state: AnimalState)
	{
		let animalState = animalStates.find(s => s.animalProps.id == state.animalProps.id);
		if (!animalState)
		{
			animalState = {
				animalProps: state.animalProps,
				stateStack: [state],
				animationInterval: undefined
			};
			animalStates.push(animalState);
		}
		else
		{
			const previousState = animalState.stateStack[animalState.stateStack.length - 1];
			if (previousState)
			{
				previousState.stop();
			}
			animalState.stateStack.push(state);
		}

		animalState.stateStack[animalState.stateStack.length - 1].start();
	}

	export function pushStates(states: AnimalState[])
	{
		let animalState = animalStates.find(s => s.animalProps.id == states[0].animalProps.id);
		if (!animalState)
		{
			animalState = {
				animalProps: states[0].animalProps,
				stateStack: states,
				animationInterval: undefined
			};
			animalStates.push(animalState);
		}
		else
		{
			const previousState = animalState.stateStack[animalState.stateStack.length - 1];
			if (previousState)
			{
				previousState.stop();
			}
			for (const state of states)
			{
				animalState.stateStack.push(state);
			}
		}

		animalState.stateStack[animalState.stateStack.length - 1].start();
	}

	export function popState(id: string)
	{
		const animalState = animalStates.find(s => s.animalProps.id == id);
		if (!animalState)
		{
			throw new Error("Animal not found");
		}
		if (animalState.stateStack.length <= 1)
		{
			throw new Error("You're popping everything!");
		}

		const previousState = animalState.stateStack.pop();
		if (previousState)
		{
			previousState.stop();
		}
		animalState.stateStack[animalState.stateStack.length - 1].start();
	}

	export function sendMessage(objectId: string, message: string)
	{
		const animalState = animalStates.find(s => s.animalProps.id == objectId);
		if (!animalState)
		{
			throw new Error("Animal not found");
		}
		while (!animalState.stateStack[animalState.stateStack.length - 1].processMessage(message))
		{
			popState(objectId);
		}
	}

	export function terminate(objectId: string)
	{
		const index = animalStates.findIndex(s => s.animalProps.id == objectId);
		if (index < 0)
		{
			throw new Error("Animal not found");
		}
		const animalState = animalStates[index];
		animalState.stateStack[animalState.stateStack.length - 1].stop();
		if (animalState.animationInterval)
		{
			clearInterval(animalState.animationInterval);
		}

		animalStates[index] = animalStates[animalStates.length - 1];
		animalStates.length--;
	}

	export function changeAnimation(id: string, animation: AnimationType)
	{
		const animalState = animalStates.find(s => s.animalProps.id == id);
		if (!animalState)
		{
			throw new Error("Animal not found");
		}
		if (animalState.animationInterval)
		{
			clearInterval(animalState.animationInterval);
		}
		const animationDeltaPerFrame = .25 / (1000 / 60);
		animalState.animationInterval = setInterval(() =>
		{
			let isDone = true;
			for (let animationWeight of animalState.animalProps.animationWeights)
			{
				if (animationWeight.animation == animation)
				{
					animationWeight.weight += animationDeltaPerFrame;
					if (animationWeight.weight >= 1)
					{
						animationWeight.weight = 1;
					}
					else
					{
						isDone = false;
					}
				}
				else
				{
					animationWeight.weight -= animationDeltaPerFrame;
					if (animationWeight.weight <= 0)
					{
						animationWeight.weight = 0;
					}
					else
					{
						isDone = false;
					}
				}
			}
			EventManager.emit("renderAnimals");

			if (isDone)
			{
				if (animalState.animationInterval)
				{
					clearInterval(animalState.animationInterval);
				}
			}
		}, 1000 / 60);
	}
}