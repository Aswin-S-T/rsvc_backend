const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/owner");

router.use(function (req, res, next) {
  next();
});

// get property details
router.get("/landing-page", ownerController.getLandingPageInfo);

router.get("/listing-info/:id", ownerController.getEditListingInfo);

router.get("/general-details/:id", ownerController.getGeneralDetailsInfo);

router.get("/additional-details/:id", ownerController.getPropertyAdditionalDetails);

module.exports = router;
