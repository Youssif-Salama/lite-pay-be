import { userModel } from "../../../db/dbConnection.js";
import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { makeToken } from "../../utils/jwt/jwt.utils.js";

export const addNewGoogleLoggedInUser= ErrorHandlerService(async (req, res) => {
  const { email, name, googleId, accessToken } = req.data;
  // check if this email has a normal account
  const checkIfEmailUsed = await userModel.findOne({ where: { email } });
  if (!checkIfEmailUsed) {
    const signUpNewUser = await userModel.create({
      userName: name,
      email,
      googleId,
    });
    if (!signUpNewUser)
      throw new AppErrorService(400, "failed to create user");
    const token = makeToken({ user: signUpNewUser, accessToken });
    res.status(201).json({ message: "signup success", token });
  } else {
    if (checkIfEmailUsed?.googleId) {
      // on found user exist with oauth then login him
      const token = makeToken({ user: checkIfEmailUsed, accessToken });
      res.status(200).json({ message: "login success", token });
    } else {
      // on found user exist with normal account
      res.json(
        400,
        "user already exist with normal account, please login with normal account"
      );
    }
  }
});
