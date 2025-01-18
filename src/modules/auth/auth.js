import { credentialModel, roleModel, userModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { comparePassword, hashPassword } from "../../utils/bcrypt/bcrypt.utils.js";
import { decodeToken, makeToken } from "../../utils/jwt/jwt.utils.js";

/*
  - signup auth controller
*/
export const signup=ErrorHandlerService(async(req,res)=>{
  // preparing pre requirements;
  const {email,password}=req.body;
  const hashedPassword=hashPassword(password);

  // find the user role
  const findUserRole=await roleModel.findAll({where:{type:"user"}});

  if(!findUserRole || findUserRole.length===0) throw new AppErrorService(400,"failed to find user role");

  // save email
  const saveEmailToUserModel=await userModel.create({email,roleId:findUserRole[0].id});
  if(!saveEmailToUserModel) throw new AppErrorService(400,"failed to save email");

  // save password
  const savePasswordToCredentialModel=await credentialModel.create({password:hashedPassword,userId:saveEmailToUserModel.id});
  if(!savePasswordToCredentialModel) {
    await userModel.destroy({where:{email}});
    throw new AppErrorService(400,"failed to save password");
  }
  res.status(201).json({message:"signup success"});
})

/*
  - login auth controller
*/
export const login=ErrorHandlerService(async(req,res)=>{
  const {password}=req.body;
  const foundUser=req.user;

  const userCredits=await credentialModel.findAll(
    {
      where:{userId:foundUser.id}
    }
  );
  const hashedPassword=userCredits[0].password;
  if(!hashedPassword) throw new AppErrorService(400,"failed to get user credentials");
  const isValidPassword=comparePassword(password,hashedPassword);
  if(!isValidPassword) throw new AppErrorService(400,"invalid password");
  const token=makeToken({user:foundUser});
  res.status(200).json({message:"login success",token});
})

// validate otp
export const validateOtp=ErrorHandlerService(async(req,res)=>{
  const {otp,emailToken}=req.body;
    const decodedEmailToken=decodeToken(emailToken);
    if(otp===decodedEmailToken.otp){
      throw new AppErrorService(400,"invalid otp");
    }
    res.status(200).json({message:"otp validated successfully"})
})

export const logout=ErrorHandlerService(async(req,res)=>{
  res.status(200).json({message:"logout success"});
})