const paypal = require("paypal-rest-sdk");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");

const { PAYPAL_MODE, PAYPAL_CLIENT_KEY, PAYPAL_SECRET_KEY } = process.env;

paypal.configure({
  mode: PAYPAL_MODE,
  client_id: PAYPAL_CLIENT_KEY,
  client_secret: PAYPAL_SECRET_KEY,
});

const onlinePayments = async (req, res) => {
  console.log("Starting onlinePayments function");
  console.log("req.session.userInfo details:", req.session.userInfo);
  req.session.presentOrderData = req.body;
  const total = req.query.total;
  console.log("Total amount:", typeof total);
  console.log("Total amount:", total);

  try {
    console.log("Creating payment JSON");
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:3000/paymentDone",
        cancel_url: "http://localhost:3000/checkout",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Book",
                sku: "001",
                price: total,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: total,
          },
          description: "Payment done Through Online",
        },
      ],
    };

    console.log("Payment JSON created:", create_payment_json);

    paypal.payment.create(create_payment_json, function (err, payment) {
      if (err) {
        console.error("PayPal payment creation error:", err);
        res.status(500).send("Error processing payment.");
      } else {
        console.log("Payment created successfully:", payment);
        req.session.paymentId = payment.id;
        console.log("Payment ID saved in session:", req.session.paymentId);

        for (let i = 0; i < payment.links.length; i++) {
          console.log("Processing payment link:", payment.links[i]);
          if (payment.links[i].rel === "approval_url") {
            console.log("Approval URL found:", payment.links[i].href);
            // res.redirect(payment.links[i].href);
            res.send({ url: payment.links[i].href });
            return;
          }
        }
        res.status(500).send("No approval URL found in PayPal response.");
      }
    });
  } catch (error) {
    console.error(
      "Something went wrong during the online payment process:",
      error
    );
    res.status(500).send("Internal Server Error");
  }
};

async function wholeTotal(req) {
  try {
    let usersCartData = await cartModel
      .find({ userId: req.session.userInfo?._id })
      .populate("productId");
    let wholeTotal = 0;
    console.log(usersCartData);
    for (const k of usersCartData) {
      wholeTotal += k.productId.price * k.productQuantity;
      await cartModel.updateOne(
        { _id: k._id },
        { $set: { totalCostPerProduct: k.productId.price * k.productQuantity } }
      );
    }

    usersCartData = await cartModel
      .find({ userId: req.session.userInfo._id })
      .populate("productId");
    req.session.wholeTotal = wholeTotal;
    return JSON.parse(JSON.stringify(usersCartData));
  } catch (error) {
    console.log("Something Went Wrong in wholetotal", error);
  }
}

const paymentDone = async (req, res) => {
  try {
    console.log(
      "............this the data is coming from the post order method input's..........",
      req.session.presentOrderData
    );
    let addressData = await addressModel
      .findOne({ _id: req.session.presentOrderData.address })
      .populate("addressModel");
    if (!req.session.currentOrder) {
      const tempOrder = {
        userId: req.session.userInfo._id,
        orderNumber: Math.floor(Math.random() * (10000 - 100 + 1)) + 100,
        orderDate: new Date(),
        addressChoosen: JSON.parse(JSON.stringify(addressData)),
        couponOffers: req.session.presentOrderData.couponOffers,
        cartData: await wholeTotal(req),
        grandTotalCost: req.session.presentOrderData.presentTotal,
      };

      req.session.currentOrder = await orderModel.create(tempOrder);
    }
    // if(discountAmount){
    //   await orderModel.findByIdAndUpdate({_id:req.session.currentOrder._id},{$set:{totalCouponDeduction:discountAmount}})
    // }

    console.log(req.session.currentOrder);
    let checkCart = await cartModel.find({ userId: req.session.userInfo._id });

    if (checkCart.length >= 0) {
      //for paypal
      // if(req.body.paymentMethod==COD)
      let aa = await orderModel.updateOne(
        { _id: req.session.currentOrder._id },
        {
          $set: {
            paymentId: req.session.paymentId,
            paymentType: "Paypal",
            comments: req.session.presentOrderData.comments,
            grandTotalcost: req.session.presentOrderData.presentTotal,
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
      // let k = await cartModel
      //   .findByIdAndUpdate({ _id: req.session.currentOrder._id })
      //   .populate("productId");
      let currentOrderData = await orderModel.findOne({
        _id: req.session.currentOrder._id,
      });
      res.render("users/paymentDone", {
        islogin: req.session.isLogged,
        paymentId: req.session.paymentId,
        currentOrderData,
      });
      await cartModel.deleteMany({ userId: req.session.userInfo._id });
    }
  } catch (error) {
    console.log("something went wrong payment done", error);
  }
};

module.exports = { onlinePayments, paymentDone };
