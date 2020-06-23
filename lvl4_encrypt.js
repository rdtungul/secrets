//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


// session for express required session
app.use(session({
  secret: "This is a secret",
  resave: false,
  saveUninitialized: false
}));

// initialized and session the required passport
app.use(passport.initialize());
app.use(passport.session());


// // database connection
mongoose.connect("mongodb://localhost:27017/userDB", { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// plugin mongoose that will use to hash and salt passwords
userSchema.plugin(passportLocalMongoose);

// this is for password encryption
const User = new mongoose.model("User", userSchema);

// passport use for serialize and deserialize user auth.
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// these are the route for the link pages
app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout(); // this is a logout session
  res.redirect("/");
});


// this is for the registration route
app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


// this is for the login route
app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});




//Testing the connection if it is connected to the server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
