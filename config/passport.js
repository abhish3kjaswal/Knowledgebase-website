const LocalStrategy = require('passport-local').Strategy;
const User = require("../models/user");

const config = require("../config/database");
const bcrypt = require("bcryptjs");


module.exports =function(passport){

//Local startegy
passport.use(new LocalStrategy(function(username,password,done){
  //match username
  let query={username:username};
  User.findOne(query,function(err,user){
    if(err) throw err;
    if(!user){
      return done(null, false,{message:"credentials not valid"});
    }

    //match password
    bcrypt.compare(password,user.password,function(err,isMatch){
      if(err) throw err;
      if(isMatch){
        return done(null,user);
      }
      else {
        return done(null, false,{message:"credentials not valid"});
      }
    });

  });
}));

// passport serialize deserializeUser
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
}
