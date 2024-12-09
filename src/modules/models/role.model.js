export default (sequelize,DataTypes)=>{
  return sequelize.define("Role", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM([
        "user",
        "vip",
        "staff",
        "manager",
        "owner",
      ]),
      allowNull: false,
      defaultValue: "user",
      unique: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status:{
      type: DataTypes.ENUM([
        "active",
        "inactive",
    "deleted"
      ]),
      defaultValue: "active"
    }
  }, { timestamps: true });
}