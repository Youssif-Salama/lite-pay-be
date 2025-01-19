import {Router} from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { paginationMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { cardPriceAddingValidationSchema, cardPriceUpdateValidationSchema } from "../../validations/cardPrice/card.price.validations.js";
import { activateCardPrice, addNewCardPrice, deleteAllCardPrices, deleteCardPrice, getAllCardPrices, updateCardPrice } from "../controllers/card.price.controllers.js";

const cardPricRouter=Router();

// get all
cardPricRouter.get("/",authentication,authorization(["owner","manager","staff","vip","user"]),paginationMiddleware("cardPriceModel"),getAllCardPrices);

// add new card price
cardPricRouter.post("/",authentication,authorization(["owner","manager"]),validate(cardPriceAddingValidationSchema),addNewCardPrice);

// delete all
cardPricRouter.delete("/",authentication,authorization(["owner","manager"]),deleteAllCardPrices);

// delete one
cardPricRouter.delete("/:id",authentication,authorization(["owner","manager"]),deleteCardPrice);

// update
cardPricRouter.put("/:id",authentication,authorization(["owner","manager"]),validate(cardPriceUpdateValidationSchema),updateCardPrice);

// activate
cardPricRouter.put("/activate/:id",authentication,authorization(["owner","manager"]),activateCardPrice)

export default cardPricRouter;