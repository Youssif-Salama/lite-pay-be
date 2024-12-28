export default (sequelize,DataTypes)=>{
  return sequelize.define("Rating",{
    title:{
      type:DataTypes.ENUM("instapay","vodafone","norm","vip"),
      allowNull:false
    },
    value:{
      type:DataTypes.FLOAT,
      allowNull:false
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