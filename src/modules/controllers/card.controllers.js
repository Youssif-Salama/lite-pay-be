import { cardModel, requestModel, roleModel, transactionModel, userModel } from "../../../db/dbConnection.js";
import { checkDatesEquality, DateService } from "../../services/Date.services.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import env from "dotenv";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";
import { Op } from "sequelize";
env.config();

// add new card
export const addNewCard=ErrorHandlerService(async(req,res)=>{
  // const expiryTestDate=DateService(1);
  // const get request from reqests by its id
  const {requestId,cardNumber,cvv,type,cardBalance,expiryDate,bankId}=req.body;

  // const isDateEqual=checkDatesEquality(expiryTestDate,expiryDate);

  // if(!isDateEqual) throw new AppErrorService(400,"invalid expiry date");

  const findRequest=await requestModel.findByPk(requestId);
  if(!findRequest) throw new AppErrorService(404,"request not found");

  const {nameOnCard,userId,rate}=findRequest;
  const result=await cardModel.create({
    bankId,
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
  findUser.username=nameOnCard;
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
  if(req.query.role){
    req.dbQuery={
      ...req.dbQuery,
      include:[
        {
          model:userModel,
          include:[
            {
              model:roleModel,
              where:{type:req.query.role}
            }
          ]
        }
      ]
    }
  }
  if(req.filterQuery){
    Object.entries(req.filterQuery).forEach(([key,value])=>{
      req.dbQuery.where={
        ...req.dbQuery.where,
        [key]:value
      }
    })
  }
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
export const updateCard=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const updateCard=await cardModel.update(req.body,{where:{id,status:"active"}});
  if(!updateCard) throw new AppErrorService(400,"failed to update card");
  res.status(200).json({
    message:"card updated successfully",
    data:updateCard
  })
})

// get one card
export const getOneCard=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const findOne=await cardModel.findOne({
    where:{
      id
    },
    include:[{
      model:userModel,
      include:[
        {
          model:roleModel
        }
      ]
    }]
  })
  const getAllCardSuccessRequests = await requestModel.findAll({
    where: {
      cardId: id,
      status: "success",
      createdAt: {
        [Op.lt]: new Date(),
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });
  const totalLast30DaysDeposit = getAllCardSuccessRequests.reduce((total, request) => {
    return total + Number(request.amountUsd);
  }, 0);

  if(!findOne) throw new AppErrorService(400,"failed to fetch card");
  let data = {
    ...findOne.toJSON ? findOne.toJSON() : findOne,
    totalLast30DaysDeposit
  };

  res.status(200).json({
    message:"success",
    data,
  })
})

// delete user cards
export const deleteSpecificUserCards=ErrorHandlerService(async(req,res)=>{
  const {id:userId}=req.params;
  const deleteCards=await cardModel.destroy({where:{userId}});
  if(!deleteCards && deleteCards!==0) throw new AppErrorService(400,"failed to delete cards");
  res.status(200).json({
    message:"cards deleted successfully"
  })
})

// get user cards
export const getSpecificUserCards=ErrorHandlerService(async(req,res)=>{
  const findAll=await cardModel.findAll(req.dbQuery);
  if(!findAll) throw new AppErrorService(400,"failed to fetch all cards");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})

// get card transactions
export const getSpecificCardTransactions= ErrorHandlerService(async(req,res)=>{
  const findAll=await transactionModel.findAll(req.dbQuery);
  if(!findAll) throw new AppErrorService(400,"failed to fetch all transactions");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})

// get card requests
export const getSpecificCardRequests=ErrorHandlerService(async(req,res)=>{
  const findAll=await requestModel.findAll({...req.dbQuery});
  if(!findAll) throw new AppErrorService(400,"failed to fetch all transactions");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})