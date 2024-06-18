const orderModel = require("../models/orderModel");
const addressModel = require("../models/addressModel")



const getOrderManagment = async(req,res)=>{
  try {
      let orderDetails = await orderModel.find().populate("userId")
      console.log(orderDetails);
      res.render("admin/orderManagment",{orderData:orderDetails});
  } catch (error) {
    console.log("Something Went Wrong",error);
  }
}

const getChangeOrderStatus = async(req,res)=>{
  console.log(req.params);
  console.log("this is happening in the change order status processs",req.query)
  try {
    await orderModel.findOneAndUpdate({_id:req.params.ordId},{$set:{orderStatus:req.query.statusId}});
    res.send({success:true})
  } catch (error) {
    console.log("Something Went Wrong",error)
  }
}

const getSingleOrder = async(req,res)=>{
  try {
      let orderDet = await orderModel.findOne({_id:req.query.singleOrd}).populate("userId");
      console.log("This is the array that has been passing from the orderDet.cartData -->",orderDet.cartData);
      let addressDet = await addressModel.findOne({_id:orderDet.addressChoosen});
      res.render("admin/currentOrder",{orderDet,addressDet})
  } catch (error) {
    console.log("Something Went wrong",error);
  }
}

module.exports={getOrderManagment,getChangeOrderStatus,getSingleOrder}