import {Router} from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { paginationMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { addRatingValidationSchema, updateRatingValidationSchema } from "../../validations/rating/rating.validations.js";
import { addNewRating, deleteAllrating, deleteRating, getAllRatings, updateRating } from "../controllers/rating.controllers.js";

const ratingRouter=Router();

// get all
ratingRouter.get("/",authentication,paginationMiddleware("ratingModel"),getAllRatings);

// add new promo
ratingRouter.post("/",authentication,validate(addRatingValidationSchema),addNewRating);

// delete all
ratingRouter.delete("/",authentication,deleteAllrating);

// delete one
ratingRouter.delete("/:id",authentication,deleteRating);

// update
ratingRouter.put("/:id",authentication,validate(updateRatingValidationSchema),updateRating);

export default ratingRouter;