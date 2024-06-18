const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "userDB" },
  productId: { type: mongoose.Types.ObjectId, required: true, ref: "products" },
  wishlist: { type: Boolean, required: true },
});

const wishListCollection = mongoose.model("wishlist", WishlistSchema);

module.exports = wishListCollection;
