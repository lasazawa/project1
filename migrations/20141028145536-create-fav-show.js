"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("FavShows", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      artist: {
        type: DataTypes.STRING
      },
      date: {
        type: DataTypes.STRING
      },
      venue: {
        type: DataTypes.STRING
      },
      time: {
        type: DataTypes.STRING
      },
      location: {
        type: DataTypes.STRING
      },
      track_id: {
        type: DataTypes.STRING,
      },
      event_id: {
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
    migration.dropTable("FavShows").done(done);
  }
};