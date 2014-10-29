"use strict";

module.exports = function(sequelize, DataTypes) {
  var UsersFavShows = sequelize.define("UsersFavShows", {
    UserId: DataTypes.INTEGER,
    FavShowId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return UsersFavShows;
};
