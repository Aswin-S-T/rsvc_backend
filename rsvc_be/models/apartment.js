const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");

const Apartment = sequelize.define("Apartment", {
  ApartmentID: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  Property: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Floor: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ApartmentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Image: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  LayoutIndex: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Price: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
});

module.exports = Apartment;
