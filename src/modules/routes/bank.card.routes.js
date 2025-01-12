import {Router} from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { fetchMyAccounts, fetchMyCards, fetchTransactions } from "../controllers/bank.card.controllers.js";

const bankCardsRouter=Router();

// fetch my accounts
bankCardsRouter.get("/accounts",authentication,authorization(["owner"]),fetchMyAccounts);

// fetch my cards
bankCardsRouter.get("/cards",authentication,authorization(["owner"]),fetchMyCards);

// fetch my transactions
bankCardsRouter.get("/transactions",authentication,authorization(["owner"]),fetchTransactions);


export default bankCardsRouter;