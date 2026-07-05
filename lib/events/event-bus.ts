type EventHandler<T> = (event: T) => void;

function createEventBus<T>() {
  const handlers = new Set<EventHandler<T>>();
  const history: T[] = [];

  return {
    emit(event: T) {
      history.push(event);
      if (history.length > 50) history.shift();
      for (const handler of handlers) handler(event);
    },
    subscribe(handler: EventHandler<T>) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    recent() {
      return [...history];
    },
  };
}

export type AppEvent = {
  type: string;
  at: string;
  fixtureId?: string;
  payload?: unknown;
};

export const appEventBus = createEventBus<AppEvent>();
