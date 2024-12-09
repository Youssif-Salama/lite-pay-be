import {Router} from "express";
import { checkRoleExistance } from "../middlewares/roles.middlewares.js";
import { addNewRole, getAllRoles, getOneRole, updateRole } from "../controllers/roles.controllers.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createRoleValidationSchema, updateRoleValidationSchema } from "../../validations/role/role.validations.js";
import { paginationMiddleware, populateMiddleware, selectMiddleware } from "../../middlewares/features.middlewares.js";
import { roleModel, userModel } from "../../../db/dbConnection.js";
import { authentication } from "../../middlewares/auth.middlewares.js";

const rolesRouter=Router();

// create
rolesRouter.post("/",authentication,checkRoleExistance("create"),validate(createRoleValidationSchema),addNewRole);

// update
rolesRouter.put("/:id",authentication,checkRoleExistance("update"),validate(updateRoleValidationSchema),updateRole);

// get by pk
rolesRouter.get("/:id",authentication,selectMiddleware(),populateMiddleware('[{"model": "User", "attributes": ["id", "name"]}]',userModel,"users"),getOneRole);

// get all
rolesRouter.get("/",authentication,paginationMiddleware(roleModel),selectMiddleware(),populateMiddleware('[{"model": "User", "attributes": ["id", "name"]}]',userModel,"users"),getAllRoles);


export default rolesRouter