import { Vector3Component } from "metaverse-api";
import { AnimalState } from "ts/StateMachine/AnimalState";
import { IAnimalProps, Animation } from "ts/SharedProperties";
import { setInterval, clearInterval } from "timers";
import { subtract, isZero, calcPath, add, div, equals, lengthSquared, mul } from "ts/MathHelper";
import { AnimalStateMachine } from "ts/StateMachine/AnimalStateMachine";
import { Grid } from "ts/Grid";
import { IStateIdleConfig, StateIdle } from "ts/StateMachine/StateIdle";

export interface IStateGoToConfig
{
	moveSpeed: number;
	panicSpeed?: number;
}

export class StateGoTo extends AnimalState
{
	target: {
		position: Vector3Component,
		isDead?: boolean
	};
	config: IStateGoToConfig;
	blockedConfig?: IStateIdleConfig;
	interval?: NodeJS.Timer = undefined;
	inPanic: boolean = false;

	constructor(animal: IAnimalProps, target: { position: Vector3Component, isDead?: boolean }, config: IStateGoToConfig, blockedConfig?: IStateIdleConfig)
	{
		super(animal);

		this.target = target;
		this.config = config;
		this.blockedConfig = blockedConfig;

		if (!(this.config.moveSpeed > 0))
		{
			throw new Error("You can't walk that fast");
		}
	}

	start()
	{
		const speed = this.inPanic ? (this.config.panicSpeed || this.config.moveSpeed) : this.config.moveSpeed;
		this.animalProps.moveDuration = speed;
		const targetPosition = this.target.position;
		const path = calcPath(this.animalProps.position, targetPosition);
		if (this.target.isDead || path.length <= 0)
		{
			if (this.blockedConfig && !this.target.isDead)
			{
				return AnimalStateMachine.pushState(new StateIdle(this.animalProps, this.blockedConfig));
			}
			else
			{
				return AnimalStateMachine.popState(this.animalProps.id);
			}
		}

		if (path.length == 1)
		{
			return AnimalStateMachine.popState(this.animalProps.id);
		}

		let pathIndex = 1;
		this.interval = setInterval(() =>
		{
			let target = path[pathIndex];
			if (pathIndex < path.length - 1)
			{ // Smooth diag movement
				target = add(target, path[pathIndex + 1]);
				target = div(target, 2);
			}
			try
			{
				this.walkTowards(target);
			}
			catch (e)
			{
				return this.repath();
			}
			pathIndex++;
			if (pathIndex >= path.length
				|| this.target.isDead)
			{
				return AnimalStateMachine.popState(this.animalProps.id);
			}

			if (!equals(this.target.position, targetPosition))
			{
				return this.repath();
			}
		}, speed);
	}

	repath()
	{
		this.stop();
		this.start();
	}

	stop()
	{
		if (this.interval)
		{
			clearInterval(this.interval);
		}
	}

	walkTowards(targetPosition: Vector3Component)
	{
		const toTarget = subtract(targetPosition, this.animalProps.position);
		if (isZero(toTarget))
		{ // Already there
			AnimalStateMachine.changeAnimation(this.animalProps.id, Animation.Idle);
			return;
		}

		Grid.clear(this.animalProps.position);
		if (!Grid.isAvailable(targetPosition))
		{
			Grid.set(this.animalProps.position);
			throw new Error("Space occupied, can't walk there.");
		}
		this.animalProps.position = targetPosition;
		Grid.set(this.animalProps.position);
		if (lengthSquared(toTarget) > .1)
		{
			// Look past the target
			this.animalProps.lookAtPosition = add(targetPosition, mul(toTarget, 10));
		}
		AnimalStateMachine.changeAnimation(this.animalProps.id, this.inPanic ? Animation.Run : Animation.Walk);
	}

	processMessage(message: string): boolean
	{
		if (message == "panic")
		{
			this.inPanic = true;
			this.repath();
			return true;
		}

		return super.processMessage(message);
	}
}



