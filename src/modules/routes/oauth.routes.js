import { Router } from "express";
import env from "dotenv";
import { callBackGoogleLogin, loginWithGoogle } from "../auth/oauth/google.controllers.js";
import passport from "passport";
import { addNewGoogleLoggedInUser } from "../controllers/oauth.controllers.js";
env.config();

const GoogleOauthRouter = Router();

// login with google
GoogleOauthRouter.get("/google",loginWithGoogle);
GoogleOauthRouter.get("/google/callback",
  passport.authenticate("google",{session: false ,failureRedirect:"/"})
  ,callBackGoogleLogin,addNewGoogleLoggedInUser);

export default GoogleOauthRouter