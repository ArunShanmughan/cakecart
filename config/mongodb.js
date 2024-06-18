
const mongose = require("mongoose")

const dataBase =  async ()=>{
  try {
    console.log("req entered dataBase")
    await mongose.connect(process.env.MONGO_URL);
    console.log("Database connected")
  } catch (error) {
    console.log("failed to connect DataBase",error)
  }
}


module.exports = dataBase

