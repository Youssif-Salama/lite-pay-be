import express from "express";
import env from "dotenv";
env.config();
import bootstrap from "./bootstrap.js";
const app=express();
app.use(express.json());

bootstrap(app);