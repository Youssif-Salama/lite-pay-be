import { cardModel, transactionModel } from "../../db/dbConnection.js";
import { fetchFromBankApi } from "../modules/controllers/bank.card.controllers.js";
import fetchBrandData from "../services/Avatar.services.js";
import { AppErrorService, ErrorHandlerService } from "../services/ErrorHandler.services.js";
import Queue from 'bull';
import env from "dotenv";
env.config();


export const displayBankTransactionsInterval = (callback) => {
  let pollingInterval = 10000;
  const maxInterval = 20000;
  let intervalId;

  const path = "/transactions";
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1);
  const url = `${modifiedUrl}/${process.env.Bank_Id}${path}`;

  const pollTransactions = async () => {
    try {
      const data = await fetchFromBankApi(url);
      const transactions = data?.transactions;

      const existingTransactions = await transactionModel.findAll({
        attributes: ["transactionId"],
      });
      const existingTransactionIds = existingTransactions.map(
        (tx) => tx.transactionId
      );

      // تصفية البيانات لعدم تكرارها بناءً على المعاملات المخزنة في قاعدة البيانات
      const filteredData = transactions
        .filter((item) => item)
        .filter((item) => !existingTransactionIds.includes(item?.id));

      const cards = await cardModel.findAll();

      if (filteredData.length > 0) {
        // تجهيز البيانات الجديدة
        const arrangedData = await Promise.all(
          filteredData.map(async (item) => {
            const avatar = await fetchBrandData(item?.counterpartyName);

            let amount = item?.amount;
            if (item?.relatedTransactions?.amount) {
              amount += item?.relatedTransactions?.amount;
            }

            let itemStatus = "approved";
            if (item?.status === "sent") itemStatus = "approved";
            if (item?.status === "failed") itemStatus = "rejected";

            // إذا كانت المعاملة تحتوي على details (معلومات البطاقة)
            if (item?.details?.debitCardInfo) {
              return {
                amount: amount,
                transactionId: item?.id,
                companyName: item?.counterpartyName,
                avatar: avatar,
                date: item?.estimatedDeliveryDate,
                time: item?.postedAt,
                failureReason: item?.reasonForFailure,
                category: item?.mercuryCategory,
                bankCardId: item?.details?.debitCardInfo?.id,
                details: JSON.stringify({
                  details: item,
                  relatedTransactions: item?.relatedTransactions,
                  bankDescription: item?.bankDescription,
                }),
                cardId: cards.find((card) => card.bankId === item?.details?.debitCardInfo?.id)?.id,
                status: itemStatus,
                bankCreatedAt: item?.createdAt,
              };
            } else {
              // إذا كانت المعاملة لا تحتوي على details
              return {
                amount: amount,
                transactionId: item?.id,
                companyName: item?.counterpartyName,
                avatar: avatar,
                date: item?.estimatedDeliveryDate,
                time: item?.postedAt,
                failureReason: item?.reasonForFailure,
                category: item?.mercuryCategory,
                bankCardId: null,  // لا توجد تفاصيل بطاقة
                details: JSON.stringify({
                  details: item,
                  relatedTransactions: item?.relatedTransactions,
                  bankDescription: item?.bankDescription,
                }),
                cardId: null,  // لا توجد بطاقة مرتبطة
                status: itemStatus,
                bankCreatedAt: item?.createdAt,
              };
            }
          })
        );

        // إضافة البيانات الجديدة
        if (typeof callback === "function") {
          await callback(arrangedData);
          console.log(`تم إضافة ${arrangedData.length} عنصرًا جديدًا.`);
        }
      }

      // إعادة تعيين وقت التكرار إلى 10 ثواني
      pollingInterval = 10000;
    } catch (error) {
      // في حالة حدوث خطأ، قم بزيادة وقت الانتظار حتى الوصول إلى الحد الأقصى
      pollingInterval = Math.min(maxInterval, pollingInterval * 2);
    }
    finally {
      // تحديث فقط المعاملات التي تم العثور لها على بطاقة
      setTimeout(async () => {
        const transactionsWithoutCard = await transactionModel.findAll({
          where: { cardId: null },
          attributes: ["transactionId", "bankCardId"],
        });

        if (transactionsWithoutCard.length > 0) {
          const cards = await cardModel.findAll();

          const transactionsToUpdate = transactionsWithoutCard
            .map((transaction) => {
              const matchedCard = cards.find((card) => card.bankId === transaction.bankCardId);
              return matchedCard ? { transactionId: transaction.transactionId, cardId: matchedCard.id } : null;
            })
            .filter(Boolean); // إزالة القيم null

          if (transactionsToUpdate.length > 0) {
            await Promise.all(
              transactionsToUpdate.map(({ transactionId, cardId }) =>
                transactionModel.update({ cardId }, { where: { transactionId } })
              )
            );

            console.log(`تم تحديث ${transactionsToUpdate.length} معاملة بإضافة cardId.`);
          }
        }
      }, 5000); // تأخير بسيط قبل التحقق من البطاقات

      clearInterval(intervalId);
      intervalId = setInterval(pollTransactions, pollingInterval);
      console.log("إنتهت عملية الاستعلام");
    }

    // finally {
    //   // أوقف الاستدعاء السابق وابدأ استدعاء جديد
    //   clearInterval(intervalId);
    //   intervalId = setInterval(pollTransactions, pollingInterval);
    //   console.log("إنتهت عملية الاستعلام");
    // }
  };

  // بدء عملية الاستعلام عند استدعاء الدالة
  intervalId = setInterval(pollTransactions, pollingInterval);

  // دالة لإيقاف التكرار عند الحاجة
  return () => clearInterval(intervalId);
};








const queryQueue = new Queue('card-balance-processing', {
  limiter: {
    groupKey: 'card-balance-group', // Prevents same card from being processed concurrently
    max: 10, // Limit to 10 jobs processed concurrently
    duration: 1000, // Duration in ms for max jobs
  },
  settings: {
    // Retry options for failed jobs
    retryProcessDelay: 3000, // Wait 3 seconds before retrying a failed job
    backoff: {
      type: 'exponential', // Retry exponentially increasing intervals
      delay: 1000, // Start retry after 1 second
    },
    // Timeout options for jobs
    timeout: 30000, // 30 seconds max time to process a job
  },
});

// Job processor for the queue
queryQueue.process(async (job) => {
  const { cardId, amount } = job.data;

  try {
    await applyCardBalance(cardId, amount);
  } catch (error) {
    console.error(`Failed to process Card ID: ${cardId}. Error: ${error.message}`);
    throw error;
  }
});



// Add new transactions
export const addNewTransaction = (data) =>
  ErrorHandlerService(async (req, res) => {
    if (!data || data.length === 0)
      throw new AppErrorService(400, "No transactions to add");

    const addTransaction = await transactionModel.bulkCreate(data);
    if (!addTransaction)throw new AppErrorService(400, "Failed to add transactions");

    // Enqueue balance update jobs for each transaction
  data.forEach(async(transaction) => {
    // before adding the card balance check if the transaction from bank is created befor user existence
    const getCardDetails = await cardModel.findOne({
      where: { cardId: transaction.cardId },
      include: [
        {
          model: userModel,
        }
      ],
    });
    // Adding each card balance update to the queue
    if(new Date(getCardDetails?.user?.createdAt) < new Date(transaction.date)){
      queryQueue.add({ cardId: transaction.cardId, amount: transaction.amount });
    }
  });
    // applying quer queu to save the card new balance
    res.status(201).json({ message: "Transactions added successfully" });
  });

// Start polling
export const startPolling = (callback) => {
  try {
    return displayBankTransactionsInterval(callback);
  } catch (error) {
    console.error("Error starting polling:", error);
    throw new AppErrorService(500, "Failed to start transaction polling");
  }
};




// apply card balance
export const applyCardBalance=ErrorHandlerService(async(cardId,amount)=>{
  // find card number
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1);
  const url = `${modifiedUrl}/${process.env.Bank_Id}/cards`;

  const data = await fetchFromBankApi(url);
  const findTheDesiredCard=data?.cards?.find((card)=>card?.cardId==cardId);
  if(!findTheDesiredCard) throw new AppErrorService(404,"card not found");
  const {lastFourDigits}=findTheDesiredCard;

  // find the card and apply new balance on cardNumber
  const desiredCardFromLitepay = await cardModel.findOne({
    cardNumber: { $regex: `^\\d{12}${lastFourDigits}$` },
  })

  if(!desiredCardFromLitepay) throw new AppErrorService(404,"card not found");
  // before adding the card balance check if the transaction from bank is created befor user existence
  // save the new balance
  desiredCardFromLitepay.balance+=amount;
  await desiredCardFromLitepay.save();
  return true;
  })