
module.exports = function(req,res,next){
  try {
    if(req.session.adminLogged){
      next()
    }else{
      res.redirect("/admin");
    }
  } catch (error) {
    console.log("Something went wrong",error);
  }
}