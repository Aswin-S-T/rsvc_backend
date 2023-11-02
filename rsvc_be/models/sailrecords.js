const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");

const SailRecord = sequelize.define("SailRecord", {
  SailID: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  Property: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  Agent: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  Buyer: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  Apartment: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  AgreementDocument: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  SailStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = SailRecord;
