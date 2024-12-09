import {Router} from "express";
import authRouter from "../src/modules/routes/auth.routes.js";
import rolesRouter from "../src/modules/routes/roles.routes.js";
import userRouter from "../src/modules/routes/user.routes.js";

const v1Router = Router();

v1Router.use("/auth",authRouter);
v1Router.use("/roles",rolesRouter);
v1Router.use("/users",userRouter);

export default v1Router;