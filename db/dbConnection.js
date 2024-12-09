import { Sequelize } from "sequelize";
import * as models from "./import.db.js"
import env from "dotenv";
env.config();

/*
 - sequelize is a library that helps us to connect to our database
 - we use env variables to connect to our database
 - it's an instance of the Sequelize class
*/
// export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//   host: 'localhost',
//   dialect: 'postgres',
// });
export const sequelize = new Sequelize(process.env.Db_Ext_Url, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// start migration
export const userModel = models.userModelDefinition(sequelize, Sequelize);
export const roleModel = models.roleModelDefinition(sequelize, Sequelize);
export const credentialModel = models.credentialModelDefinition(sequelize, Sequelize);
// end migration


// relations
roleModel.hasMany(userModel, { foreignKey: 'roleId', as: 'users' });
userModel.belongsTo(roleModel, { foreignKey: 'roleId', as: 'role' });
userModel.hasOne(credentialModel, { foreignKey: 'userId',as:"credential" });
// end relations









/**
 * Syncs the database by recreating all tables if they don't exist.
 * If they do exist, it will attempt to alter them to match the current models.
 * @returns {Promise<void>}
 */
export const syncDb = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

function fireDbConnection() {
  return sequelize.authenticate();
}

export default fireDbConnection;
