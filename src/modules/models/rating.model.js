export default (sequelize,DataTypes)=>{
  return sequelize.define("Rating",{
    title:{
      type:DataTypes.ENUM("instapay","vodafone","norm","vip"),
      allowNull:false,
      unique:true
    },
    value:{
      type:DataTypes.FLOAT,
      allowNull:false
    },
    addedBy:{
      type:DataTypes.INTEGER,
      refrences:{
        model:"Users",
        key:"id"
      }
    }
  },{timestamps:true})
}