const ImagesModel = require("../models/images");
const config = require("../config/config");
const bcrypt = require("bcrypt");

/**
 * Function to get one row from the image table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const findOne = async (params) => {
  try {
    params = params ? params() : [];
    let data = await ImagesModel.findOne(...params);
    data = data?.toJSON();
    data.ImageLink = `${config.imageBaseUrl}/${data.ImageName}`;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to get rows from the image table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const findMany = async (params) => {
  try {
    params = params ? params() : [];
    let data = await ImagesModel.findAll(...params);
    data = data?.map((entry) => entry.toJSON()) ?? [];
    for (const item of data) {
      item.ImageLink = `${config.imageBaseUrl}/${item.ImageName}`;
    }
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to save one row in the image table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const create = async (data) => {
  try {
    if (data?.ImageID) {
      const [row, created] = await ImagesModel.update(data, {
        where: { ImageID: data?.ImageID ?? null },
      });

      return await findOne(() => [{ where: { ImageID: data.ImageID } }]);
    } else {
      return await ImagesModel.create(data);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to update rows in the image table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const update = async (params) => {
  try {
    params = params ? params() : [];
    const [affectedRows, updatedRows] = await ImagesModel.update(...params);
    return [affectedRows, updatedRows];
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to delete rows in the image table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const deleteRow = async (query) => {
  try {
    return await ImagesModel.destroy(query);
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = {
  findOne,
  findMany,
  update,
  deleteRow,
  create,
};
