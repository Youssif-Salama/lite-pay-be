import {Router} from "express";
import { addNewDashboardTransaction, changeTransactionStatus, deleteSpecificUserTransactions, getAllTransactions, getMyTransactions, getUserTransactions, updateDashboardTransaction } from "../controllers/transactions.controllers.js";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { dateRangeFilterMiddleware, includeMiddleware, paginationMiddleware, searchMiddlware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { filterTransactionOnType } from "../middlewares/transaction.middlewares.js";

const transactionRouter=Router({mergeParams:true});
// get all
transactionRouter.get("/",authentication,authorization(["owner","manager","staff"]),sortingMiddleware(),filterTransactionOnType,dateRangeFilterMiddleware(),searchMiddlware(["companyName","amount"]),includeMiddleware([{model:"cardModel"}]),paginationMiddleware("transactionModel"),getAllTransactions);

// add new Transaction
transactionRouter.post("/",authentication,authorization(["owner","manager","staff"]),addNewDashboardTransaction);

// get my transactions
transactionRouter.get("/mine",authentication,authorization(["user","vip","staff","manager","owner"]),sortingMiddleware(),filterTransactionOnType,dateRangeFilterMiddleware(),searchMiddlware(["companyName","amount"]),includeMiddleware([{model:"cardModel"}]),paginationMiddleware("transactionModel"),getMyTransactions);

// get user transactions
transactionRouter.get("/specific",authentication,authorization(["manager","owner","staff"]),sortingMiddleware(),filterTransactionOnType,dateRangeFilterMiddleware(),searchMiddlware(["companyName","amount"]),includeMiddleware([{model:"cardModel"}]),paginationMiddleware("transactionModel"),getUserTransactions);

// delete user transactions
transactionRouter.delete("/specific",authentication,authorization(["manager","owner","staff"]),deleteSpecificUserTransactions);

// changeTransactionStatus
transactionRouter.put("/change-status/:id",authentication,authorization(["owner","manager","staff"]),changeTransactionStatus);

// update updateDashboardTransaction
transactionRouter.put("/:id",authentication,authorization(["owner","manager","staff"]),updateDashboardTransaction);


export default transactionRouter;