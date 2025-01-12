import { Op } from "sequelize";
import { ErrorHandlerService, AppErrorService } from "../services/ErrorHandler.services.js";
import morgan from "morgan";
import { logsModel } from "../../db/dbConnection.js";

export const situationFilterMiddleware = ( fields = [] ) => {
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

export const dateRangeFilterMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {startDate,endDate}=req.query;
  if(!startDate || !endDate) return next();
  req.filterQuery=req.filterQuery || {};
  req.filterQuery["createdAt"]={[Op.between]:[new Date(startDate),new Date(endDate)]};
  next();
})



// handle logs
export const handleLogsMiddleware = (app) => {
  // Wrapping everything with error handler
  app.use(ErrorHandlerService(async (req, res, next) => {
    // Intercepting res.json to track the response data
    const originalJson = res.json;
    res.json = (data) => {
      res.trackedResJson = data; // Track the response body
      originalJson.call(res, data); // Call the original res.json method
    };
    next();
  }));

  // Using morgan for logging requests
  app.use(morgan(async (tokens, req, res) => {
    // Extract relevant info from the request and response
    const time = tokens["response-time"](req, res);
    const { method, url, headers, body, params, query } = req;
    if(req.body?.password) req.body.password="***";
    const status = res.statusCode;
    const statusMessage = res.statusMessage;
    const message = res.trackedResJson; // The response body tracked by the custom json method

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
      createdAt: new Date()
    };

    // Storing the log in the database
    try {
      const storeLog = await logsModel.create({data:arrangedLog});
      if (!storeLog) throw new AppErrorService(400, "Failed to store log");

      return true; // Return true indicating that the log was stored
    } catch (error) {
      console.error("Error storing log:", error);
      throw new AppErrorService(500, "Error in logging middleware");
    }
  }));
};
