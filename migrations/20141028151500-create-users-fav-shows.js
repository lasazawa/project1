"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("UsersFavShows", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      UserId: {
        type: DataTypes.INTEGER,
        foreignKey:true
      },
      FavShowId: {
        type: DataTypes.INTEGER,
        foreignKey:true
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
    migration.dropTable("UsersFavShows").done(done);
  }
};