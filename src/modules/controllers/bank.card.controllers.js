import { AppErrorService, ErrorHandlerService } from "../../services/ErrorHandler.services.js";

/**
 * Encodes a given token as a base64 string.
 *
 * @param {string} token - Token to be encoded
 * @returns {string} - The encoded token
 */
export const encodeToken = (token) => {
  return Buffer.from(token).toString('base64');
};

/**
 * Fetches data from the bank's API.
 *
 * @param {string} url - URL of the bank's API
 * @returns {Promise<Object>} - The fetched data from the bank's API
 * @throws {AppErrorService} - If there was an error while fetching the data
 */
export const fetchFromBankApi = async (url) => {
  const encodedToken = encodeToken(process.env.Bank_Secret_Token);
  const result = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedToken}`,
    },
  });

  if (!result.ok) {
    throw new AppErrorService(400, "Failed to fetch data from bank API");
  }

  return result.json();
};

/**
 * Fetches the bank accounts from the bank API.
 */
export const fetchMyAccounts = ErrorHandlerService(async (req, res) => {
  const data = await fetchFromBankApi(process.env.Bank_Api_Url);
  res.status(200).json({ message: "Accounts fetched successfully", data });
});

/**
 * Fetches the bank cards from the bank API, removing the last character from the Bank_Api_Url.
 */
export const fetchMyCards = ErrorHandlerService(async (req, res) => {
  const {sortKey,sortValue}=req.query;
  if(!sortKey || !sortValue) return next();
  // Remove the last character from the Bank_Api_Url
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1); // Removes the last character
  const url = `${modifiedUrl}/${process.env.Bank_Id}/cards`; // Construct the full URL

  const data = await fetchFromBankApi(url);
  data=data?.cards?.sort((a,b)=>a[sortKey]-b[sortKey]);
  res.status(200).json({ message: "Cards fetched successfully", data });
});

/**
 * Fetches the bank transactions from the bank API, with an optional start parameter.
 */
export const fetchTransactions = ErrorHandlerService(async (req, res) => {
  const { start } = req.query; // Get the 'start' query parameter

  // Construct the transactions URL with optional start date handling
  let path = '/transactions';
  if (start) {
    // Handle the start time format and increment the second
    const withoutMs = start.split('.')[0];
    let [date, time] = withoutMs.split('T');
    let [hours, minutes, seconds] = time.split(':');

    seconds = (parseInt(seconds) + 1).toString().padStart(2, '0');

    if (parseInt(seconds) > 59) {
      seconds = '00';
      minutes = (parseInt(minutes) + 1).toString().padStart(2, '0');

      if (parseInt(minutes) > 59) {
        minutes = '00';
        hours = (parseInt(hours) + 1).toString().padStart(2, '0');

        if (parseInt(hours) > 23) {
          hours = '00';
          // Handle day overflow if needed
        }
      }
    }

    start = `${date}T${hours}:${minutes}:${seconds}Z`;
    path += `?start=${start}`;
  }

  // Remove the last character from the Bank_Api_Url before appending the transactions endpoint
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1); // Removes the last character
  const url = `${modifiedUrl}/${process.env.Bank_Id}${path}`;

  const data = await fetchFromBankApi(url);
  res.status(200).json({ message: "Transactions fetched successfully", data });
});
