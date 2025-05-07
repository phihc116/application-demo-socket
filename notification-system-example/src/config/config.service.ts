import * as dotenv from 'dotenv';
import envSchema from 'env-schema';
import { Type, type Static } from '@sinclair/typebox';

const Schema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.String({ default: 'development' }),
  OIDC_ISSUER: Type.String(), 
  OIDC_AUTHORITY: Type.String(),
  OIDC_JWKS_URL: Type.String(),
  OIDC_AUDIENCE: Type.String(),  
  GRPC_PORT: Type.Number({ default: 50051 }),
  CORS_ORIGINS: Type.String({ default: '*' }), 
  REDIS_HOST: Type.String({ default: 'localhost' }),
  REDIS_PORT: Type.Number({ default: 6379 }),
  REDIS_PASSWORD: Type.Optional(Type.String()),
  REDIS_PREFIX: Type.String({ default: 'herond-notification:' }),  
  ADAPTER_TYPE: Type.String({ default: 'none' }),
  CLUSTER_WORKERS: Type.Optional(Type.Number()),
});

type Config = Static<typeof Schema>;

export class ConfigService {
  private static _config: Config;

  static async load() {
    dotenv.config();
    this._config = envSchema({ schema: Schema, dotenv: true });

    if (
      this._config.NODE_ENV === 'development' ||  
      this._config.OIDC_ISSUER.includes('kubernetes.docker.internal')
    ) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      console.log('SSL verification disabled for local development');
    }

    for (const key of Object.keys(this._config) as (keyof Config)[]) {
      Object.defineProperty(this, key, {
        get: () => this._config[key],
        enumerable: true,
        configurable: false
      });
    }
  }

  static get<T extends keyof Config>(key: T): Config[T] {
    return this._config[key];
  }

  static getAll(): Config {
    return this._config;
  } 

  static PORT: number;
  static GRPC_PORT: number;  
  static NODE_ENV: string;
  static OIDC_ISSUER: string;
  static OIDC_AUTHORITY: string;
  static OIDC_JWKS_URL: string;
  static OIDC_AUDIENCE: string;  
  static CORS_ORIGINS: string;  
  static REDIS_HOST: string;
  static REDIS_PORT: number;
  static REDIS_PASSWORD: string | undefined;
  static REDIS_PREFIX: string; 
  static ADAPTER_TYPE: string;
  static CLUSTER_WORKERS: number | undefined;
}
