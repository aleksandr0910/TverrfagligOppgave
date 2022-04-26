if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const users = [];
const passport = require("passport");

const localStrategy = require("passport-local");

const dotenv = require("dotenv");

const flash = require("express-flash");
const session = require("express-session");


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
  })
);

const authenticateUSer = async (email, password, done) => {
  const user = users.find(user => user.email === email)
  if (user == null) {
    return done(null, false, { message: "no user like that exists" });
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Wrong password" });
    }
  } catch (e) {
    return done(e);
  }
};
passport.use(new localStrategy({ usernameField: "email" }, authenticateUSer));
passport.serializeUser((user, done) => {
  done(user.id);
});
passport.deserializeUser((id, done) => {done(users.find((user => user.id === id)))});

app.use(passport.initialize());
app.use(passport.session());

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
    failureFlash: true,
    failureMessage: true
  })
);

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); 
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

app.listen(3000, function () {
  console.log("Port started");
});
