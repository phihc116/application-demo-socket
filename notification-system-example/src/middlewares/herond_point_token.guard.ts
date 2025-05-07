import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Request, Response, NextFunction } from "express"; 
import { ConfigService } from "../config/config.service.ts";

const JWKS_URL = ConfigService.OIDC_JWKS_URL; 
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export function herondPointAuthMiddleware() {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: "Missing Authorization header" });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Invalid Authorization header format" });
        return;
      }

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: ConfigService.OIDC_ISSUER,
        audience: ConfigService.OIDC_AUDIENCE,
      });

      (req as any).user = payload;
      next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      res.status(401).json({ error: "Unauthorized" });
    }
  };
}
