import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  level: "info",

  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),

  transports: [
    // Console logs
    new winston.transports.Console(),

    // General logs
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d"
    }),

    // Error-only logs
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d" //specifies that error logs should be retained for 30 days, after which they will be automatically deleted.
    })
  ]
});

export default logger;