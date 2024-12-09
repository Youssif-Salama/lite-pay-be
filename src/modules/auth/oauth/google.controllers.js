import passport from "passport";
import passportIntegrationWithGoogle from "./google.config.js";

// login with google controller
export const loginWithGoogle = (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email']
  })(req, res, next);
};


// on login success (callback)
export const callBackGoogleLogin = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(400).json({ message: "Authentication failed." });
  }
  else{
    req.data={
      email:user.profile._json.email,
      name:user.profile._json.name,
      googleId:user.profile.id,
      accessToken:user.profile._json.accessToken
    }
    next();
  }
};