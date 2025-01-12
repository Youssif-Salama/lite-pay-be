import {Router} from "express";
import { addNewDashboardTransaction, changeTransactionStatus, getAllTransactions, updateDashboardTransaction } from "../controllers/transactions.controllers.js";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { paginationMiddleware } from "../../middlewares/features.middlewares.js";

const transactionRouter=Router();
// get all
transactionRouter.get("/",authentication,authorization(["owner","manager","staff"]),paginationMiddleware("transactionModel"),getAllTransactions);

// add new Transaction
transactionRouter.post("/",authentication,authorization(["owner","manager","staff"]),addNewDashboardTransaction);

// update updateDashboardTransaction
transactionRouter.put("/:id",authentication,authorization(["owner","manager","staff"]),updateDashboardTransaction);

// changeTransactionStatus
transactionRouter.put("/change-status/:id",authentication,authorization(["owner","manager","staff"]),changeTransactionStatus);

export default transactionRouter;