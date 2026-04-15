import pino from "pino";
const noir = require('pino-noir');

const { redactionKeys } = require('./redaction/redaction-keys');
const serializers = { err: pino.stdSerializers.err };

const isPretty = process.env.LOG_PRETTY === "true";

const logger = isPretty
  ? pino({
      level: process.env.LOG_LEVEL || "info",
      serializers: noir(serializers, redactionKeys),

      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname"
        }
      }
    })
  : pino({
      level: process.env.LOG_LEVEL || "info",
      serializers: noir(serializers, redactionKeys)

    });

export default logger;