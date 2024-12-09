import {Router} from "express";
import { checkUserExistence } from "../middlewares/auth.middlwares.js";
import { login, signup } from "../auth/auth.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { signupValidationSchema } from "../../validations/auth/auth.validations.js";
import GoogleOauthRouter from "./oauth.routes.js";

const authRouter=Router();

authRouter.post("/signup",validate(signupValidationSchema),checkUserExistence("signup"),signup);
authRouter.post("/login",validate(signupValidationSchema),checkUserExistence("login"),login);



authRouter.use("/",GoogleOauthRouter);
export default authRouter;