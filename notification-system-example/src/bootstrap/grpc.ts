import { Server, ServerCredentials } from "@grpc/grpc-js";
import { NotificationServiceService } from "../features/grpc-handlers/protos/notification.ts";
import { getNotificationHandlers } from "../features/grpc-handlers/notification.handler.ts";
import { ConfigService } from "../config/config.service.ts";
import cluster from "cluster";

const PORT = ConfigService.GRPC_PORT;

export function startGrpcServer() {
  const grpcServer = new Server();
  grpcServer.addService(NotificationServiceService, getNotificationHandlers());

  grpcServer.bindAsync(
    `0.0.0.0:${PORT}`,
    ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to start gRPC server:", err);
        return;
      }
      console.log(
        `gRPC server running on port ${port} (${
          cluster.isPrimary ? "Primary" : "Worker"
        } ${process.pid})`
      );
    }
  );

  return grpcServer;
}
