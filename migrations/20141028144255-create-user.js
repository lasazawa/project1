"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      display_name: {
        type: DataTypes.STRING
      },
      spotifyId: {
        type: DataTypes.STRING
      },
      accessToken:{
        type: DataTypes.STRING
      },
      refreshToken:{
        type: DataTypes.STRING
      },
      image: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Users").done(done);
  }
};