import { Server } from "socket.io";
import { registerHandler } from "../features/grpc-handlers/message_handler.registry.ts";
import { HerondPointsHandler } from "../features/herond-points/herond_points_handler.ts";
import { FromServiceNames } from "../features/grpc-handlers/service_name.const.ts";

export const setupSocket = async (io: Server) => {
  registerHandler(FromServiceNames.HEROND_POINTS, new HerondPointsHandler(io));

  io.on("connection", (socket) => {
    console.log(`Client connected to worker ${process.pid}:`, socket.id);
  });

  return io;
};
