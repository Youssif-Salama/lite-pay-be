import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";

// if req.query.status retrun
export const requestStatusMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {status}=req.query;
  if(!status) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{status}
  }
  next();
})


// filter Req On Type
export const filterReqOnType=ErrorHandlerService(async(req,res,next)=>{
  const {reqType}=req.query;
  if(!reqType) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{type:reqType}
  }
  next();
})