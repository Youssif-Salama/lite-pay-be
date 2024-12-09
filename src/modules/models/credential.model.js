export default (sequelize,DataTypes)=>{
  return sequelize.define('Credential', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    refrences:{
      model:"Users",
      key:"id"
    }
  }
}, {
  timestamps: true,
});
}