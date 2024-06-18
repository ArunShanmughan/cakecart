const categoryModel = require("../models/categoryModel");
const admAuth = require("../middlewares/adminAuth");


const getCategoryManagment = async (req, res) => {
  try {
      const catDetails = await categoryModel.find();
      res.render("admin/categoryManagment", { categoryinfo: catDetails });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};


const categoryList = async (req, res) => {
  try {
    await categoryModel.updateOne(
      { _id: req.query.id },
      { $set: { isListed: false } }
    );
    res.send({ list: true });
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};


const categoryUnList = async (req, res) => {
  try {
    await categoryModel.updateOne(
      { _id: req.query.id },
      { $set: { isListed: true } }
    );
    res.send({ unlist: true });
  } catch (error) {
    console.log("Something Went wrong", error);
  }
};



const getAddCategory = async (req, res) => {
  try {
    const categoryName = req.body.category;
    const description = req.body.categoryDes;
    console.log(req.body);

    const categoryExists = await categoryModel.findOne({
      categoryName: { $regex: new RegExp("^" + req.body.category + "$", "i") },
    });

    if (categoryExists) {
      res.send({ invalid: true });
    } else {
      const newCategory = new categoryModel({
        categoryName,
        description,
      });
      await newCategory.save();
      res.send({ success: true });
    }
  } catch (error) {
    console.log("Something Went Wrong", error);
  }
};


const postEditCategory = async (req, res) => {
  try {
    const catDetails = await categoryModel.findOne({
      categoryName: {
        $regex: new RegExp(
          "^" + req.body.categoryName.toLowerCase() + "$",
          "i"
        ),
      },
    });

    if (
      /^\s*$/.test(req.body.categoryName) ||
      /^\s*$/.test(req.body.categoryDes)
    ) {
      res.send({ noValue: true });
    } else if (catDetails && catDetails._id != req.body.categoryId) {
      res.send({ exists: true });
    } else {
      await categoryModel.updateOne(
        { _id: req.body.categoryId },
        {
          $set: {
            categoryName: req.body.categoryName,
            description: req.body.categoryDes,
          },
        }
      );
      res.send({ success: true });
    }
  } catch (error) {
    console.log("Something went Wrong", error);
  }
};

module.exports={
  getCategoryManagment,
  categoryList,
  categoryUnList,
  getAddCategory,
  postEditCategory,
}