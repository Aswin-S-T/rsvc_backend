const { Op } = require("sequelize");

const propertyService = require("../services/properties");
const floorService = require("../services/floors");
const apartmentService = require("../services/apartments");
const amenityService = require("../services/amenities");
const imagesService = require("../services/images");
const structuralDetailsService = require("../services/structuralDetails");

/**
 * Function to fetch the properties list
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 *
 * TBD: We need to update this controller dependin on the future changes
 */
exports.getLandingPageInfo = async (req, res, next) => {
  try {
    // We will have to replace the finone by findmany below in the future and provide proper where clause
    let property = await propertyService.findOne(() => [{}]);
    res.send({
      propertyName: property.PropertyName,
      propertyId: property.PropertyID,
      tagLine: "Lorem Ipsum",
    });
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
};
