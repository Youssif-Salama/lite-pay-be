
/**
 * Middleware to filter promos based on promoType query string.
 * If promoType is present in query string, it filters the promos by that type.
 * If promoType is not present, it simply calls next().
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Next middleware function.
 */
export const filterPromoOnType=()=>async(req,res,next)=>{
  const {promoType}=req.query;
  if(!promoType) return next();
  req.dbQuery={
    ...req.dbQuery,
    where:{type:promoType}
  }
  next();
}