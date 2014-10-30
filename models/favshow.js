"use strict";

module.exports = function(sequelize, DataTypes) {
  var FavShow = sequelize.define("FavShow", {
    artist: DataTypes.STRING,
    date: DataTypes.STRING,
    venue: DataTypes.STRING,
    time: DataTypes.STRING,
    location: DataTypes.STRING,
    track_id: DataTypes.STRING,
    event_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        FavShow.hasMany(models.User, {through: "UsersFavShows"});
        FavShow.hasMany(models.UsersFavShows);
        // associations can be defined here
      }
    }
  });

  return FavShow;
};
