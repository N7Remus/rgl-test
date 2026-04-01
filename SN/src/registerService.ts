import Redis, { RedisOptions } from "ioredis";
import logger from "./logger";

export class RegisterService {
    client: Redis;
    subClient: Redis;
    SERVER_ID: string;
    REDIS_ENDPOINT: RedisOptions;
    REDIS_CHANNEL: string;
    REDIS_KEY: string;

    constructor(SERVER_ID: string, REDIS_ENDPOINT: RedisOptions, REDIS_CHANNEL: string, REDIS_KEY: string) {
        this.SERVER_ID = SERVER_ID
        this.REDIS_ENDPOINT = REDIS_ENDPOINT
        this.REDIS_CHANNEL = REDIS_CHANNEL
        this.REDIS_KEY = REDIS_KEY

        this.client = new Redis(REDIS_ENDPOINT);
        this.subClient = new Redis(REDIS_ENDPOINT);

        this.start()
    }
    private start() {
        this.subClient.subscribe(this.REDIS_CHANNEL, (err, count) => {
            if (err) {
                // Just like other commands, subscribe() can fail for some reasons,
                // ex network issues.
                logger.error("Failed to subscribe: %s", err.message);
                throw Error('Failed to subscribe');
            } else {
                // `count` represents the number of channels this client are currently subscribed to.
                logger.info(
                    `Subscribed successfully! This client is currently subscribed to ${this.REDIS_CHANNEL} channel.`
                );
            }
        });

        this.subClient.on("message", (channel, message) => {
            logger.debug(`Received ${message} from ${channel}`);
        });
    }

    async set(REDIS_KEY: string, newState: any){
        await this.client.set(REDIS_KEY, JSON.stringify(newState));
    }

    async publish(REDIS_KEY: string, newState: any) {
        // Save to Redis
        await this.client.set(REDIS_KEY, JSON.stringify(newState));

        // Broadcast change
        await this.client.publish(
            this.REDIS_CHANNEL,
            JSON.stringify({
                source: this.SERVER_ID,
                state: newState,
                timestamp: Date.now(),
            })
        );
    }

}