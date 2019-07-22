const express = require("express");
const path = require("path");
const bodyparser= require("body-parser");
const mongoose = require("mongoose");
var expressValidator= require("express-validator");
const flash = require("connect-flash");
const session= require("express-session");
const config = require("./config/database");
const passport= require("passport");


mongoose.connect(config.database);
let db = mongoose.connection;


//check connection
db.once('open', function() {
  console.log("successfully connected to db");
});

//check for db errors
db.on('error', function() {
  console.log(err);
});

//init app
const app = express();

//bring in models
let Article = require("./models/article");
let User = require("./models/user");

//load engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



// bodyparser middleware
app.use(bodyparser.urlencoded({extended:false}));


//add public folder
app.use(express.static(path.join(__dirname,'public')));

// express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express expressValidator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//
app.get('*',function(req,res,next){
  res.locals.user =req.user || null;
  next();
});

// home route
app.get("/", function(req, res) {
  Article.find({}, function(err,articles) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: 'Articles',
        articles: articles
      });
    }
  });
});


//route file
let articles= require('./routes/articles');
let users= require("./routes/users");

app.use("/articles",articles);
app.use("/users",users);

//listen start server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
