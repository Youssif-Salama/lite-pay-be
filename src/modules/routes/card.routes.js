import { Router } from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { addNewCard, changeCardStatus, deleteAllCards, deleteCard, deleteSpecificUserCards, getAllCards, getMyCards, getSpecificCardRequests, getSpecificCardTransactions, getSpecificUserCards, updateCard } from "../controllers/card.controllers.js";
import { includeMiddleware, paginationMiddleware, searchMiddlware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { cardStatusMiddleware } from "../middlewares/card.middlewares.js";
import { dateRangeFilterMiddleware, situationFilterMiddleware } from "../../middlewares/global.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { cardValidationSchema, cardValidationSchemaPut } from "../../validations/card/card.validations.js";
import transactionRouter from "./transaction.routes.js";
import { filterReqOnType } from "../middlewares/request.middlewares.js";
import { filterTransactionOnType } from "../middlewares/transaction.middlewares.js";

const cardRouter=Router({mergeParams:true});

// get my cards
cardRouter.get("/mine",authentication,authorization(["staff","manager","owner","vip","basic"]),sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","balance"]),cardStatusMiddleware,includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),paginationMiddleware("cardModel"),getMyCards);

// get all cards
cardRouter.get("/all",authentication,authorization(["staff","manager","owner"]),dateRangeFilterMiddleware,sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","type","balance"]),cardStatusMiddleware,paginationMiddleware("cardModel"),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),getAllCards);

// add new card
cardRouter.post("/",authentication,authorization(["staff","manager","owner"]),validate(cardValidationSchema),addNewCard);

// change card status
cardRouter.put("/change-status/:id",authentication,authorization(["staff","manager","owner"]),changeCardStatus);

// delete all cards
cardRouter.delete("/all",authentication,authorization(["manager","owner"]),deleteAllCards);

// delete one card
cardRouter.delete("/:id",authentication,authorization(["manager","owner"]),deleteCard);

// update one card in dashboard
cardRouter.put("/:id",authentication,authorization(["manager","owner","staff"]),validate(cardValidationSchemaPut),updateCard);

// delete user cards
cardRouter.delete("/",authentication,authorization(["manager","owner"]),deleteSpecificUserCards);

// get user cards
cardRouter.get("/",authentication,authorization(["staff","manager","owner"]),sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","balance"]),cardStatusMiddleware,includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),paginationMiddleware("cardModel"),getSpecificUserCards);

// get card transactions
cardRouter.get("/transactions/:id",authentication,authorization(["manager","owner","staff"]),sortingMiddleware(),filterTransactionOnType,paginationMiddleware("transactionModel"),getSpecificCardTransactions);
// get card requests
cardRouter.get("/requests/:id",authentication,authorization(["manager","owner","staff"]),filterReqOnType,situationFilterMiddleware(["status","method"]),dateRangeFilterMiddleware,sortingMiddleware(),searchMiddlware(["account","nameOnCard","phoneNumber","email","telegram"]),paginationMiddleware("requestModel"),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  },
  {
    model:"cardModel",
  }
]),getSpecificCardRequests);

export default cardRouter;