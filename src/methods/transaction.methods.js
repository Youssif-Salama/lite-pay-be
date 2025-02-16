import { cardModel, transactionModel } from "../../db/dbConnection.js";
import { fetchFromBankApi } from "../modules/controllers/bank.card.controllers.js";
// import fetchBrandData from "../services/Avatar.services.js";
import { AppErrorService, ErrorHandlerService } from "../services/ErrorHandler.services.js";
import Queue from 'bull';
import env from "dotenv";
env.config();

const getAllTransactions = async (offsetParam, limitParam) => {
  let offset = offsetParam;
  const limit = limitParam;
  let start = new Date('2024-08-01');
  const fDay = new Date('2025-01-01');
  let today = new Date();

    const path = "/transactions";
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1);
  const url = `${modifiedUrl}/${process.env.Bank_Id}${path}`;

  // Ensure proper date formatting
  const todayFormatted = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Calculate the month difference
  const monthsDiff = (todayFormatted.getFullYear() - fDay.getFullYear()) * 12 + (todayFormatted.getMonth() - fDay.getMonth());

  if (monthsDiff >= 4) {
    start = todayFormatted;
  }

  const startDateParam = `start=${start.toISOString().split('T')[0]}`;
  const endDateParam = `end=${todayFormatted.toISOString().split('T')[0]}`;

  let data = await fetchFromBankApi(`${url}?${startDateParam}&${endDateParam}&limit=${limit}&offset=${offset}`);

  return data?.transactions;
};

export const displayBankTransactionsInterval = (callback) => {
  let pollingInterval = 10000;
  const maxInterval = 20000;
  let intervalId;
  let offset = 0;
  let limit = 500;
  let flag = false;
  const pollTransactions = async () => {
    try {
      const transactions = await getAllTransactions(offset, limit);

      if (transactions.length === 0) {
        console.log("No transactions found. Resetting offset and restarting polling...");

        offset = 0;
        clearInterval(intervalId);
        setTimeout(() => {
          intervalId = setInterval(pollTransactions, pollingInterval);
        }, 5000);
        return;
      }else{
        offset += limit;
        console.log("transactions found", transactions.length,offset);

      }

      const existingTransactions = await transactionModel.findAll({
        attributes: ["transactionId"],
      });
      const existingTransactionIds = existingTransactions.map(
        (tx) => tx.transactionId
      );

      const filteredData = transactions
        .filter((item) => item)
        .filter((item) => !existingTransactionIds.includes(item?.id));

      const cards = await cardModel.findAll();

      if (filteredData.length > 0) {
        const arrangedData = await Promise.all(
          filteredData.map(async (item) => {
            let amount = item?.amount;
            if (item?.relatedTransactions?.amount) {
              amount += item?.relatedTransactions?.amount;
            }

            let itemStatus = "pending";
            if (item?.status === "sent") itemStatus = "approved";
            if (item?.status === "failed") itemStatus = "rejected";

            if (item?.details?.debitCardInfo) {
              return {
                amount: amount,
                transactionId: item?.id,
                companyName: item?.counterpartyName,
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
              return {
                amount: amount,
                transactionId: item?.id,
                companyName: item?.counterpartyName,
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

      pollingInterval = 10000;
    } catch (error) {
      pollingInterval = Math.min(maxInterval, pollingInterval * 2);
    } finally {
      try {
        const existingNullCardTransactions = await transactionModel.findAll({
          attributes: ["transactionId", "bankCardId", "cardId"],
          where: { cardId: null }
        });

        if (existingNullCardTransactions.length > 0) {

          const cards = await cardModel.findAll();

          for (const transaction of existingNullCardTransactions) {
            const matchingCard = cards.find((card) => card.bankId === transaction.bankCardId);

            if (matchingCard?.id) {
              await transactionModel.update(
                { cardId: matchingCard.id },
                { where: { transactionId: transaction.transactionId } }
              );
              console.log(`تم تحديث المعاملة ${transaction.transactionId} وإسناد البطاقة الجديدة.`);
            }
          }
        }
      } catch (updateError) {
        console.error("Error updating transactions with missing cardId:", updateError);
      }
      clearInterval(intervalId);
      intervalId = setInterval(pollTransactions, pollingInterval);
      console.log("Polling process finished.");
    }
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