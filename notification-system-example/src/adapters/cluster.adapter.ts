import cluster from "cluster";
import { availableParallelism } from "os";
import { Server } from "socket.io";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import { ConfigService } from "../config/config.service.ts";
import * as v8 from "v8";
import * as http from "http";

export class ClusterAdapter {
  private static numCPUs = availableParallelism();
  private static isShuttingDown = false;

  static isPrimaryProcess(): boolean {
    return cluster.isPrimary;
  }

  static isWorkerProcess(): boolean {
    return cluster.isWorker;
  }

  static async setupPrimaryProcess(httpServer: http.Server): Promise<void> {
    if (!this.isPrimaryProcess()) {
      throw new Error("Setup primary called from non-primary process");
    }

    setupMaster(httpServer, {
      loadBalancingMethod: "least-connection",
    });

    setupPrimary();

    this.configureClusterSerialization();

    this.forkWorkers();

    this.setupClusterEventHandlers();
  }

  private static setupClusterEventHandlers(): void {
    cluster.on("exit", (worker, code, signal) => {
      if (!this.isShuttingDown) {
        console.log(
          `Worker ${worker.process.pid} died (${signal || code}). Restarting...`
        );
      }
    });

    cluster.on("online", (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });
  }

  private static forkWorkers(): void {
    const workerCount = ConfigService.CLUSTER_WORKERS || this.numCPUs;
    for (let i = 0; i < workerCount; i++) {
      cluster.fork({
        PORT: ConfigService.PORT + i,
      });
    }
  }

  private static configureClusterSerialization(): void {
    if (
      process.version.startsWith("v16") ||
      process.version.startsWith("v18")
    ) {
      cluster.setupPrimary({ serialization: "advanced" });
    } else {
      (cluster as any).setupMaster({ serialization: "advanced" });
    }
  }

  static async setupWorkerProcess(io: Server): Promise<void> {
    if (!this.isWorkerProcess()) {
      throw new Error("Setup worker called from non-worker process");
    }
 
    const adapter = createAdapter();
    io.adapter(adapter);
 
    setupWorker(io);
 
    this.setupWorkerEventHandlers(io);
    this.startMemoryMonitoring();
  }

  private static setupWorkerEventHandlers(io: Server): void {
    io.setMaxListeners(20);
    process.setMaxListeners(20);

    io.on("connection", (socket) => {
      socket.conn.setMaxListeners(10);
      socket.setMaxListeners(10);

      socket.on("disconnect", () => {
        socket.removeAllListeners();
      });
    });

    this.setupGracefulShutdown(io);
  }

  private static setupGracefulShutdown(io: Server): void {
    process.on("SIGTERM", async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log(
        `Worker ${process.pid} received SIGTERM - starting graceful shutdown`
      );

      try {
        const sockets = await io.fetchSockets();
        for (const socket of sockets) {
          socket.disconnect(true);
        }

        setTimeout(async () => {
          console.log(`Worker ${process.pid} completing shutdown`);
          await this.cleanup();
          process.exit(0);
        }, 5000);
      } catch (error) {
        console.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    });
  }

  private static startMemoryMonitoring(): void {
    const MEMORY_CHECK_INTERVAL = 30000; // 30 seconds
    const HEAP_USED_THRESHOLD = 0.9; // 90% of max heap

    setInterval(() => {
      const heapUsed = v8.getHeapStatistics().used_heap_size;
      const heapTotal = v8.getHeapStatistics().heap_size_limit;
      const heapPercentage = heapUsed / heapTotal;

      if (heapPercentage > HEAP_USED_THRESHOLD) {
        console.warn(
          `High memory usage in worker ${process.pid}: ${(
            heapPercentage * 100
          ).toFixed(2)}%`
        );
        global.gc?.();
      }
    }, MEMORY_CHECK_INTERVAL);
  }

  static async cleanup(): Promise<void> {
    this.isShuttingDown = true;

    if (this.isPrimaryProcess()) {
      for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (worker) {
          worker.send("shutdown");
          worker.disconnect();
          setTimeout(() => worker.kill(), 5000);
        }
      }
      console.log("All cluster workers are being shutdown");
    }

    console.log(
      `${this.isPrimaryProcess() ? "Primary" : "Worker"} ${
        process.pid
      } cleanup completed`
    );
  }
}
