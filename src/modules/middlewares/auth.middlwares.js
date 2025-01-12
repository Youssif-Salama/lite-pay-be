import { roleModel, userModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";

/**
 * Middleware to check if a user already exists with given email.
 * @param {string} forWhat - the purpose of checking the existence of the user ["signup","login"]
 * @throws {AppErrorService} - if the user exists for signup or does not exist for login
 */
export const checkUserExistence =(forWhat)=>ErrorHandlerService(async(req,res,next)=>{
  const {email}=req.body;
  const findIfEmailExist=await userModel.findOne({
    where:{email},
    include:{
      model:roleModel
        }
  })
  if(forWhat==="signup" && findIfEmailExist) throw new AppErrorService(400,"user alread exist with this email");
  if(forWhat==="login" && !findIfEmailExist) throw new AppErrorService(400,"user does not exist with this email");
  if(findIfEmailExist) req.user=findIfEmailExist;
  next();
})
