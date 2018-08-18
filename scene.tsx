const config = require('./config.json');
import * as DCL from 'metaverse-api';
import { Vector3Component } from 'metaverse-api';
import * as SceneHelper from 'ts/SceneHelper';
import { Dog } from 'components/Dog';
import { Cat } from 'components/Cat';
import { Mouse } from 'components/Mouse';
import { Cheese } from 'components/Cheese';
import { Entrance } from 'components/Entrance';
import { IAnimalProps, ISceneryProps, AnimalType, Animation, IBaitProps, BaitType } from 'ts/SharedProperties';
import { Exit } from 'components/Exit';
import { Tree } from 'components/Tree';
import { BehaviorManager } from 'ts/BehaviorManager';
import { House } from 'components/House';
import { Fence } from 'components/Fence';
import { PreyBehaviorManager } from 'ts/PreyBehaviorManager';
import { PredatorBehaviorManager } from 'ts/PredatorBehaviorManager';
import { Ground } from 'components/Ground';
import { Catnip } from 'components/Catnip';
import { callOnUpdate, initEventManager, unsubToUpdateForObject } from 'EventManager';
import { sleep, add } from 'ts/MathHelper';

export default class DogCatMouseCheese extends DCL.ScriptableScene
{
	// Data
	baitType: keyof typeof BaitType = config.baitType;
	state: {
		animals: IAnimalProps[],
		trees: ISceneryProps[],
		baitProps: IBaitProps,
	} = {
			animals: [],
			trees: [],
			baitProps: {
				position: { x: 21, y: 0, z: 12 },
				isVisible: true,
				baitType: BaitType[this.baitType]
			},
		};
	objectCounter = 0;
	behaviors: BehaviorManager[] = [];
	grid: boolean[][] = [];

	// Init
	sceneDidMount()
	{
		initEventManager(this.eventSubscriber);
		this.createGrid();
		this.grid[Math.round(this.state.baitProps.position.x)][Math.round(this.state.baitProps.position.z)] = true;
		this.spawnTrees();
		//this.renderGrid(); // for debugging
		this.eventSubscriber.on("Entrance_click", e => this.onEntranceClick());
		this.eventSubscriber.on("House_click", e => this.onHouseClick());
		this.eventSubscriber.on("Exit_click", e => this.onExitClick());
		this.eventSubscriber.on('captureCheese', e => this.onCaptureCheese());
		this.eventSubscriber.on('preyExit', e => this.onPreyExit(e));
		this.eventSubscriber.on('startChasingPrey', e => this.onStartChasingPrey(e));
		this.eventSubscriber.on('caughtPrey', e => this.onCaughtPrey(e));
		this.updateLoop();
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
				position = { x: Math.round(Math.random() * 28) + 1, y: 0, z: Math.round(Math.random() * 28) + 1 };
			} while (!SceneHelper.isPositionAvailable(this.grid, position));
			this.grid[position.x][position.z] = true;

			trees.push({
				position,
				rotation: { x: 0, y: Math.random() * 360, z: 0 }
			});
		}
		this.setState({ trees });
	}

	// Events
	updateLoop()
	{
		setTimeout(() =>
		{
			callOnUpdate();
			this.updateLoop();
		}, 1000 / 60);
	}
	onEntranceClick()
	{ // Spawn prey
		const animal = this.spawnAnimal(
			config.prey.animalType,
			SceneHelper.entranceProps.position,
			add(SceneHelper.entranceProps.position, { x: 1, y: 0, z: 0 }),
			config.prey.sneakSpeed);
		if (animal)
		{
			this.behaviors.push(new PreyBehaviorManager(
				this.grid,
				animal,
				this.state.baitProps.position,
				SceneHelper.exitProps.position,
				() =>
				{
					this.setState({ animals: this.state.animals });
				}));
		}
	}
	onHouseClick()
	{ // Spawn predator
		const animal = this.spawnAnimal(
			config.predator.animalType,
			SceneHelper.houseProps.position,
			add(SceneHelper.houseProps.position, { x: 0, y: 0, z: -1 }),
			config.predator.patrolSpeed);
		if (animal)
		{
			this.behaviors.push(new PredatorBehaviorManager(this.grid, animal, () =>
			{
				this.setState({ animals: this.state.animals });
			}, () => this.state.animals));
		}
	}
	onExitClick()
	{ // Reset the scene
		for (const animal of this.state.animals.slice())
		{
			this.despawn(animal);
		}
		for (const tree of this.state.trees)
		{
			this.grid[Math.round(tree.position.x)][Math.round(tree.position.z)] = false;
		}
		this.spawnTrees();
	}
	async onCaptureCheese()
	{
		let cheeseProps = this.state.baitProps;
		cheeseProps.isVisible = false;
		this.setState({ cheeseProps: cheeseProps });
		await sleep(2000);
		cheeseProps.isVisible = true;
		this.setState({ cheeseProps: cheeseProps });
	}
	async onPreyExit(animal: IAnimalProps)
	{
		await sleep(500);
		this.despawn(animal);
	}
	onStartChasingPrey(prey: IAnimalProps)
	{
		const behavior = this.behaviors.find((b) => b.animalProps == prey);
		if (behavior instanceof PreyBehaviorManager)
		{
			behavior.onSpotted();
		}
	}
	async onCaughtPrey(prey: IAnimalProps)
	{
		prey.isDead = true;
		unsubToUpdateForObject(prey.id);
		await sleep(1500);
		this.despawn(prey);
	}

	// Helper methods
	spawnAnimal(animalKey: keyof typeof AnimalType,
		position: Vector3Component,
		lookAtPosition: Vector3Component,
		moveDuration: number): IAnimalProps | null
	{
		if (this.grid[Math.round(position.x)][Math.round(position.z)])
		{ // Space is occupied, can't spawn
			return null;
		}
		this.grid[Math.round(position.x)][Math.round(position.z)] = true;

		const animal: IAnimalProps = {
			id: "Animal" + this.objectCounter++,
			animalType: AnimalType[animalKey],
			position,
			lookAtPosition,
			moveDuration,
			animationWeights: [
				{ animation: Animation.Idle, weight: 1 },
				{ animation: Animation.Walk, weight: 0 },
				{ animation: Animation.Drink, weight: 0 },
				{ animation: Animation.Sit, weight: 0 },
			],
			isDead: false,
		};
		this.setState({ animals: [...this.state.animals, animal] });
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
		console.log("Despawn: " + animal.animalType + " Remaining: " + (this.state.animals.length - 1));
		animal.isDead = true;
		this.grid[Math.round(animal.position.x)][Math.round(animal.position.z)] = false;
		unsubToUpdateForObject(animal.id);
		this.behaviors = this.behaviors.filter((a) => a.animalProps.id != animal.id);
		const animals = this.state.animals.filter((a) => a.id != animal.id);
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
	renderBait()
	{
		if (this.state.baitProps.baitType == BaitType.Cheese)
		{
			return Cheese(this.state.baitProps)
		}
		else
		{
			return Catnip(this.state.baitProps);
		}
	}
	renderAnimals()
	{
		return this.state.animals.map((animal) =>
		{
			//console.log(JSON.stringify(animal));
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
	renderGrid()
	{
		return this.grid.map((row, x) =>
		{
			return row.map((cell, z) =>
			{
				if (cell)
				{
					this.state.trees.push({
						position: { x, y: 0, z },
						rotation: { x: 0, y: Math.random() * 360, z: 0 }
					});
					this.setState({ trees: this.state.trees });
				}
			});
		});
	}
	async render()
	{
		return (
			<scene>
				{Ground(SceneHelper.groundProps)}
				{Entrance(SceneHelper.entranceProps)}
				{Exit(SceneHelper.exitProps)}
				{House(SceneHelper.houseProps)}
				{this.renderBait()}
				{this.renderAnimals()}
				{this.renderTrees()}
				{this.renderFence()}
			</scene>
		)
	}
}