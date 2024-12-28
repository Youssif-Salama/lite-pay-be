import {Router} from "express";
import { addNewDashboardTransaction, changeTransactionStatus, getAllTransactions, updateDashboardTransaction } from "../controllers/transactions.controllers.js";
import { authentication } from "../../middlewares/auth.middlewares.js";

const transactionRouter=Router();
// get all
transactionRouter.get("/",getAllTransactions);

// add new Transaction
transactionRouter.post("/",authentication,addNewDashboardTransaction);

// update updateDashboardTransaction
transactionRouter.put("/:id",authentication,updateDashboardTransaction);

// changeTransactionStatus
transactionRouter.put("/change-status/:id",authentication,changeTransactionStatus);

export default transactionRouter;