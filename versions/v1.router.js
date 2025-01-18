import {Router} from "express";
import authRouter from "../src/modules/routes/auth.routes.js";
import rolesRouter from "../src/modules/routes/roles.routes.js";
import userRouter from "../src/modules/routes/user.routes.js";
import requestRouter from "../src/modules/routes/request.routes.js";
import bankCardsRouter from "../src/modules/routes/bank.card.routes.js";
import cardRouter from "../src/modules/routes/card.routes.js";
import promoRouter from "../src/modules/routes/promo.routes.js";
import cardPricRouter from "../src/modules/routes/card.price.routes.js";
import transactionRouter from "../src/modules/routes/transaction.routes.js";
import ratingRouter from "../src/modules/routes/rating.routes.js";
import logRoutes from "../src/modules/routes/logs.routes.js";

const v1Router = Router();

v1Router.use("/auth",authRouter);
v1Router.use("/roles",rolesRouter);
v1Router.use("/users",userRouter);
v1Router.use("/requests",requestRouter);
v1Router.use("/cards",cardRouter);
v1Router.use("/promos",promoRouter);
v1Router.use("/bank",bankCardsRouter);
v1Router.use("/card-price",cardPricRouter);
v1Router.use("/transactions",transactionRouter);
v1Router.use("/ratings",ratingRouter);
v1Router.use("/logs",logRoutes);

export default v1Router;