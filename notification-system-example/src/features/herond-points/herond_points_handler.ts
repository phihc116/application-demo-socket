import type { Namespace, Server } from "socket.io";
import type { NotificationHandler } from "../grpc-handlers/message_handler.registry.ts";
import type { SendMessageRequest } from "../grpc-handlers/protos/notification.ts";
import { herondPointAuthSocketMiddleware } from "../../middlewares/herond_point_token.socket.guard.ts";

export class HerondPointsHandler implements NotificationHandler {
  private readonly io: Server;
  private readonly herondPointsNamespace: Namespace;
  
  constructor(io: Server) {
    this.io = io;
    this.herondPointsNamespace = this.io.of("/herond-points");
    this.herondPointsNamespace.use(herondPointAuthSocketMiddleware);
    this.setupConnectionHandling();
  }

  private setupConnectionHandling() {
    this.herondPointsNamespace.on("connection", async (socket) => {
      try {
        const userId = socket.data.userId;
        if (!userId) {
          console.error("No userId found in socket data");
          socket.disconnect(true);
          return;
        }

        const roomName = `user:${userId}`;
        await socket.join(roomName);

        socket.on("disconnect", async () => {
          console.log(
            `Socket ${socket.id} for user ${userId} disconnecting...`
          );
        });
      } catch (error) {
        console.error("Error handling socket connection:", error);
        socket.disconnect(true);
      }
    });
  }

  async handleMessage(payload: SendMessageRequest): Promise<void> {
    try {
      const parsedPayload = JSON.parse(payload.payload);
      const targetUserId = parsedPayload.userId || payload.userId;

      if (!targetUserId) {
        console.error("No target userId found in payload");
        return;
      }

      const roomName = `user:${targetUserId}`;
      const eventName = "user-status-updated";
      this.herondPointsNamespace.to(roomName).volatile.emit(eventName, {
        userId: targetUserId,
        event: payload.event,
        payload: parsedPayload,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }
}
