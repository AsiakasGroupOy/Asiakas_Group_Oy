const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('voip_system', 'user', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const Call = sequelize.define('Call', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }
});

sequelize.sync();

module.exports = Call;
