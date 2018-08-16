import * as DCL from 'metaverse-api'
import { Vector3Component } from 'metaverse-api';
import * as MathHelper from './mathHelper';
import * as SceneHelper from './sceneHelper';
import { Dog } from 'components/Dog';
import { Cat } from 'components/Cat';
import { Mouse } from 'components/Mouse';
import { Cheese, ICheeseProps } from 'components/Cheese';
import { Entrance, IEntranceProps } from 'components/Entrance';
import { setInterval, clearInterval } from 'timers';
import { Animation } from 'Animation';
import { IEntityProps } from 'SharedProperties';
import { Exit, IExitProps } from 'components/Exit';
import { ITreeProps, Tree } from 'components/Tree';

export interface IState
{
	characterPosition: Vector3Component,
	dog: IEntityProps,
	cat: IEntityProps,
	mouse: IEntityProps,
	trees: ITreeProps[],
}

const cheeseProps: ICheeseProps = {
	position: { x: 10, y: 0, z: 3 }
};
const entranceProps: IEntranceProps = {
	position: { x: 1.5, y: 0, z: 3 },
	rotation: { x: 0, y: 270, z: 0 }
};
const exitProps: IExitProps = {
	position: { x: 28, y: 0, z: 20 },
	rotation: { x: 0, y: 90, z: 0 }
};

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
		trees: [],
	};

	dogInterval: NodeJS.Timer | null = null; // TODO we need more
	grid: boolean[][];

	sceneDidMount()
	{
		this.grid = [];
		for (let x = 0; x < 30; x++)
		{
			this.grid.push([]);
			for (let y = 0; y < 30; y++)
			{
				this.grid[x].push(false);
			}
		}

		this.subscribeTo("positionChanged", (e) =>
		{
			this.setState({ characterPosition: e.position });
		});

		let trees: ITreeProps[] = [];
		for (let i = 0; i < Math.random() * 50 + 1; i++)
		{
			let position;
			do
			{
				position = { x: Math.round(Math.random() * 30), y: 0, z: Math.round(Math.random() * 30) };
			} while (!SceneHelper.isInBounds(position) || this.grid[position.x][position.z]);
			this.grid[position.x][position.z] = true;

			trees.push({
				position,
				rotation: { x: 0, y: Math.random() * 360, z: 0 }
			});
		}
		this.setState({ trees });

		this.followPath("dog", [
			{ x: 5, y: 0, z: 6 },
			{ x: 5, y: 0, z: 7 },
			{ x: 5, y: 0, z: 8 },
			{ x: 5, y: 0, z: 9 },
			{ x: 6, y: 0, z: 9 },
			{ x: 7, y: 0, z: 9 },
			{ x: 8, y: 0, z: 9 },
			{ x: 9, y: 0, z: 9 },
			{ x: 10, y: 0, z: 9 },
			{ x: 11, y: 0, z: 9 },
			{ x: 12, y: 0, z: 9 },
			{ x: 13, y: 0, z: 9 },
		]);

		this.followPath("cat", [
			{ x: 15, y: 0, z: 15 },
			{ x: 15, y: 0, z: 14 },
			{ x: 15, y: 0, z: 13 },
			{ x: 15, y: 0, z: 12 },
			{ x: 14, y: 0, z: 12 },
			{ x: 14, y: 0, z: 11 },
			{ x: 14, y: 0, z: 10 },
			{ x: 14, y: 0, z: 9 },
			{ x: 13, y: 0, z: 9 },
			{ x: 12, y: 0, z: 9 },
			{ x: 11, y: 0, z: 9 },
			{ x: 10, y: 0, z: 9 },
			{ x: 9, y: 0, z: 9 },
			{ x: 8, y: 0, z: 9 },
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
		{ // TODO stop interval when we arrive
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

		this.grid[Math.round(entity.position.x)][Math.round(entity.position.z)] = false;
		if (this.grid[Math.round(targetPosition.x)][Math.round(targetPosition.z)])
		{ // TODO collision (throw exception?)
			entity.position.y = 2;
			this.changeAnimation(entity, Animation.Idle, entityInterval);
			return entity;
		}
		entity.position = targetPosition;
		this.grid[Math.round(entity.position.x)][Math.round(entity.position.z)] = true;
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

	renderTrees()
	{
		return this.state.trees.map((tree) =>
		{
			return Tree(tree);
		});
	}

	async render()
	{
		return (
			<scene>
				{Entrance(entranceProps)}
				{Exit(exitProps)}
				{Cheese(cheeseProps)}
				{Dog(this.state.dog)}
				{Cat(this.state.cat)}
				{Mouse(this.state.mouse)}
				{this.renderTrees()}
			</scene>
		)
	}
}