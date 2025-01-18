import {Router} from "express";
import { checkUserExistence } from "../middlewares/auth.middlwares.js";
import { login, logout, signup, validateOtp } from "../auth/auth.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { signupValidationSchema } from "../../validations/auth/auth.validations.js";
import GoogleOauthRouter from "./oauth.routes.js";
import { otpWhatsApp } from "../controllers/whatsapp.controllers.js";

const authRouter=Router();

authRouter.post("/signup",validate(signupValidationSchema),checkUserExistence("signup"),signup);
authRouter.post("/login",validate(signupValidationSchema),checkUserExistence("login"),login);
authRouter.post("/logout",logout)
authRouter.post("/otp",otpWhatsApp);
authRouter.post("/validate-otp",validateOtp);


authRouter.use("/",GoogleOauthRouter);
export default authRouter;