import {Router} from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { addNewPromo, deleteAllPromos, deletePromo, getAllPromos, updatePromo } from "../controllers/promo.controllers.js";
import { paginationMiddleware } from "../../middlewares/features.middlewares.js";
import { filterPromoOnType } from "../middlewares/promo.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { addPromoValidationSchema, updatePromoValidationSchema } from "../../validations/promo/promo.validations.js";

const promoRouter=Router();

// get all
promoRouter.get("/",authentication,filterPromoOnType(),paginationMiddleware("promoModel"),getAllPromos);

// add new promo
promoRouter.post("/",authentication,validate(addPromoValidationSchema),addNewPromo);

// delete all
promoRouter.delete("/",authentication,deleteAllPromos);

// delete one
promoRouter.delete("/:id",authentication,deletePromo);

// update
promoRouter.put("/:id",authentication,validate(updatePromoValidationSchema),updatePromo);

export default promoRouter;