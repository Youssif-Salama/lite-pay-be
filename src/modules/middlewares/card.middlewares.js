import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";

// if req.query.status retrun
export const cardStatusMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {status}=req.query;
  if(!status) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{"status":status}
  }
  next();
})