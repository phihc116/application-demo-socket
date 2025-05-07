import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Socket } from "socket.io"; 
import { ConfigService } from "../config/config.service.ts";

const JWKS_URL = ConfigService.OIDC_JWKS_URL;
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export function herondPointAuthSocketMiddleware(socket: Socket, next: Function) {
  try {
    const authToken = socket.handshake.auth.Authorization || socket.handshake.headers.authorization; 
    if (!authToken) {
      return next(new Error("Missing Authorization header"));
    }

    const token = authToken.split(" ")[1];
    if (!token) {
      return next(new Error("Invalid Authorization header format"));
    }

    jwtVerify(token, JWKS, {
      issuer: ConfigService.OIDC_ISSUER,
      audience: ConfigService.OIDC_AUDIENCE,
    })
      .then(({ payload }) => {
        socket.data.userId = payload.sub;
        next();
      })
      .catch((err) => {
        console.error("JWT verification failed:", err);
        next(new Error("Unauthorized"));
      });
  } catch (error) {
    console.error("Auth middleware error:", error);
    next(new Error("Internal server error"));
  }
}
