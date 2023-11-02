const { Op } = require("sequelize");

const propertyService = require("../services/properties");
const floorService = require("../services/floors");
const apartmentService = require("../services/apartments");
const addressService = require("../services/addresses");
const sailRecordService = require("../services/sailRecords");
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
    let user = req?.decoded?.data?.UserName;
    if (user) {
      // We will have to replace the finone by findmany below in the future and provide proper where clause
      let properties = await propertyService.findMany(() => [{ where: { Owner: user } }]);

      // Get the count of agents
      let agentCount = 0;
      properties.reduce((prv, crr) => {
        if (!prv?.[crr.Agent1]) {
          agentCount++;
        }
        if (!prv?.[crr.Agent2]) {
          agentCount++;
        }
        return { ...prv, [crr.Agent1]: 1, [crr.Agent2]: 1 };
      }, {});

      // Get the count of units sold
      let sailCount = 0;
      for (let property of properties) {
        sailCount += await sailRecordService.countRecords(() => [{ where: { Property: property.PropertyID, SailStatus: "sold" } }]);
      }

      // Get the count of propspective buyers
      let buyers = {};
      for (let property of properties) {
        let apartmentsUnderOption = await sailRecordService.findMany(() => [
          { where: { Property: property.PropertyID, SailStatus: "under option" } },
        ]);
        apartmentsUnderOption.forEach((record) => (buyers[record.Buyer] = 1));
      }
      let prospectiveBuyerCount = Object.keys(buyers)?.length ?? 0;

      // Get property address
      for (let property of properties) {
        let address = await addressService.findOne(() => [{ where: { AddressID: property.Address } }]);
        property.Address = `${address.AddressLine2}, ${address.Area}`;
      }

      res.send({
        agentCount,
        sailCount,
        prospectiveBuyerCount,
        properties: properties.map((property) => ({
          propertyName: property.PropertyName,
          propertyId: property.PropertyID,
          address: property.Address,
        })),
      });
    } else {
      res.status(403).send("Unauthorised access");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

/**
 * Function to fetch the properties list
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.getEditListingInfo = async (req, res, next) => {
  try {
    let property = await propertyService.findOne(() => [{ where: { PropertyID: req.params?.id } }]);

    // Get all image links
    let images = await imagesService.findMany(() => [
      { where: { [Op.or]: [{ LinkedTo: property?.PropertyID }, { ImageID: property?.ThumbnailImage }, { ImageID: property?.MainImage }] } },
    ]);
    let thumbnailImage = await imagesService.findOne(() => [{ where: { ImageID: property?.ThumbnailImage } }]);
    let mainImage = await imagesService.findOne(() => [{ where: { ImageID: property?.MainImage } }]);

    // Get the property address
    let address = await addressService.findOne(() => [{ where: { AddressID: property.Address } }]);

    // Get the floors
    let floors = await floorService.findMany(() => [{ where: { Property: property.PropertyID } }]);

    // Get the image links inside each floor
    for (let floor of floors) {
      if (floor.LayoutImage) {
        let image = await imagesService.findOne(() => [{ ImageID: floor.LayoutImage }]);
        floor.LayoutImage = image;
      }
    }

    res.send({
      propertyName: property.PropertyName,
      propertyId: property.PropertyID,
      images,
      thumbnailImage,
      mainImage,
      address,
      floors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

/**
 * Function to fetch the properties general info
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.getGeneralDetailsInfo = async (req, res, next) => {
  try {
    let property = await propertyService.findOne(() => [{ where: { PropertyID: req.params?.id } }]);

    // Get the floors
    let floors = await floorService.findMany(() => [{ where: { Property: property.PropertyID } }]);

    // Get the apartments inside each floor
    for (let floor of floors) {
      let apartments = await apartmentService.findMany(() => [{ where: { Floor: floor.FloorID } }]);
      // Iterate through apartment and get the image links and the amenities
      for (let apartment of apartments) {
        // Get the image link
        if (apartment.Image) {
          let image = await imagesService.findOne(() => [{ ImageID: apartment.Image }]);
          apartment.Image = image;
        }

        // Get the amenities
        let amenities = await amenityService.findMany(() => [{ where: { ReferenceID: apartment.ApartmentID } }]);
        // Get the image links inside each amenity
        for (let amenity of amenities) {
          if (amenity.Image) {
            let image = await imagesService.findOne(() => [{ ImageID: amenity.Image }]);
            amenity.Image = image;
          }
        }
        apartment.amenities = amenities;
      }

      floor.apartments = apartments;
    }

    res.send({
      propertyId: property.PropertyID,
      floors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

/**
 * Function to fetch the properties additional details
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.getPropertyAdditionalDetails = async (req, res, next) => {
  try {
    // We will have to replace the finone by findmany below in the future and provide proper where clause
    let property = await propertyService.findOne(() => [{ where: { PropertyID: req.params?.id } }]);
    // Get the property details
    let details = await structuralDetailsService.findOne(() => [{ where: { DetailsID: property.Details } }]);
    // Get the amenities of the property
    let amenities = await amenityService.findMany(() => [{ where: { ReferenceID: property.PropertyID } }]);

    res.send({
      propertyName: property.PropertyName,
      propertyId: property.PropertyID,
      description: details.Description,
      amenities,
      ...details,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
