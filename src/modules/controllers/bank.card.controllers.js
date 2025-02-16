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
  const { sortKey, sortValue } = req.query;

  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1);
  const url = `${modifiedUrl}/${process.env.Bank_Id}/cards`;

  try {
    const data = await fetchFromBankApi(url);

    if (!data || !data.cards) {
      return res.status(404).json({ message: "No cards found" });
    }

    let sortedData = data.cards;

    if (sortKey && sortValue) {
      sortedData = [...data.cards].sort((a, b) => {
        const valueA = a[sortKey];
        const valueB = b[sortKey];

        if (sortValue === 'desc') {
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueB.localeCompare(valueA);
          } else if (valueA instanceof Date && valueB instanceof Date) {
            return valueB - valueA;
          } else if (typeof valueA === 'number' && typeof valueB === 'number') {
            return valueB - valueA;
          }
        } else {
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueA.localeCompare(valueB);
          } else if (valueA instanceof Date && valueB instanceof Date) {
            return valueA - valueB;
          } else if (typeof valueA === 'number' && typeof valueB === 'number') {
            return valueA - valueB;
          }
        }

        return 0;  // In case the field type doesn't match any criteria
      });
    }

    res.status(200).json({ message: "Cards fetched successfully", data: sortedData });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching cards", error: error.message });
  }
});




/**
 * Fetches the bank transactions from the bank API, with an optional start parameter.
 */
export const fetchTransactions = ErrorHandlerService(async (req, res) => {
  let {limit=500,offset=0}=req.query
  // Construct the transactions URL with optional start date handling
  let path = '/transactions';


  // Remove the last character from the Bank_Api_Url before appending the transactions endpoint
  const modifiedUrl = process.env.Bank_Api_Url.slice(0, -1); // Removes the last character
  const url = `${modifiedUrl}/${process.env.Bank_Id}${path}?limit=${limit}&offset=${offset}`;

  const data = await fetchFromBankApi(url);
  res.status(200).json({ message: "Transactions fetched successfully", data });
});
