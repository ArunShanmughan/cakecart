const usersModel = require("../models/userDB.js");
const categoryCollection = require("../models/categoryModel.js");
const orderCollection = require("../models/orderModel.js");
const productCollection = require("../models/productModel.js");

const productsCount = async () => {
  try {
    return await productCollection.countDocuments();
  } catch (error) {
    console.error(error);
  }
};

const categoryCount = async () => {
  try {
    return await categoryCollection.countDocuments();
  } catch (error) {
    console.error(error);
  }
};

const pendingOrders = async () => {
  try {
    return await orderCollection.countDocuments({
      orderStatus: { $ne: "delivered" },
    });
  } catch (error) {
    console.error(error);
  }
};

const completedOrdersCount = async () => {
  try {
    return await orderCollection.countDocuments({ orderStatus: "delivered" });
  } catch (error) {
    console.error(error);
  }
};

const currentDayRevenue = async () => {
  try {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const result = await orderCollection.aggregate([
      { $match: { orderDate: { $gte: yesterday, $lt: today } } },
      { $group: { _id: "", totalRevenue: { $sum: "$grandTotalcost" } } },
    ]);
    return result.length > 0 ? result[0].totalRevenue : 0;
  } catch (error) {
    console.error(error);
  }
};

const fourteenDaysRevenue = async (filter) => {
  try {
    let startDate;
    switch (filter) {
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "2-week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        break;
      case "last-month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "last-year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        //if there is any filter is not this will return
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
    }
    const result = await orderCollection.aggregate([
      { $match: { orderStatus: "delivered", orderDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          dailyRevenue: { $sum: "$grandTotalcost" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 14,
      },
    ]);
    return {
      date: result.map((v) => v._id),
      revenue: result.map((v) => v.dailyRevenue),
    };
  } catch (error) {
    console.error(error);
  }
};

const totalRevenue = async () => {
  try {
    const result = await orderCollection.find({
      paymentId: {
        $ne: null,
        $ne: "payment pending",
      },
    });

    return {
      revenue: result.reduce((acc, curr) => (acc += curr.grandTotalcost), 0),
    };
  } catch (error) {
    console.error(error);
  }
};

const monthlyRevenue = async () => {
  try {
    const today = new Date();
    const lastmonth = new Date();
    lastmonth.setDate(today.getDate() - 28);

    const result = await orderCollection.aggregate([
      { $match: { orderDate: { $gte: lastmonth, $lt: today } } },
      { $group: { _id: "", MonthlyRevenue: { $sum: "$grandTotalcost" } } },
    ]);
    return result.length > 0 ? result[0].MonthlyRevenue : 0;
  } catch (error) {
    console.error(error);
  }
};

const categoryWiseRevenue = async (filter) => {
  try {
    let startDate;
    switch (filter) {
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "2-week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        break;
      case "last-month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "last-year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        //if there is any filter is not this will return
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
    }
    const result = await orderCollection.aggregate([
      { $match: { orderStatus: "delivered", orderDate: { $gte: startDate } } },
      { $unwind: "$cartData" },
      {
        $group: {
          _id: "$cartData.productId.category",
          revenuePerCategory: { $sum: "$cartData.totalCostPerProduct" },
        },
      },
    ]);

    let categoryData = await categoryCollection.find();

    if (!categoryData || categoryData.length === 0) {
      throw new Error("No category data found");
    }

    let finalData = {
      categoryName: result.map((v) => {
        let match = categoryData.find((catVal) => catVal._id == v._id);
        return match ? match.categoryName : "Unknown Category";
      }),
      revenuePerCategory: result.map((v) => v.revenuePerCategory),
    };

    console.log("CategoryWise Revenue", finalData);
    return finalData;
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error to be handled by the caller
  }
};

const activeUsers = async () => {
  try {
    return await usersModel.find({ isBlocked: false }).count();
  } catch (error) {
    console.log("Something Went wrong in the activeUSers", error);
  }
};

module.exports = {
  productsCount,
  categoryCount,
  pendingOrders,
  completedOrdersCount,
  currentDayRevenue,
  fourteenDaysRevenue,
  categoryWiseRevenue,
  totalRevenue,
  monthlyRevenue,
  activeUsers,
};
