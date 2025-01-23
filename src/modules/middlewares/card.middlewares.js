import { Op, Sequelize } from "sequelize";
import { ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";
import { roleModel, userModel } from "../../../db/dbConnection.js";

// if req.query.status retrun
export const cardStatusMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {status}=req.query;
  if(!status) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{"status":status,
      ...req.dbQuery.where
    }
  }
  next();
})

export const cardOwnerPlanMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {role}=req.query;
  req.dbQuery={
    ...req.dbQuery,
    include:[{
      model:userModel,
      include:[{
        model:roleModel,
        where:{type:role}
      }]
    }]
  }
  next();
})


// specificUser middleware
export const specificUserMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const {userId}=req.query;
  if(!userId) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{userId,...req.dbQuery.where}
  }
  next();
})


export const cardSearchCriteria = ErrorHandlerService(async (req, res, next) => {
  const { searchWord } = req.query;
  if (!searchWord) return next();

  req.dbQuery = {
    ...req.dbQuery,
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchWord}%` } },
        Sequelize.where(
          Sequelize.cast(Sequelize.col('cardNumber'), 'TEXT'),
          { [Op.iLike]: `%${searchWord}%` }
        ),
        Sequelize.where(
          Sequelize.cast(Sequelize.col('cvv'), 'TEXT'),
          { [Op.iLike]: `%${searchWord}%` }
        ),
        Sequelize.where(
          Sequelize.cast(Sequelize.col('expiryDate'), 'TEXT'),
          { [Op.iLike]: `%${searchWord}%` }
        ),
        Sequelize.where(
          Sequelize.cast(Sequelize.col('balance'), 'TEXT'),
          { [Op.iLike]: `%${searchWord}%` }
        ),
      ],
    },
  };

  next();
});


export const userCardsFilterMiddleware=ErrorHandlerService(async(req,res,next)=>{
  const token=req.headers.token;
  const decodedToken=decodeToken(token);
  const userId=decodedToken.user.id;
  req.dbQuery={
    ...req.dbQuery,
    where:{userId,...(req.dbQuery.where || {})}
  }
  next();
})


export const requestsOnCardFilterMiddleware = ErrorHandlerService(async (req, res, next) => {
  const { id } = req.params;

  if (!req.dbQuery) {
    req.dbQuery = {};
  }

  req.dbQuery.where = {
    cardId: id,
    ...(req.dbQuery.where || {})
  };

  next();
});
