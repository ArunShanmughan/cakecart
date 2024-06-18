const mongoose = require("mongoose");



const LogInSchema = new mongoose.Schema({
  fName: {
    type: String,
    required: true,
  },
  lName:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  address:{
    type: String,
    required:true,
  },
  postCode:{
    type:Number,
    required:true,
  },
  country:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  },
  isBlocked:{
    type:Boolean,
    required:true,
    default:false,
  }
});

const collection =  mongoose.model("UserDB", LogInSchema);
module.exports = collection;
