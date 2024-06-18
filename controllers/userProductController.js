const userData = require("../models/userDB");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

const getProducts = async (req, res) => {
  try {
    const categoryInfo = await categoryModel.find({ isListed: true });

    // Define variables for numbers
    const productsPerPage = 4;
    const pageNumber = parseInt(req.query.pageNo) || 1;
    const skipIndex = (pageNumber - 1) * productsPerPage;
    const query = { isListed: true };

    if (req.query.searchId) {
      query.productName = { $regex: req.query.searchId, $options: "i" };
    } else if (req.query.id) {
      query.parentCategory = req.query.id;
    }

    // Reset session variables
    req.session.ascSort = null;
    req.session.desSort = null;
    req.session.highValueSort = null;
    req.session.lowValueSort = null;
    req.session.newArrive = null;

    const productDataWithPagination = await productModel
      .find(query)
      .populate("category")
      .skip(skipIndex)
      .limit(productsPerPage);

    let productInfo = req.session.productsData || productDataWithPagination;

    // Calculate total pages
    const totalProducts = await productModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Create an array of page numbers
    const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

    res.render("users/products", {
      islogin: req.session.isLogged,
      productInfo:
        req.session.ascSort ||
        req.session.desSort ||
        req.session.highValueSort ||
        req.session.lowValueSort ||
        req.session.newArrive ||
        productInfo,
      categoryDet: categoryInfo,
      totalPagesArray,
    });

    // Clear session variable
    req.session.productsData = null;
  } catch (error) {
    console.log("Something went Wrong", error);
  }
};


const getSingleProduct = async (req, res) => {
  try {
    const productDetails = await productModel.findOne({ _id: req.query.id });
    const categoryDetails = await categoryModel.findOne({ _id: req.query.id });
    const currentQuantity = productDetails.quantity;
    res.render("users/singleProduct", {
      islogin: req.session.isLogged,
      productInfo: productDetails,
      categoryInfo: categoryDetails,
      maxValue : currentQuantity
    });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};


const getSearchProduct = async (req, res) => {
  try {
    const searchedProduct = await productModel.find({
      productName: { $regex: req.body.searchElement, $options: "i" },
    });
    if (searchedProduct.length > 0) {
      res.send({ searchProduct: true });
    } else {
      res.send({ searchProduct: false });
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};


const getSortData = async (req, res) => {
  try {
    if (req.query.sortId == 1) {
      const ascSortByName = await productModel.find().sort({ productName: 1 });
      req.session.ascSort = ascSortByName;
      res.send({ ascSort: true });
    } 
    else if (req.query.sortId == 2) {
      const desSortByName = await productModel.find().sort({ productName: -1 });
      req.session.desSort = desSortByName;
      res.send({ desSort: true });
    } 
    else if (req.query.sortId == 3) {
      const ascSortByPrice = await productModel.find().sort({ price: 1 });
      req.session.highValueSort = ascSortByPrice;
      res.send({ highValueSort: true });
    } 
    else if (req.query.sortId == 4) {
      const desSortByPrice = await productModel.find().sort({ price: -1 });
      req.session.lowValueSort = desSortByPrice;
      res.send({ lowValueSort: true });
    }
    else if(req.query.sortId == 5){
      const newArrivals = await productModel.find().sort({_id:-1});
      req.session.newArrive = newArrivals;
      res.send({newArrive:true})
    }
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};

module.exports = {
  getProducts,
  getSingleProduct,
  getSearchProduct,
  getSortData,
};
