import { cardModel, transactionModel } from "../../../db/dbConnection.js";
import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";

export const filterTransactionOnType=ErrorHandlerService(async(req,res,next)=>{
  const {transactionType}=req.query;
  if(!transactionType) return next();
  req.dbQuery={
    ...(req.dbQuery || {}),
    where:{type:transactionType,
      ...(req.dbQuery.where || {})}
  }
  next();
})

export const filterTransactionOnCard=ErrorHandlerService(async(req,res, next)=>{
  const {id}=req.params;
  req.dbQuery={
    ...(req.dbQuery || {}),
    where:{cardId:id,
      ...(req.dbQuery.where || {})}
  };
  next();
})


export const countMetaForTransactions=async(dbQuery,query)=>{
  const { pageNo, limitNo } = query;
  const page = pageNo ? parseInt(pageNo, 10) : 1;
  const limit = limitNo ? parseInt(limitNo, 10) : 10;

    let totalRows;
    if(dbQuery){
      totalRows= await transactionModel.count({
        where: dbQuery.where || {},
        include: dbQuery.include
      })
    }
    else{
      totalRows= await transactionModel.count()
    }
    const totalPages = Math.ceil(totalRows / limit);

    const meta = {
      hasNext: page < totalPages,
      hasPrev: page > 1,
      totalRows,
      page,
      limit,
      totalPages,
    };
    return meta;
}