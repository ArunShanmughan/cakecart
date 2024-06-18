const productModel = require("../models/productModel")
const userModel = require("../models/userDB");
const wishListCollection = require("../models/wishListModel");

const postAddToWishlist = async(req,res)=>{
  try {
    await wishListCollection.create({
      userId:req.session.userInfo._id,
      productId:req.params.wishedItem,
      wishlist:true
    })

    res.send({success:true})
  } catch (error) {
    console.log("Something went wrong",error);
  }
}

const getWishlist = async(req,res)=>{
  try {
    let wishListData = await wishListCollection.find({userId:req.session.userInfo._id}).populate("productId")
    console.log(wishListData)
    res.render("users/wishlist",{wishlistItems:wishListData,islogin: req.session.isLogged})
  } catch (error) {
    console.log("Something went Wrong",error);
  }
}

const getWishlistRemover = async(req,res)=>{
  try {
    console.log("This is the params for delet from the wishlist:",req.params);
    await wishListCollection.deleteOne({_id:req.params.item});
    res.send({success:true})
  } catch (error) {
    console.log("Something went wrong",error);
  }
}

module.exports = {postAddToWishlist,getWishlist,getWishlistRemover}