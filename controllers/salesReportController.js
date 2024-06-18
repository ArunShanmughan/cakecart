const orderData = require("../models/orderModel");
const userData = require("../models/userDB");
const formatDate = require("../services/formatDate");
// const getSalesData = require("../services/salesData")
const exceljs = require("exceljs");
const fs = require("fs");
const puppeteer = require("puppeteer");

const getSalesReport = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = 10;
    let skip = (page - 1) * limit;

    let count = await orderData.countDocuments({ isListed: true });
    if (req.session?.admin?.salesData) {
      let { salesData, dateValues } = req.session.admin;
      console.log("this is true and the data send according to the session");
      return res.render("admin/salesReport", {
        salesData,
        dateValues,
        page,
        limit,
        skip,
      });
    }

    let salesData = await orderData
      .find({ orderStatus: "delivered" })
      .sort({ orderDate: -1 })
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        as: "productDetails",
      })
      .populate("couponOffers")
      .skip(skip)
      .limit(limit);
    console.log("this is salesdata ->", salesData);
    salesData.forEach((order) => {
      order.cartData.forEach((item) => {
        console.log("Product Details: ", item.productDetails);
      });
    });
    console.log("this is salesdata ->");
    console.log("this is salesdata.cartData ->");
    console.log("this is Count ->", count);
    console.log("this is limt ->", limit);
    res.render("admin/salesReport", {
      salesData,
      dateValues: null,
      count,
      limit,
      page,
    });
  } catch (error) {
    console.error(error);
  }
};

const postSalesDateFilter = async (req, res) => {
  try {
    console.log("this is the req.body in postSalesDateFilter", req.body);
    let { dateFrom, dateTo } = req.body;
    console.log(dateFrom);
    console.log(dateTo);
    let salesDateFilter = await orderData
      .find({
        orderDate: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
        orderStatus: "delivered",
      })
      .populate("userId");

    console.log("this is the date filtered data", salesDateFilter);

    let salesData = salesDateFilter.map((k) => {
      k.orderDateFormatted = formatDate(k.orderDate);
      return k;
    });

    console.log("salesDate after mapping", salesData);

    req.session.admin = {};
    req.session.admin.dateValues = req.body;
    req.session.admin.salesData = JSON.parse(JSON.stringify(salesData));
    console.log(
      "this is the session for seeing the date values passed",
      req.session.admin.dateValues
    );
    console.log(
      "this session is to check the values passed after filtering the data",
      req.session.admin.salesData
    );
    res.send({ success: true });
  } catch (error) {
    console.log("something went wrong", error);
  }
};

const salesReportPdfDownload = async (req, res) => {
  try {
    console.log(req.query);
    let startDate, endDate;
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    }
    //need to comeplte from here

    const salesData = await orderData
      .find({
        orderDate: { $gte: startDate, $lte: endDate },
        orderStatus: "delivered",
      })
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        as: "productDetails",
      })
      .populate("couponOffers");

    console.log(salesData);
    const browser = await puppeteer.launch({ channel: "chrome" });
    const page = await browser.newPage();

    let pdfWholeTotal = 0;
    for (let i = 0; i < salesData.length; i++) {
      pdfWholeTotal += salesData[i].grandTotalcost;
    }

    let htmlContent = `
      <h1 style="text-align: center;">Sales Report</h1>
      <h5>FromDate</h5>:<span>${startDate.toDateString()}</span>
      <h5>To</h5>:<span>${endDate.toDateString()}</span>
      <h3>Total Sales</h3>  <h4>${
        salesData.length
      }</h4>  <h3>Total Amount</h3> <h4>  $ ${pdfWholeTotal}</h4>
      <table style="width:100%; border-collapse: collapse;" border="1">
          <tr>
          <th>Order Number</th>
          <th>UserName</th>
          <th>Order Date</th>
          <th>Products</th>
          <th>Quantity</th>
          <th>Payment Method</th>
          <th>Status</th>
          <th>Coupons</th>
          <th>Total Cost</th>
          </tr>`;

    salesData.forEach((order) => {
      htmlContent += `
          <tr>
          <td>${order.orderNumber}</td>
          <td>${order.userId.fName}</td>
          <td>${formatDate(order.orderDate)}</td>
          <td>${order.cartData
            .map((item) => item.productId.productName)
            .join(", ")}</td>
          <td>${order.cartData
            .map((item) => item.productQuantity)
            .join(", ")}</td>
          <td>${order.paymentType}</td>
          <td>${order.orderStatus}</td>
          <td>${order.couponOffers ? order.couponOffers.couponCode : "Nil"}</td>
          <td>${order.grandTotalcost}</td>
          </tr>`;
    });
    htmlContent += `</table>`;

    await page.setContent(htmlContent);
    console.log(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4", timeout: 60000 });

    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salesReport.pdf"
    );

    res.send(pdfBuffer);
    console.log("cccccccccccccccccccccccccccccccc");
    await browser.close();
  } catch (error) {
    console.log("Somethng went wrong in downloading pdf", error);
  }
};

const salesReportExcelDownload = async (req, res) => {
  try {
    const workBook = new exceljs.Workbook();
    const sheet = workBook.addWorksheet("book");

    sheet.columns = [
      { header: "Order No", key: "no", width: 10 },
      { header: "Name", key: "username", width: 25 },
      { header: "Order Date", key: "orderDate", width: 25 },
      { header: "Products", key: "products", width: 35 },
      { header: "No of items", key: "noOfItems", width: 35 },
      { header: "productPrice", key: "productPrice", width: 35 },
      {
        header: "Final price after offer(if Applied)",
        key: "totalCost",
        width: 50,
      },
      { header: "Payment Method", key: "paymentMethod", width: 25 },
      { header: "Status", key: "status", width: 20 },
    ];

    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      startDate = new Date(0);
      endDate = new Date();
    }

    const salesData = await orderData
      .find({
        orderDate: { $gte: startDate, $lte: endDate },
        orderStatus: "delivered",
      })
      .populate("userId")
      .populate({
        path: "cartData.productId",
        model: "products",
        as: "productDetails",
      })
      .populate("couponOffers");

    console.log(salesData);

    salesData.forEach((order) => {
      sheet.addRow({
        no: order.orderNumber,
        username: order.userId.fName,
        orderDate: order.orderDate,
        products: order.cartData.map((i) => i.productId.productName).join(", "),
        noOfItems: order.cartData.map((i) => i.productQuantity).join(", "),
        productPrice: order.cartData.map((i) => i.productId.price).join(", "),
        totalCost: "$" + order.grandTotalcost,
        paymentMethod: order.paymentType,
        status: order.orderStatus,
      });
    });

    const totalOrder = salesData.length;
    const totalSales = salesData.reduce(
      (total, sale) => total + sale.grandTotalcost,
      0
    );

    const totalDiscount = salesData.reduce((total, sale) => {
      let discountAmount = sale.cartData.reduce((discount, cartItem) => {
        let productPrice = cartItem.productId.price;
        let priceBeforeOffer = cartItem.productId.priceBeforeOffer;
        let discountPercentage = cartItem.productId.productOfferPercentage || 0;
        let actualAmount = productPrice * cartItem.productQuantity;
        let paidAmount =
          actualAmount - (actualAmount * discountPercentage) / 100;
        return discount + (actualAmount - paidAmount);
      }, 0);
      return total + discountAmount;
    }, 0);

    sheet.addRow({});
    sheet.addRow({ "Total Orders": totalOrder });
    sheet.addRow({ "Total Sales": "₹" + totalSales });
    sheet.addRow({ "Total Discount": "₹" + totalDiscount });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salesReport.xlsx"
    );

    await workBook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log("Something went wrong in excel downloading",error);
  }
};

module.exports = {
  getSalesReport,
  postSalesDateFilter,
  salesReportPdfDownload,
  salesReportExcelDownload,
};
