"use strict";

module.exports = function(sequelize, DataTypes) {
  var UsersFavShows = sequelize.define("UsersFavShows", {
    UserId: DataTypes.INTEGER,
    FavShowId: DataTypes.INTEGER,
    isLiked: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        UsersFavShows.belongsTo(models.User);
        UsersFavShows.belongsTo(models.FavShow);
      }
    }
  });

  return UsersFavShows;
};
