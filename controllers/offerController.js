const productOfferModel = require("../models/productOfferModel");
const formatDate = require("../services/formatDate");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const categoryOfferModel = require("../models/categoryOfferModel");
const applyCategoryOffer = require("../services/applyCategoryOffer").applyCategoryOffer;
const applyProductOffers =
  require("../services/applyProductOffer").applyProductOffer;

const getOfferManagment = async (req, res) => {
  try {
    //updating currentStatus field by checking with the current date

    let productOffers = await productOfferModel.find();
    console.log(productOffers);
    productOffers.forEach(async (i) => {
      await productOfferModel.updateOne(
        { _id: i._id },
        {
          $set: {
            currentStatus: i.endDate >= new Date(),
          },
        }
      );
    });

    //formating the data according to the Date
    productOffers = productOffers.map((i) => {
      i.startDateFormated = formatDate(i.startDate, "YYYY-MM-DD");
      i.endDateFormated = formatDate(i.endDate, "YYYY-MM-DD");
      return i;
    });

    const productData = await productModel.find();
    const categoryData = await categoryModel.find();

    res.render("admin/offerManagment", {
      productOffers,
      productData,
      categoryData,
    });
  } catch (error) {
    console.log("Something went wrong while rendering offermanagment");
  }
};

const postNewOffer = async (req, res) => {
  console.log("coming to this postNewOffer function with req.body");
  try {
    console.log(req.body);
    let { productName } = req.body;
    let existingOffer = await productOfferModel.findOne({ productName });

    if (!existingOffer) {
      let productData = await productModel.findOne({ productName });

      let { productOfferPercentage, startDate, endDate } = req.body;

      await productOfferModel.insertMany([
        {
          productId: productData._id,
          productName,
          productOfferPercentage,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      ]);
      await applyProductOffers("postNewOffer");
      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch (error) {
    console.log("Something went wrong", error);
  }
};

const putEditOffer = async (req, res) => {
  console.log("this is the edit offer controller the body data is: ", req.body);
  try {
    let { productName } = req.body;
    console.log(productName);
    let existingOffer = await productOfferModel.findOne({
      productName: { $regex: new RegExp(req.body.productName, "i") },
    });

    if (!existingOffer || existingOffer._id == req.params.id) {
      let updateFields = {
        productName,
        productOfferPercentage: Number(req.body.productOfferPercentage),
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };
      console.log(updateFields);
      let temp = await productOfferModel.findByIdAndUpdate(
        req.params.id,
        updateFields
      );

      await applyProductOffers("putEditOffer");
      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch (error) {
    console.log("Something went wrong in the edit offer controller", error);
  }
};


const getCategoryOffer = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const categoryOffers = await categoryOfferModel.find().populate("category");
    applyCategoryOffer();
    res.render("admin/categoryOfferManagment", { categories, categoryOffers });
  } catch (error) {
    console.log(
      "Somethig went wrog with getting category Offer Managment",
      error
    );
  }
};



const ChangeCategoryOfferStatus = async (req, res) => {
  try {
    let presentCategory = await categoryOfferModel.findOne({
      _id: req.params.id,
    });
    console.log("this is in the change status offer status function",presentCategory);
    if (presentCategory.isAvailable) {
     await categoryOfferModel.findByIdAndUpdate(
        { _id: presentCategory._id },
        { $set: { isAvailable: false } }
      )
    } else {
      await categoryOfferModel.findByIdAndUpdate(
        { _id: presentCategory._id },
        { $set: { isAvailable: true } }
      )
    }

    res.send({ success: true });
  } catch (error) {
    console.log(
      "Something went wrong while changing the category offer status",
      error
    );
  }
};

const postNewCategoryOffer = async(req,res)=>{
  try {
    // console.log("this is in the body of postNewCategoryOffer",req.body);
    const {category,categoryOfferPercentage,startDate,endDate} = req.body;

    const offerExist = await categoryOfferModel.findOne({category});

    if(offerExist){
      res.send({exist:true})
    }

    const offer = await new categoryOfferModel({
      category,
      offerPercentage:categoryOfferPercentage,
      startDate,
      endDate
    }).save()

    res.send({success:true})
  } catch (error) {
    console.log("Something went Were in postNewCategoryOffer controller",error);
  }
}

const editCategoryOffer = async(req,res)=>{
  try {
    // console.log("This is the req.body coming into the editCategoryOffer:",req.body);
    const {id,offerPercentage,startDate,endDate}=req.body;

    const offer = await categoryOfferModel.findByIdAndUpdate(id,{offerPercentage,startDate,endDate});
    res.send({success:true});
  } catch (error) {
    res.send({success:false});
    console.log("Something went wrong in the editCategoryOffer controller",error);
  }
}

module.exports = {
  getOfferManagment,
  postNewOffer,
  putEditOffer,
  getCategoryOffer,
  ChangeCategoryOfferStatus,
  postNewCategoryOffer,
  editCategoryOffer,
};
