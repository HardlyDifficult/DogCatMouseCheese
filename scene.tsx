const config = require('./config.json');
import * as DCL from 'metaverse-api';
import { Vector3Component } from 'metaverse-api';
import * as MathHelper from './mathHelper';
import * as SceneHelper from './sceneHelper';
import { Dog } from 'components/Dog';
import { Cat } from 'components/Cat';
import { Mouse } from 'components/Mouse';
import { Cheese, ICheeseProps } from 'components/Cheese';
import { Entrance, IEntranceProps } from 'components/Entrance';
import { Animation } from 'Animation';
import { IEntityProps } from 'SharedProperties';
import { Exit, IExitProps } from 'components/Exit';
import { ITreeProps, Tree } from 'components/Tree';
import { BehaviorManager, PreyBehaviorManager } from 'Behaviors';

// TODO can we arrive (slow down walk animation before stop moving

export interface IState
{
	characterPosition: Vector3Component,
	dog: IEntityProps,
	cat: IEntityProps,
	mice: IEntityProps[],
	trees: ITreeProps[],
}

const cheeseProps: ICheeseProps = {
	position: { x: 10, y: 0, z: 3 }
};
const entranceProps: IEntranceProps = {
	position: { x: 2, y: 0, z: 3 },
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
			id: "Dog",
			position: { x: 1, y: 0, z: 15 },
			lookAtPosition: { x: 5, y: 0, z: 6 },
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
			]
		},
		cat: {
			id: "Cat",
			position: { x: 29, y: 0, z: 15 },
			lookAtPosition: { x: 15, y: 0, z: 14 },
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
			]
		},
		mice: new Array<IEntityProps>(),
		trees: [],
	};

	objectCounter = 0;
	preyBehavior: BehaviorManager | null = null;
	grid: boolean[][] = [];

	sceneDidMount()
	{
		this.createGrid();
		this.spawnTrees();
		this.subscribeTo("positionChanged", (e) =>
		{
			this.setState({ characterPosition: e.position });
		});
		this.eventSubscriber.on("Entrance_click", () =>
		{
			if (this.grid[Math.round(entranceProps.position.x)][Math.round(entranceProps.position.z)])
			{ // Space is occupied, can't spawn
				return;
			}
			this.grid[Math.round(entranceProps.position.x)][Math.round(entranceProps.position.z)] = true;

			let mice = this.state.mice.slice();
			const mouse = {
				id: "Mouse" + this.objectCounter++,
				position: entranceProps.position, 
				lookAtPosition: MathHelper.add(entranceProps.position, { x: 0, y: 0, z: 1 }),
				animationWeights: [
					{ animation: Animation.Idle, weight: 1 },
					{ animation: Animation.Walk, weight: 0 },
				]
			};
			mice.push(mouse);
			this.setState({ mice });

			this.preyBehavior = new PreyBehaviorManager(this.grid, mouse, cheeseProps.position, exitProps.position, () =>
			{
				this.setState({ mice: this.state.mice });
			});
			this.eventSubscriber.on(mouse.id + "_click", () =>
			{
				if (this.preyBehavior)
				{
					this.preyBehavior.onClick();
				}
			});
		});
		//this.followPath("dog", { x: 29, y: 0, z: 15 });
		//this.followPath("cat", { x: 1, y: 0, z: 15 });
	}

	createGrid()
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
	}

	spawnTrees()
	{
		let trees: ITreeProps[] = [];
		const range: number = config.trees.max - config.trees.min;
		for (let i = 0; i < Math.random() * range + config.trees.min; i++)
		{
			let position;
			do
			{
				position = { x: Math.round(Math.random() * 30), y: 0, z: Math.round(Math.random() * 30) };
			} while (!SceneHelper.isInBounds(position) || this.grid[position.x][position.z] || this.isSceneryPosition(position));
			this.grid[position.x][position.z] = true;

			trees.push({
				position,
				rotation: { x: 0, y: Math.random() * 360, z: 0 }
			});
		}
		this.setState({ trees });
	}

	isSceneryPosition(position: Vector3Component)
	{
		return MathHelper.inSphere(position, cheeseProps.position, 2)
			|| MathHelper.inSphere(position, entranceProps.position, 3)
			|| MathHelper.inSphere(position, exitProps.position, 3);
	}

	renderTrees()
	{
		return this.state.trees.map((tree) =>
		{
			return Tree(tree);
		});
	}

	renderMice()
	{
		return this.state.mice.map((mouse) =>
		{
			return Mouse(mouse);
		});
	}

	async render()
	{
		return (
			<scene>
				{Entrance(entranceProps)}
				{Exit(exitProps)}
				{this.renderTrees()}
				{Cheese(cheeseProps)}
				{Dog(this.state.dog)}
				{Cat(this.state.cat)}
				{this.renderMice()};
			</scene>
		)
	}
}