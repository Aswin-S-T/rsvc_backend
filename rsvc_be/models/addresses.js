const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");

const Addresses = sequelize.define("Addresses", {
  AddressID: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  AddressLine1: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  AddressLine2: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Area: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Pincode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  GoogleMapLink: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  Latitude: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  Longitude: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
});

module.exports = Addresses;
