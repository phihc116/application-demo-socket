import { Server } from "socket.io";
import { RedisAdapter } from "../adapters/redis.adapter.ts";
import { ConfigService } from "../config/config.service.ts";
import { AdapterType } from "../adapters/adapter_type.ts";

export class HealthService {
  private static io: Server;

  static initialize(socketServer: Server) {
    this.io = socketServer;
  }

  static async checkHealth() {
    const health = {
      status: "ok",
      timestamp: Date.now(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      socketio: {
        connections: this.io?.engine?.clientsCount || 0,
        status: "ok"
      },
      redis: {
        status: "ok"
      }
    };

    try {
      if (this.isRedisEnabled()) {
        const redisStatus = await RedisAdapter.checkConnection();
        health.redis.status = redisStatus ? "ok" : "error";
      }

      if (!this.io?.engine?.clientsCount) {
        health.socketio.status = "warning";
      }

      return health;
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        ...health,
        status: "error",
        error: error.message
      };
    }
  }

  static async checkReadiness() {
    const readiness = {
      status: "ok",
      checks: {
        redis: this.isRedisEnabled() ? "pending" : "disabled",
        socketio: "pending"
      }
    };

    try {
      // Check Redis if enabled
      if (this.isRedisEnabled()) {
        readiness.checks.redis = await RedisAdapter.checkConnection() ? "ok" : "error";
      }

      // Check Socket.IO
      readiness.checks.socketio = this.io?.engine ? "ok" : "error";

      // Overall status
      readiness.status = Object.values(readiness.checks).some(status => status === "error") 
        ? "error" 
        : "ok";

      return readiness;
    } catch (error) {
      console.error("Readiness check failed:", error);
      return {
        status: "error",
        error: error.message,
        checks: readiness.checks
      };
    }
  }

  private static isRedisEnabled(): boolean {
    return ConfigService.ADAPTER_TYPE === AdapterType.REDIS;
  }
}