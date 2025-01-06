import { manipulateDate } from "./global.methods.js";

/**
 * Filters data based on the given date range.
 *
 * @param {string} whatDate - Specifies the date range to filter by ("today", "lastWeek", "lastMonth").
 * @param {Array} data - The data to filter.
 * @return {Array} - Filtered data.
 */
export function filterByDateRange(whatDate, data) {
  if (whatDate && ["today", "lastWeek", "lastMonth"].includes(whatDate)) {
    return data.filter(item => {
      const isInDateRange = countReqTransThreeDates(item.createdAt, whatDate);
      return isInDateRange;
    });
  }
  return data;
}

/**
 * Determines if a date falls within a specific range based on `forWhatDate`.
 *
 * @param {Date} itemCreationDate - The date to check.
 * @param {string} forWhatDate - The range to compare against ("today", "lastWeek", "lastMonth").
 * @return {boolean} - True if the date falls within the range.
 */
export const countReqTransThreeDates = (itemCreationDate, forWhatDate) => {
  let offsetDays = 0;

  switch (forWhatDate) {
    case "lastWeek":
      offsetDays = -7;
      break;
    case "lastMonth":
      offsetDays = -30;
      break;
    // "today" is default
  }

  const today = new Date();
  const startDate = new manipulateDate(today, 0, 0, offsetDays).getDate();
  const endDate = new manipulateDate(startDate, 0, 0, 1).getDate();

  const itemDate = new Date(itemCreationDate);

  return itemDate >= startDate && itemDate < endDate;
};