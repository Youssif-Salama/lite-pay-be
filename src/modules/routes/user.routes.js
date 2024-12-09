import {Router} from "express";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { blockUser, deleteMyAccount, forgotPasswordReq, getAllUsers, resetPasswordDo, unBlockUser, updateMyAccount, updateMyPassword } from "../controllers/user.controllers.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { paginationMiddleware, populateMiddleware, selectMiddleware } from "../../middlewares/features.middlewares.js";
import { roleModel, userModel } from "../../../db/dbConnection.js";
import { updateUserValidationSchema } from "../../validations/user/user.validations.js";



const userRouter=Router();

// get all users
userRouter.get("/",authentication,paginationMiddleware(userModel),selectMiddleware(),populateMiddleware('[{"model": "Role", "attributes": ["id", "name","type"]}]',roleModel,"role","one"),getAllUsers);

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

export default userRouter;