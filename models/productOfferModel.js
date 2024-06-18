const mongoose = require("mongoose");

const productOfferSchema= new mongoose.Schema({
  productId: { type: mongoose.Types.ObjectId, required: true, ref:'products' },
  productName: { type: String, required: true},
  productOfferPercentage: { type: Number, min: 5, max: 90, required: true},
  startDate: { type: Date, required: true, default: new Date().toLocaleString() },
  endDate: { type: Date, required: true },
  currentStatus: { type: Boolean, default: true }
},{ timestamps: true})

const productOfferModel = mongoose.model('productOffer',productOfferSchema);

module.exports = productOfferModel