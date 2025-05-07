import app from "./app.ts";
import * as http from "http";
import { setupSocket } from "./socket.ts";
import { startGrpcServer } from "./grpc.ts";
import { Server } from "socket.io";

async function bootstrapAsync() {
  const express = app;
  const httpServer = http.createServer(express);

  const io = new Server(httpServer, {
    connectionStateRecovery: {},
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],  
    }
  });

  await setupSocket(io);
  startGrpcServer();

  httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000");
  });  
}

await bootstrapAsync();
