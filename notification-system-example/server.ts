import { AdapterType } from "./src/adapters/adapter_type.ts";
import { ConfigService } from "./src/config/config.service.ts";

await ConfigService.load();
//process.env.DEBUG = "socket.io:*";

const adapterType = ConfigService.ADAPTER_TYPE; 

switch (adapterType) {
  case AdapterType.CLUSTER:
    await import("./src/bootstrap/bootstrap-cluster.ts");
    break;
  case AdapterType.REDIS:
    await import("./src/bootstrap/bootstrap-redis.ts");
    break;
  default:
    await import("./src/bootstrap/bootstrap-none.ts");
    break;
}
