const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/auth");

router.use(function (req, res, next) {
  next();
});

/**
 * POST Endpoint to process the local login request
 */
router.post("/local", authController.localLogin);

// Facebook Authentication Routes
router.get("/facebook", passport.authenticate("facebook"));

router.get("/facebook/callback", authController.facebookLogin);

// Google Authentication Routes
router.get("/google", passport.authenticate("google"));

router.get("/google/callback", authController.googleLogin);

// google signin using
router.post("/google-signin", authController.googleSignin);

module.exports = router;
