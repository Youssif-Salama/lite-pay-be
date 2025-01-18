import {Router} from "express";
import { executeLogs, filterLogsRangeDate, getLogs, getNotUserLogs, getSystemLogs, getUserLogs, paginationLogs, searchLogs } from "../controllers/logs.all.js";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";

const logRoutes=Router();

logRoutes.get("/all",authentication,authorization(["owner","manager"]),getLogs(),filterLogsRangeDate(),searchLogs(),paginationLogs(),executeLogs());
logRoutes.get("/not-user",authentication,authorization(["owner","manager"]),getNotUserLogs(),filterLogsRangeDate(),searchLogs(),paginationLogs(),executeLogs());
logRoutes.get("/user",authentication,authorization(["owner","manager"]),getUserLogs(),filterLogsRangeDate(),searchLogs(),paginationLogs(),executeLogs());
logRoutes.get("/system",authentication,authorization(["owner","manager"]),getSystemLogs(),filterLogsRangeDate(),searchLogs(),paginationLogs(),executeLogs());

export default logRoutes;