const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth")

const {
  getlandingpage,
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  getOtp,
  postOtp,
  getLogout,
  getMyAccount,
  postEditUserInfo,
  getOrderHistory,
  getMyAddress,
  getMyWallet,
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
} = require("../controllers/userController");

const {
  getProducts,
  getSingleProduct,
  getSearchProduct,
  getSortData,
} = require("../controllers/userProductController");

const{
  postAddToWishlist,
  getWishlist,
  getWishlistRemover,
} = require("../controllers/wishListController")

const{onlinePayments,paymentDone}=require("../controllers/paymentController")

router.get("/", getlandingpage);
router.get("/views/users/login", getLogin);
router.post("/views/users/login", postLogin);
router.get("/signup", getSignup);
router.post("/views/users/signup", postSignup);
router.get("/views/users/otp", getOtp);
router.post("/views/users/otp", postOtp);
router.get("/resendOTP", getOtp);
router.get("/views/users/logout", getLogout);
router.get("/myAccount",userAuth, getMyAccount);
router.post("/editUserInfo",userAuth,postEditUserInfo)
router.get("/orderHistory",userAuth, getOrderHistory);
router.get("/myAddress",userAuth, getMyAddress);
router.get("/myWallet",userAuth, getMyWallet)
router.get("/addAddress",userAuth, getAddAddress);
router.post("/addAddress",userAuth, postAddAddress);
router.get("/editAddress",userAuth, getEditAddress);
router.post("/editAddress",userAuth, postEditAddress);
router.get("/deleteAddress",userAuth, getDeleteAddress);
router.get("/changePassword",userAuth, getChangePassword);
router.post("/changePassword",userAuth,postChangePassword);
router.post("/addToCart/:id",userAuth, getAddToCart);
router.get("/cart",userAuth,getCart);
router.post("/deleteCart/:id",userAuth,postDeleteCart);
router.put("/cart/decQty/:id",userAuth,getDecQtyCart);
router.put("/cart/incQty/:id",userAuth,getIncQtyCart);
router.get("/checkout",userAuth,getCheckout);
router.post("/orderPlaced",userAuth,postOrderPlaced);
router.get("/orderinfo",userAuth,getOrderInfo)
router.get("/cancelOrder",userAuth,getCancelOrder);
router.get("/singleOrder",userAuth,getSingleOrder)
router.get("/downloadInvoice",userAuth,downloadInvoicePDF)
router.post("/applyCoupon",userAuth,postApplyCoupon)

//user side product Controllers
router.get("/products",userAuth, getProducts);
router.get("/singleProduct",userAuth, getSingleProduct);
router.post("/searchProducts",userAuth, getSearchProduct);
router.get("/products/sort/sortValue",userAuth, getSortData);

//user Side Wishlist controller
router.post("/addToWishList/:wishedItem",userAuth,postAddToWishlist)
router.get("/wishlist",userAuth,getWishlist);
router.get("/removeFromWishList/:item",userAuth,getWishlistRemover)

//payment controller of paypal
router.post("/payPalPayment",userAuth,onlinePayments)
router.get("/paymentDone",userAuth,paymentDone);


module.exports = router;
