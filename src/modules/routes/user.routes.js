import {Router} from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { addSpecificUserRating, ApplyMyRequestsAndTransactionsPagination, autoRequestsListenerForVipRole, blockUser, changeUserRole, deleteMyAccount, forgotPasswordReq, getAllUsers, getMyRequestsAndTransactions, getOneUserData, resetPasswordDo, unBlockUser, updateMyAccount, updateMyPassword } from "../controllers/user.controllers.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { paginationMiddleware, populateMiddleware, selectMiddleware } from "../../middlewares/features.middlewares.js";
import { roleModel } from "../../../db/dbConnection.js";
import { addUserRatingSchema, changeRoleAutoSchema, changeUserRoleSchema, updateUserValidationSchema } from "../../validations/user/user.validations.js";
import cardRouter from "./card.routes.js";



const userRouter=Router();

// get all users
userRouter.get("/",authentication,paginationMiddleware("userModel"),selectMiddleware(),populateMiddleware('[{"model": "Role", "attributes": ["id", "name","type"]}]',roleModel,"role","one"),getAllUsers);

//delete my account
userRouter.delete("/delete",authentication,deleteMyAccount);

//update my account
userRouter.put("/update",authentication,validate(updateUserValidationSchema),updateMyAccount);

// block user
userRouter.put("/block/:id",authentication,blockUser);

// unblock user
userRouter.put("/unblock/:id",authentication,unBlockUser);

// update my password
userRouter.put("/update-password",authentication,validate(updateUserValidationSchema),updateMyPassword);

// reset password req
userRouter.post("/reset-password-req",forgotPasswordReq);

// reset password do
userRouter.post("/reset-password-do",resetPasswordDo)


// change user role
userRouter.put("/change-role",authentication,validate(changeUserRoleSchema),changeUserRole)

// add user rate
userRouter.post("/rating",authentication,validate(addUserRatingSchema),addSpecificUserRating)

// auto role changer
userRouter.put("/change-role-auto",authentication,autoRequestsListenerForVipRole);

// get all my raquests and transactions
userRouter.post("/req-trans",authentication,getMyRequestsAndTransactions,ApplyMyRequestsAndTransactionsPagination);

// get one user
userRouter.get("/one/:id",authentication,getOneUserData);

// use cards router
userRouter. use("/:id/cards",cardRouter);

export default userRouter;