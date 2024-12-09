/**
 * A higher-order function that wraps an asynchronous function and catches any errors.
 * @param {Function} fn - The asynchronous function to be wrapped.
 * @returns {Function} - An Express middleware function that handles errors.
 */
const ErrorHandlerService=(fn)=>{
  return(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
}

class AppErrorService extends Error{
  /**
   * Constructs an instance of AppErrorService.
   * @param {number} statusCode - The HTTP status code associated with the error.
   * @param {string} message - The error message.
   */
  constructor(statusCode,message){
    super(message);
    this.statusCode=statusCode;
  }
}


export {ErrorHandlerService,AppErrorService}