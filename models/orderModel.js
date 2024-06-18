const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserDB",
    },
    orderNumber: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    paymentType: {
      type: String,
      default: "Cash on Delivery",
    },
    orderStatus: {
      type: String,
      required: true,
      default: "Pending",
    },
    returnApproval: {
      type: Boolean,
      default: false,
    },
    addressChoosen: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "addressModel",
    },
    cartData: {
      type: Array,
    },
    grandTotalcost: {
      type: Number,
    },
    paymentId: {
      type: String,
    },
    totalOrders: {
      type: Number,
    },
    totalDiscount: {
      type: Number,
    },
    totalCouponDeduction: {
      type: Number,
    },
    productOffers: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
    couponOffers: { type: mongoose.Schema.Types.ObjectId, ref: "coupons" },
    cancelReason: { type: String, default: null },
    returnReason: { type: String, default: null },
  },
  { timestamps: true }
);

const orderCollection = mongoose.model("orders", orderSchema);

module.exports = orderCollection;
