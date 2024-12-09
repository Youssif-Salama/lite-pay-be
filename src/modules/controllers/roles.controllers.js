import { roleModel } from "../../../db/dbConnection.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";

export const addNewRole=ErrorHandlerService(async(req,res)=>{
  const role = await roleModel.create(req.body);
  if(!role) throw new AppErrorService(400,"failed to create role");
  res.status(201).json({
    message:"role created successfully",
    data:role
  });
})


export const updateRole=ErrorHandlerService(async(req,res)=>{
  const role = await roleModel.update(req.body,{where:{id:req.params.id}});
  if(!role) throw new AppErrorService(400,"failed to update role");
  res.status(201).json({
    message:"role updated successfully",
    data:role
  });
})


export const getOneRole=ErrorHandlerService(async(req,res)=>{
  const role = await roleModel.findByPk(req.params.id,req.dbQuery);
  if(!role) throw new AppErrorService(400,"failed to get role");
  res.status(201).json({
    message:"role fetched successfully",
    data:role
  });
})


export const getAllRoles=ErrorHandlerService(async(req,res)=>{
  const roles = await roleModel.findAll(req.dbQuery);
  if(!roles) throw new AppErrorService(400,"failed to get roles");
  res.status(201).json({
    message:"roles fetched successfully",
    data:roles,
    meta:req.meta
  });
})
