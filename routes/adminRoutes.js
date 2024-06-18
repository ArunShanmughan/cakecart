const express = require("express");
const admRouter = express.Router();
const upload = require("../services/multer.js");
const admAuth = require("../middlewares/adminAuth.js");

const {
  getAdmin,
  postAdmin,
  getAdminDash,
  getUserManagment,
  userBlock,
  userUnBlock,
  admLogout,
} = require("../controllers/adminController.js");

const {
  getCategoryManagment,
  categoryList,
  categoryUnList,
  getAddCategory,
  postEditCategory,
} = require("../controllers/categorycontroller.js");

const {
  getProductManagment,
  productBlock,
  productUnBlock,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
} = require("../controllers/productController.js");

const {
  getOrderManagment,
  getChangeOrderStatus,
  getSingleOrder,
} = require("../controllers/orderController.js");

const {
  getOfferManagment,
  postNewOffer,
  putEditOffer,
  getCategoryOffer,
  ChangeCategoryOfferStatus,
  postNewCategoryOffer,
  editCategoryOffer,
} = require("../controllers/offerController.js");

const {
  getCouponManagment,
  getCreateCoupon,
  postDeleteCoupon,
  putEditCoupon,
} = require("../controllers/couponController.js");

const {
  getSalesReport,
  postSalesDateFilter,
  salesReportPdfDownload,
  salesReportExcelDownload,
}=require("../controllers/salesReportController.js");


const {
  getDashBoardData,
  topProducts,
  topCategory,
} = require("../controllers/dashBoardController.js");
//admin Routers
admRouter.get("/admin", getAdmin);
admRouter.post("/adminlog", postAdmin);
admRouter.get("/admindash", admAuth, getAdminDash);
admRouter.get("/usersmanagment", admAuth, getUserManagment);
admRouter.get("/userBlock", admAuth, userBlock);
admRouter.get("/userUnBlock", admAuth, userUnBlock);
admRouter.get("/admLogOut", admAuth, admLogout);

//Category Routers
admRouter.get("/categoryManagment", admAuth, getCategoryManagment);
admRouter.get("/categoryunlist", admAuth, categoryList);
admRouter.get("/categorylist", admAuth, categoryUnList);
admRouter.post("/addCategory", admAuth, getAddCategory);
admRouter.post("/editCategory", admAuth, postEditCategory);

//Product Routers
admRouter.get("/productManagment", admAuth, getProductManagment);
admRouter.get("/productBlock", admAuth, productBlock);
admRouter.get("/productUnBlock", admAuth, productUnBlock);
admRouter.get("/addProduct", admAuth, getAddProduct);
admRouter.post("/addProducts", admAuth, upload.any(), postAddProduct);
admRouter.get("/editProduct", admAuth, getEditProduct);
admRouter.post("/editProducts/:id", admAuth, upload.any(), postEditProduct);

//Order Managment Routers
admRouter.get("/ordermanagment", admAuth, getOrderManagment);
admRouter.get("/orderStatusChange/:ordId", admAuth, getChangeOrderStatus);
admRouter.get("/viewOrder", admAuth, getSingleOrder);

//offer Managments Routes
admRouter.get("/offerManagment", admAuth, getOfferManagment);
admRouter.post("/addOffer", admAuth, postNewOffer);
admRouter.put("/editCurrentOffer/:id", admAuth, putEditOffer);
admRouter.get("/categoryOfferManagment", admAuth, getCategoryOffer);
admRouter.post("/categoryOfferStatus/:id", admAuth, ChangeCategoryOfferStatus);
admRouter.post("/newcategoryOffer", admAuth, postNewCategoryOffer);
admRouter.put("/editCategoryOffer", admAuth, editCategoryOffer);

//Coupon Managment routes
admRouter.get("/couponManagment", admAuth, getCouponManagment);
admRouter.post("/newCouponCreate", admAuth, getCreateCoupon);
admRouter.post("/deleteCoupon/:couponId", admAuth, postDeleteCoupon);
admRouter.put("/editCoupon/:id",admAuth,putEditCoupon)

//Sales report routes
admRouter.get("/salesreport",admAuth,getSalesReport)
admRouter.post("/salesDateFilter",admAuth,postSalesDateFilter);
admRouter.get("/downloadPdf",admAuth,salesReportPdfDownload)
admRouter.get("/downloadExcel",admAuth,salesReportExcelDownload)

//Dash Board controller
admRouter.get("/dashBoardData",admAuth,getDashBoardData);
admRouter.get("/topProducts",admAuth,topProducts);
admRouter.get("/topCategory",admAuth,topCategory)

module.exports = admRouter;
