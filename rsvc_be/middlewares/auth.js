const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Middleware that routes each request
router.use(function (req, res, next) {
  let token = req.cookies.token;
  if (token) {
    // Checks if the user is logged in
    jwt.verify(token, config.jwt.secret, function (err, decod) {
      if (err) {
        res.redirect('/login');
      } else {
        req.decoded = decod;
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
});
module.exports = router;
