// Requiring path to so we can use relative routes to our HTML files
const express = require("express");
const buildUserInfo = require("../middleware/getUserInfo");
const userController = require("../controllers/user");
const formatRepoNames = require("../middleware/formatRepoNames");

// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.get("/", function(req, res) {
  res.render("index", { user: req.user });
});

router.get("/login", function(req, res) {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.render("login", { script: "/js/login.js" });
});

router.get("/signup", function(req, res) {
  if (req.user) {
    return res.redirect("/dashboard");
  }
  res.render("signup", { script: "/js/signup.js" });
});

router.get("/dashboard", isAuthenticated, buildUserInfo, function(req, res) {
  req.userData.repos = formatRepoNames(req.userData.repos);
  return res.render("dashboard", {
    ...req.userData,
    layout: "main",
    script: "/js/dashboard.js"
  });
});

router.get("/:username", function(req, res) {
  // determine layout and render layout with req.userData
  userController.getIncludedRepos(req.params.username).then(userData => {
    if (!userData) {
      return res.sendStatus(404);
    }
    userData = userData.toJSON();
    userData.Repos = formatRepoNames(userData.Repos);

    res.render(userData.layout, {
      ...userData,
      layout: "public"
    });
  });
});

module.exports = router;
