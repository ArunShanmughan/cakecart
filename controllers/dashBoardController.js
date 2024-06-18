const dashboardHelper = require("../services/dashBoardChart");
const userModel = require("../models/userDB");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

const getDashBoardData = async (req, res) => {
  try {
    const [
      productCount,
      categoryCount,
      pendingOrders,
      completedOrdersCount,
      currentDayRevenue,
      fourteenDayRevenue,
      categoryWiseRevenue,
      totalRevenue,
      monthlyRevenue,
      activeUsers,
    ] = await Promise.all([
      dashboardHelper.productsCount(),
      dashboardHelper.categoryCount(),
      dashboardHelper.pendingOrders(),
      dashboardHelper.completedOrdersCount(),
      dashboardHelper.currentDayRevenue(),
      dashboardHelper.fourteenDaysRevenue(req.query.filterData),
      dashboardHelper.categoryWiseRevenue(req.query.filterData),
      dashboardHelper.totalRevenue(),
      dashboardHelper.monthlyRevenue(),
      dashboardHelper.activeUsers(),
    ]);

    const data = {
      productCount,
      categoryCount,
      pendingOrders,
      completedOrdersCount,
      currentDayRevenue,
      fourteenDayRevenue,
      categoryWiseRevenue,
      totalRevenue,
      monthlyRevenue,
      activeUsers,
    };
    console.log("coming to the function for geting promise datas", data);
    res.json(data);
  } catch (error) {
    console.log("Something went wrong", error);
    res.send({ error });
  }
};

const topProducts = async (req, res) => {
  try {
    // const topProducts = await orderModel.aggregate([
    //   {
    //     $match: { orderStatus: "delivered" },
    //   },
    //   {
    //     $unwind: "$cartData",
    //   },
    //   {
    //     $group: {
    //       _id: "$cartData.productId",
    //       count: { $sum: 1 },
    //     },
    //   },
    //   {
    //     $sort: { count: -1 },
    //   },
    //   {
    //     $limit: 10,
    //   },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "_id",
    //       foreignField: "_id",
    //       as: "product",
    //     },
    //   },
    //   {
    //     $unwind: "$product",
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: {
    //         $mergeObjects: ["$$ROOT", "$product"],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "categorymodels",
    //       localField: "product.category",
    //       foreignField: "_id",
    //       as: "category",
    //     },
    //   },
    //   {
    //     $unwind: "$category",
    //   },
    //   {
    //     $replaceRoot: {
    //       newRoot: {
    //         $mergeObjects: ["$$ROOT", "$category"],
    //       },
    //     },
    //   },
    // ]);
    const topProducts = await orderModel.aggregate([
      {
        $match: { orderStatus: "delivered" },
      },
      {
        $unwind: "$cartData",
      },
      {
        $group: {
          _id: "$cartData.productId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    console.log("this is the top products data", topProducts);
    res.render("admin/topProducts", { topProducts });
  } catch (error) {
    console.log("something went wrong in topProducts", error);
  }
};

const topCategory = async (req, res) => {
  try {
    const topCategories = await orderModel.aggregate([
      {
        $match: { orderStatus: "delivered" },
      },
      {
        $unwind: "$cartData",
      },
      {
        $lookup: {
          from: "products",
          localField: "cartData.productId.category",
          foreignField: "_id",
          as: "category",
        },
      },
      // {
      //   $unwind: "$product",
      // },
      // {
      //   $lookup: {
      //     from: "categorymodels",
      //     localField: "product.category",
      //     foreignField: "_id",
      //     as: "category",
      //   },
      // },
      {
        $unwind: "$category",
      },
      {
        $group: {
          _id: "$category.categoryName",
          quantity: { $sum: 1 },
        },
      },
      {
        $sort: { quantity: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    console.log("This is the topcategories",topCategories);
    res.render("admin/topCategory", { topCategories });
  } catch (error) {
    console.log("Something went wrong in the topCategories", error);
  }
};

module.exports = {
  getDashBoardData,
  topProducts,
  topCategory,
};
