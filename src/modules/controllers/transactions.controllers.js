import { Op } from "sequelize";
import { cardModel, transactionModel } from "../../../db/dbConnection.js";
import { applyCardBalance } from "../../methods/transaction.methods.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";
import { countMetaForTransactions } from "../middlewares/transaction.middlewares.js";

// add new transaction on bank pulling
export const addNewTransaction=(data)=>ErrorHandlerService(async(req,res)=>{
  if(data.length===0) throw new AppErrorService(400,"failed to add transaction");
  const addTransaction=await transactionModel.bulkCreate(data);
  if(!addTransaction) throw new AppErrorService(400,"failed to add transaction");
  res.status(201).json({
    message:"transactions added successfully"
  })
})


// get all transactions
export const getAllTransactions=ErrorHandlerService(async(req,res)=>{
  const transactions=await transactionModel.findAll({...req.dbQuery})
  if(!transactions) throw new AppErrorService(400,"failed to get transactions");
  res.status(200).json({message:"transactions fetched successfully",data:transactions,meta:req.meta});
})

// add new transaction from dashboard
export const addNewDashboardTransaction=ErrorHandlerService(async(req,res)=>{
  //  req.body => amount cardId
req.body.companyName="litepay";
req.body.details={
  description:"this transaction is from litepay system"
}
const addTransaction=await transactionModel.create({...req.body,status:"approved"});
if(!addTransaction) throw new AppErrorService(400,"failed to add transaction");

// modify card balance in usd on transaction success
// call a function that 1- get the card number from the bank then search with it in cards model to change balance
const flag=applyCardBalance(req.body.cardId,req.body.amount);
if(!flag) throw new AppErrorService(400,"failed to apply card balance");
res.status(201).json({
  message:"transaction added successfully, balance updated successfully"
})
})

export const updateDashboardTransaction=ErrorHandlerService(async(req,res)=>{
  //  req.body => amount
  const {amount}=req.body;
const addTransaction=await transactionModel.update({amount},{
  where:{id:req.params.id}
});
if(!addTransaction) throw new AppErrorService(400,"failed to update transaction");

// modify card balance in usd on transaction success
// call a function that 1- get the card number from the bank then search with it in cards model to change balance
const flag=applyCardBalance(req.body.cardId,req.body.amount);
if(!flag) throw new AppErrorService(400,"failed to apply card balance");
res.status(201).json({
  message:"transaction updated successfully, balance updated successfully"
})
})

export const changeTransactionStatus=ErrorHandlerService(async(req,res)=>{
  const {status}=req.body;
  const updateTransaction=await transactionModel.update({status},{
    where:{id:req.params.id}
  });
  if(!updateTransaction) throw new AppErrorService(400,"failed to update transaction");
  res.status(201).json({
    message:"transaction status updated successfully"
  })
})


export const getMyTransactions=ErrorHandlerService(async(req,res)=>{
  const token=req.headers.token;
  const decodedToken=decodeToken(token);
  const userId=decodedToken.user.id;
  req.dbQuery={
    ...req.dbQuery,
    where:{userId}
  }
  const findUserCards=await cardModel.findAll({
    where:{userId}
  });
  if(!findUserCards) throw new AppErrorService(400,"failed to get cards");
  const allCardsIds=[];
  for(const card of findUserCards){
    allCardsIds.push(card.id);
  };
  req.dbQuery={
    ...req.dbQuery,
    where:{
      ...req.dbQuery.where,
      [Op.or]:[
        {cardId:allCardsIds}
      ],
    }
  }
  delete req.dbQuery.where.userId


  const metaPag=await countMetaForTransactions(req.dbQuery,req.query);
  console.log({metaPag});


  const findMyTransactions=await transactionModel.findAll({
    ...req.dbQuery,
  });
  if(!findMyTransactions) throw new AppErrorService(400,"failed to get transactions");
  res.status(200).json({
    message:"success",
    data:findMyTransactions,
    meta:metaPag
  })
})

export const getUserTransactions=ErrorHandlerService(async(req,res)=>{
  const {id:userId}=req.params;
  req.dbQuery={
    ...req.dbQuery,
    where:{userId}
  }
  const findUserCards=await cardModel.findAll({
    where:{userId}
  });
  if(!findUserCards) throw new AppErrorService(400,"failed to get cards");
  const allCardsIds=[];
  for(const card of findUserCards){
    allCardsIds.push(card.id);
  };
  req.dbQuery={
    ...req.dbQuery,
    where:{
      ...req.dbQuery.where,
      [Op.or]:[
        {cardId:allCardsIds}
      ],
    }
  }
  delete req.dbQuery.where.userId


  const metaPag=await countMetaForTransactions(req.dbQuery,req.query);
  console.log({metaPag});


  const findMyTransactions=await transactionModel.findAll({
    ...req.dbQuery,
  });
  if(!findMyTransactions) throw new AppErrorService(400,"failed to get transactions");
  res.status(200).json({
    message:"success",
    data:findMyTransactions,
    meta:metaPag
  })
})

export const deleteSpecificUserTransactions=ErrorHandlerService(async(req,res)=>{
  const {id:userId}=req.params;
  const getUserCards=await cardModel.findAll({
    where:{userId}
  })
  if(!getUserCards) throw new AppErrorService(400,"failed to get cards");
  const allCardsIds=[];
  for(const card of getUserCards){
    allCardsIds.push(card.id);
  };
  const deleteTransactions=await transactionModel.destroy({
    where:{cardId:{
      [Op.in]:allCardsIds
    }}
  });
  console.log({deleteTransactions});

  if(!deleteTransactions && deleteTransactions!==0) throw new AppErrorService(400,"failed to delete transactions");
  res.status(200).json({
    message:"transactions deleted successfully"
  })
})