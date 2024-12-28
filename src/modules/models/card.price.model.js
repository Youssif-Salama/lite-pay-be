export default(sequelize,DataTypes)=>{
  return sequelize.define("CardPrice",{
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    cardName:{
      type:DataTypes.STRING,
      allNull:false
    },
    cardPrice:{
      type:DataTypes.FLOAT,
      allowNull:false
    },
    isActive:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    addedBy:{
      type:DataTypes.INTEGER,
      refrences:{
        model:"Users",
        as:"id"
      }
    }
  },{timestamps:true})
}