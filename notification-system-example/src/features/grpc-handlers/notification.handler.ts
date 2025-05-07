import type { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import type {
  SendMessageRequest,
  SendMessageResponse,
} from "./protos/notification.ts";
import { dispatchMessage } from "./message_handler.registry.ts";

export function getNotificationHandlers() {
  return {
    sendMessage(
      call: ServerUnaryCall<SendMessageRequest, SendMessageResponse>,
      callback: sendUnaryData<SendMessageResponse>
    ) { 
      dispatchMessage(call.request.fromServiceName, call.request);

      callback(null, {
        success: true,
        message: "Message sent",
      });
    },

    broadcastMessage(
      call: ServerUnaryCall<any, SendMessageResponse>,
      callback: sendUnaryData<SendMessageResponse>
    ) {
      dispatchMessage(call.request.fromServiceName, call.request);

      callback(null, {
        success: true,
        message: "Broadcasted",
      });
    },
  };
}
