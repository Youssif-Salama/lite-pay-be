import {Router} from "express";
import { checkRoleExistance } from "../middlewares/roles.middlewares.js";
import { addNewRole, getAllRoles, getOneRole, updateRole } from "../controllers/roles.controllers.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createRoleValidationSchema, updateRoleValidationSchema } from "../../validations/role/role.validations.js";
import { includeMiddleware, paginationMiddleware, selectMiddleware } from "../../middlewares/features.middlewares.js";
import { authentication, authorization } from "../../middlewares/auth.middlewares.js";

const rolesRouter=Router();

// create
rolesRouter.post("/",authentication,authorization([
  "manager",
  "owner",
]),checkRoleExistance("create"),validate(createRoleValidationSchema),addNewRole);

// update
rolesRouter.put("/:id",authentication,authorization([
  "manager",
  "owner",
]),checkRoleExistance("update"),validate(updateRoleValidationSchema),updateRole);

// get by pk
rolesRouter.get("/:id",authentication,authorization([
  "staff",
  "manager",
  "owner",
]),includeMiddleware([
  {
    model:"userModel",
    attributes:["id","email","createdAt"]
  }
]),getOneRole);

// get all
rolesRouter.get("/",authentication,authorization([
  "staff",
  "manager",
  "owner",
]),paginationMiddleware("roleModel"),includeMiddleware([
  {
    model:"userModel",
    attributes:["createdAt","id","email"]
  }
]),getAllRoles);


export default rolesRouter