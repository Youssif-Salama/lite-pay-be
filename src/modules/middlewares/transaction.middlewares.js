import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";

export const filterTransactionOnType=ErrorHandlerService(async(req,res,next)=>{
  const {transactionType}=req.query;
  if(!transactionType) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{type:transactionType}
  }
  next();
})