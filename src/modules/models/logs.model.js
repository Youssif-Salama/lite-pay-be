export default (sequelize, DataTypes) => {
  return sequelize.define("Logs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data:{
      type:DataTypes.JSON,
      allowNull:false
    }
  }, {
    timestamps: true,
  });
};