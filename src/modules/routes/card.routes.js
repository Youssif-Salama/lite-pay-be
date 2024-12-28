import { Router } from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { addNewCard, changeCardStatus, deleteAllCards, deleteCard, getAllCards, getMyCards } from "../controllers/card.controllers.js";
import { includeMiddleware, paginationMiddleware, searchMiddlware, selectMiddleware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { cardStatusMiddleware } from "../middlewares/card.middlewares.js";

const cardRouter=Router({mergeParams:true});

// get my cards
cardRouter.get("/",authentication,sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","type","status","balance"]),cardStatusMiddleware,selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),paginationMiddleware("cardModel"),getMyCards);

// get all cards
cardRouter.get("/all",authentication,sortingMiddleware(),searchMiddlware(["cardNumber","cvv","name","type","status","balance"]),cardStatusMiddleware,paginationMiddleware("cardModel"),selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  }
]),getAllCards);

// add new card
cardRouter.post("/",authentication,addNewCard);

// change card status
cardRouter.put("/change-status/:id",authentication,changeCardStatus);

// delete assl cards
cardRouter.delete("/",authentication,deleteAllCards);

// delete one card
cardRouter.delete("/:id",authentication,deleteCard);

export default cardRouter;