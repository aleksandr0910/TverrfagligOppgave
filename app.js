if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const localStrategy = require("passport-local");

const dotenv = require("dotenv");

const session = require("express-session");
const { stringify } = require("querystring");

const mongoose = require('mongoose');

const passportLocalMongoose = require("passport-local-mongoose");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/test'); 

const userSchema = new mongoose.Schema ({
    
  email: String,
  password: String,
 
})

userSchema.plugin(passportLocalMongoose, {usernameField:"email"})

const User = mongoose.model('user', userSchema);

const authenticateUser = async (email, password, done) => {
  const user = await User.findOne({email})
  if (user == null) {
    return done(null, false, { message: "no user like that exists" });
  }
  try {
    console.log(password, user)
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Wrong password" });
    }
  } catch (e) {
    return done(e);
  }
};

//passport.use(new localStrategy({ usernameField: "email" }, authenticateUser));
//passport.serializeUser((user, done) => {
//done(null, user._id);
//});
//passport.deserializeUser((_id, done) => {done(null, User.findOne({_id}))});

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const person = new User({ name: 'aleks' });
person.save().then(() => console.log('hello'));


app.get("/", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
  res.render("login", {
      message:req.session.messages
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true
  })
);

app.get("/register", function (req, res) {
  res.render("register");
});
app.get("")
app.post("/register", async (req, res) => {
  User.register(new User({email:req.body.email}), req.body.password , function(err,User){
    if(err){console.log(err); res.redirect("/register")}
    else{
      //A new user was saved
      console.log(User + "2");
      passport.authenticate("local")(req,res,function(){
        res.redirect("/login")
      })
    }
  })
})
app.listen(3000, function () {
  console.log("Port started");
});
