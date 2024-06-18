const userdata = require("../models/userDB");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel")

const getAdmin = (req, res) => {
  try {
    if (!req.session.adminLogged) {
      res.render("admin/adminlog");
    } else {
      res.redirect("/admindash");
    }
  } catch (error) {
    console.log("Something went wrong", error);
  }
  
};

const postAdmin = (req, res) => {
  try {
    if (process.env.ADMIN_PASSWORD == req.body.password) {
      req.session.adminLogged = true;
      res.redirect("/admindash");
    } else {
      res.render("admin/adminlog", { message: "invalid email or password" });
    }
  } catch (error) {
    console.log("something went wrong", error);
  }
};

const getAdminDash = async(req, res) => {
  try {
    let orderData = await orderModel.find().populate("userId").populate({
      path: "cartData.productId",
      model: "products",
      as: "productDetails",
    })
      res.render("admin/admindash",{orderData});
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getUserManagment = async (req, res) => {
  try {
      const userdetails = await userdata.find();
      res.render("admin/userManagment", { userinfo: userdetails });
  } catch (error) {
    console.log("Something went Wrong", error);
  }
};

const userBlock = async (req, res) => {
  try {
    await userdata.updateOne(
      { _id: req.query.id },
      { $set: { isBlocked: false } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const userUnBlock = async (req, res) => {
  try {
    await userdata.updateOne(
      { _id: req.query.id },
      { $set: { isBlocked: true } }
    );
    res.send({ success: true });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};


const admLogout = async(req,res)=>{
  try {
    req.session.adminLogged=false;
    res.redirect("/admin")
  } catch (error) {
    console.log("Something Went Wrong",error)
  }
}


module.exports = {
  getAdmin,
  postAdmin,
  getAdminDash,
  getUserManagment,
  userBlock,
  userUnBlock,
  admLogout,
};
