import { Router } from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { addNewCard, changeCardStatus, deleteAllCards, deleteCard, getAllCards, getMyCards, updateCard } from "../controllers/card.controllers.js";
import { includeMiddleware, paginationMiddleware, searchMiddlware, selectMiddleware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { cardStatusMiddleware } from "../middlewares/card.middlewares.js";
import { dateRangeFilterMiddleware } from "../../middlewares/global.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { cardValidationSchema, cardValidationSchemaPut } from "../../validations/card/card.validations.js";

const cardRouter=Router({mergeParams:true});

// get my cards
cardRouter.get("/",authentication,authorization(["staff","manager","owner","vip","basic"]),sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","balance"]),cardStatusMiddleware,selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),paginationMiddleware("cardModel"),getMyCards);

// get all cards
cardRouter.get("/all",authentication,authorization(["staff","manager","owner"]),dateRangeFilterMiddleware,sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","type","balance"]),cardStatusMiddleware,paginationMiddleware("cardModel"),selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),getAllCards);

// add new card
cardRouter.post("/",authentication,authorization(["staff","manager","owner"]),validate(cardValidationSchema),addNewCard);

// change card status
cardRouter.put("/change-status/:id",authentication,authorization(["staff","manager","owner"]),changeCardStatus);

// delete assl cards
cardRouter.delete("/",authentication,authorization(["manager","owner"]),deleteAllCards);

// delete one card
cardRouter.delete("/:id",authentication,authorization(["manager","owner"]),deleteCard);

// update one card in dashboard
cardRouter.put("/:id",authentication,authorization(["manager","owner","staff"]),validate(cardValidationSchemaPut),updateCard);

export default cardRouter;