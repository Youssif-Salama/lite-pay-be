import {Router} from "express";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";
import { addSpecificUserRating, ApplyMyRequestsAndTransactionsPagination, autoRequestsListenerForVipRole, blockUser, changeUserRole, deleteMyAccount, forgotPasswordReq, getAllUsers, getMyRequestsAndTransactions, getOneUserData, resetPasswordDo, unBlockUser, updateMyAccount, updateMyPassword } from "../controllers/user.controllers.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { includeMiddleware, paginationMiddleware, populateMiddleware, selectMiddleware } from "../../middlewares/features.middlewares.js";
import { roleModel } from "../../../db/dbConnection.js";
import { addUserRatingSchema, changeRoleAutoSchema, changeUserRoleSchema, updateUserValidationSchema } from "../../validations/user/user.validations.js";
import cardRouter from "./card.routes.js";
import { dateRangeFilterMiddleware } from "../../middlewares/global.middlewares.js";



const userRouter=Router();

// userRouter.get("/",authentication,dateRangeFilterMiddleware,paginationMiddleware("userModel"),selectMiddleware(),populateMiddleware('[{"model": "Role", "attributes": ["id", "name","type"]}]',roleModel,"role","one"),getAllUsers);

// get all users
userRouter.get("/",authentication,authorization(["manager","owner","staff"]),dateRangeFilterMiddleware,paginationMiddleware("userModel"),selectMiddleware(),includeMiddleware([
  {
    model:"roleModel",
    attributes:["type","name","id"]
  },
  {
    model:"cardModel",
  }
]),getAllUsers);


//delete my account
userRouter.delete("/delete",authentication,authorization(["basic","vip"]),deleteMyAccount);

//update my account
userRouter.put("/update",authentication,authorization(["basic","vip","staff","manager","owner"]),validate(updateUserValidationSchema),updateMyAccount);

// block user
userRouter.put("/block/:id",authentication,authorization(["manager","owner"]),blockUser);

// unblock user
userRouter.put("/unblock/:id",authentication,authorization(["manager","owner"]),unBlockUser);

// update my password
userRouter.put("/update-password",authentication,authorization(["basic","vip"]),validate(updateUserValidationSchema),updateMyPassword);

// reset password req
userRouter.post("/reset-password-req",forgotPasswordReq);

// reset password do
userRouter.post("/reset-password-do",resetPasswordDo)


// change user role
userRouter.put("/change-role",authentication,authorization(["manager","owner"]),validate(changeUserRoleSchema),changeUserRole)

// add user rate
userRouter.post("/rating",authentication,authorization(["manager","owner","staff"]),validate(addUserRatingSchema),addSpecificUserRating)

// auto role changer
userRouter.put("/change-role-auto",authentication,authorization(["manager","owner","staff","vip","basic"]),autoRequestsListenerForVipRole);

// get all my raquests and transactions
userRouter.post("/req-trans",authentication,authorization(["basic","vip","staff","manager","owner"]),getMyRequestsAndTransactions,ApplyMyRequestsAndTransactionsPagination);

// get one user
userRouter.get("/one/:id",authentication,authorization(["basic","vip","staff","manager","owner"]),getOneUserData);

// use cards router
userRouter. use("/:id/cards",cardRouter);

export default userRouter;