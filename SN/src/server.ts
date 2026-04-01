import express from "express";
import { createClient } from "redis";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import logger from "./logger";
import { RegisterService } from "./registerService";
import { RedisOptions } from "ioredis/built/redis/RedisOptions";
import { PersistentServiceLock, PersistentServiceLockParam } from "./persistentServiceLock";
import { LocalStateManager } from "./localStateManager";

logger.info("Application startup...");

const SERVER_PORT = parseInt(process.env.PORT || "3000");
const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT || 'redis://127.0.0.1:6379'; // Redis connection string
const LEADER_LOCKTIME = parseInt(process.env.LEADER_LOCKTIME || "5"); // Locks leaderships for x seconds
const LEADER_MAINTIME = parseInt(process.env.LEADER_MAINTIME || "2"); // Leader renews lock every x seconds
const LEADER_SLEEPTIME = parseInt(process.env.LEADER_SLEEPTIME || "3"); //  tries to take over lock every x miliseconds


const SERVER_ID = "s" + uuidv4();
const REDIS_CHANNEL = "register";
const REDIS_KEY = "shared_state";

logger.debug({
  SERVER_ID: SERVER_ID,
  SERVER_PORT: SERVER_PORT

}, "Initial config");

// Local state manger
const localStateManager = new LocalStateManager();

let serverState = {};
let workersState = {};
let rooms = {};


// Start redis connection to register service
const registerService = new RegisterService(SERVER_ID, REDIS_ENDPOINT as RedisOptions, REDIS_CHANNEL, REDIS_KEY);

// try to get leader-lock
const plsOptions: PersistentServiceLockParam = {
  client: registerService.client,
  serviceName: 'leader-lock',
  token: SERVER_ID,
  localStateManager: localStateManager,
  LEADER_LOCKTIME: LEADER_LOCKTIME,
  LEADER_MAINTIME: LEADER_MAINTIME,
  LEADER_SLEEPTIME: LEADER_SLEEPTIME
};

const persistentServiceLock = new PersistentServiceLock(plsOptions);
persistentServiceLock.start();

// listen for connections on socket.io
const app = express();
app.use(express.json());
// roomid -> OK keep connection or redirect to an other server directly
app.post("/state", async (req, res) => {
  const newState = req.body;

  serverState = newState;

  await registerService.publish(REDIS_KEY, newState);

  res.send({ status: "updated", state: newState });
});

app.get("/state", (_, res) => {
  res.send(serverState);
});

app.listen(SERVER_PORT, () => console.log(`Server ${SERVER_ID} running on port ${SERVER_PORT}`));
