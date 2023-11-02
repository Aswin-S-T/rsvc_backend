const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property");

router.use(function (req, res, next) {
  next();
});

// get property details
router.get("/:id", propertyController.getPropertyDetails);

router.post("/add-edit-listing", propertyController.addNewProperty);

router.post("/edit-general-details", propertyController.addPropertyGeneralDetails);

router.post("/edit-additional-details", propertyController.addPropertyAdditionalDetails);

module.exports = router;
