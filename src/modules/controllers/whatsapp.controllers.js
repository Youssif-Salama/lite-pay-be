import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { generateOtp } from "../../services/Otp.services.js";
import { makeToken } from "../../utils/jwt/jwt.utils.js";
import { sendOtpEmail } from "../../utils/nodemailer/nodemailer.util.js";
import whatsAppSender from "../../utils/whatsapp/whatsapp.util.js";

export const otpWhatsApp=ErrorHandlerService(async(req,res)=>{
  const {phoneNumber,whay,email}=req.body;
  const otp=generateOtp();
  let token;
  if(whay !=="whatsapp") {
    if(!email) throw new AppErrorService(400,"email is required");
    sendOtpEmail(otp,email);
    token=makeToken({email,otp});
  }
  else{
    if(!phoneNumber) throw new AppErrorService(400,"phone number is required");
    const result=await whatsAppSender("otpTemplate",[otp,otp],phoneNumber);
    if(!result) throw new AppErrorService(400,"failed to send otp");
    token=makeToken({phoneNumber,otp});
  }
  res.status(200).json({message:"otp sent successfully",otpToken:token});
})