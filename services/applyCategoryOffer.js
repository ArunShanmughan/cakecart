const CategoryOfferModel = require("../models/categoryOfferModel");
const ProductModel = require("../models/productModel");






const applyCategoryOffer = async () => {
    try {
      const today = new Date();
  
      const offers = await CategoryOfferModel.find({ isAvailable: true });
      console.log("this is in the applycategoryoffer function in srvc and all category offermodels->",offers)
      const allProducts = await ProductModel.find();
      console.log("this is in the applycategoryoffer function in srvc and all products->",allProducts)
  
      for (const prod of allProducts) {
        const currentOffer = offers.find(
          (offer) => String(offer.category) === String(prod.category)
        );
  
        if (
          currentOffer &&
          currentOffer.endDate >= today
        ) {
          await ProductModel.findByIdAndUpdate(prod._id, {
            offerPrice: Math.floor(
              prod.price - (prod.price * currentOffer.offerPercentage) / 100
            ),
          });
        } else {
          await ProductModel.findByIdAndUpdate(prod._id, {
            offerPrice: prod.price,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  module.exports = { applyCategoryOffer };