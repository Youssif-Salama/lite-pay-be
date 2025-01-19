import { Op } from "sequelize";
import {
  ErrorHandlerService,
  AppErrorService,
} from "../services/ErrorHandler.services.js";
import morgan from "morgan";
import redisUtil from "../utils/upstash/upstash.redis.utils.js";
import { decodeToken } from "../utils/jwt/jwt.utils.js";

export const situationFilterMiddleware = (fields = []) => {
  return ErrorHandlerService(async (req, res, next) => {
    if (!fields || fields.length === 0) {
      return next();
    }

    const filterQuery = {};

    for (const field of fields) {
      if (req.query[field]) {
        filterQuery[field] = req.query[field];
      }
    }

    req.filterQuery = filterQuery;
    next();
  });
};

export const dateRangeFilterMiddleware = ErrorHandlerService(
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return next();
    req.filterQuery = req.filterQuery || {};
    req.filterQuery["createdAt"] = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
    next();
  }
);

// handle logs
export const handleLogsMiddleware = (app) => {
  // Wrapping everything with error handler
  app.use(
    ErrorHandlerService(async (req, res, next) => {
      // Intercepting res.json to track the response data
      const originalJson = res.json;
      res.json = (data) => {
        res.trackedResJson = data;
        originalJson.call(res, data);
      };
      next();
    })
  );

  // Using morgan for logging requests
  app.use(
    morgan(async (tokens, req, res) => {
      // Extract relevant info from the request and response
      const time = tokens["response-time"](req, res);
      const { method, originalUrl:url, headers, body, params, query } = req;

      if (req.body?.password) req.body.password = "***";
      const status = res.statusCode;
      const statusMessage = res.statusMessage;
      const message = res.trackedResJson?.message;

      // Arranging log details
      const arrangedLog = {
        method,
        url,
        headers,
        body,
        params,
        query,
        status,
        statusMessage,
        message,
        time,
        createdAt: new Date(),
      };

      // Storing the log in the database
      try {
        const previousLogs = await redisUtil.get("logs");
        let logsArr = [];
        if (previousLogs) logsArr = previousLogs;
        logsArr.push(arrangedLog);
        await distributeLogsMiddleware(arrangedLog);
        await redisUtil.set("logs", JSON.stringify(logsArr), { ex: 365*24*60*60 });
        return true;
      } catch (error) {
        console.error("Error storing log:", error);
        throw new AppErrorService(500, "Error in logging middleware");
      }
    })
  );
};

const distributeLogsMiddleware = async (arrangedLog) => {
  const { url, message } = arrangedLog;
  const defaultTTL = 365 * 24 * 60 * 60; // 1 year

  if (url.toString().includes("login") || url.toString().includes("logout")) {
    const { token } = message;
    const { user } = decodeToken(token);
    const { Role } = user;

    if (["owner", "manager", "staff"].includes(Role?.type)) {
      const previousLogsNotUser = await redisUtil.get("not-user-logs");
      let notUserLogsArr = [];

      if (previousLogsNotUser) {
        try {
          notUserLogsArr = JSON.parse(previousLogsNotUser);
        } catch (error) {
          console.error("Error parsing 'not-user-logs' from Redis:", error);
        }
      }

      notUserLogsArr.push(arrangedLog);

      let ttlNotUserLogs = await redisUtil.ttl("not-user-logs");
      if (ttlNotUserLogs === -1 || ttlNotUserLogs <= 0) {
        ttlNotUserLogs = defaultTTL;
      }

      await redisUtil.set("not-user-logs", JSON.stringify(notUserLogsArr), {
        ex: ttlNotUserLogs,
      });
    } else {
      const previousLogsUser = await redisUtil.get("user-logs");
      let userLogsArr = [];

      if (previousLogsUser) {
        try {
          userLogsArr = JSON.parse(previousLogsUser);
        } catch (error) {
          console.error("Error parsing 'user-logs' from Redis:", error);
        }
      }

      userLogsArr.push(arrangedLog);

      let ttlUserLogs = await redisUtil.ttl("user-logs");
      if (ttlUserLogs === -1 || ttlUserLogs <= 0) {
        ttlUserLogs = defaultTTL;
      }

      await redisUtil.set("user-logs", JSON.stringify(userLogsArr), {
        ex: ttlUserLogs,
      });
    }
  } else {
    const previousLogsSystem = await redisUtil.get("system-logs");
    let systemLogsArr = [];

    if (previousLogsSystem) {
      try {
        systemLogsArr = JSON.parse(previousLogsSystem);
      } catch (error) {
        console.error("Error parsing 'system-logs' from Redis:", error);
      }
    }

    systemLogsArr.push(arrangedLog);

    let ttlSystemLogs = await redisUtil.ttl("system-logs");
    if (ttlSystemLogs === -1 || ttlSystemLogs <= 0) {
      ttlSystemLogs = defaultTTL;
    }

    await redisUtil.set("system-logs", JSON.stringify(systemLogsArr), {
      ex: ttlSystemLogs,
    });
  }
};
