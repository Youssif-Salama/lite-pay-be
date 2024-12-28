import passport from "passport";
import passportIntegrationWithGoogle from "./google.config.js";

// login with google controller
export const loginWithGoogle = (req, res, next) => {
  const {lang}=req.query;
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    state:JSON.stringify({lang})
  })(req, res, next);
};


// on login success (callback)
export const callBackGoogleLogin = (req, res, next) => {
  const user = req.user;

  const state = JSON.parse(req.query.state || '{}');
  const lang = state.lang || 'en';

  if (!user) {
    return res.status(400).json({ message: "Authentication failed." });
  }
  else{
    req.data={
      email:user.profile._json.email,
      name:user.profile._json.name,
      googleId:user.profile.id,
      accessToken:user.profile._json.accessToken,
      lang
    }
    next();
  }
};