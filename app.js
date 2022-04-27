if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
//Alle requirements, rammeverks funksjoner som jeg har installert
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const localStrategy = require("passport-local");

const dotenv = require("dotenv");

const session = require("express-session");

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
//passport initialisering og session for å 
app.use(passport.initialize());
app.use(passport.session());

//Mongoose for å snakke og kommunisere med mongoDB serveren og sette den opp med koden
mongoose.connect('mongodb://localhost:27017/test'); 

const userSchema = new mongoose.Schema ({
    
  email: String,
  password: String,
 
})

userSchema.plugin(passportLocalMongoose, {usernameField:"email"})

const User = mongoose.model('user', userSchema);

//Lagd en autentiserings funksjon som går gjennom email og passord
//Skjekker om brukeren finnes eller om passordet er feil 
//Bcrypt sammenligner passordet med det lagrede hash passordet
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

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const person = new User({ name: 'aleks' });
person.save().then(() => console.log('hello'));


app.get("/", function (req, res) {
  res.render("index");
});

//Sender feilmelding om logg inn er feil
app.get("/login", function (req, res) {
  res.render("login", {
      message:req.session.messages
  });
});
//Vurderer om passord er feil og om den isåfall skal sende feilmelding
//Er det riktig sendes man til hovedside
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/hovedside",
    failureRedirect: "/login",
    failureMessage: true
  })
);

app.get("/register", function (req, res) {
  res.render("register");
});



//Registrerings funksjon som registrerer dataen som fylles ut og lagrer det i databasen for at brukere skal kunne logge på
//Tar dataen fra email og passord å krever det for å logge inn
app.post("/register", async (req, res) => {
  User.register(new User({email:req.body.email}), req.body.password , function(err,User){
    if(err){console.log(err); res.redirect("/register")}
    else{
    
      console.log(User + "2");
      passport.authenticate("local")(req,res,function(){
        res.redirect("/login")
      })
    }
  })
})
app.get("/hovedside", (req,res)=> {
  res.render("hovedside")
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Port started");
});
