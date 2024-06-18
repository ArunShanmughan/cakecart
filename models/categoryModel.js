const mongoose =  require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  isListed:{
    type:Boolean,
    default:true,
  }
})

const categoryCollections = new mongoose.model("categoryModel", categorySchema);
module.exports = categoryCollections;