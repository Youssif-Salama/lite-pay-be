import { AppErrorService, ErrorHandlerService } from "../services/ErrorHandler.services.js";

/**
 * @param {*} success - Object to structure the successful response.
 * @param {*} fail - Object to structure the failure response.
 * @returns {Function} - Express middleware function.
 */
export const execute = (success, fail) => {
  return ErrorHandlerService(async (req, res, next) => {
    const method = req.method;
    let response;
    try {
      if (method === "POST") {
        response = await req.dbQuery();
      } else {
        response = await req.dbQuery();
      }

      // إذا لم يكن هناك استجابة، نرفع خطأ
      if (!response) {
        return next(new AppErrorService(fail?.status || 500, fail?.result));
      }

      // إعداد البيانات للاستجابة
      success.result.data = response;
      success.result.meta = res.pagination;

      if (res.contracts && res.contracts.length > 0) {
        success.result.contracts = res.contracts;
      }

      // إرسال الاستجابة بنجاح
      return res.status(success?.status || 200).json(success.result);
    } catch (error) {
      // استخدام next(error) بدلاً من throw
      return next(error);
    }
  });
};
