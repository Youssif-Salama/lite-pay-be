import { Op } from "sequelize";
import { cardModel, credentialModel, requestModel, roleModel, transactionModel, userModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { hashPassword } from "../../utils/bcrypt/bcrypt.utils.js";
import { decodeToken, makeToken } from "../../utils/jwt/jwt.utils.js";
import { sendEmail } from "../../utils/nodemailer/nodemailer.util.js";
import { generateOtp } from "../../services/Otp.services.js";
import whatsAppSender from "../../utils/whatsapp/whatsapp.util.js";

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
  const {email,username,age,gender,phoneNumber,telegram}=req.body;
  const {user}=req;

  if(!user) throw new AppErrorService(400,"user not found");
  const updateUser=await userModel.update({email,username,age,gender,phoneNumber,telegram},{where:{id:user.id}});
  if(!updateUser) throw new AppErrorService(400,"failed to update user");
  res.status(200).json({message:"user updated successfully"})
})

// update onse user
export const updateOneUserRating=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const {rating}=req.body;
  if(!id) throw new AppErrorService(400,"user id not found");
  const updateUser=await userModel.update({rating},{where:{id}});
  if(!updateUser) throw new AppErrorService(400,"failed to update user");
  res.status(200).json({message:"user updated successfully"})
})

// used
export const blockUser=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  if(!id) throw new AppErrorService(400,"user id not found");
  const blockUser=await userModel.update({status:"inactive"},{where:{id}});
  if(!blockUser || blockUser[0]==0) throw new AppErrorService(400,"failed to block user or user not found");
  res.status(200).json({message:"user blocked successfully"})
})

// used
export const unBlockUser=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  if(!id) throw new AppErrorService(400,"user id not found");
  const unBlockUser=await userModel.update({status:"active"},{where:{id}});
  if(!unBlockUser || unBlockUser[0]==0) throw new AppErrorService(400,"failed to unblock user or user not found");
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
export const getAllUsers = ErrorHandlerService(async (req, res) => {
  const users = await userModel.findAll({ ...req.dbQuery });

  if (!users || users.length === 0) {
    throw new AppErrorService(400, "Failed to get users");
  }

  const userIds = users.map(user => user.id);

  const last30DaysRequests = await requestModel.findAll({
    where: {
      userId: { [Op.in]: userIds },
      status: "success",
      createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    attributes: ["userId", "amountUsd"]
  });

  const depositMap = last30DaysRequests.reduce((acc, request) => {
    acc[request.userId] = (acc[request.userId] || 0) + (request.amountUsd || 0);
    return acc;
  }, {});

  const data = users.map(user => ({
    ...user.toJSON(),
    last30DaysDeposit: depositMap[user.id] || 0
  }));

  res.status(200).json({
    message: "Users fetched successfully",
    data,
    meta: req.meta
  });
});

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
  const {email,phone,method}=req.body;
  const otp=generateOtp();
  if(method=="phone" && phone){
    const findUser=await userModel.findOne({where:{phoneNumber:phone}});
    if(!findUser) throw new AppErrorService(400,"user not found");
    const result=await whatsAppSender("otpTemplate",[otp,otp],phone);
    if(!result) throw new AppErrorService(400,"failed to send otp");
    const emailToken=makeToken({phoneNumber:phone,otp});
    res.status(200).json({message:"An Otp has been sent to you to reset your password",emailToken});
  }
  else if(method=="email" && email){
    const findUser=await userModel.findOne({where:{email}});
    if(!findUser) throw new AppErrorService(400,"user not found");
    sendEmail(email,otp);
    const emailToken=makeToken({email,otp});
    res.status(200).json({message:"An Email has been sent to you to reset your password",emailToken});
  }
  else{
    throw new AppErrorService(400,"email or phone number is required");
  }
})


// reset password do
export const resetPasswordDo=ErrorHandlerService(async(req,res)=>{
  const {otp,emailToken,password}=req.body;
  const decodedEmailToken=decodeToken(emailToken);
  if(otp===decodedEmailToken.otp){
    throw new AppErrorService(400,"invalid otp");
  }
  let findUser;
  if(decodedEmailToken.email){
    findUser=await userModel.findOne({where:{email:decodedEmailToken.email}});
  }
  if(decodedEmailToken.phoneNumber){
    findUser=await userModel.findOne({where:{phoneNumber:decodedEmailToken.phoneNumber}});
  }
  if(!findUser) throw new AppErrorService(400,"user not found, invalid token");
  const hashedPassword=hashPassword(password);
  const updatePassword=await credentialModel.update({password:hashedPassword},{where:{userId:findUser.id}});
  if(!updatePassword) throw new AppErrorService(400,"failed to update password");
  res.status(200).json({message:"password updated successfully"});
})

// change user role
export const changeUserRole=ErrorHandlerService(async(req,res)=>{
  const {roleId,userId}=req.body;
  const findRole=await roleModel.findOne({
    where:{
      id:roleId
    }
  })
  if(!findRole) throw new AppErrorService(404,"role not found");
  const findUser=await userModel.findByPk(userId);
  if(!findUser) throw new AppErrorService(404,"user not found");
  findUser.roleId=findRole.id;
  await findUser.save();
  res.status(200).json({
    message:`user role changed to ${findRole?.type}`
  })
})

// add user specific rating
export const addSpecificUserRating=ErrorHandlerService(async(req,res)=>{
  const {ratingValue,userId}=req.body;
  const findUser=await userModel.findByPk(userId);
   if(!findUser) throw new AppErrorService(404,"user not found");
   findUser.rating=ratingValue;
   await findUser.save();
   res.status(200).json({
    message:"user rating added successfully"
   })
})


// auth role handler
export const autoRequestsListenerForVipRole=ErrorHandlerService(async(req,res)=>{
  const {userId}=req.body;
  const findUser=await userModel.findByPk(userId);
  if(!findUser) throw new AppErrorService(404,"user not found");
  const findUserRequests=await requestModel.findAll({
    where:{
      userId
    }
  });
  const totalUsdAmount = findUserRequests.reduce((start, item) => {
    return start + (Number(item?.amountUsd) || 0);
  }, 0);

  if(Number(totalUsdAmount)==1000){
    findVipRole=await roleModel.findOne({
      where:{
        type:"vip"
      }
    });
    if(!findRole) throw new AppErrorService(404,"vip role not found");
    findUser.roleId=findVipRole.id;
    await findUser.save();
  }
})


// get all my requests + transactions
export const getMyRequestsAndTransactions=ErrorHandlerService(async(req,res,next)=>{
  const {userId}=req.body;
  const findUser=await userModel.findOne({
    where:{
      id:userId
    }
  });
  if(!findUser) throw new AppErrorService(404,"user not found");
  const getAllMyRequests=await requestModel.findAll({
    where:{
      userId
    }
  });
  if(!getAllMyRequests) throw new ErrorHandlerService(400,"failed to get requests");
  const getAllMyCards=await cardModel.findAll({
    where:{
      userId
    }
  })
  if(!getAllMyCards) throw new ErrorHandlerService(400,"failed to get cards");
  let allCardsIds=[];
  for(const card of getAllMyCards){
    allCardsIds.push(card.id);
  };

  let myTransactions = [];
  for (const cardId of allCardsIds) {
    const findMyTransactions = await transactionModel.findAll({
      where: {
        [Op.or]: [
          { cardId: cardId.toString() },
          { bankCardId: cardId.toString() }
        ]
      }
    });
    myTransactions.push(...findMyTransactions);
  }

  let temp = [...getAllMyRequests, ...myTransactions];
  req.getMyRequestsAndTransactions = temp;
  next();
})

export const ApplyMyRequestsAndTransactionsFilters = ErrorHandlerService(async (req, res) => {
  const { page = 1, limit = 10, sort = 'asc', status,whatDate } = req.query;
  const getMyRequestsAndTransactions = req.getMyRequestsAndTransactions;

  // apply date filter
  let filteredData = getMyRequestsAndTransactions;
  if (whatDate && ["today", "lastWeek", "lastMonth"].includes(whatDate)) {
    filteredData = filterByDateRange(whatDate, filteredData);
  }

  // Filter by status if provided
  filteredData = getMyRequestsAndTransactions;
  if (status) {
    const allowedStatuses = ["pending", "approved", "rejected"];

if (allowedStatuses.includes(status.toLowerCase())) {
  filteredData = filteredData.filter(item => {
    const itemStatus = item.status?.toLowerCase();
    if (status.toLowerCase() === "approved") {
      return itemStatus === "approved" || itemStatus === "success";
    } else if (status.toLowerCase() === "rejected") {
      return itemStatus === "rejected" || itemStatus === "failed";
    } else {
      return itemStatus === status.toLowerCase();
    }
  });
} else {
      return res.status(400).json({ message: "Invalid status value. Allowed values are: pending, approved, rejected." });
    }
  }

  const sortedData = filteredData.sort((a, b) => {
    if (sort.toLowerCase() === 'asc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sort.toLowerCase() === 'desc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // Apply pagination
  const skip = (page - 1) * limit;
  const paginatedData = sortedData.slice(skip, skip + parseInt(limit));

  // Meta data for pagination
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const meta = {
    page: parseInt(page),
    limit: parseInt(limit),
    totalRows,
    totalPages,
    hasNext,
    hasPrev
  };

  res.status(200).json({
    message: "success",
    data: paginatedData,
    meta
  });
});


// get one user
export const getOneUserData=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const findUser=await userModel.findByPk(id,{
    include:[{
      model:roleModel
    },{
      model:cardModel
    }]
  });
  if(!findUser) throw new AppErrorService(404,"user not found");
  res.status(200).json({message:"user fetched successfully",data:findUser});
})


export const deleteOneUser=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const deletedUser=await userModel.destroy({where:{id}});
  if(!deletedUser) throw new AppErrorService(400,"failed to delete user");
  res.status(200).json({message:"user deleted successfully"})
})