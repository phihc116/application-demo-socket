import app from "./app.ts";
import * as http from "http";
import { setupSocket } from "./socket.ts";
import { startGrpcServer } from "./grpc.ts";
import { Server } from "socket.io";
import { RedisAdapter } from "../adapters/redis.adapter.ts";
import { HealthService } from "../services/health.service.ts";

async function bootstrapAsync() {
  const express = app;
  const httpServer = http.createServer(express);

  const io = new Server(httpServer, {
    connectionStateRecovery: {},
  });

  await setupSocket(io);

  await RedisAdapter.setup(io);
  HealthService.initialize(io);

  startGrpcServer();

  httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000");
  });
}

await bootstrapAsync();
