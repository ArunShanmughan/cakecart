// const { escapeXML } = require("ejs");
const userData = require("../models/userDB");
const transport = require("../services/sendOTP");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const addressModel = require("../models/addressModel");
const { postAddProduct } = require("./productcontroller");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const wishListCollection = require("../models/wishListModel");
const paypal = require("paypal-rest-sdk");
const couponModel = require("../models/couponModel");
const walletModel = require("../models/walletmodel");
const {generateInvoice} = require("../services/generatePDF");

const getlandingpage = async (req, res) => {
  try {
    const categoryInfo = await categoryModel.find();
    const ProductInfo = await productModel.find().populate("category");
    const usersCartData = await wholeTotal(req);
    console.log("this is homepage rendering data-->", usersCartData);
    // console.log(req.session.isLogged)
    if (req.session.isLogged) {
      req.session.otpRequest = false;
      const wishListData = await wishListCollection
        .find({
          userId: req.session.userInfo._id,
        })
        .populate("productId");
      console.log(
        "This is the wishlist data from the collection--> ",
        wishListData
      );
      res.render("users/homePage", {
        islogin: req.session.isLogged,
        categoryInfo: categoryInfo,
        usersCartData: usersCartData,
        productInfo: ProductInfo,
        wholeTotal: req.session.wholeTotal,
        wishListItems: wishListData,
      });
    } else {
      res.render("users/homePage", {
        islogin: null,
        categoryInfo: categoryInfo,
        productInfo: ProductInfo,
        wholeTotal: req.session.wholeTotal,
        cartData: usersCartData,
      });
    }
  } catch (error) {
    console.log("something went wrong", error);
  }
};

const getLogin = (req, res) => {
  try {
    if (!req.session.isLogged) {
      console.log("loginpage is rendering");
      res.render("users/login");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log("something went wrong", error);
  }
};

const postLogin = async (req, res) => {
  try {
    const check = await userData.findOne({ email: req.body.email });
    console.log(check);
    if (check.password == req.body.password && check.isBlocked == false) {
      req.session.isLogged = true;
      req.session.userInfo = check;
      // console.log(req.session.isLogged)
      res.redirect("/");
    } else {
      res.render("users/login", {
        message: "Username or Password is incorrect",
      });
    }
  } catch (error) {
    console.log("Something went Wrong", error);
  }
};

const getOtp = async (req, res) => {
  try {
    if (req.session.otpRequest) {
      const userEmail = req.session.email;
      // console.log(userEmail);
      const userDetail = await userData.findOne({ email: userEmail });
      console.log(userDetail);
      req.session.userInfo = userDetail;
      const oneTimePassword = () => Math.floor(1000 + Math.random() * 9000);
      console.log(oneTimePassword);
      req.session.OTP = oneTimePassword();
      console.log(req.session.OTP);
      await transport.sendMail({
        from: process.env.MAIL_ID,
        to: userEmail,
        subject: "Signup OTP for Cake Cart",
        text: `Here is your One Time Password for registration ${req.session.OTP}`,
      });
      res.render("users/otp");
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("something went wrong in getting Otp", error);
  }
};

const postOtp = async (req, res) => {
  try {
    if (req.session.OTP == req.body.otp) {
      req.session.isLogged = true;
      res.redirect("/");
    } else {
      res.render("users/otp", { message: "Invalid OTP" });
    }
  } catch (error) {
    console.log("Something went wrong Post otp", error);
  }
};

const getSignup = (req, res) => {
  try {
    res.render("users/signup");
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const postSignup = async (req, res) => {
  try {
    const data = {
      fName: req.body.firstname,
      lName: req.body.lastname,
      email: req.body.email,
      mobile: req.body.phonenumber,
      address: req.body.address,
      postCode: req.body.postCode,
      country: req.body.country,
      password: req.body.password,
    };
    const exist = await userData.findOne({ email: req.body.email });
    if (exist != null) {
      res.render("users/signup", { message: "This is an Existing user" });
    } else {
      await userData.insertMany([data]);
      req.session.email = req.body.email;
      req.session.isLogged = true;
      req.session.otpRequest = true;
      res.redirect("/views/users/otp");
    }
  } catch (error) {
    console.log("Error during signup:", error);
  }
};

const getMyAccount = async (req, res) => {
  try {
    res.render("users/myAccount", {
      islogin: req.session.isLogged,
      userData: req.session.userInfo,
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getMyWallet = async (req, res) => {
  try {
    let myWallet = await walletModel.findOne({
      userId: req.session.userInfo._id,
    });
    console.log(myWallet);
    res.render("users/myWallet", { myWallet, islogin: req.session.isLogged });
  } catch (error) {}
};

const postEditUserInfo = async (req, res) => {
  try {
    console.log("coming to this postEditUserInfo controller");
    console.log(req.body);
    let currentdata = {
      fName: req.body.fName,
      lName: req.body.lName,
      email: req.body.email,
      mobile: req.body.mobile,
    };

    await userData.findByIdAndUpdate(
      { _id: req.session.userInfo._id },
      { $set: currentdata }
    );
    res.send({ success: true });
  } catch (error) {
    console.log("Something went wrong while editing user Info", error);
    res.send({ success: false });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    let userOrderData = await orderModel
      .find({ userId: req.session.userInfo._id })
      .populate("userId");
    console.log(userOrderData);
    res.render("users/myOrders", {
      islogin: req.session.isLogged,
      userData: req.session.userInfo,
      orderDetails: userOrderData,
    });
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};

const getMyAddress = async (req, res) => {
  try {
    if (req.session.isLogged) {
      console.log("address page is getting");
      let userAddress = await addressModel.find({
        userId: req.session.userInfo._id,
      });
      res.render("users/myAddress", {
        islogin: req.session.isLogged,
        userAdd: userAddress,
      });
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};

const getAddAddress = async (req, res) => {
  try {
    if (req.session.isLogged) {
      let addressData = await addressModel.find();
      res.render("users/addAddress", { islogin: req.session.isLogged });
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const postAddAddress = async (req, res) => {
  try {
    const addAddress = new addressModel({
      userId: req.session.userInfo._id,
      addressHead: req.body.addressTitle,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      phone: req.body.phone,
    });

    // const addressDetail = await addressModel.find({ addressLine1: { $regex: new RegExp('^' + req.body.addressline1.toLowerCase() + '$', 'i') } })
    if (
      /^\s*$/.test(req.body.addressline1) ||
      /^\s*$/.test(req.body.addressline2) ||
      /^\s*$/.test(req.body.firstname) ||
      /^\s*$/.test(req.body.lastname) ||
      /^\s*$/.test(req.body.phonenumber)
    ) {
      res.send({ noValue: true });
    } else {
      res.send({ success: true });
      addAddress.save();
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getEditAddress = async (req, res) => {
  try {
    console.log(req.query);
    if (req.session.isLogged) {
      let presentAddress = await addressModel.findOne({ _id: req.query.addId });
      res.render("users/editAddress", {
        presentAddress,
        islogin: req.session.isLogged,
      });
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const postEditAddress = async (req, res) => {
  try {
    await addressModel.updateOne(
      { _id: req.query.editAddId },
      {
        $set: {
          addressHead: req.body.addressTitle,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          addressLine1: req.body.addressLine1,
          addressLine2: req.body.addressLine2,
          phone: req.body.phone,
        },
      }
    );
    res.redirect("/myAddress");
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};

const getDeleteAddress = async (req, res) => {
  try {
    if (req.session.isLogged) {
      await addressModel.deleteOne({ _id: req.query.dltId });
      res.redirect("/myAddress");
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};

const getChangePassword = async (req, res) => {
  try {
    if (req.session.isLogged) {
      res.render("users/changePassword", { islogin: req.session.isLogged });
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const postChangePassword = async (req, res) => {
  try {
    if (req.session.userInfo.password == req.body.currentPassword) {
      await userData.updateOne(
        { _id: req.session.userInfo._id },
        { $set: { password: req.body.newPassword } }
      );
      res.redirect("/myAddress");
    } else {
      let warning = "Please enter valid existing password";
      res.render("users/changePassword", {
        message: warning,
        islogin: req.session.isLogged,
      });
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getAddToCart = async (req, res) => {
  try {
    console.log(req.params);
    let existingProduct = await cartModel.findOne({
      productId: req.params.id,
    });
    console.log(existingProduct);
    if (existingProduct) {
      await cartModel.updateOne(
        { _id: existingProduct._id },
        { $inc: { productQuantity: 1 } }
      );
    } else {
      await cartModel.insertMany([
        {
          userId: req.session.userInfo._id,
          productId: req.params.id,
          productQuantity: req.body.productQuantity,
        },
      ]);
    }
    res.send({ success: true });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

async function wholeTotal(req) {
  try {
    if (req.session.userInfo) {
      let usersCartData = await cartModel
        .find({ userId: req.session.userInfo?._id })
        .populate("productId");
      let wholeTotal = 0;
      console.log(usersCartData);
      for (const k of usersCartData) {
        wholeTotal += k.productId.price * k.productQuantity;
        await cartModel.updateOne(
          { _id: k._id },
          {
            $set: {
              totalCostPerProduct: k.productId.price * k.productQuantity,
            },
          }
        );
      }
      usersCartData = await cartModel
        .find({ userId: req.session.userInfo._id })
        .populate("productId");
      req.session.wholeTotal = wholeTotal;
      return JSON.parse(JSON.stringify(usersCartData));
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
}

const getCart = async (req, res) => {
  try {
    if (req.session.isLogged) {
      let usersCartData = await wholeTotal(req);
      console.log(usersCartData);
      // let cartDetails = await cartModel.find({ userId: req.session?.userInfo?._id }).populate("productId");
      res.render("users/cart", {
        islogin: req.session.isLogged,
        userCartData: usersCartData,
        wholeTotal: req.session.wholeTotal,
      });
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

const postDeleteCart = async (req, res) => {
  try {
    await cartModel.findOneAndDelete({ _id: req.params.id });
    res.send({ success: true });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getDecQtyCart = async (req, res) => {
  try {
    let cartFindData = await cartModel
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartFindData.productQuantity > 1) {
      cartFindData.productQuantity--;
      cartFindData.totalCostPerProduct =
        cartFindData.productId.price * cartFindData.productQuantity;
    }
    await cartFindData.save();
    console.log(cartFindData);
    await wholeTotal(req);
    res.json({
      success: true,
      cartFindData,
      currentUser: req.session.userInfo,
      wholeTotal: req.session.wholeTotal,
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getIncQtyCart = async (req, res) => {
  try {
    let cartFindData = await cartModel
      .findOne({ _id: req.params.id })
      .populate("productId");
    if (cartFindData.productQuantity < cartFindData.productId.quantity) {
      cartFindData.productQuantity++;
      cartFindData.totalCostPerProduct =
        cartFindData.productId.price * cartFindData.productQuantity;
    }
    cartFindData = await cartFindData.save();
    console.log(cartFindData);
    await wholeTotal(req);
    res.json({
      success: true,
      cartFindData,
      currentUser: req.session.userInfo,
      wholeTotal: req.session.wholeTotal,
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getCheckout = async (req, res) => {
  try {
    if (req.session.isLogged) {
      let addressData = await addressModel
        .find({ userId: req.session.userInfo._id })
        .populate("addressModel");
      await wholeTotal(req);
      let availableCoupons = await couponModel.find({
        expiryDate: { $gte: new Date() },
      });
      let walletBalance = await walletModel.findOne({
        userId: req.session.userInfo._id,
      });
      console.log(
        "This is the wallet Balance from the back end",
        walletBalance
      );
      res.render("users/checkout", {
        islogin: req.session.isLogged,
        locationData: addressData,
        grandTotal: req?.session?.wholeTotal,
        validCoupons: availableCoupons,
        walletData: walletBalance,
      });
    } else {
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

const postApplyCoupon = async (req, res) => {
  try {
    console.log(req.body);
    let coupData = await couponModel.findOne({
      couponCode: req.body.couponCode,
    });
    console.log(coupData);
    if (!coupData) {
      res.send({ validCoupon: false });
    }

    if (coupData.userId.includes(req.session.userInfo._id)) {
      res.send({ validCoupon: false, alreadyUsed: true });
    }

    let { expiryDate } = coupData;
    let expiryDateCheck = new Date() < new Date(expiryDate);

    if (expiryDateCheck) {
      res.send({ validCoupon: true, coupData });
    } else {
      res.send({ validCoupon: false });
    }
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

// const postRemoveCoupon = async (req,res)=>{
//   try {
//     res.send({success:true})
//   } catch (error) {
//     console.log("Something went wrong",error);
//   }
// }

//This is for CASH ON DELIVERY option order placed method
const postOrderPlaced = async (req, res) => {
  try {
    console.log(
      "............this the data is coming from the post order method input's..........",
      req.body
    );
    let appliedCoupon = null;
    if (req.body.couponOffers) {
      appliedCoupon = req.body.couponOffers;
    }

    if (req.body.paymentMethod == "wallet") {
      let walletInfo = await walletModel.findOne({
        userId: req.session.userInfo._id,
      });
      console.log(walletInfo);
      let walletBal = walletInfo.walletBalance;
      if (walletBal < req.session.wholeTotal) {
        return res.send({ inSufficient: true });
      }
    }
    let addressData = await addressModel
      .find({ userId: req.session.userInfo._id })
      .populate("addressModel");
    console.log(
      "for checking is there anuy order in req.session.currentOrder",
      req.session.currentOrder
    );
    if (!req.session.currentOrder) {
      req.session.currentOrder = await orderModel.create({
        userId: req.session.userInfo._id,
        orderNumber: Math.floor(Math.random() * (10000 - 100 + 1)) + 100,
        orderDate: new Date(),
        couponOffers: appliedCoupon,
        addressChoosen: JSON.parse(JSON.stringify(addressData[0])),
        cartData: await wholeTotal(req),
        grandTotalCost: req.session.wholeTotal,
      });
    }

    console.log(req.session.currentOrder);
    let checkCart = await cartModel.find({ userId: req.session.userInfo._id });

    if (checkCart.length >= 0) {
      //for COD
      // if(req.body.paymentMethod==COD)
      await orderModel.updateOne(
        { _id: req.session.currentOrder._id },
        {
          $set: {
            paymentId: req.body.Address,
            paymentType: req.body.paymentMethod,
            comments: req.body.comments,
            grandTotalcost: req.session.wholeTotal,
          },
        }
      );
      let cartData = await cartModel
        .find({ _id: req.session.userInfo._id })
        .populate("productId");

      for (const product of cartData) {
        product.productId.quantity -= product.productQuantity;
        product.productId.stockSold += 1;
        await product.productId.save();
      }
      console.log("aaaaaaaaaa");

      let orderData = await orderModel.findOne({
        _id: req.session.currentOrder._id,
      });
      console.log(
        "this is the orderData before checking whether the payment Type is empty or not",
        orderData
      );
      if (orderData.paymentType == "") {
        orderData.paymentType = "COD";
        orderData.save();
      }
      let k = await cartModel
        .findByIdAndUpdate({
          _id: req.session.currentOrder._id,
        })
        .populate("productId");
      console.log("bbbbbbbbbbbbb");
      let orderDetails = await orderModel.findOne({
        _id: req.session.currentOrder._id,
      });
      console.log(
        "This is the orderDetails getting after creating order success and sending to the res.send",
        orderDetails
      );
      if (req.body.paymentMethod == "wallet") {
        await walletModel.updateOne(
          { userId: req.session.userInfo._id },
          { $inc: { walletBalance: -req.session.wholeTotal } }
        );
      }

      res.send({
        success: true,
      });
      await cartModel.deleteMany({ userId: req.session.userInfo._id });
    }
  } catch (error) {
    console.log("something went wrong", error);
  }
};

const getOrderInfo = async (req, res) => {
  try {
    let orderDetails = await orderModel.findOne({
      _id: req.session.currentOrder._id,
    });
    console.log("Coming to getOrderInfo with order details->", orderDetails);
    res.render("users/orderinfo", {
      islogin: req.session.isLogged,
      presentOrder: orderDetails,
    });
    req.session.currentOrder = null;
    console.log(
      "After making the req.session.currentOrder as null",
      req.session.currentOrder
    );
    await cartModel.deleteMany({ userId: req.session.userInfo._id });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getCancelOrder = async (req, res) => {
  try {
    console.log("coming to this cancel order");
    const orderData = await orderModel.findOne({ _id: req.query.cancelId });
    await orderModel.findOneAndUpdate(
      { _id: req.query.cancelId },
      { $set: { orderStatus: "cancelled" } }
    );
    let walletTransaction = {
      transactiondate: new Date(),
      transactionAmount: orderData.grandTotalcost,
      transactionType: "Online Payment Order Cancelled",
    };
    console.log(orderData.paymentType);
    let exist = await walletModel.findOne({ userId: req.session.userInfo._id });
    if (orderData.paymentType != "COD") {
      if (exist) {
        await walletModel.findOneAndUpdate(
          { userId: req.session.userInfo._id },
          {
            $inc: { walletBalance: orderData.grandTotalcost },
            $push: { walletTransaction },
          }
        );
      } else {
        await walletModel.create({
          userId: req.session.userInfo._id,
          walletBalance: orderData.grandTotalcost,
          walletTransaction: [{ ...walletTransaction }],
        });
      }
    }
    res.redirect("/orderHistory");
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};

const getSingleOrder = async (req, res) => {
  try {
    let orderInfo = await orderModel.findOne({ _id: req.query.viewOrd });
    console.log("this is CartData", orderInfo);
    let addressInfo = await addressModel
      .findOne({ _id: orderInfo.addressChoosen })
      .populate("userId");
    res.render("users/singleorder", {
      orderInfo,
      addressInfo,
      islogin: req.session.isLogged,
    });
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};

const downloadInvoicePDF = async (req, res,next) => {
  try {
    console.log(
      "This is comingto the downloadinvoice pdf with query ",
      req.query
    );
    let orderDet = await orderModel
      .findOne({ _id: req.query.orderId })
      .populate("addressChoosen");
    console.log(orderDet);
    const orderNumber = orderDet._id;
    const fileName = `invoice_order_${orderNumber}.pdf`;
    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${fileName}`,
    });

    await generateInvoice(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      orderDet
    );
  } catch (error) {
    console.log("Something went wrong in downloading the invoice", error);
  }
};

const getLogout = (req, res) => {
  req.session.isLogged = false;
  req.session.destroy();
  res.redirect("/");
};

module.exports = {
  getlandingpage,
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  getOtp,
  postOtp,
  getLogout,
  getMyAccount,
  getMyWallet,
  getOrderHistory,
  getMyAddress,
  postEditUserInfo,
  getAddAddress,
  postAddAddress,
  getEditAddress,
  postEditAddress,
  getDeleteAddress,
  getChangePassword,
  postChangePassword,
  getAddToCart,
  getCart,
  postDeleteCart,
  getDecQtyCart,
  getIncQtyCart,
  getCheckout,
  postOrderPlaced,
  getOrderInfo,
  getCancelOrder,
  getSingleOrder,
  downloadInvoicePDF,
  postApplyCoupon,
};
