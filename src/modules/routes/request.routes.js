import {Router} from "express";
import { addNewRequest, getAllRequests, getOneRequest, updateRequestStatus } from "../controllers/request.controllers.js";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { includeMiddleware, paginationMiddleware, searchMiddlware, selectMiddleware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { changeRequestStatusValidationSchema, requestValidationSchema } from "../../validations/request/request.validations.js";
import { requestStatusMiddleware } from "../middlewares/request.middlewares.js";

const requestRouter=Router();

// post request
requestRouter.post("/",authentication,validate(requestValidationSchema),addNewRequest);

// change status
requestRouter.put("/:id",authentication,validate(changeRequestStatusValidationSchema),updateRequestStatus)

// get one request
requestRouter.get("/:id",authentication,selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  },
  {
    model:"cardModel",
  }
]),getOneRequest);

// get all requests
requestRouter.get("/",authentication,sortingMiddleware(),searchMiddlware(["account","nameOnCard","phoneNumber","email","telegram"]),requestStatusMiddleware,paginationMiddleware("requestModel"),selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  },
  {
    model:"cardModel",
  }
]),getAllRequests);

export default requestRouter;