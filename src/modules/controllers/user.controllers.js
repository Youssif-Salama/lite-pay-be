import { credentialModel, userModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { hashPassword } from "../../utils/bcrypt/bcrypt.utils.js";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";
import { sendEmail } from "../../utils/nodemailer/nodemailer.util.js";

// used
export const deleteMyAccount=ErrorHandlerService(async(req,res)=>{
  const {user}=req;
  if(!user) throw new AppErrorService(400,"user not found");
  const destroyUser=await userModel.destroy({where:{id:user.id}});
  if(!destroyUser) throw new AppErrorService(400,"failed to delete user");
  res.status(200).json({message:"user deleted successfully"})
})

// used
export const updateMyAccount=ErrorHandlerService(async(req,res)=>{
  const {email,userName}=req.body;
  const {user}=req;
  if(!user) throw new AppErrorService(400,"user not found");
  const updateUser=await userModel.update({email,userName},{where:{id:user.id}});
  if(!updateUser) throw new AppErrorService(400,"failed to update user");
  res.status(200).json({message:"user updated successfully"})
})

// used
export const blockUser=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  if(!id) throw new AppErrorService(400,"user id not found");
  const blockUser=await userModel.update({status:"inactive"},{where:{id}});
  if(!blockUser) throw new AppErrorService(400,"failed to block user");
  res.status(200).json({message:"user blocked successfully"})
})

// used
export const unBlockUser=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  if(!id) throw new AppErrorService(400,"user id not found");
  const unBlockUser=await userModel.update({status:"active"},{where:{id}});
  if(!unBlockUser) throw new AppErrorService(400,"failed to unblock user");
  res.status(200).json({message:"user unblocked successfully"})
})

// used
export const updateMyPassword=ErrorHandlerService(async(req,res)=>{
  const {password}=req.body;
  const {user}=req;
  if(!user) throw new AppErrorService(400,"user not found");
  const hashedPassword=hashPassword(password);
  const updatePassword=await credentialModel.update({password:hashedPassword},{where:{userId:user.id}});
  if(!updatePassword) throw new AppErrorService(400,"failed to update password");
  res.status(200).json({message:"password updated successfully"});
})

// used
export const getAllUsers=ErrorHandlerService(async(req,res)=>{
  const users=await userModel.findAll({...req.dbQuery})
  if(!users) throw new AppErrorService(400,"failed to get users");
  res.status(200).json({message:"users fetched successfully",data:users,meta:req.meta});
})

// don't use now in routes or apis
export const deleteUser=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  if(!id) throw new AppErrorService(400,"user id not found");
  const destroyUser=await userModel.destroy({where:{id}});
  if(!destroyUser) throw new AppErrorService(400,"failed to delete user");
  res.status(200).json({message:"user deleted successfully"})
})

// send requerst to reset password
export const forgotPasswordReq=ErrorHandlerService(async(req,res)=>{
  const {email}=req.body;
  if(!email) throw new AppErrorService(400,"email not found");
  sendEmail(email);
  res.status(200).json({message:"An Email has been sent to you to reset your password"});
})


// reset password do
export const resetPasswordDo=ErrorHandlerService(async(req,res)=>{
  const {otp,emailToken,password}=req.body;
  const decodedEmailToken=decodeToken(emailToken);
  if(otp===decodedEmailToken.otp){
    throw new AppErrorService(400,"invalid otp");
  }
  const findUser=await userModel.findOne({where:{email:decodedEmailToken.email}});
  if(!findUser) throw new AppErrorService(400,"user not found, invalid token");
  const hashedPassword=hashPassword(password);
  const updatePassword=await credentialModel.update({password:hashedPassword},{where:{userId:findUser.id}});
  if(!updatePassword) throw new AppErrorService(400,"failed to update password");
  res.status(200).json({message:"password updated successfully"});
})