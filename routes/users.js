const express = require("express");
const router = express.Router();
const bcrypt= require("bcryptjs");
const passport= require("passport");

//bring in user model
let User = require("../models/user");
let Article = require("../models/article");

// register form
router.get("/register",function(req,res){
res.render("register");
});

//register post processes
router.post("/register",function(req,res){
  const name= req.body.name;
  const email= req.body.email;
  const username= req.body.username;
  const password= req.body.password;
  const password2= req.body.password2;

  req.checkBody("name","name is required").notEmpty();
  req.checkBody("email","email is required").notEmpty();
  req.checkBody("email","email not valid").isEmail();
  req.checkBody("username","username is required").notEmpty();
  req.checkBody("password","password is required").notEmpty();
  req.checkBody("password2","password do not match").equals(req.body.password);

  let errors= req.validationErrors();
  if(errors){
    res.render("register",{
      errors:errors
    });
  }
  else{
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });
    bcrypt.genSalt(10,function(err,salt){
      bcrypt.hash(newUser.password,salt,function(err,hash){
        if(err){
          console.log(error);
        }
        newUser.password= hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
          }
           else{
             req.flash("success","you are now Registered!! and can login");
             res.redirect("/users/login");
           }
        });
      });

    });
  }

});

//Login form routes

router.get("/login",function(req,res){
  res.render("login");
});

//login process routes
router.post("/login",function(req,res,next){
passport.authenticate('local',{
  successRedirect:"/",
  failureRedirect:"/users/login",
  failureFlash:true
})(req,res,next);

});

//Logout
router.get("/logout",function(req,res){
  req.logout();
  req.flash("success","you are logged out");
  res.redirect("/users/login");
});

//profile routes
router.get("/profile/:id",ensureAuthenticated,function(req,res){
  User.findById(req.params.id,function(err,user){
    res.render("profile",{
      user:user
    });
  });
});
// profile Updated
router.get("/profile/ed_profile/:id",ensureAuthenticated,function(req,res){
User.findById(req.params.id,function(err,user){
  if(! req.user._id){
    req.flash("danger","not Authorized");
    res.redirect("/");
  }
  else{
  res.render("profile_ed_article", {
    title: "Edit Title",
    user: user
  });

}
});
});

router.post("/profile/ed_profile/:id",function(req,res){
  let user ={};
  user.name = req.body.name;
  user.email= req.body.email;

  let query ={
    _id: req.params.id
  }
  User.update(query,user,function(err){
if(err){
  console.log(err);
  return;
}
else{
  req.flash("success","successfully saved");
  res.redirect("/");
}
  });
});

//my articles
router.get("/profile/my_article/:id",ensureAuthenticated,function(req,res){
  User.findById(req.params.id,function(err,user){

    Article.find({author:user.id},function(err,article){
      
      res.render("my_article",{
        user:user,
        articles:article
      });
    });
  });
});

//Access control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash("danger","please login");
    res.redirect("/users/login");
  }
}




module.exports= router;
