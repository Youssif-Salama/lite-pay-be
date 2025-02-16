import express from "express";
import env from "dotenv";
env.config();
import bootstrap from "./bootstrap.js";
import { startPolling } from "./src/methods/transaction.methods.js";
import { addNewTransaction } from "./src/modules/controllers/transactions.controllers.js";
// import { handleLogsMiddleware } from "./src/middlewares/global.middlewares.js";
import fs from "fs";

const app = express();
app.use(express.json());
// apply logs
// handleLogsMiddleware(app);


// Start transaction polling
startPolling((data) =>
  addNewTransaction(data)(null, {
    status: (code) => ({
      json: (response) => console.log("Response:", code, response),
    }),
  })
);

bootstrap(app);