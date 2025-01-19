import {Router} from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { paginationMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { addRatingValidationSchema, updateRatingValidationSchema } from "../../validations/rating/rating.validations.js";
import { addNewRating, deleteAllrating, deleteRating, getAllRatings, updateRating } from "../controllers/rating.controllers.js";

const ratingRouter=Router();

// get all
ratingRouter.get("/",authentication,authorization(["owner","manager","staff","vip","user"]),paginationMiddleware("ratingModel"),getAllRatings);

// add new promo
ratingRouter.post("/",authentication,authorization(["owner","manager"]),validate(addRatingValidationSchema),addNewRating);

// delete all
ratingRouter.delete("/",authentication,authorization(["owner","manager"]),deleteAllrating);

// delete one
ratingRouter.delete("/:id",authentication,authorization(["owner","manager"]),deleteRating);

// update
ratingRouter.put("/:id",authentication,authorization(["owner","manager"]),validate(updateRatingValidationSchema),updateRating);

export default ratingRouter;