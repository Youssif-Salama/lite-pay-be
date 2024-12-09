import { sequelize } from "./dbConnection.js"

const syncDb=async(req,res)=>{
  try {
    const{dbName,dbUser,dbPass}=req.body;
    if(dbName===process.env.DB_NAME && dbUser===process.env.DB_USER && dbPass===process.env.DB_PASS){
      const result=await sequelize.sync({alter:true});
      result?res.json({message:"Database synced"}):res.json({message:"Database sync failed"});
    }
    else{
      res.json({message:"Database sync failed"});
    }
  } catch (error) {
    res.json({message:"Database sync failed"});
  }
}

export default syncDb;