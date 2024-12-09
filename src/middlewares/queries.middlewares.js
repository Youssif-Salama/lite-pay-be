/**
 * Middleware to handle creating a new entry in the database.
 * @param {Model} model - The Sequelize model.
 * @returns {Function} Middleware function.
 */
export const attachAddQuery = (model) => {
  return (req, res, next) => {
      try {
          req.dbQuery = model.create(req.body);
          next();
      } catch (error) {
          next(error);
      }
  };
};

/**
* Middleware to handle fetching entries from the database.
* @param {Model} model - The Sequelize model.
* @returns {Function} Middleware function.
*/
export const attachGetQuery = (model) => {
  return (req, res, next) => {
      try {
          req.dbQuery =(options={})=> model.findAll(options);
          next();
      } catch (error) {
          next(error);
      }
  };
};

/**
* Middleware to handle updating entries in the database.
* @param {Model} model - The Sequelize model.
* @returns {Function} Middleware function.
*/
export const attachUpdateQuery = (model) => {
  return (req, res, next) => {
    try {
        req.dbQuery = async (options = {}) => {
          const updateResult =model.update(req.body, {
            where: { id: req.params.id },
            ...options,
          });
          return updateResult;
        };

        next();
      } catch (error) {
          next(error);
      }
  };
};

/**
* Middleware to handle deleting entries from the database.
* @param {Model} model - The Sequelize model.
* @returns {Function} Middleware function.
*/
export const attachDeleteQuery = (model) => {
  return (req, res, next) => {
      try {
          const deletedRowsCount =model.destroy({
              where: req.params // Assumes you're passing conditions via params
          });
          req.dbQuery = { deletedRowsCount };
          next();
      } catch (error) {
          next(error);
      }
  };
};