const multer= require('multer')
const path= require('node:path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/img/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix+ path.extname(file.originalname))
  }
})
console.log("coming here in multer");

const upload = multer({ storage })

module.exports= upload 