import {Router} from "express";
import { addNewRequest, deleteSpecificUserRequests, getAllRequests, getMyRequests, getOneRequest, getSpecificUserRequests, updateRequestStatus } from "../controllers/request.controllers.js";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { includeMiddleware, paginationMiddleware, searchMiddlware, selectMiddleware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { changeRequestStatusValidationSchema } from "../../validations/request/request.validations.js";
import { filterReqOnType, requestStatusMiddleware } from "../middlewares/request.middlewares.js";
import { dateRangeFilterMiddleware, situationFilterMiddleware } from "../../middlewares/global.middlewares.js";

const requestRouter=Router({mergeParams:true});

// post request
requestRouter.post("/",authentication,addNewRequest);


// get my requests
requestRouter.get("/mine",authentication,authorization(["user","vip","staff","manager","owner"]),searchMiddlware(["account","nameOnCard","phoneNumber","email","telegram"]),requestStatusMiddleware,filterReqOnType,sortingMiddleware(),paginationMiddleware("requestModel"),getMyRequests);


// get all requests
requestRouter.get("/",authentication,authorization(["manager","owner","staff"]),filterReqOnType,situationFilterMiddleware(["status","method"]),dateRangeFilterMiddleware,sortingMiddleware(),searchMiddlware(["account","nameOnCard","phoneNumber","email","telegram"]),paginationMiddleware("requestModel"),selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  },
  {
    model:"cardModel",
  }
]),getAllRequests);



// get user requests
requestRouter.get("/specific",authentication,authorization(["manager","owner","staff"]),filterReqOnType,situationFilterMiddleware(["status","method"]),dateRangeFilterMiddleware,sortingMiddleware(),searchMiddlware(["account","nameOnCard","phoneNumber","email","telegram"]),paginationMiddleware("requestModel"),selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  },
  {
    model:"cardModel",
  }
]),getSpecificUserRequests);

// delete user requests
requestRouter.delete("/specific",authentication,authorization(["manager","owner","staff"]),deleteSpecificUserRequests);

// get one request
requestRouter.get("/:id",authentication,authorization(["manager","owner","staff"]),selectMiddleware(),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id"]
  },
  {
    model:"cardModel",
  }
]),getOneRequest);

// change status
requestRouter.put("/:id",authentication,authorization(["manager","owner","staff"]),validate(changeRequestStatusValidationSchema),updateRequestStatus)


export default requestRouter;