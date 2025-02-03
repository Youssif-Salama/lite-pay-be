export default (sequelize,DataTypes) => {
  return sequelize.define(
    "Request",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      account: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      method: {
        type: DataTypes.ENUM("instapay","vodafone"),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("card", "recharge"),
        defaultValue: "card",
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      amountUsd: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      cardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Cards",
          key: "id",
        },
      },
      attachments: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      nameOnCard: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
            },
      // email: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   validate: {
      //     isEmail: true,
      //   },
      // },
      telegram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rate:{
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending",
          "success",
          "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );
};