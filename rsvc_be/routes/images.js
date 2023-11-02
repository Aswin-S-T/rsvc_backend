const express = require("express");
const router = express.Router();
const imagesController = require("../controllers/images");

// get property details
// router.get("/:id", imagesController.getPropertyDetails);

router.post("/upload", imagesController.uploadImage);

router.delete("/delete", imagesController.deteleImage);

module.exports = router;
