export default (sequelize,DataTypes)=>{
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate:{
        isEmail:{
          args:true,
          msg:"Invalid email format"
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    telegram:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    age:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
    cards: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    requests: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    rating:{
      type:DataTypes.FLOAT
    }
  }, {
    timestamps: true,
  });
}