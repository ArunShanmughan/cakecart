const couponmodel = require("../models/couponModel");
const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModel");
const formatDate = require("../services/formatDate");

const getCouponManagment = async (req, res) => {
  try {
    let couponData = await couponmodel.find();
    couponData = couponData.map((i) => {
      i.formatedStartDate = formatDate(i.startDate, "YYYY-MM-DD");
      i.formatedExpiryDate = formatDate(i.expiryDate, "YYYY-MM-DD");
      return i;
    });
    res.render("admin/couponManagment", { totalCoupons: couponData });
  } catch (error) {
    console.log(
      "Something Went wrong in the Get Coupon Managment controller",
      error
    );
  }
};

const getCreateCoupon = async (req, res) => {
  try {
    let existingCoupon = await couponmodel.findOne({
      couponCode: { $regex: new RegExp(req.body.couponCode, "i") },
    });

    if (!existingCoupon) {
      await couponmodel.insertMany([
        {
          couponCode: req.body.couponCode,
          discountPercentage: req.body.discountPercentage,
          startDate: new Date(req.body.startDate),
          expiryDate: new Date(req.body.expiryDate),
          minimumPurchase: req.body.minimumPurchase,
          maximumDiscount: req.body.maximumDiscount,
        },
      ]);
      res.send({ success: true });
    } else {
      res.send({ exist: true });
    }
  } catch (error) {
    res.send({ success: false });
    console.log("Someting went wrong in the create Coupon",error)
  }
};


const postDeleteCoupon = async(req,res)=>{
  try {
    await couponmodel.findByIdAndDelete({_id:req.params.couponId});
    res.send({success:true})
  } catch (error) {
    console.log("Something went wrong in deleting")
  }
}


const putEditCoupon = async(req,res)=>{
  try {
    console.log("coming to the editCoupon controller with the body data",req.body);
    console.log("coming to the editCoupon controller with the params data",req.params);
    let existingCoupon = await couponmodel.findOne({
      couponCode: { $regex: new RegExp(req.body.couponCode, "i")}
    })

    if(!existingCoupon || existingCoupon._id == req.params.id){
      let updateData = {
        couponCode: req.body.couponCode,
        discountPercentage: req.body.discountPercentage,
        startDate: new Date(req.body.startDate),
        expiryDate: new Date(req.body.endDate),
        minimumPurchase: req.body.minimumPurchase,
        maximumDiscount: req.body.maximumDiscount,
      };

      await  couponmodel.findOneAndUpdate({_id:req.params.id},{$set:updateData});
      res.send({success:true})
    }else{
      res.send({exist:true})
    }
  } catch (error) {
    console.log("something went wrong in the update controller",error);
  }
}

module.exports = { getCouponManagment, getCreateCoupon, postDeleteCoupon, putEditCoupon };
