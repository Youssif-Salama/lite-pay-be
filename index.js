import express from "express";
import env from "dotenv";
env.config();
import bootstrap from "./bootstrap.js";
import { startPolling } from "./src/methods/transaction.methods.js";
import { addNewTransaction } from "./src/modules/controllers/transactions.controllers.js";

const app = express();
app.use(express.json());

// Start transaction polling
startPolling((data) =>
  addNewTransaction(data)(null, {
    status: (code) => ({
      json: (response) => console.log("Response:", code, response),
    }),
  })
);

bootstrap(app);
