import type { SendMessageRequest } from "./protos/notification.ts";
import {
  FromServiceNames,
  type FromServiceName,
} from "./service_name.const.ts";

export interface NotificationHandler {
  handleMessage(payload: SendMessageRequest): void;
}

const handlers: Record<string, NotificationHandler> = {};

export function registerHandler(
  fromServiceName: string,
  handlerClass: NotificationHandler
) {
  handlers[fromServiceName] = handlerClass;
}

export function dispatchMessage(
  fromServiceName: string,
  payload: SendMessageRequest
) {
  if (
    !Object.values(FromServiceNames).includes(
      fromServiceName as FromServiceName
    )
  ) {
    console.warn(`Unknown service name: ${fromServiceName}`);
    return;
  }

  const handler = handlers[fromServiceName as FromServiceName];
  if (!handler) {
    console.warn(`No handler registered for: ${fromServiceName}`);
    return;
  }
  
  handler.handleMessage(payload);
}
