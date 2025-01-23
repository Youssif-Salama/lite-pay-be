import { Router } from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { addNewCard, changeCardStatus, deleteAllCards, deleteCard, deleteSpecificUserCards, getAllCards, getMyCards, getOneCard, getSpecificCardRequests, getSpecificCardTransactions, getSpecificUserCards, updateCard } from "../controllers/card.controllers.js";
import { dateRangeFilterMiddleware, includeMiddleware, paginationMiddleware, searchMiddlware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { cardOwnerPlanMiddleware, cardSearchCriteria, cardStatusMiddleware, requestsOnCardFilterMiddleware, specificUserMiddleware, userCardsFilterMiddleware } from "../middlewares/card.middlewares.js";
import { situationFilterMiddleware } from "../../middlewares/global.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { cardValidationSchema, cardValidationSchemaPut } from "../../validations/card/card.validations.js";
import { filterReqOnType, requestStatusMiddleware } from "../middlewares/request.middlewares.js";
import { filterTransactionOnCard, filterTransactionOnType } from "../middlewares/transaction.middlewares.js";

const cardRouter=Router({mergeParams:true});

// get my cards
cardRouter.get("/mine",authentication,authorization(["staff","manager","owner","vip","user"]),sortingMiddleware(),cardStatusMiddleware,dateRangeFilterMiddleware(),searchMiddlware(["cardNumber","cvv","name","balance"]),userCardsFilterMiddleware,includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id","telegram","username","status"]
  }
]),paginationMiddleware("cardModel"),getMyCards);

// get all cards
cardRouter.get("/all",authentication,authorization(["staff","manager","owner"]),sortingMiddleware(),cardStatusMiddleware,cardOwnerPlanMiddleware,dateRangeFilterMiddleware(),searchMiddlware(["cardNumber","cvv","name","balance"]),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id","telegram","username","status"]
  }
]),paginationMiddleware("cardModel"),getAllCards);

// add new card
cardRouter.post("/",authentication,authorization(["staff","manager","owner"]),validate(cardValidationSchema),addNewCard);

// change card status
cardRouter.put("/change-status/:id",authentication,authorization(["staff","manager","owner"]),changeCardStatus);

// delete all cards
cardRouter.delete("/all",authentication,authorization(["manager","owner"]),deleteAllCards);

// get on card
cardRouter.get("/one/:id",authentication,authorization(["manager","owner","staff"]),getOneCard);

// delete one card
cardRouter.delete("/:id",authentication,authorization(["manager","owner"]),deleteCard);

// update one card in dashboard
cardRouter.put("/:id",authentication,authorization(["manager","owner","staff"]),validate(cardValidationSchemaPut),updateCard);

// delete user cards
cardRouter.delete("/",authentication,authorization(["manager","owner"]),deleteSpecificUserCards);

// get user cards
cardRouter.get("/",authentication,authorization(["staff","manager","owner"]),sortingMiddleware(),specificUserMiddleware,cardStatusMiddleware,dateRangeFilterMiddleware(),searchMiddlware(["cardNumber","cvv","name","balance"]),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id","phoneNumber","telegram","username","status"]
  }
]),paginationMiddleware("cardModel"),getSpecificUserCards);

// get card transactions
cardRouter.get("/transactions/:id",authentication,authorization(["manager","owner","staff"]),sortingMiddleware(),filterTransactionOnCard,filterTransactionOnType,requestStatusMiddleware,searchMiddlware(["companyName","amount"]),paginationMiddleware("transactionModel"),getSpecificCardTransactions);

// get card requests
cardRouter.get("/requests/:id",authentication,authorization(["manager","owner","staff"]),sortingMiddleware(),dateRangeFilterMiddleware(),requestsOnCardFilterMiddleware,filterReqOnType,requestStatusMiddleware,searchMiddlware(["account","nameOnCard","phoneNumber","email","telegram"]),paginationMiddleware("requestModel"),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id","telegram","username","status"]
  },
  {
    model:"cardModel",
  }
]),getSpecificCardRequests);

export default cardRouter;