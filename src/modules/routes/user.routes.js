import {Router} from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { addSpecificUserRating, ApplyMyRequestsAndTransactionsPagination, autoRequestsListenerForVipRole, blockUser, changeUserRole, deleteMyAccount, deleteOneUser, forgotPasswordReq, getAllUsers, getMyRequestsAndTransactions, getOneUserData, resetPasswordDo, unBlockUser, updateMyAccount, updateMyPassword, updateOneUserRating } from "../controllers/user.controllers.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { includeMiddleware, paginationMiddleware, populateMiddleware, searchMiddlware, selectMiddleware } from "../../middlewares/features.middlewares.js";
import { roleModel } from "../../../db/dbConnection.js";
import { addUserRatingSchema, changeRoleAutoSchema, changeUserRoleSchema, updateUserValidationSchema } from "../../validations/user/user.validations.js";
import cardRouter from "./card.routes.js";
import { dateRangeFilterMiddleware } from "../../middlewares/global.middlewares.js";
import requestRouter from "./request.routes.js";
import transactionRouter from "./transaction.routes.js";



const userRouter=Router();

// userRouter.get("/",authentication,dateRangeFilterMiddleware,paginationMiddleware("userModel"),selectMiddleware(),populateMiddleware('[{"model": "Role", "attributes": ["id", "name","type"]}]',roleModel,"role","one"),getAllUsers);

// get all users
userRouter.get("/",authentication,authorization(["manager","owner","staff"]),dateRangeFilterMiddleware,selectMiddleware(),searchMiddlware(["email","name","phoneNumber","telegram"]),includeMiddleware([
  {
    model:"roleModel",
    attributes:["type","name","id"]
  },
  {
    model:"cardModel",
  }
]),paginationMiddleware("userModel"),getAllUsers);


//delete my account
userRouter.delete("/delete",authentication,authorization(["user","vip"]),deleteMyAccount);

//update my account
userRouter.put("/update",authentication,authorization(["user","vip","staff","manager","owner"]),validate(updateUserValidationSchema),updateMyAccount);

// change user rating
userRouter.put("/rating/:id",authentication,authorization(["manager","owner","staff"]),updateOneUserRating);

// block user
userRouter.put("/block/:id",authentication,authorization(["manager","owner"]),blockUser);

// unblock user
userRouter.put("/unblock/:id",authentication,authorization(["manager","owner"]),unBlockUser);

// update my password
userRouter.put("/update-password",authentication,authorization(["user","vip"]),validate(updateUserValidationSchema),updateMyPassword);

// reset password req
userRouter.post("/reset-password-req",forgotPasswordReq);

// reset password do
userRouter.post("/reset-password-do",resetPasswordDo)


// change user role
userRouter.put("/change-role",authentication,authorization(["manager","owner"]),validate(changeUserRoleSchema),changeUserRole)

// add user rate
userRouter.post("/rating",authentication,authorization(["manager","owner","staff"]),validate(addUserRatingSchema),addSpecificUserRating)

// auto role changer
userRouter.put("/change-role-auto",authentication,authorization(["manager","owner","staff","vip","user"]),autoRequestsListenerForVipRole);

// get all my raquests and transactions
userRouter.post("/req-trans",authentication,authorization(["user","vip","staff","manager","owner"]),getMyRequestsAndTransactions,ApplyMyRequestsAndTransactionsPagination);

// get one user
userRouter.get("/one/:id",authentication,authorization(["user","vip","staff","manager","owner"]),getOneUserData);

// delete one user
userRouter.delete("/:id",authentication,authorization(["manager","owner"]),deleteOneUser);

// use cards router
userRouter. use("/:id/cards",cardRouter);

// user requests router
userRouter.use("/:id/requests",requestRouter);

// user transactions router
userRouter.use("/:id/transactions",transactionRouter);

export default userRouter;