import { cardPriceModel, promoModel, ratingModel, requestModel, roleModel, userModel } from "../../../db/dbConnection.js";
import { countBalance } from "../../methods/request.methods.js";
import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";
import { decodeToken } from "../../utils/jwt/jwt.utils.js";


// handle request
export const addNewRequest = ErrorHandlerService(async (req, res) => {
  // get user id from decodedToken (stored in request)
  const { id: userId } = req.user;
  req.body.userId = userId;

  // const get all userData
  let findUser = await userModel.findByPk(userId);
  if (!findUser) throw new AppErrorService(400, "User not found");


  // if user first request
  const {nameOnCard,phoneNumber,telegram,gender,age,amount,amountUsd,method,rate,promo,cardId,attachments}=req.body;
  const [
    getPromos,
    cardPriceActive,
    getNormRating,
    getInstapayRating,
    getVodafoneRating,
    getVipRating,
    findRole,
  ] = await Promise.all([
    promo && promoModel.findOne({ where: { promo } }),
    cardPriceModel.findOne({ where: { isActive: true } }),
    ratingModel.findOne({ where: { title: "norm" } }),
    ratingModel.findOne({ where: { title: "instapay" } }),
    ratingModel.findOne({ where: { title: "vodafone" } }),
    ratingModel.findOne({ where: { title: "vip" } }),
    roleModel.findOne({ where: { id: findUser.roleId } }),
  ]);

  // You can now use the variables: getPromos, cardPriceActive, getNormRating, etc.


  if(findUser?.requests?.length==0 || !findUser?.requests){
      // check if the user already has a request with the same phone number
  const findRequest = await requestModel.findOne({
    where: {
      phoneNumber
    },
  })
  if(findRequest) throw new AppErrorService(400,"user already has a request with the same phone number");
      // catch otp
  const{otp,otpToken}=req.body;
  if(!otp || !otpToken) throw new AppErrorService(400,"otp or otpToken not found");
  const decodedOtpToken=decodeToken(otpToken);

  if(otp!==decodedOtpToken.otp){
    throw new AppErrorService(400,"invalid otp");
  }
      // make request for the first time (after send me token of otp+user and otp itself).
      // absolutely first time is for basic account (so i'll perform some math functions and equations here).
      const {amountInUsd,amountInEgp}=countBalance({
        amountUsd,
        method,
        promo:getPromos? getPromos : null,
        rate,
        cardPrice:cardPriceActive?.cardPrice,
        isFirst:true,
        allRatings:{
          norm:getNormRating?.value,
          instapay:getInstapayRating?.value,
          vodafone:getVodafoneRating?.value,
          vip:getVipRating?.value
        },
        userRole:{userRating:findUser?.rating,roletype:findRole?.type}
      })
      const newRequestWithoutCharge=await requestModel.create({
        nameOnCard,
        phoneNumber,
        telegram,
        type:"card",
        method,
        userId,
        status:"pending",
        amountUsd,
        amount,
        rate,
cardId ,
        attachments})


      if(!newRequestWithoutCharge) throw new AppErrorService(404,"failed to add new request");
      findUser.age = age;
      findUser.gender = gender;
      findUser.phoneNumber = phoneNumber;
      findUser.name = nameOnCard;
      findUser.telegram = telegram;
      findUser.requests = [...(findUser?.requests || []), newRequestWithoutCharge.id];

      await findUser.save();
      res.status(201).json({
        message:"request created successfully",
        data:newRequestWithoutCharge
      })
  }
  else{
    // pls check this part
    const lastUserRequestId=findUser?.requests?.[findUser?.requests?.length-1];
    const getRequest=await requestModel.findByPk(lastUserRequestId);

    if(!getRequest) throw new AppErrorService(404,"failed to get user last request");
    const {amountInUsd,amountInEgp}=countBalance({
      amountUsd,
      method,
      promo:getPromos,
      rate,
      cardPrice:cardPriceActive?.cardPrice,
      isFirst:false,
      allRatings:{
        norm:getNormRating?.value,
        instapay:getInstapayRating?.value,
        vodafone:getVodafoneRating?.value,
        vip:getVipRating?.value
      },
      userRole:{userRating:findUser?.rating,roletype:findRole?.type}
    })
    const makeRequestNotForTheFirstTime=await requestModel.create({
      nameOnCard:getRequest?.nameOnCard,
        phoneNumber:getRequest?.phoneNumber,
        telegram:getRequest?.telegram,
        type:"recharge",
        method,
        userId,
        status:"pending",
        amountUsd,
        amount,
        rate,
        cardId,
        attachments
    })
    if(!makeRequestNotForTheFirstTime) throw new AppErrorService(404,"failed to add new request");
    res.status(201).json({
      message:"request created successfully",
      data:makeRequestNotForTheFirstTime
    })
  }

});



// change status
export const updateRequestStatus=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const updateRequest=await requestModel.update({status:req.body.status},{
    where:{id}
  });
  if(!updateRequest || updateRequest[0]==0) throw new AppErrorService(400,"failed to update request");
  res.status(200).json({
    message:`request status updated successfully to ${req.body.status}`,
    data:updateRequest
  })
})

// get one request by pk (id)
export const getOneRequest=ErrorHandlerService(async(req,res)=>{
  const {id}=req.params;
  const findRequest=await requestModel.findAll({
    where:{id}
  });
  if(!findRequest) throw new AppErrorService(400,"failed to get request");
  res.status(200).json({
    message:"success",
    data:findRequest
  })
})

// get all request paginated
export const getAllRequests=ErrorHandlerService(async(req,res)=>{

  const findAll=await requestModel.findAll({
    ...req.dbQuery
  });
  if(!findAll) throw new AppErrorService(400,"failed to fetch all requests");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})

// get myRequest
export const getMyRequests=ErrorHandlerService(async(req,res)=>{
  const getUserAllRequets=await requestModel.findAll(req.dbQuery);
  if(!getUserAllRequets) throw new AppErrorService(400,"failed to fetch all requests");
  res.status(200).json({
    message:"success",
    data:getUserAllRequets,
    meta:req.meta
  })
})


// get user requests
export const getSpecificUserRequests=ErrorHandlerService(async(req,res)=>{
  const findAll=await requestModel.findAll(req.dbQuery);
  if(!findAll) throw new AppErrorService(400,"failed to fetch all requests");
  res.status(200).json({
    message:"success",
    data:findAll,
    meta:req.meta
  })
})

// delete user request
export const deleteSpecificUserRequests=ErrorHandlerService(async(req,res)=>{
  const {id:userId}=req.params;
  const deleteRequests=await requestModel.destroy({where:{userId}});
  if(!deleteRequests && deleteRequests!==0) throw new AppErrorService(400,"failed to delete requests");
  res.status(200).json({
    message:"requests deleted successfully"
  })
})