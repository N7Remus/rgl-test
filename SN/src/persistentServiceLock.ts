import Redis from "ioredis";
import logger from "./logger";
import { LocalStateManager } from "./localStateManager";
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export interface PersistentServiceLockParam {
  client: Redis,
  serviceName: string,
  token: string,
  localStateManager: LocalStateManager,
  LEADER_LOCKTIME: number,
  LEADER_MAINTIME: number,
  LEADER_SLEEPTIME: number,
}

export class PersistentServiceLock {
  private token: string;
  private readonly lockKey: string;
  private isRunning: boolean = false;
  private client: Redis;
  private localStateManager: LocalStateManager;
  private LEADER_LOCKTIME: number;
  private LEADER_MAINTIME: number;
  private LEADER_SLEEPTIME: number;


  constructor(params:PersistentServiceLockParam) {
    this.lockKey = `servers:${params.serviceName}`;
    this.client = params.client;
    this.token = params.token;
    this.LEADER_LOCKTIME = params.LEADER_LOCKTIME;
    this.LEADER_MAINTIME = params.LEADER_MAINTIME;
    this.LEADER_SLEEPTIME = params.LEADER_SLEEPTIME;
    this.localStateManager = params.localStateManager;
  }

  async start() {
    this.isRunning = true;

    // The "Supervisor" Loop
    while (this.isRunning) {
      logger.silent("Attempting to acquire lock...");

      // 1. ACQUIRE
      const acquired = await this.client.set(this.lockKey, this.token, 'EX', this.LEADER_LOCKTIME, 'NX');

      if (acquired === 'OK') {
        this.localStateManager.updateLeaderLock(true);
        logger.info("Lock secured. Entering work/heartbeat mode.");
        await this.maintainLock();
      } else {
        logger.silent(`Lock busy. Retrying in ${this.LEADER_SLEEPTIME / 1000}s...`);
        await sleep(this.LEADER_SLEEPTIME);
      }
    }
  }

  private async maintainLock() {
    // 2. MAINTAIN (The Heartbeat)
    while (this.isRunning) {
      await sleep(1000);

      // Step 2: Renew - Manual Lua script for pre-8.6 compatibility
      // Returns 1 if successful, 0 if lock was lost/changed
      const result = await this.client.eval(
        `if redis.call("get", KEYS[1]) == ARGV[1] then 
           return redis.call("expire", KEYS[1], ARGV[2]) 
         else 
           return 0 
         end`,
        1,
        this.lockKey,
        this.token,
        5
      );

      if (result === 0) {
        logger.warn("Lock lost. Returning to acquisition loop.");
        // check who holds it, and listen to the id
        return;
      }

      // start looking for rooms with offline room servers (async)


    }
  }

  stop() {
    this.isRunning = false;
  }
}

