import { Router } from "express";
import syncDb from "../db/sync.db.js";

const dbRouter=Router();

// sync database
dbRouter.post("/sync",syncDb)

export default dbRouter;