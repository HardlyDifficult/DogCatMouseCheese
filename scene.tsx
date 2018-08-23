const config = require('./config.json');
import * as DCL from 'metaverse-api';
import * as SceneHelper from 'ts/SceneHelper';
import { Dog } from 'components/Dog';
import { Cat } from 'components/Cat';
import { Mouse } from 'components/Mouse';
import { Cheese } from 'components/Cheese';
import { Entrance } from 'components/Entrance';
import { IAnimalProps, ISceneryProps, AnimalType, IBaitProps, BaitType } from 'ts/SharedProperties';
import { Exit } from 'components/Exit';
import { Tree } from 'components/Tree';
import { House } from 'components/House';
import { Fence } from 'components/Fence';
import { Ground } from 'components/Ground';
import { Catnip } from 'components/Catnip';
import { FenceCorner } from 'components/FenceCorner';
import { FenceSpinner, SpinState } from 'components/FenceSpinner';

export default class DogCatMouseCheese extends DCL.ScriptableScene
{
	// Data
	baitType: keyof typeof BaitType = config.baitType;
	state: {
		animals: IAnimalProps[],
		trees: ISceneryProps[],
		fenceSpinState: SpinState[],
		baitProps: IBaitProps,
	} = {
			animals: [],
			trees: [],
			fenceSpinState: [SpinState.None, SpinState.None],
			baitProps: {
				id: config.baitType,
				position: { x: 21, y: 0, z: 5 },
				isVisible: true,
				baitType: BaitType[this.baitType]
			},
		};
	objectCounter = 0;

	// Init
	sceneDidMount()
	{
		this.spawnTrees();
	}
	spawnTrees()
	{
		let trees: ISceneryProps[] = [];
		trees = [
			{
				position: {x: 3, y: 0, z: 2},
				rotation: {x: 0, y: Math.random() * 360, z: 0},
				scale: {x: 1, y: Math.random() * .4 + 1, z: 1}
			}
		];
		this.setState({ trees });
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
	renderFenceCorners()
	{
		return SceneHelper.fenceCornerProps.map((fenceCorner) =>
		{
			return FenceCorner(fenceCorner);
		});
	}
	renderFenceSpinners()
	{
		return SceneHelper.fenceSpinnerProps.map((fenceSpinner, index) =>
		{
			return FenceSpinner({ id: index, sceneProps: fenceSpinner, spinState: this.state.fenceSpinState[index] });
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
				{this.renderFenceCorners()}
				{this.renderFenceSpinners()}
			</scene>
		)
	}
}