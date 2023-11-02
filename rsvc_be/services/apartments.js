const ApartmentsModel = require("../models/apartment");
const config = require("../config/config");
const bcrypt = require("bcrypt");

/**
 * Function to get one row from the apartment table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const findOne = async (params) => {
  try {
    params = params ? params() : [];
    let data = await ApartmentsModel.findOne(...params);
    data = data?.toJSON();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to get rows from the apartment table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const findMany = async (params) => {
  try {
    params = params ? params() : [];
    let data = await ApartmentsModel.findAll(...params);
    data = data?.map((entry) => entry.toJSON()) ?? [];
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to save one row in the apartment table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const create = async (data) => {
  try {
    if (data?.ApartmentID) {
      const [row, created] = await ApartmentsModel.update(data, {
        where: { ApartmentID: data?.ApartmentID ?? null },
      });

      return await findOne(() => [{ where: { ApartmentID: data.ApartmentID } }]);
    } else {
      return await ApartmentsModel.create(data);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to update one row in the apartment table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const update = async (params) => {
  try {
    params = params ? params() : [];
    const [affectedRows, updatedRows] = await ApartmentsModel.update(...params);
    return [affectedRows, updatedRows];
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Function to delete rows in the apartment table
 * @param {Function} params Params for the query function
 * @returns {Object}
 */
const deleteRow = async (query) => {
  try {
    return await ApartmentsModel.destroy(query);
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
