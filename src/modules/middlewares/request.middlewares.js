import { roleModel, userModel } from "../../../db/dbConnection.js";
import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";

// if req.query.status retrun
export const requestStatusMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {status}=req.query;
  if(!status) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{status,
      ...(req.dbQuery.where || {})}
  }
  next();
})


// filter Req On Type
export const filterReqOnType=ErrorHandlerService(async(req,res,next)=>{
  const {reqType}=req.query;
  if(!reqType) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{type:reqType,
      ...(req.dbQuery.where || {})}
  }
  next();
})

export const filterReqOnUser = ErrorHandlerService(async (req, res, next) => {
  const { token } = req.headers;

  const decodedToken = decodeToken(token);
  const userId = decodedToken?.user?.id;

  if (!req.dbQuery) {
    req.dbQuery = {};
  }

  req.dbQuery.where = {
    userId,
    ...(req.dbQuery.where || {}),
  };

  next();
});


export const requestMethodMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {method}=req.query;
  if(!method) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{method,
      ...(req.dbQuery.where || {})}
  }
  next();
})

export const displayRequestUserRole=ErrorHandlerService(async(req,res,next)=>{
  req.dbQuery={
    ...req.dbQuery,
    include:[
      ...(req.dbQuery.include || []),
      {
      model:userModel,
      include:[{
        model:roleModel
      }]
    }]
  }
  next();
})