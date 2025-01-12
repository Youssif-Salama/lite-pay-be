export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Card",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bankId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      cvv: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // type: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      // balanceUsd: {
      //   type: DataTypes.FLOAT,
      //   allowNull: false,
      // },
      status: {
        type: DataTypes.ENUM("active", "inactive", "deleted"),
        defaultValue: "active",
      },
    },
    {
      timestamps: true,
    }
  );
};
