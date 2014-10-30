"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    display_name: DataTypes.STRING,
    spotifyId: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    refreshToken: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.FavShow, {through: "UsersFavShows"});
        User.hasMany(models.UsersFavShows);
        // associations can be defined here
      }
    }
  });

  return User;
};
