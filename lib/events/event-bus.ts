type EventHandler<T> = (event: T) => void;

function createEventBus<T>() {
  const handlers = new Set<EventHandler<T>>();

  return {
    emit(event: T) {
      for (const handler of handlers) handler(event);
    },
    subscribe(handler: EventHandler<T>) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
  };
}

export const appEventBus = createEventBus<{ type: string; at: string; payload?: unknown }>();
