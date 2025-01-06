/**
 * Utility class for manipulating dates.
 */
export class manipulateDate {
  /**
   * Creates a new manipulateDate object, manipulating the given date.
   * @param {Date} [date=new Date()] - The date to manipulate.
   * @param {number} [year=0] - The number of years to add to the date.
   * @param {number} [month=0] - The number of months to add to the date.
   * @param {number} [day=0] - The number of days to add to the date.
   */
  constructor(date = new Date(), year = 0, month = 0, day = 0) {
    this.result = new Date(date);
    this.result.setFullYear(this.result.getFullYear() + year);
    this.result.setMonth(this.result.getMonth() + month);
    this.result.setDate(this.result.getDate() + day);
  }

  /**
   * Returns the manipulated date.
   *
   * @return {Date} - The manipulated date.
   */
  getDate() {
    return this.result;
  }
}