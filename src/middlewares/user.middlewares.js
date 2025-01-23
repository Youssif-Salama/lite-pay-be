import { roleModel } from "../../db/dbConnection.js";
import { ErrorHandlerService } from "../services/ErrorHandler.services.js";

export const filterUserOnRoleMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {role}=req.query;
  req.dbQuery = {
    ...req.dbQuery,
    include: [
      {
        model: roleModel,
        ...(role ? { where: { type: role } } : {}),
      },
      ...(req.dbQuery.include || []),
    ],
  };
  next();
});