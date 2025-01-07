/**
 * Returns a new Date object with the year incremented by the given number.
 * @param {number} no - The number of years to increment.
 * @returns {Date} - The new Date object.
 */
export const DateService=(no)=>{
  const today=new Date();
  let yearPlusOne=today.getFullYear()+no;
  const year=yearPlusOne.toString().slice(2,4);
  const month=today.toISOString().slice(5,7);


  return month+"/"+year;
}


export const checkDatesEquality=(date1,date2)=>{
  if(date1==date2) return true;
  else return false;
}