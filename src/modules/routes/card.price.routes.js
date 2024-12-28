import {Router} from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { paginationMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { cardPriceAddingValidationSchema, cardPriceUpdateValidationSchema } from "../../validations/cardPrice/card.price.validations.js";
import { activateCardPrice, addNewCardPrice, deleteAllCardPrices, deleteCardPrice, getAllCardPrices, updateCardPrice } from "../controllers/card.price.controllers.js";

const cardPricRouter=Router();

// get all
cardPricRouter.get("/",authentication,paginationMiddleware("cardPriceModel"),getAllCardPrices);

// add new card price
cardPricRouter.post("/",authentication,validate(cardPriceAddingValidationSchema),addNewCardPrice);

// delete all
cardPricRouter.delete("/",authentication,deleteAllCardPrices);

// delete one
cardPricRouter.delete("/:id",authentication,deleteCardPrice);

// update
cardPricRouter.put("/:id",authentication,validate(cardPriceUpdateValidationSchema),updateCardPrice);

// activate
cardPricRouter.put("/activate/:id",authentication,activateCardPrice)

export default cardPricRouter;