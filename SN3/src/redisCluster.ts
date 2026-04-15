import Redis, { Cluster, ClusterOptions, ClusterNode } from 'ioredis';

export class RedisClusterManager {
    private cluster: Cluster | null = null;
    private previousNodes: any | null = null;
    private password: string | undefined = undefined;

    private clusterOptions(password: string | undefined): ClusterOptions {

        return {
            // 1. AUTO-DISCOVERY & TOPOLOGY
            // Periodically refreshes the cluster map to find new nodes
            slotsRefreshInterval: 5000, // Refresh every 5s during dev to see changes fast
            // How long to wait for the refresh to complete
            slotsRefreshTimeout: 2000,

            // 2. RECONNECTION STRATEGY
            clusterRetryStrategy: (times: number) => {
                const delay = Math.min(times * 100, 3000);
                return delay;
            },

            // 3. NODE SETTINGS
            redisOptions: {
                password: password,
                connectTimeout: 10000,
                autoResubscribe: true,
                lazyConnect: false,
            },

            // Ensures the client knows which nodes are masters vs replicas
            enableReadyCheck: true,

            // Scale reads to replicas if needed (optional)
            scaleReads: 'master',
        };

    }

    constructor(private readonly seedNodes: ClusterNode[], password: string | undefined) {
        this.seedNodes = seedNodes;
        this.password = password;
    }

    public connect(): void {
        if (this.cluster) return;

        // The library uses the seedNodes to perform the initial 'CLUSTER SLOTS' command
        this.cluster = new Redis.Cluster(this.seedNodes, this.clusterOptions(this.password));

        this.cluster.on('connect', () => console.log('Redis: TCP Connected'));
        this.cluster.on('ready', () => console.log('Redis: Cluster Ready'));
        this.cluster.on('error', (err: Error) => console.error('Redis Error:', err.message));
        this.cluster.on('+node', (node) => console.log(`Node Added: ${node.options.host}`));
        this.cluster.on('-node', (node) => console.warn(`Node Removed: ${node.options.host}`));
        this.cluster.on('refresh', () => {
            // Log the current status of all nodes known to the client
            const nodes = this.cluster?.nodes().map(n => ({
                host: n.options.host,
                protocol: n.options.port,
                status: n.status

            }));
            const nodesFingerprint = JSON.stringify(nodes);

            if (this.previousNodes != nodesFingerprint) {
                this.previousNodes = nodesFingerprint;
                console.log('🔄 Cluster topology refreshed!');
                console.table(nodes);
            }
        });
    }

    public async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
        if (!this.cluster) throw new Error('Not connected');
        return ttlSeconds
            ? await this.cluster.set(key, value, 'EX', ttlSeconds)
            : await this.cluster.set(key, value);
    }

    public async get(key: string): Promise<string | null> {
        if (!this.cluster) throw new Error('Not connected');
        return await this.cluster.get(key);
    }

    public async disconnect(): Promise<void> {
        if (this.cluster) {
            await this.cluster.quit();
            this.cluster = null;
        }
    }

    // todo delete
    public async testLoop() {
        setInterval(async () => {
            try {
                const res = await this.cluster?.set('health-check', Date.now().toString());
                console.log('Ping: OK');
                this.cluster?.nodes().forEach(node => {
                    console.log(node.options.host, node.status);
                });

                /* console.log('SET fooo,');
                await redis.set('fooo','BAAR')
                console.log('foo,', await redis.get('foo'));
                console.log('fooo,', await redis.get('fooo')); */

            } catch (e: any) {
                console.log('Ping: FAILED -', e.message);
            }
        }, 15000);
    }
}


// redis.testLoop();
