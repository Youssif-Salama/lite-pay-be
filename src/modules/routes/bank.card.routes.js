import {Router} from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { fetchMyAccounts, fetchMyCards, fetchTransactions } from "../controllers/bank.card.controllers.js";

const bankCardsRouter=Router();

// fetch my accounts
bankCardsRouter.get("/accounts",authentication,fetchMyAccounts);

// fetch my cards
bankCardsRouter.get("/cards",authentication,fetchMyCards);

// fetch my transactions
bankCardsRouter.get("/transactions",authentication,fetchTransactions);


export default bankCardsRouter;