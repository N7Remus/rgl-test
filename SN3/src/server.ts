import chokidar from "chokidar";
import { ConfigLoader } from "./common/configLoader";
import logger from "./logger";
import { RedisClusterManager } from "./redisCluster";
import { ClusterNode } from "ioredis";
// We have logger 
const configFile = process.env.CONFIG_FILE || './config/config.json';
const loader = new ConfigLoader(configFile, 150);
const watcher = chokidar.watch(configFile, { ignoreInitial: true });
loader.loadOnce();
// We have config 
if (loader.config) {
	logger.info('Config live reload is enabled.');
	logger.debug('Initial config: %o', loader.config);
}
// --- Initialization ---
const clusterSeedNodes: ClusterNode[] = [
  { host: loader.config?.redis.host, port: loader.config?.redis.port }
];
const redis = new RedisClusterManager(clusterSeedNodes, loader.config?.redis.password);
// We have redis connection
redis.connect();

// We start service 

// We start local socketio server 

// We bind to web interface
