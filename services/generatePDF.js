const PDFDocument = require("pdfkit");

module.exports = {
  generateInvoice: (dataCallback, endCallback, orderDet) => {
    console.log("coming to this function invoice generating...")
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, orderDet);
    generateBody(doc, orderDet);
    generateFooter(doc);
    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    doc.end();
    console.log("everything over in here generate pdf")
  },
};

function generateHeader(doc) {
  try {
    console.log("generateHeader coming to here too")
    doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Cake Cart", 110, 57)
    .fontSize(10)
    .text("BetaSpace-4thFloor, Desabandhu St., Ramnagar,", 200, 65, {
      align: "right",
    })
    .text(" Coimbatore, TN- 6100025", 200, 80, { align: "right" })
    .moveDown();
  } catch (error) {
    console.log("Something went wrong on generating header invoice downloading",error)
  }
  
}

function generateFooter(doc) {
  try {
    console.log("generateFooter coming to here ")
    doc.fontSize(10).text("Thank You! Shop with us again :)", 50, 750, {
      align: "center",
      width: 500,
    });
  } catch (error) {
    console.log("Something went wrong in the generatefooter in invoice donwloading",error)
  }
}


function generateCustomerInformation(doc, orderData) {
  try {
    console.log("generateCustomerInformation coming to here")
    const addressChoosen = orderData.addressChoosen;

  doc
    .text(`Order Number: ${orderData.orderNumber}`, 50, 100)
    .text(
      `Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}`,
      50,
      115
    )
    .text(`Total Price: ${orderData.grandTotalcost}`, 50, 130)
    .text(
      `Name: ${addressChoosen.firstName} ${addressChoosen.lastName}`,
      300,
      100
    )
    .text(
      `Address: ${addressChoosen.addressLine1} ${addressChoosen.addressLine2} `,
      300,
      115
    )
    .text(`Phone: ${addressChoosen.phone}`, 300, 150)
    .moveDown();
  } catch (error) {
    console.log("Something went wrong in the generatorcustomerinformation",error)
  }
}

function generateBody(doc, orderData) {
  try {
    console.log("generateBody coming to this function..")
    generateHr(doc, 90);

  doc.fontSize(15).text("Invoice", 210, 170);

  doc.font("Helvetica-Bold").fontSize(14).text("Product", 50, 240);
  doc.text("Quantity", 250, 240);
  doc.text("Price", 350, 240, { width: 100, align: "right" });

  doc.moveDown();
  generateHr(doc, 260);

  orderData.cartData.forEach((v, i) => {
    doc.fontSize(10).text(v.productId.productName, 50, 260 + (i + 1) * 20);
    doc.text(v.productQuantity.toString(), 250, 260 + (i + 1) * 20);
    doc.text('Rs.'+v.totalCostPerProduct, 350, 260 + (i + 1) * 20, {
      width: 100,
      align: "right",
    });

    if (i !== orderData.cartData.length - 1) {
      doc.moveDown();
    }
  });

  generateHr(doc, doc.y);
  doc.moveDown();

  doc
    .fontSize(14)
    .text(`Total Price: ${'Rs.'+orderData.grandTotalcost}`, 350, doc.y);
  } catch (error) {
    console.log("Something went wrong in the generate body in invoice downloading..",error)
  }
}

function generateHr(doc, y) {
  try {
    console.log("generateHr coming to this function")
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  } catch (error) {
    console.log("Something went wrong in the generator hr in invoice downloading",error)
  }
}