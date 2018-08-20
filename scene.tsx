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
import { House } from 'components/House';
import { Fence } from 'components/Fence';
import { Ground } from 'components/Ground';
import { Catnip } from 'components/Catnip';
import { sleep, add } from 'ts/MathHelper';
import { Grid } from 'ts/Grid';
import { EventManager } from 'ts/EventManager';
import { AnimalStateMachine } from 'ts/StateMachine/AnimalStateMachine';
import { StateEat } from 'ts/StateMachine/StateEat';
import { StatePatrol } from 'ts/StateMachine/StatePatrol';
import { StateGoTo } from 'ts/StateMachine/StateGoTo';
import { StateDespawn } from 'ts/StateMachine/StateDespawn';
//"sprintSpeed": 20, todo
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
				id: config.baitType,
				position: { x: 21, y: 0, z: 12 },
				isVisible: true,
				baitType: BaitType[this.baitType]
			},
		};
	objectCounter = 0;

	// Init
	sceneDidMount()
	{
		EventManager.init(this.eventSubscriber);
		Grid.init(30, 30);
		SceneHelper.updateGridWithStaticScenery();
		Grid.set(this.state.baitProps.position);
		this.spawnTrees();
	

		this.eventSubscriber.on("Entrance_click", e => this.onEntranceClick());
		this.eventSubscriber.on("House_click", e => this.onHouseClick());
		this.eventSubscriber.on("Exit_click", e => this.onExitClick());

		this.eventSubscriber.on('renderAnimals', e => this.onRenderAnimals());
		this.eventSubscriber.on('captureCheese', e => this.onCaptureBait()); // Confirm dead. use despawn instead
		this.eventSubscriber.on('despawn', (animalId, delay) => this.onDespawn(animalId, delay));
	}
	spawnTrees()
	{
		let trees: ISceneryProps[] = [];
		const range: number = config.trees.max - config.trees.min;
		for (let i = 0; i < Math.random() * range + config.trees.min; i++)
		{
			const position = Grid.randomPosition(2, true); 
			Grid.set(position);
			trees.push({
				position,
				rotation: { x: 0, y: Math.random() * 360, z: 0 }
			});
			break;
		}
		this.setState({ trees });
	}

	// Events
	onEntranceClick()
	{ // Spawn prey
		const animalProps = this.spawnAnimal(
			config.prey.animalType,
			SceneHelper.entranceProps.position,
			add(SceneHelper.entranceProps.position, { x: 1, y: 0, z: 0 }),
			config.prey.sneakSpeed);
		if (animalProps)
		{
			AnimalStateMachine.pushState(new StateDespawn(animalProps, {}));
			AnimalStateMachine.pushState(new StateGoTo(animalProps, SceneHelper.exitProps, config.prey.exitConfig, config.prey.blockedConfig));
			AnimalStateMachine.pushState(new StateEat(animalProps, this.state.baitProps, config.prey.eatConfig, config.prey.blockedConfig));
		}
	}
	onHouseClick()
	{ // Spawn predator
		const animalProps = this.spawnAnimal(
			config.predator.animalType,
			SceneHelper.houseProps.position,
			add(SceneHelper.houseProps.position, { x: 0, y: 0, z: -1 }),
			config.predator.patrolSpeed);
		if (animalProps)
		{
			AnimalStateMachine.pushState(new StatePatrol(
				animalProps,
				SceneHelper.houseProps,
				config.predator.patrolConfig
			));
		}
	}
	onExitClick()
	{ // Reset the scene
		for (const animal of this.state.animals.slice())
		{
			EventManager.emit("despawn", animal.id);
		}
		for (const tree of this.state.trees)
		{
			Grid.clear(tree.position);
		}
		this.spawnTrees();
	}
	onRenderAnimals()
	{
		this.setState({ animals: this.state.animals });
	}
	async onCaptureBait()
	{
		this.state.baitProps.isVisible = false;
		this.setState({ baitProps: this.state.baitProps });
		await sleep(2000);
		this.state.baitProps.isVisible = true;
		this.setState({ baitProps: this.state.baitProps });
	}
	async onDespawn(animalId: string, delay: number)
	{
		const animal = this.state.animals.find(a => a.id == animalId);
		if (animal)
		{
			AnimalStateMachine.terminate(animalId);
			animal.isDead = true;
			await sleep(delay);
			Grid.clear(animal.position);
			this.setState({ animals: this.state.animals.filter((a) => a.id != animal.id) });
		}
	}

	// Helper methods
	spawnAnimal(animalKey: keyof typeof AnimalType,
		position: Vector3Component,
		lookAtPosition: Vector3Component,
		moveDuration: number): IAnimalProps | null
	{
		if (!Grid.isAvailable(position))
		{ // Space is occupied, can't spawn
			return null;
		}
		Grid.set(position);

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
			scale: 1,
		};
		this.setState({ animals: [...this.state.animals, animal] });
		this.eventSubscriber.on(animal.id + "_click", () =>
		{
			AnimalStateMachine.sendMessage(animal.id, "click");
		});

		return animal;
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