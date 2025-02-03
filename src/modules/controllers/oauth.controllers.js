import { roleModel, userModel } from "../../../db/dbConnection.js";
import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { makeToken } from "../../utils/jwt/jwt.utils.js";

export const addNewGoogleLoggedInUser= ErrorHandlerService(async (req, res) => {
  const { email, name, googleId, accessToken ,lang} = req.data;
  // check if this email has a normal account
  const checkIfEmailUsed = await userModel.findOne({ where: { email }, include: { model: roleModel } });

    // find the user role
    const findUserRole=await roleModel.findOne({type:"user"});
    if(!findUserRole) throw new AppErrorService(400,"failed to find user role");


  if (!checkIfEmailUsed) {
    const signUpNewUser = await userModel.create({
      userName: name,
      email,
      googleId,
      roleId:findUserRole.id
    });

    if (!signUpNewUser)
      throw new AppErrorService(400, "failed to create user");
    const token = makeToken({ user: {...signUpNewUser,Role:findUserRole}, accessToken });
    res.redirect(process.env.Frontend_Link+"/"+lang+"/login?token="+token)
    // res.status(201).json({ message: "signup success", token,lang });
  } else {
    if (checkIfEmailUsed?.googleId) {
      // on found user exist with oauth then login him
      const token = makeToken({ user: checkIfEmailUsed, accessToken });
      res.redirect(process.env.Frontend_Link+"/"+lang+"/login?token="+token)
      // res.status(200).json({ message: "login success", token,lang});
    } else {
      // on found user exist with normal account
      res.json(
        400,
        "user already exist with normal account, please login with normal account"
      );
    }
  }
});