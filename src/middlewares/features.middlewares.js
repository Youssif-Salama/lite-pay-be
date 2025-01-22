import { Op, Sequelize, where } from 'sequelize';
import { allModels as models } from '../../db/dbConnection.js';
import { AppErrorService, ErrorHandlerService } from '../services/ErrorHandler.services.js';
/**
 * @description
 * A middleware to handle pagination. It takes a Sequelize model as an argument.
 * It expects the page and limit to be provided as query parameters.
 * It sets the `dbQuery` property of the request with the offset and limit.
 * It also sets the `meta` property of the request with the meta information about the pagination.
 * @param {Model} model - The Sequelize model.
 * @returns {import('express').RequestHandler} - The middleware function.
 */
export const paginationMiddleware = (model) => {
  return ErrorHandlerService(async (req, res, next) => {
    const { pageNo, limitNo } = req.query;
    const page = pageNo ? parseInt(pageNo, 10) : 1;
    const limit = limitNo ? parseInt(limitNo, 10) : 10;

    if (page <= 0 || limit <= 0) {
      return next(new AppErrorService(400, 'Page and limit must be positive integers.'));
    }

    const offset = (page - 1) * limit;

    try {
      let totalRows;
      if(req.dbQuery){
        totalRows= await models[model].count({
          where: req.dbQuery.where || {},
          include: req.dbQuery.include
        })
      }
      else{
        totalRows= await models[model].count()
      }
      const totalPages = Math.ceil(totalRows / limit);

      const meta = {
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalRows,
        page,
        limit,
        totalPages,
      };

      req.meta = meta;

      req.dbQuery = {
        ...req.dbQuery,
        offset,
        limit,
      };

      next();
    } catch (error) {
      next(error);
    }
  });
};


  /**
   * Middleware to handle selecting only certain fields from the database.
   * @param {object} req.query - The query object from the Express request.
   * @param {string} req.query.selectors - A JSON string containing an array of field names to select.
   * @param {object} req.dbQuery - The database query object.
   * @param {object} req.dbQuery.attributes - The fields to select from the database.
   */
export const selectMiddleware=()=>ErrorHandlerService(async(req,res,next)=>{
  try{
    const {usePopulate}=req.query;
    if(usePopulate) return next();
    const {selectors}=req.query;
  if(!selectors || selectors.length===0) return next();
  const selectFields=JSON.parse(selectors);
  req.dbQuery={
    ...req.dbQuery,
    attributes:selectFields
  }
  next();
  }
  catch(error){
    next(error);
  }
})




export const populateMiddleware = (populate,model,alias) => ErrorHandlerService(async (req, res, next) => {
  try {
    const {selectors} = req.query;
    const selectFields=selectors && JSON.parse(selectors);
    const { usePopulate } = req.query;
    if(!usePopulate) return next();
    if (!populate || populate.length === 0) return next();

    const populateFields = JSON.parse(populate);

    req.dbQuery = {
      ...req.dbQuery,
      include: populateFields.map(field => {
          return {
            model,
            as:alias && alias,
            attributes: selectFields
          };
      })
    };

    next();
  } catch (error) {
    next(error);
  }
});


export const includeMiddleware = (includes) =>
  ErrorHandlerService(async (req, res, next) => {
    req.dbQuery ={
      ...req.dbQuery,
      include:
        includes.map((item) => ({
          model: models[item.model],
          attributes: item.attributes || undefined,
          as: item.alias || undefined,
        }))
    }
    next();
  });


  export const searchMiddlware=(searchKeys)=>ErrorHandlerService(async(req,res,next)=>{
    const {searchWord}=req.query;
    if(!searchWord) return next();
    const searchCriteria = searchKeys.map((key) => {
      return Sequelize.where(
        Sequelize.cast(Sequelize.col(key), 'TEXT'),
        { [Op.iLike]: `%${searchWord}%` }
      );
    });

    req.dbQuery={
      ...req.dbQuery,
      where:{
        ...(req.dbQuery.where || {}),
        [Op.or]:searchCriteria
      }
    }
    next();
  })


  export const dateRangeFilterMiddleware=()=>ErrorHandlerService(async(req,res,next)=>{
    const {startDate,endDate}=req.query;
    if(!startDate || !endDate) return next();
    const startDateObj=new Date(startDate);
    const endDateObj=new Date(endDate);
    req.dbQuery={
      ...req.dbQuery,
      where:{
        ...(req.dbQuery.where || {}),
        createdAt:{
          [Op.between]:[startDateObj,endDateObj]
        }
      }
    }
    next();
  })

  export const sortingMiddleware=()=>ErrorHandlerService(async(req,res,next)=>{
    const {sortKey,sortValue}=req.query;
    if(!sortKey || !sortValue) return next();
    else{
      req.dbQuery={
        ...req.dbQuery,
        order:[[sortKey,sortValue]]
      }
      next();
    }
  })