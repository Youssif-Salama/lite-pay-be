import { cardModel, requestModel, userModel } from "../../../db/dbConnection.js";
import { checkDatesEquality, DateService } from "../../services/Date.services.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import env from "dotenv";
env.config();

// add new card
export const addNewCard=ErrorHandlerService(async(req,res)=>{
  const expiryTestDate=DateService(1);
  // const get request from reqests by its id
  const {requestId,cardNumber,cvv,type,cardBalance,expiryDate}=req.body;

  const isDateEqual=checkDatesEquality(expiryTestDate,expiryDate);
  if(!isDateEqual) throw new AppErrorService(400,"invalid expiry date");

  const findRequest=await requestModel.findByPk(requestId);
  if(!findRequest) throw new AppErrorService(404,"request not found");

  const {nameOnCard,userId,rate}=findRequest;
  const result=await cardModel.create({
    bankId:process.env.Bank_Id,
    cardNumber,
    cvv,
    type,
    userId,
    name:nameOnCard,
    balance:cardBalance,
    balanceUsd:cardBalance,
    expiryDate
  });
  if(!result) throw new AppErrorService(400,"failed to add card");
  findRequest.amountUsd=Number(cardBalance);
  findRequest.amount=Number(cardBalance)*Number(rate);
  await findRequest.save();
  const findUser=await userModel.findOne({where:{id:userId}});
  findUser.cards=[...(findUser?.cards || []), result?.id]
  await findUser.save();
  res.status(201).json({
    message:"card added successfully",
    data:result
  })
})

// change card status
export const changeCardStatus=ErrorHandlerService(async(req,res)=>{
  const {status}=req.body;
  const {id}=req.params;
  if(!id) throw new AppErrorService(400,"card id not found");
  const updateCard=await cardModel.update({status},{where:{id}});
  if(!updateCard) throw new AppErrorService(400,"failed to change card status");
  res.status(200).json({
    message:`card status updated successfully to ${status}`,
    data:updateCard
  })
})


// get all cards
export const getAllCards=ErrorHandlerService(async(req,res)=>{
  const findAll=await cardModel.findAll(req.dbQuery);
  if(!findAll) throw new AppErrorService(400,"failed to fetch all cards");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})

// get all my cards merge params
export const getMyCards=ErrorHandlerService(async(req,res)=>{
  const {id:userId}=req.params;
  req.dbQuery={
    ...req.dbQuery,
    where:{userId}
  }
  const findAll=await cardModel.findAll(req.dbQuery);
  if(!findAll) throw new AppErrorService(400,"failed to fetch all cards");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})

// delete all cards
export const deleteAllCards=ErrorHandlerService(async(req,res)=>{
  const destroyAll=await cardModel.destroy();
  if(!destroyAll) throw new AppErrorService(400,"failed to delete all cards");
  res.status(200).json({
    message:"all cards deleted successfully"
  })
})

// delete specific card
export const deleteCard=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const deleteOne=await cardModel.destroy({where:{id}});
  if(!deleteOne) throw new AppErrorService(400,"failed to delete card");
  res.status(200).json({
    message:"card deleted successfully"
  })
})

// update one card in dashboard