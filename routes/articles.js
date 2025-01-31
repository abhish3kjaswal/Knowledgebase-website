const express = require("express");
const router = express.Router();

//bring in Article model
let Article = require("../models/article");
//bring in Article model
let User = require("../models/user");

// ADD  rout article Edit article/edit/id
router.get("/edit/:id", ensureAuthenticated , function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if(article.author != req.user._id){
      req.flash("danger","not Authorized");
      res.redirect("/");
    }
    else{

    res.render("edit_article", {
      title: "Edit Title",
      article: article
    });

}
  });
});

// to update article
router.post("/edit/:id", function(req, res) {

  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {
    _id: req.params.id
  };

  Article.update(query, article, function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated');
      res.redirect("/");
    }
  });

});

// delete
router.delete('/:id', function(req, res) {
  if(!req.user._id){
    res.status(500).send();
  }
  let query = {_id: req.params.id
  };
Article.findById(req.params.id,function(err,article){
  if(article.author != req.user._id){
    res.status(500).send();
  }
  else{
    Article.remove(query, function(err) {
      if (err) {
        console.log(err);
      }
      req.flash('danger', 'Article deleted');
      res.send('success');
    });
  }
});

});

//add route
router.get("/add",ensureAuthenticated, function(req, res) {

  res.render("add_article", {
    title: 'Add article'
  });
});

//add submit post request

router.post("/add", function(req, res) {
  req.checkBody('title', 'Title is required').notEmpty();
  // req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'body is required').notEmpty();

  //get errors

  let errors = req.validationErrors();
  if (errors) {
    res.render("add_article", {
      title: 'Add article',
      errors: errors
    });
  } else {
    let article = new Article();

    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added');
        res.redirect("/");
      }
    });
  }
});

//get single articles article/id
router.get("/:id", function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    User.findById(article.author,function(err,user){
      res.render("article", {
        article: article,
        author: user.name
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

module.exports = router;
