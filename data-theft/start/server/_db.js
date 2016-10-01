'use strict';

var Sequelize = require('sequelize');

var secrets = require('../secrets');

var db = new Sequelize(secrets.databaseURI, {
  define: {
    timestamps: false,
    underscored: true
  }
});

module.exports = db;
