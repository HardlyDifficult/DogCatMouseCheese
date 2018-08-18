import { EventSubscriber } from "metaverse-api";

const subscriptions: { objectId: string, useCases: { useCase: string, onUpdate: (callCount: number) => void, callCount: number }[] }[] = [];
let eventSubscriber: EventSubscriber;

export function initEventManager(_eventSubscriber: EventSubscriber)
{
	eventSubscriber = _eventSubscriber;
}

export function emitEvent(eventName: string, ...params: any[])
{
	eventSubscriber.emit(eventName, ...params);
}

export function subToUpdate(objectId: string, useCase: string, onUpdate: (callCount: number) => void)
{
	let objectSubscriptions = subscriptions.find((s) => s.objectId == objectId);
	if (!objectSubscriptions)
	{
		objectSubscriptions = {
			objectId,
			useCases: [{ useCase, onUpdate, callCount: 0 }]
		}
		subscriptions.push(objectSubscriptions);
	}
	else
	{
		let useCaseSubscription = objectSubscriptions.useCases.find((s) => s.useCase == useCase);
		if (!useCaseSubscription)
		{
			objectSubscriptions.useCases.push({ useCase, onUpdate, callCount: 0 });
		}
		else
		{
			useCaseSubscription.onUpdate = onUpdate;
			useCaseSubscription.callCount = 0;
		}
	}
}

export function unsubToUpdate(objectId: string, useCase: string)
{
	let objectSubscriptions = subscriptions.find((s) => s.objectId == objectId);
	if (objectSubscriptions)
	{
		let useCaseSubscription = objectSubscriptions.useCases.findIndex((s) => s.useCase == useCase);
		if (useCaseSubscription >= 0)
		{
			if (objectSubscriptions.useCases.length == 1)
			{
				unsubToUpdateForObject(objectId);
			}
			else
			{
				objectSubscriptions.useCases.splice(useCaseSubscription, 1);
			}
		}
	}
}

export function unsubToUpdateForObject(objectId: string)
{
	let objectSubscriptions = subscriptions.findIndex((s) => s.objectId == objectId);
	if (objectSubscriptions >= 0)
	{
		subscriptions.splice(objectSubscriptions, 1);
	}
}

export function callOnUpdate()
{
	for (const objectSubscription of subscriptions)
	{
		for (const useCaseSubscription of objectSubscription.useCases)
		{
			useCaseSubscription.onUpdate(useCaseSubscription.callCount++);
		}
	}
}