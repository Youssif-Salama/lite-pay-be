import { userModel } from "../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../services/ErrorHandler.services.js";
import { verifyToken } from "../utils/jwt/jwt.utils.js";

// authentication middleware
export const authentication=ErrorHandlerService(async(req,res,next)=>{
  const {token}=req.headers;
  if(!token) throw new AppErrorService(400,"token not found");
  const decodedToken=await verifyToken(token);
  if(!decodedToken) throw new AppErrorService(498,"invalid token");
  const checkIfUserBlocked=await userModel.findOne({where:{id:decodedToken.user.id,status:"inactive"}});
  if(checkIfUserBlocked) throw new AppErrorService(400,"user is blocked");
  req.user=decodedToken.user;
  next();
});



/**
 * Middleware to authorize a user based on their role.
 * @param {string} userRole - The required role for authorization.
 * @throws {AppErrorService} - Throws a 400 error if the user is not authenticated,
 *                             or a 403 error if the user is unauthorized.
 */
export const authorization=(userRole)=>ErrorHandlerService(async(req,res,next)=>{
  const {user}=req;
  if(!user) throw new AppErrorService(400,"user not found, not authenticated");
  if(user.role.type!==userRole) throw new AppErrorService(403,"unauthorized");
  next();
});