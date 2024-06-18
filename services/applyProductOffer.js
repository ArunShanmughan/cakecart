const productCollection = require("../models/productModel");
const productOfferCollection = require("../models/productOfferModel");
// const CategoryOfferModel = require("../models/categoryOfferModel");

module.exports = {
  applyProductOffer: async (from) => {
    try {
      // updating the currentStatus field of productOfferCollection by checking with the current date
      let productOfferData = await productOfferCollection.find();
      productOfferData.forEach(async (v) => {
        let checker = true;
        if(v.endDate>new Date()){
          checker = true
        }else{
          checker = false
        }
        await productOfferCollection.updateOne(
          { _id: v._id },
          {
            set: {
              currentStatus:checker
            },
          }
        );
      });

      let productData = await productCollection.find();
      productData.forEach(async (v) => {
        let offerExists = await productOfferCollection.findOne({
          productId: v._id,
          currentStatus: true,
        });

        if (offerExists) {
          offerExistsAndActiveFn(v, offerExists, from);
        }

        let offerExistsAndInactive = await productOfferCollection.findOne({
          productId: v._id,
          currentStatus: false,
        });

        if (offerExistsAndInactive) {
          offerExistsAndInactiveFn(v, from);
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
};

async function offerExistsAndActiveFn(v, offerExists, from) {
  let { productOfferPercentage } = offerExists;
  if (from == "postNewOffer") {
    console.log("this function is being called for creating a new offer and if it exists in productoffer",v)
    console.log(offerExists)
    let productPrice = Math.round(
      v.price * (1 - productOfferPercentage * 0.01)
    );
    console.log("this is te product price in offerExistsAndActiveFn",productPrice);
    console.log(typeof(productPrice))
    await productCollection.updateOne(
      { _id: v._id },
      {
        $set: {
          priceBeforeOffer: v.price,
          price:productPrice,
          productOfferId: offerExists._id,
          productOfferPercentage:productOfferPercentage,
        },
      }
    );
    console.log("Right after changing in the database for creatimg priceBeforeOfferpercenage",v)
  } else if (from == "putEditOffer" || "landingPage") {
    console.log("This is in edit category offer if the offer doesn't exists",v)
    let productPrice = Math.round(
      v.priceBeforeOffer * (1 - productOfferPercentage * 0.01)
    );
    console.log("this is the product Price",productPrice)
    await productCollection.updateOne(
      { _id: v._id },
      {
        $set: {
          price:productPrice,
          productOfferId: offerExists._id,
          productOfferPercentage:productOfferPercentage,
        },
      }
    );
  }
}

async function offerExistsAndInactiveFn(v, from) {
  console.log("This is coming into the offer exist and inactiv e function which is in the services",v)
  if (from == "putEditOffer" || "landingPage") {
    let productPrice = v.priceBeforeOffer;
    await productCollection.updateOne(
      { _id: v._id },
      {
        $set: {
          productPrice,
          productOfferId: null,
          productOfferPercentage: null,
        },
      }
    );
  }
}