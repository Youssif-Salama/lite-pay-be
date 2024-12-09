import { roleModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";


export const checkRoleExistance=(forWhat)=>{
  return ErrorHandlerService(async(req,res,next)=>{
    const { type } = req.body;
    const { id } = req.params;

      if (forWhat === "create") {
        // Check if the role type already exists
        const findRole = await roleModel.findOne({ where: { type } });
        if (findRole) {
          return next(new AppErrorService(400, "Role already exists"));
        }
      } else if (forWhat === "update") {
        // Check if the role exists by ID
        const findRole = await roleModel.findByPk(id);
        if (!findRole) {
          return next(new AppErrorService(400, "Role does not exist"));
        }
      }
      next();
  })
}