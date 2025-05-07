import cors from "cors";
import { ConfigService } from "./config.service.ts";

const allowedOrigins =
  ConfigService.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) || [];

export const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) => {
      if (
        typeof allowed === "string" &&
        allowed.startsWith("/") &&
        allowed.endsWith("/")
      ) {
        return new RegExp(allowed.slice(1, -1)).test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
