const { Op } = require("sequelize");

const propertyService = require("../services/properties");
const floorService = require("../services/floors");
const apartmentService = require("../services/apartments");
const addressService = require("../services/addresses");
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
exports.getPropertyDetails = async (req, res, next) => {
  try {
    // We will have to replace the finone by findmany below in the future and provide proper where clause
    let property = await propertyService.findOne(() => [{ where: { PropertyID: req.params?.id } }]);

    // Get all image links
    let images = await imagesService.findMany(() => [
      { where: { [Op.or]: [{ LinkedTo: property?.PropertyID }, { ImageID: property?.ThumbnailImage }, { ImageID: property?.MainImage }] } },
    ]);

    // Get the property details
    let details = await structuralDetailsService.findOne(() => [{ where: { DetailsID: property.Details } }]);

    // Get the amenities of the property
    let amenities = await amenityService.findMany(() => [{ where: { ReferenceID: property.PropertyID } }]);

    res.send({
      propertyName: property.PropertyName,
      propertyId: property.PropertyID,
      description: details.Description,
      images,
      amenities,
      ...details,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

/**
 * Function to add new listing
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.addNewProperty = async (req, res, next) => {
  try {
    let data = req?.body?.data;
    let user = req?.decoded?.data?.UserName;
    if (!user) {
      res.status(403).send("Unauthorised access");
      return;
    }
    if (data) {
      // Save the address first and get the ID
      let addressData = {
        Area: data.area,
        AddressLine1: data.addressLine1,
        AddressLine2: data.addressLine2,
        GoogleMapLink: data.googleMapLink,
      };
      if (data?.addressId) {
        addressData.AddressID = data.addressId;
      }
      let address = await addressService.create(addressData);

      let propertyData = {
        PropertyName: data.propertyName,
        Owner: user,
        ThumbnailImage: data.thumbnailImage,
        MainImage: data.mainImage,
        Address: address.AddressID,
        Draft: true,
      };
      if (data?.propertyId) {
        propertyData.PropertyID = data.propertyId;
      }
      let property = await propertyService.create(propertyData);

      // link the rest of images to the property
      for (let image of data.images) {
        let imageData = {
          LinkedTo: property.PropertyID,
        };
        await imagesService.update(() => [{ imageData }, { where: { ImageID: image } }]);
      }

      // Delete all the exsisitng floor details and enter new ones
      await floorService.deleteRow({ where: { Property: property.PropertyID } });

      // Save the floor details
      for (let floorData of data?.floors) {
        floorData = {
          FloorName: floorData?.floorName ?? "",
          UnitCount: floorData?.units ?? 0,
          LayoutImage: floorData?.layoutImage ?? null,
          Property: property.PropertyID,
        };
        await floorService.create(floorData);
      }

      res.status(200).send("Done");
    } else {
      res.status(400).send("Invalid Data send");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

/**
 * Function to add General details for property
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.addPropertyGeneralDetails = async (req, res, next) => {
  try {
    let data = req?.body?.data;
    let user = req?.decoded?.data?.UserName;
    if (!user) {
      res.status(403).send("Unauthorised access");
      return;
    }
    if (data) {
      // Iterate through each floor
      for (let floor of data?.floors) {
        let floorData = await floorService.findOne(() => [{ where: { FloorID: floor.id } }]);
        let property = floorData.Property;

        // We have to update the unit count for the floor
        await floorService.update(() => [{ UnitCount: floor?.layout?.length ?? 0 }, { where: { FloorID: floor.id } }]);

        // Iterate through apartments in each floor
        for (let [index, apartment] of floor?.layout?.entries()) {
          let apartmentData = {
            Property: property,
            Floor: floor.id,
            LayoutIndex: index,
            ApartmentName: apartment.name,
            Image: apartment?.image ?? null,
            Price: apartment?.price ?? 0,
          };
          if (apartment.id) {
            apartmentData.ApartmentID = apartment.id;
          }
          apartmentData = await apartmentService.create(apartmentData);

          // save each amenity
          for (let amenity of apartment.amenities) {
            let amenityData = {
              AmenityType: amenity.name,
              Number: amenity.number,
              ReferenceID: apartmentData.ApartmentID,
              Image: amenity.image,
            };
            if (amenity.id) {
              amenityData.AmenityID = amenityData.id;
            }
            amenityData = await amenityService.create(amenityData);
          }
        }
      }
      res.status(200).send("Done");
    } else {
      res.status(400).send("Invalid Data send");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

/**
 * Function to add additional details for property
 * @param {Object} req The Express req object
 * @param {Object} res The Express response object
 * @param {Function} next The next middleware function to be called
 */
exports.addPropertyAdditionalDetails = async (req, res, next) => {
  try {
    let data = req?.body?.data;
    let user = req?.decoded?.data?.UserName;
    if (!user) {
      res.status(403).send("Unauthorised access");
      return;
    }
    if (data) {
      let structuralDetails = {
        Description: data.description,
        AgeOfBuilding: data.age,
        HouseType: data.propertyType,
      };
      if (data.detailsId) {
        structuralDetails.DetailsID = data.detailsId;
      } else {
        // check if this property already has details
        let property = await propertyService.findOne(() => [{ where: { PropertyID: data.propertyId } }]);
        if (property?.Details) {
          structuralDetails.DetailsID = property.Details;
        }
      }
      structuralDetails = await structuralDetailsService.create(structuralDetails);

      // Link the details to the property and change the draft status
      await propertyService.update(() => [{ Details: structuralDetails.DetailsID, Draft: false }, { where: { PropertyID: data.propertyId } }]);

      res.status(200).send("Done");
    } else {
      res.status(400).send("Invalid Data send");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
