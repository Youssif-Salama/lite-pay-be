import { roleModel } from "../../db/dbConnection.js";
import { ErrorHandlerService } from "../services/ErrorHandler.services.js";

export const filterUserOnRoleMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {role}=req.query;
  if(!role) return next();
  req.dbQuery={
    ...req.dbQuery,
    include:[{
      model:roleModel,
      where:{type:role}
    }]
  }
  next();
});