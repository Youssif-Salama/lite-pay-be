import {Router} from "express";
import { addNewRequest, deleteSpecificUserRequests, getAllRequests, getMyRequests, getOneRequest, getSpecificUserRequests, updateRequestStatus } from "../controllers/request.controllers.js";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { dateRangeFilterMiddleware, includeMiddleware, paginationMiddleware, searchMiddlware, selectMiddleware, sortingMiddleware } from "../../middlewares/features.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { changeRequestStatusValidationSchema } from "../../validations/request/request.validations.js";
import { displayRequestUserRole, filterReqOnType, filterReqOnUser, requestMethodMiddleware, requestStatusMiddleware } from "../middlewares/request.middlewares.js";
import {  situationFilterMiddleware } from "../../middlewares/global.middlewares.js";
import { specificUserMiddleware } from "../middlewares/card.middlewares.js";

const requestRouter=Router({mergeParams:true});

// post request
requestRouter.post("/",authentication,addNewRequest);


// get my requests
requestRouter.get("/mine",authentication,authorization(["user","vip","staff","manager","owner"]),sortingMiddleware(),filterReqOnUser,requestStatusMiddleware,filterReqOnType,requestMethodMiddleware,dateRangeFilterMiddleware(),searchMiddlware(["account","nameOnCard","amount"]),includeMiddleware([
  {
    model:"cardModel"
  }
]),paginationMiddleware("requestModel"),getMyRequests);


// get all requests
requestRouter.get("/",authentication,authorization(["manager","owner","staff"]),sortingMiddleware(),requestStatusMiddleware,filterReqOnType,requestMethodMiddleware,dateRangeFilterMiddleware(),searchMiddlware(["account","nameOnCard","amount"]),includeMiddleware([
  {
    model:"cardModel",
  },
  {
    model:"userModel",
    attributes:["email","id","telegram","username","status"]
  }
]),displayRequestUserRole,paginationMiddleware("requestModel"),getAllRequests);


// get user requests
requestRouter.get("/specific",authentication,authorization(["manager","owner","staff"]),sortingMiddleware(),searchMiddlware(["account","nameOnCard","amount"]),dateRangeFilterMiddleware(),situationFilterMiddleware(["status","method"]),includeMiddleware([
  {
    model:"userModel",
    attributes:["email","id","telegram","username","status"]
  },
  {
    model:"cardModel",
  }
]),specificUserMiddleware,displayRequestUserRole,paginationMiddleware("requestModel"),getSpecificUserRequests);

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