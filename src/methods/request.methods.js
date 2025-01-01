// add balance equation
// buy card and request
// we       x             have amount amountUsd promo
// (amountUsd * rate) +(x*6/100) => totoal amount in egp after rate and tax (y);
// vodafone cash y +(y*1/100);
// instapay y +(y*0/100)

// after adding previous payment gateways => z
// card price => z + (cardPrice * rate)   *card price is a seprate table
// promo code evaluation (*promo caod etable {promo:1234,type:"total",max:"100",percent:"10%"},{promo:1234,type:"card",max:null,percent:"10%"})
// go on


  /**
   * Count the total balance after applying rate, tax, promo codes and card price.
   * @param {object} paymentData - an object containing the payment data:
   * - amountUsd: the amount in USD
   * - method: the payment method (instapay or vodafone)
   * - promo: the promo code object
   * - rate: the rate
   * - cardPrice: the card price
   * - isFirst: a boolean indicating if this is the first request
   * @returns {number} the total balance after applying rate, tax, promo codes and card price
   */
export const countBalance=(paymentData)=>{
  const {amountUsd,method,promo,rate,cardPrice,isFirst,allRatings,userRole}=paymentData;

  // apply rate and tax
  let amountAfterRate=(amountUsd*(rate));
  // apply role type
  let valueAfterTax;
  if(userRole?.roleType=="vip" && userRole?.userRating){
    valueAfterTax=amountAfterRate + (amountAfterRate*(Number(userRole?.userRating)/100));
  }
  else if (userRole?.roleType=="vip" && !userRole?.userRating){
    valueAfterTax=amountAfterRate + (amountAfterRate*(Number(allRatings.vip)/100));
  }
  else{
    valueAfterTax=amountAfterRate + (amountAfterRate*(Number(allRatings.norm)/100));
  }

  let countBalanceWithoutPromo=()=>{
    if(method==="instapay"){
      return (valueAfterTax+(valueAfterTax*(Number(allRatings.instapay)/100)));
    }
    if(method==="vodafone"){
      return (valueAfterTax+(valueAfterTax*(Number(allRatings.vodafone)/100)));
    }
  }

  let valueWithoutCard=countBalanceWithoutPromo();

  let applyCardPrice=()=>{
    if(isFirst){
      let priceAfterCard=(valueWithoutCard+(cardPrice*(rate)));
      return priceAfterCard;
    }
    else{
      return valueWithoutCard;
    }
  }

  let valueBeforePromo=applyCardPrice();


  // find promo code if have
  let ApplyPromo=()=>{
    if(promo){
      if(promo.type==="total"){
        let promoValue=(valueBeforePromo*(Number(promo.percent)/100));
        if(promoValue>promo.max){
          return (valueBeforePromo-promo.max);
        }
        else{
          return (valueBeforePromo-promoValue);
        }
      }
      else{
        let cardPromoValue=(cardPrice*(Number(promo.percent)/100));
        return (valueBeforePromo-cardPromoValue);
      }
    }
    else{
      return valueBeforePromo;
    }
  }

  let lastTotal=ApplyPromo();
  return {amountInUsd:(Math.floor(lastTotal/rate)),amountInEgp:Math.ceil(lastTotal)};
}