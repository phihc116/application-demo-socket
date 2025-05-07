import app from "./app.ts";
import * as http from "http";
import { setupSocket } from "./socket.ts";
import { startGrpcServer } from "./grpc.ts";
import { Server } from "socket.io";
import { ClusterAdapter } from "../adapters/cluster.adapter.ts";

async function bootstrapAsync() {
  const express = app;
  const httpServer = http.createServer(express);

  if (ClusterAdapter.isPrimaryProcess()) {
    await ClusterAdapter.setupPrimaryProcess(httpServer);
  } else {
    const io = new Server(httpServer, {
      connectionStateRecovery: {},
    });

    await setupSocket(io);
    ClusterAdapter.setupWorkerProcess(io);

    startGrpcServer();

    httpServer.listen(process.env.PORT, () => {
      console.log("Server is listening on port 3000");
    });
  }
}

await bootstrapAsync();
