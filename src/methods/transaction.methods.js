import { cardModel, transactionModel } from "../../db/dbConnection.js";
import { fetchFromBankApi } from "../modules/controllers/bank.card.controllers.js";
import { AppErrorService, ErrorHandlerService } from "../services/ErrorHandler.services.js";
import Queue from 'bull';
import env from "dotenv";
env.config();

// Polling bank transactions with callback for database handling
export const displayBankTransactionsInterval = (callback) => {
  let result = null;
  let pollingInterval = 60000; // initial interval in ms
  const maxInterval = 60000*2; // maximum backoff interval in ms
  let intervalId;

  const path = "/transactions";
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1);
  const url = `${modifiedUrl}/${process.env.Bank_Id}${path}`;

  const pollTransactions = async () => {
    try {
      const data = await fetchFromBankApi(url);
      const transactions = data?.transactions;

      if (JSON.stringify(transactions) !== JSON.stringify(result)) {
        result = transactions;

        const existingTransactions = await transactionModel.findAll({
          attributes: ["transactionId"],
        });
        const existingTransactionIds = existingTransactions.map(
          (tx) => tx.transactionId
        );

        const filteredData = result
          .filter((item) => item?.details?.debitCardInfo?.id && item)
          .filter((item) => !existingTransactionIds.includes(item?.id));

        if (filteredData.length > 0) {
          const arrangedData = filteredData.map((item) => {
            // amount
            let amount = item?.amount;
            if(item?.relatedTransactions?.amount) amount +=item?.relatedTransactions?.amount;

            // status
            let itemStatus = "pending";
            if (item?.status === "sent") itemStatus = "approved";
            if (item?.status === "failed") itemStatus = "rejected";

            return {
              amount: amount,
              transactionId: item?.id,
              companyName: item?.counterpartyName,
              date: item?.estimatedDeliveryDate,
              time: item?.postedAt,
              failureReason: item?.reasonForFailure,
              category: item?.mercuryCategory,
              bankCardId: item?.details?.debitCardInfo?.id,
              details: JSON.stringify({details:item?.details,relatedTransactions:item?.relatedTransactions}),
              status: itemStatus,
              bankCreatedAt: item?.createdAt,
            };
          });

          if (typeof callback === "function") {
            await callback(arrangedData);
          }
        }

        pollingInterval = 10000;
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      pollingInterval = Math.min(maxInterval, pollingInterval * 2);
    } finally {
      clearInterval(intervalId);
      intervalId = setInterval(pollTransactions, pollingInterval);
    }
  };

  intervalId = setInterval(pollTransactions, pollingInterval);

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
  data.forEach((transaction) => {
    // Adding each card balance update to the queue
    queryQueue.add({ cardId: transaction.cardId, amount: transaction.amount });
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
  // save the new balance
  desiredCardFromLitepay.balance+=amount;
  await desiredCardFromLitepay.save();
  return true;
  })