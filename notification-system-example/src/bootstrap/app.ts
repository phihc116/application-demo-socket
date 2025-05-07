import express, { type Application } from "express"; 
import { corsOptions } from "../config/cors.config.ts";
import cors from "cors";
import { herondPointAuthMiddleware } from "../middlewares/herond_point_token.guard.ts";
import { HealthService } from "../services/health.service.ts";

const app: Application = express();

app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", async (req, res) => {
  const health = await HealthService.checkHealth();
  res.status(health.status === "ok" ? 200 : 503).json(health);
});

// Readiness probe endpoint
app.get("/ready", async (req, res) => {
  const readiness = await HealthService.checkReadiness();
  res.status(readiness.status === "ok" ? 200 : 503).json(readiness);
});

app.get("/protected", herondPointAuthMiddleware(), (req, res) => {
  const user = (req as any).user;
  res.json({ message: "You are authorized!", user });
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

export default app;
