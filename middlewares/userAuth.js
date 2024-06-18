module.exports = function(req,res,next){
  try {
    if(req.session.isLogged){
      next();
    }else{
      res.redirect("/views/users/login");
    }
  } catch (error) {
    console.log("Something went wrong",error);
  }
}