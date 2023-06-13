if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const request = require("request");
const bodyParser = require("body-parser");
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];
app.set("view-engine", "ejs");
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("index.ejs");
});

app.get("/products", (req, res) => {
  res.render("products.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/dashboard", checkAuthenticated, (req, res) => {
  res.render("dashboard.ejs", {
    name: req.user.name,
    email: req.user.email,
  });
});
app.get("/request", checkAuthenticated, (req, res) => {
  res.render("request.ejs", {
    name: req.user.name,
    email: req.user.email,
  });
});
app.get("/request-business", checkAuthenticated, (req, res) => {
  res.render("request-business.ejs", {
    name: req.user.name,
    email: req.user.email,
  });
});
app.get("/request-scheme", checkAuthenticated, (req, res) => {
  res.render("request-scheme.ejs", {
    name: req.user.name,
    email: req.user.email,
  });
});
app.get("/request-civil-servant", checkAuthenticated, (req, res) => {
  res.render("request-civil-servant.ejs", {
    name: req.user.name,
    email: req.user.email,
  });
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
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
});

app.delete("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000, () => {
  console.log(
    "Live Server Started at localhost:3000 Developed By ahmadulkawnine"
  );
});
