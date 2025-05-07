import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { ConfigService } from "../config/config.service.ts"; 
import { AdapterType } from "./adapter_type.ts";

export class RedisAdapter {
  private static pubClient: Redis;
  private static subClient: Redis;
  private static io: Server;

  static async setup(io: Server): Promise<void> {
    this.io = io;   
    if (ConfigService.ADAPTER_TYPE !== AdapterType.REDIS) {
      console.log("Redis Adapter is disabled");
      return;
    }

    try {
      await this.initializeRedisClients();
      await this.waitForConnections(); 
      this.setupAdapter(io);
    } catch (error) {
      console.error("Failed to setup Redis Adapter:", error);
      throw error;
    }
  }

  private static async initializeRedisClients(): Promise<void> {
    const redisOptions = this.getRedisOptions();
    this.pubClient = new Redis(redisOptions);
    this.subClient = this.pubClient.duplicate();
    this.setupErrorHandlers();
  }

  private static getRedisOptions() {
    return {
      host: ConfigService.REDIS_HOST,
      port: ConfigService.REDIS_PORT,
      password: ConfigService.REDIS_PASSWORD,
      keyPrefix: ConfigService.REDIS_PREFIX,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      reconnectOnError: (err: Error) => err.message.includes("READONLY"),
    };
  }

  private static async waitForConnections(): Promise<void> {
    await Promise.all([
      new Promise<void>((resolve) => this.pubClient.once("ready", resolve)),
      new Promise<void>((resolve) => this.subClient.once("ready", resolve)),
    ]);
  }

  private static setupAdapter(io: Server): void {
    const adapter = createAdapter(this.pubClient, this.subClient);
    io.adapter(adapter);
  }

  private static setupErrorHandlers(): void {
    const setupClient = (client: Redis, name: string) => {
      client
        .on("error", (err: Error) => console.error(`Redis ${name} Error:`, err))
        .on("reconnecting", (attempt: number) =>
          console.log(`Redis ${name} reconnecting... Attempt: ${attempt}`)
        )
        .on("ready", () => console.log(`Redis ${name} ready`));
    };

    setupClient(this.pubClient, "Pub");
    setupClient(this.subClient, "Sub");
  }

  static async cleanup(): Promise<void> {
    try {
      await Promise.all([
        this.pubClient?.disconnect(),
        this.subClient?.disconnect(),
      ]);
 
      this.pubClient = null;
      this.subClient = null;

      console.log("Redis connections closed");
    } catch (error) {
      console.error("Error closing Redis connections:", error);
      throw error;
    }
  }

  static async checkConnection(): Promise<boolean> {
    if (!this.pubClient) return false;
    try {
      await this.pubClient.ping();
      return true;
    } catch (error) {
      console.error("Redis connection check failed:", error);
      return false;
    }
  }
}








