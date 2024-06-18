const mongoose= require('mongoose')

const adminSchema= new mongoose.Schema({
    email: String,
    password: String
})

const adminCollections = mongoose.model('admins',adminSchema);

module.exports = adminCollections;