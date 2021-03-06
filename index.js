const express = require("express");
const app = express();
//const lovecounter = require ("./love-counter")
//const expresshandlebars = require('express-handlebars');
const cors = require('cors');
//import { engine } from 'express-handlebars';
//const users = require('./users');
const passport = require("passport");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const initializePassport = require("./passportConfig");
var path = require('path');
//const handlebarSetup = expresshandlebars ({
  //partialsDir: "./views/partials",
  //viewPath: './views',
  //layoutsDir: './views/layouts'
//});
initializePassport(passport);
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "static")));
app.use(express.urlencoded({ extended: false }));
//app.engine('handlebars', engine.expresshandlebars);
//app.engine('handlebars', handlebarSetup);
//app.set('view engine', '');
//app.set('views', './views');

app.set('view engine', 'ejs');
app.use(cors());
app.use(
    session({
      // Key we want to keep secret which will encrypt all of our information
      secret:'secret',
      // Should we resave our session variables if nothing has changes which we dont
      resave: false,
      // Save empty value if there is no vaue which we do not want to do
      saveUninitialized: false
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
app.get("/", (req, res) => {
    res.render("index");
  });
 

app.get("/users/register", checkAuthenticated, (req, res) => {
     res.render("register");
});


  app.get("/users/login", checkAuthenticated, (req, res) => {
    // flash sets a messages variable. passport sets the error message
    //console.log(req.session.flash.error);
    res.render("login");
  });
  
  app.get("/users/home", (req, res) => {
    //console.log(req.isAuthenticated());
    res.render("home", { user:req.user.name });
  });
  app.get("/users/logout", (req, res) => {
    //req.logout();
  //res.render("index", { message: "You have logged out successfully" });
    req.logOut(req.user, err => {
        if (err) return next(err);
        res.redirect("/users/login");
    });
    //req.flash("success_msg", "You have logged out successfully");
    //res.redirect("/users/login");
  });
  app.post("/users/register", checkAuthenticated, async (req, res) => {
    let { name, email, password, password2 } = req.body;
  
    let errors = [];
  
    console.log({
      name,
      email,
      password,
      password2
    });
    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
      }
    
      if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
      }
    
      if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
      }
    
      if (errors.length > 0) {
        res.render("register", { errors, name, email, password, password2 });
      } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // Validation passed
        pool.query(
          `SELECT * FROM users
            WHERE email = $1`,
          [email],
          (err, results) => {
            if (err) {
              throw err;
            }
            console.log(results.rows);
    
            if (results.rows.length > 0) {
             errors.push({message: "Email already registered" });
             res.render("register", {errors });
                
            
            } else {
              pool.query(
               `INSERT INTO users (name, email, password)
                    VALUES ($1, $2, $3)
                    RETURNING id, password`,
                [name, email, hashedPassword],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
                  console.log(results.rows);
                  req.flash("success_msg", "You are now registered. Please log in");
                  res.redirect("/users/login");
                }
              );
            }
          }
        );
      }
});

app.post(
    "/users/login",
    passport.authenticate("local", {
      successRedirect: "/users/home",
      failureRedirect: "/users/login",
      failureFlash: true
    })
  );

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/home");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
