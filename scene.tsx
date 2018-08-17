const config = require('./config.json');
import * as DCL from 'metaverse-api';
import { Vector3Component } from 'metaverse-api';
import * as MathHelper from 'ts/MathHelper';
import * as SceneHelper from 'ts/SceneHelper';
import { Dog } from 'components/Dog';
import { Cat } from 'components/Cat';
import { Mouse } from 'components/Mouse';
import { Cheese, ICheeseProps } from 'components/Cheese';
import { Entrance } from 'components/Entrance';
import { Animation } from 'ts/Animation';
import { IAnimalProps, ISceneryProps, AnimalType } from 'ts/SharedProperties';
import { Exit } from 'components/Exit';
import { Tree } from 'components/Tree';
import { BehaviorManager } from 'ts/BehaviorManager';
import { House } from 'components/House';
import { Fence } from 'components/Fence';
import { PreyBehaviorManager } from 'ts/PreyBehaviorManager';
import { PredatorBehaviorManager } from 'ts/PredatorBehaviorManager';

// TODO refactor math helper
// TODO config:PredatorPatrolSpeed, PredatorAttackSpeed, PreySneakSpeed, PreyRunSpeed
// TODO visually adjust movement speeds
// TODO collide before standing on-top of the cheese.

export default class DogCatMouseCheese extends DCL.ScriptableScene
{
	// Data
	state: {
		characterPosition: Vector3Component,
		animals: IAnimalProps[],
		trees: ISceneryProps[],
		cheeseProps: ICheeseProps,
	} = {
			characterPosition: { x: 0, y: 0, z: 0 },
			animals: [],
			trees: [],
			cheeseProps: {
				position: { x: 10, y: 0, z: 3 },
				isVisible: true,
			},
		};
	objectCounter = 0;
	behaviors: BehaviorManager[] = [];
	grid: boolean[][] = [];

	// Init
	sceneDidMount()
	{
		this.createGrid();
		this.spawnTrees();
		this.subscribeTo("positionChanged", e => this.onPositionChanged(e));
		this.eventSubscriber.on("House_click", e => this.onHouseClick());
		this.eventSubscriber.on("Entrance_click", e => this.onEntranceClick());
		this.eventSubscriber.on("Exit_click", e => this.onExitClick());
		this.eventSubscriber.on('captureCheese', e => this.onCaptureCheese());
		this.eventSubscriber.on('mouseEscape', e => this.onMouseEscape(e));
		this.eventSubscriber.on('chase', e => this.onChase(e));
		this.eventSubscriber.on('caught', e => this.onCaught(e));
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
		SceneHelper.updateGridWithStaticScenery(this.grid);
	}
	spawnTrees()
	{
		let trees: ISceneryProps[] = [];
		const range: number = config.trees.max - config.trees.min;
		for (let i = 0; i < Math.random() * range + config.trees.min; i++)
		{
			let position;
			do
			{
				position = { x: Math.round(Math.random() * 30), y: 0, z: Math.round(Math.random() * 30) };
			} while (!SceneHelper.isInBounds(position) || this.grid[position.x][position.z] || SceneHelper.isSceneryPosition(position));
			this.grid[position.x][position.z] = true;

			trees.push({
				position,
				rotation: { x: 0, y: Math.random() * 360, z: 0 }
			});
		}
		this.setState({ trees });
	}

	// Events
	onPositionChanged(e: ({ position: Vector3Component })) 
	{
		this.setState({ characterPosition: e.position });
	}
	onEntranceClick()
	{
		const animal = this.spawnAnimal(
			config.animalTypes.prey,
			SceneHelper.entranceProps.position,
			MathHelper.add(SceneHelper.entranceProps.position, { x: 0, y: 0, z: 1 }));
		if (animal)
		{
			this.behaviors.push(new PreyBehaviorManager(
				this.eventSubscriber,
				this.grid,
				animal,
				this.state.cheeseProps.position,
				SceneHelper.exitProps.position,
				() =>
				{
					this.setState({ animals: this.state.animals });
				}));
		}
	}
	onExitClick()
	{ // Reset the scene
		for (const animal of this.state.animals.slice())
		{
			this.despawn(animal);
		}
		this.spawnTrees();
	}
	onHouseClick()
	{
		const animal = this.spawnAnimal(
			config.animalTypes.predator,
			SceneHelper.houseProps.position,
			MathHelper.add(SceneHelper.houseProps.position, { x: 0, y: 0, z: 1 }));
		if (animal)
		{
			this.behaviors.push(new PredatorBehaviorManager(this.eventSubscriber, this.grid, animal, () =>
			{
				this.setState({ animals: this.state.animals });
			}, this.state.animals));
		}
	}
	async onCaptureCheese()
	{
		let cheeseProps = this.state.cheeseProps;
		cheeseProps.isVisible = false;
		this.setState({ cheeseProps: cheeseProps });
		await MathHelper.sleep(2000);
		cheeseProps.isVisible = true;
		this.setState({ cheeseProps: cheeseProps });
	}
	async onMouseEscape(mouse: IAnimalProps)
	{
		await MathHelper.sleep(1000);
		this.despawn(mouse);
	}
	onChase(prey: IAnimalProps)
	{
		const behavior = this.behaviors.find((b) => b.animalProps == prey);
		if (behavior instanceof PreyBehaviorManager)
		{
			behavior.onSpotted();
		}
	}
	onCaught(prey: IAnimalProps)
	{
		this.despawn(prey);
	}

	// Helper methods
	spawnAnimal(animalKey: keyof typeof AnimalType, position: Vector3Component, lookAtPosition: Vector3Component): IAnimalProps | null
	{
		if (this.grid[Math.round(position.x)][Math.round(position.z)])
		{ // Space is occupied, can't spawn
			return null;
		}
		this.grid[Math.round(position.x)][Math.round(position.z)] = true;

		let animals = this.state.animals.slice();
		const animal = {
			id: "Animal" + this.objectCounter++,
			animalType: AnimalType[animalKey],
			position,
			lookAtPosition,
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
			]
		};
		animals.push(animal);
		this.setState({ animals });
		this.eventSubscriber.on(animal.id + "_click", () =>
		{
			let behavior = this.behaviors.find((b) => b.animalProps == animal);
			if (behavior)
			{
				behavior.onClick();
			}
		});

		return animal;
	}
	despawn(animal: IAnimalProps)
	{
		console.trace();
		this.grid[Math.round(animal.position.x)][Math.round(animal.position.z)] = false;
		const behavior = this.behaviors.find((b) => b.animalProps == animal);
		if (behavior)
		{
			behavior.stop();
		}
		let animals = this.state.animals;
		animals.splice(animals.findIndex((a) => a == animal), 1);
		this.setState({ animals });
	}

	// Render
	renderTrees()
	{
		return this.state.trees.map((tree) =>
		{
			return Tree(tree);
		});
	}
	renderFence()
	{
		return SceneHelper.fenceProps.map((fence) =>
		{
			return Fence(fence);
		});
	}
	renderAnimals()
	{
		return this.state.animals.map((animal) =>
		{
			switch (animal.animalType)
			{
				case AnimalType.Mouse:
					return Mouse(animal);
				case AnimalType.Cat:
					return Cat(animal);
				case AnimalType.Dog:
					return Dog(animal);
			}
		});
	}
	async render()
	{
		return (
			<scene>
				{Entrance(SceneHelper.entranceProps)}
				{Exit(SceneHelper.exitProps)}
				{House(SceneHelper.houseProps)}
				{this.renderFence()}
				{this.renderTrees()}
				{Cheese(this.state.cheeseProps)}
				{this.renderAnimals()}
			</scene>
		)
	}
}