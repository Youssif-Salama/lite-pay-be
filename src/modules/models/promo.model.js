export default (sequelize, DataTypes) => {
  return sequelize.define("Promo", {
    promo: {
      type:DataTypes.STRING,
      allowNull:false
    },
    type: {
      type:DataTypes.ENUM("total","card"),
      defaultValue:"total"
    },
    max: {
      type:DataTypes.FLOAT,
      defaultValue:100
    },
    percent: {
      type:DataTypes.FLOAT,
      defaultValue:0
    },
    addedBy:{
      type:DataTypes.INTEGER,
      refrences:{
        model:"Users",
        key:"id"
      }
    }
  },{timestamps:true});
};
