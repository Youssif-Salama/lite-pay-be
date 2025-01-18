import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";
import redisUtil from "../../utils/upstash/upstash.redis.utils.js";

// apply middleware chaining on logs
// prepare req.logsArr
export const getLogs=()=>ErrorHandlerService(async(req,res,next)=>{
  const result=await redisUtil.get("logs");
  console.log(result);

  req.logsArr=result;
  next();
});
export const getNotUserLogs=()=>ErrorHandlerService(async(req,res,next)=>{
  const result=await redisUtil.get("not-user-logs");
  req.logsArr=result;
  next();
});
export const getUserLogs=()=>ErrorHandlerService(async(req,res,next)=>{
  const result=await redisUtil.get("user-logs");
  req.logsArr=result;
  next();
});
export const getSystemLogs=()=>ErrorHandlerService(async(req,res,next)=>{
  const result=await redisUtil.get("system-logs");
  req.logsArr=result;
  next();
});

// prepare res.logsArr filters and features
// apply date range filter (on all except non user logs)
export const filterLogsRangeDate=()=>ErrorHandlerService(async(req,res,next)=>{
  const {startDate ,endDate}=req.query;
  if(!startDate || !endDate) return next();
  const logsArr=req.logsArr;
  req.logsArr=logsArr && logsArr.filter((log)=>{
    const logDate=new Date(log.createdAt);
    return logDate>=new Date(startDate) && logDate<=new Date(endDate);
  });
  next();
});
// apply pagination
export const paginationLogs = () => ErrorHandlerService(async (req, res, next) => {
  const { page=1, size=10 } = req.query;

  const logsArr = req.logsArr;
  const totalRows = logsArr && logsArr.length;

  const totalPages = Math.ceil(totalRows / Number(size));

  const pageNumber = Math.max(1, Math.min(Number(page), totalPages));

  const startIndex = (pageNumber - 1) * Number(size);

  const endIndex = startIndex + Number(size);

  req.logsArr = logsArr && logsArr.slice(startIndex, endIndex);
  res.pagination = {
    hasNext: pageNumber < totalPages,
    hasPrev: pageNumber > 1,
    totalRows,
    page: pageNumber,
    limit: Number(size),
    totalPages
  };

  next();
});

// apply searching criteria
export const searchLogs=()=>ErrorHandlerService(async(req,res,next)=>{
  const {search}=req.query;
  if(!search) return next();
  const logsArr=req.logsArr;
  req.logsArr=logsArr && logsArr.filter((log)=>{
    const{token:tokenFromMessage}=log.message;
    const {token:tokenFromHeader}=req.headers;
    if(tokenFromHeader){
      const decodedToken=decodeToken(tokenFromHeader);
    const {username,phoneNumber,email,telegram,status,Role}=decodedToken;
      return username.includes(search) || phoneNumber.includes(search) || email.includes(search) || telegram.includes(search) || status.includes(search) || Role.type.includes(search);
  }
    if (tokenFromMessage) {
      const decodedToken = decodeToken(tokenFromMessage);
      const { username, phoneNumber, email, telegram, status, Role } = decodedToken;
      return username.includes(search) || phoneNumber.includes(search) || email.includes(search) || telegram.includes(search) || status.includes(search) || Role.type.includes(search);
    }
  });
  next();
});


// execute req.logsArr
export const executeLogs=()=>ErrorHandlerService(async(req,res,next)=>{
  res.status(200).json({
    message:"Logs fetched successfully",
    data:req.logsArr ? req.logsArr : [],
    meta:res.pagination
  });
});