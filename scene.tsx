import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';
import * as MathHelper from './mathHelper';
//import * as SceneHelper from './sceneHelper';
import { Dog } from 'components/Dog';
import { Cat } from 'components/Cat';
import { Mouse } from 'components/Mouse';
import { Cheese, ICheeseProps } from 'components/Cheese';
import { setInterval, clearInterval } from 'timers';
import { Animation } from 'Animation';
import { IEntityProps } from 'SharedProperties';

export interface IState
{
	characterPosition: Vector3Component,
	dog: IEntityProps,
	cat: IEntityProps,
	mouse: IEntityProps,
}

//enum PreyGoal
//{
//	Idle,
//	Sit,
//	Follow,
//	GoDrink,
//	Drinking,
//}

const cheeseProps: ICheeseProps = { position: { x: 10, y: 0, z: 3 } };

export default class DogCatMouseCheese extends DCL.ScriptableScene<any, IState>
{
	state = {
		characterPosition: { x: 0, y: 0, z: 0 },
		dog: {
			position: { x: 5, y: 0, z: 5 },
			lookAtPosition: { x: 5, y: 0, z: 6 },
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
			]
		},
		cat: {
			position: { x: 15, y: 0, z: 15 },
			lookAtPosition: { x: 15, y: 0, z: 14 },
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
			]
		},
		mouse: {
			position: { x: 10, y: 0, z: 10 },
			lookAtPosition: { x: 11, y: 0, z: 10 },
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
			]
		},
	};

	dogInterval: NodeJS.Timer | null = null;

	sceneDidMount()
	{
		this.subscribeTo("positionChanged", (e) =>
		{
			this.setState({ characterPosition: e.position });
		});

		this.followPath("dog", [
			{ x: 5, y: 0, z: 6 },
			{ x: 5, y: 0, z: 7 },
			{ x: 5, y: 0, z: 8 },
			{ x: 5, y: 0, z: 9 },
			{ x: 6, y: 0, z: 9 },
			{ x: 7, y: 0, z: 9 },
			{ x: 8, y: 0, z: 9 },
			{ x: 9, y: 0, z: 9 },
		]);

		this.followPath("cat", [
			{ x: 15, y: 0, z: 15 },
			{ x: 15, y: 0, z: 14 },
			{ x: 15, y: 0, z: 13 },
			{ x: 15, y: 0, z: 12 },
			{ x: 14, y: 0, z: 12 },
		]);

		this.followPath("mouse", [
			{ x: 10, y: 0, z: 11 },
			{ x: 10, y: 0, z: 12 },
			{ x: 10, y: 0, z: 13 },
			{ x: 10, y: 0, z: 14 },
			{ x: 10, y: 0, z: 15 },
		]);
	}

	followPath(entityType: (keyof IState), path: Vector3Component[])
	{
		let pathIndex = 0;
		setInterval(() =>
		{
			if (++pathIndex >= path.length)
			{
				pathIndex = path.length - 1;
			}
			let state: any = {};
			state[entityType] = this.walkTowards(this.state[entityType] as IEntityProps, path[pathIndex], this.dogInterval);
			this.setState(state);
		}, 500);
	}

	walkTowards(entity: IEntityProps, targetPosition: Vector3Component, entityInterval: NodeJS.Timer | null): IEntityProps
	{
		const toTarget = MathHelper.subtract(targetPosition, entity.position);
		if (MathHelper.isZero(toTarget))
		{ // Already there
			this.changeAnimation(entity, Animation.Idle, entityInterval);
			return entity;
		}

		entity.position = targetPosition;
		// Look past the target
		entity.lookAtPosition = MathHelper.add(targetPosition, toTarget); 
		this.changeAnimation(entity, Animation.Walk, entityInterval);
		return entity;
	}

	changeAnimation(entity: IEntityProps, animation: Animation, entityInterval: NodeJS.Timer | null)
	{
		if (entityInterval)
		{
			clearInterval(entityInterval);
		}
		const animationDeltaPerFrame = 1 / (1 * 1000 / 60);
		entityInterval = setInterval(() =>
		{
			let isDone = true;
			for (let animationWeight of entity.animationWeights)
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

			if (isDone && entityInterval)
			{
				clearInterval(entityInterval);
			}
		}, 1000/60);
	}

	async render()
	{
		return (
			<scene>
				{Dog(this.state.dog)}
				{Cat(this.state.cat)}
				{Mouse(this.state.mouse)}
				{Cheese(cheeseProps)}
			</scene>
		)
	}
}