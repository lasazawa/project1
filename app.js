var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    async = require('async'),
    request = require('request'),
    dateFormat = require('dateformat'),
    db = require("./models/index"),
    _ = require('underscore');
var cookieSession = require('cookie-session');
var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));

var songkickKey = process.env.SONGKICK_ID;

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOT_ID,
  clientSecret : process.env.SPOT_SECRET,
  redirectUri : 'http://localhost:3000/auth/spotify/callback'
});


// helper functions

function formatTime (t) {
  var h = parseInt(t.substring(0, 2));
  var ap = 'am';
  (h === 0 ? h = 12 : h = h);
  if (h > 12) {
    h -=12;
    ap = 'pm';
  }
  return h + t.substring(2,5) + ap;
}

// ------------

app.use(cookieSession( {
  secret: 'secretkey',
  name: 'cookie session',
  maxage: 50000000,
  })
);

passport.serializeUser(function(user, done) {
    console.log("SERIALIZED JUST RAN");
    done(null, user[0].dataValues.id);
});

passport.deserializeUser(function(id, done) {
    console.log("DESERIALIZED JUST RAN");
    db.User.find({
        where:{
            id:id
        }
    }).done(function(err,user){
        done(err, user);
    });

});

app.use(passport.initialize());
app.use(passport.session());

var currentUser = "";
console.log("***********************" ,currentUser);

passport.use(new SpotifyStrategy({
    clientID: process.env.SPOT_ID,
    clientSecret: process.env.SPOT_SECRET,
    callbackURL: "http://localhost:3000/auth/spotify/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getMe()
      .then(function(data) {
        console.log('Some information about the authenticated user', data);

    db.User.findOrCreate({where:{
        spotifyId: profile.id
    },
    defaults:{
        accessToken: accessToken,
        refreshToken: refreshToken,
        display_name: data.display_name,
        image: data.images[0].url
    }
    }).done(function (err, user) {
        currentUser = user[0].dataValues;
        console.log("THIS IS USER", user);
        return done(err,user);
    });

    }, function(err) {
        console.log('Something went wrong!', err);
    });

  }
));

// ------------------

// Spotify auth
app.get('/auth/spotify',
  passport.authenticate('spotify'),
  function(req, res){
  });

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/home');
  });

// Index
app.get('/', function(req, res) {
  db.FavShow.findAll({
      where: {date: "2014-10-31"}
      }).done(function(err, daysEvents) {
        console.log(daysEvents.length);
        res.render('index', {listOfEvents:daysEvents});
      });
});


// Profile
app.get('/profile', function(req, res) {
  if(!req.user) {
    res.render("index");
  }

  req.user.getFavShows({include:[db.UsersFavShows]}).done(function(err, favshows) {
    if (err) {
      console.log(err);
      var errMsg = "Uh oh, something went wrong";
    }

    favshows.forEach(function(show) {
      var dates = show.dataValues.date;
      dates = new Date();
      show.month = (dateFormat(dates, "mmm"));
      show.day = (dateFormat(dates, "dd"));
      show.time = formatTime(show.dataValues.time);

    });
  console.log(favshows);
  console.log(favshows.length);
  res.render('profile', {favShows:favshows, user:req.user});

  });
});

app.post('/profile/favshow', function(req, res) {

  db.UsersFavShows.findOrCreate({
    where:{
      UserId: req.body.UserId,
      FavShowId: req.body.FavShowId
    },
    defaults:{
      UserId: req.body.UserId,
      FavShowId: req.body.FavShowId,
      isLiked: true
    }
  }).done(function(err,like){
    res.redirect("/home");
  });
});

app.delete('/profile/delete', function(req, res) {
  var favShow = req.body.FavShowId,
  userId = req.user.dataValues.id;
  db.UsersFavShows.find({where:
    {FavShowId: favShow,
    UserId: userId}
  }).done(function(err, joinInstance) {
    joinInstance.destroy().done(function(err) {
      res.redirect('/profile');
    });
  });
});


app.get('/home', function(req, res) {
  if(!req.user) {
    res.render("index");
  }
    db.FavShow.findAll({
      where: {
        date: "2014-10-31"
      },
      include:[db.UsersFavShows]}).done(function(err,daysEvents){

      console.log(daysEvents);
      daysEvents.forEach(function(event) {
        if (event.time !== null) {
          event.time = formatTime(event.dataValues.time);
        }
        if (event.track_id.length > 60) {
          console.log("NO TRACK FOUND");
        }
      });

      res.render('home', {listOfEvents:daysEvents, user:req.user});
    });
  });

app.delete('/home/delete', function(req, res) {
  var favShow = req.body.FavShowId,
  userId = req.body.UserId;
  console.log(favShow);
  console.log(userId);
  db.UsersFavShows.find({where:
    {FavShowId: favShow,
    UserId: userId}
  }).done(function(err, joinInstance) {
    joinInstance.destroy().done(function(err) {
      res.redirect('/home');
    });
  });
});

// FOR POPULATING DB ONLY //

app.get('/populate', function(req, res) {
  if(!req.user) {
    res.render("index");
  }
    var daysEvents = [];
    var artistNames = [];
    var artistIds = [];
    var artistImages = [];
    var topTracks = [];
    var track = {};
    var finalTracks = [];
    var allEvents = "http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json?apikey=" + songkickKey + "&page=8";


    async.waterfall([
    function firstCall(callback){
        console.log("firstCall just ran!");
             request(allEvents, function(error, response, body) {
        // making sure theres no error and getting a successful 200 back
        if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body);

            var allEvents = obj.resultsPage.results.event;
            // console.log(allEvents)

            daysEvents = _.filter(allEvents, function(event){
                return event.start.date === "2014-10-31" && event.type === "Concert";
            });

            // artist name string from event list
            // console.log(allEvents.length);
            // console.log(daysEvents.length);
            if(typeof obj.resultsPage.results.performance !== 'undefined'){
              var artistString = (daysEvents[0].performance[0].displayName);
            }

            // get all artist name strings for days events
            daysEvents.forEach(function(event) {
              if(typeof event.performance !== 'undefined'){
                artistNames.push(event.performance[0].displayName);
              }
            });

        }
            // this is the callback for async.waterfall (first parameter is if there is an error)
            // console.log(daysEvents)
            callback(null,artistNames);
            });

        },
        function secondCall(artistNames, callback){
            console.log("second call just ran");
            async.each(artistNames, function(name,callback){
            var artistObject = "https://api.spotify.com/v1/search?q=" + name + "&type=artist";
                request(artistObject, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                    var obj2 = JSON.parse(body);
                    // make sure this is not undefined
                    if (typeof obj2.artists.items[0] !== 'undefined'){
                        // console.log(typeof obj2.artists.items[0].id);
                        artistIds.push(obj2.artists.items[0].id);
                        callback();
                    }
                    else {
                     callback();
                    }

                    }
                });
            },
        function(err){
            if(err){
                console.log("Oops! Something went wrong", err);
            }
            else{
                // this is the callback for async.waterfall (first parameter is if there is an error)
                callback(null, artistIds, artistNames);
            }
        });
    },
    // we are still missing 5.....
        function thirdCall(artistIds, artistNames, callback){
            var count = 0;
            console.log("third call just ran");
            async.each(artistIds,function(id,callback){
              var artistTopTracks = "https://api.spotify.com/v1/artists/" + id + "/top-tracks?country=US";
                request(artistTopTracks, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                      var result = JSON.parse(body);
                      for (var i = 0; i < daysEvents.length; i++) {
                      console.log(result);
                        if(typeof result.tracks[0] != 'undefined') {
                          if (daysEvents[i].performance[0].displayName === result.tracks[0].artists[0].name) {
                              daysEvents[i].uri = result.tracks[0].uri;
                              count++;
                          }
                        }
                      }
                      callback();
                    }
                });
            },
            function(err){
            if(err){
                console.log("Oops! Something went wrong", err);
            }
            else{
                // this is 18....it should be higher :(
                console.log(count);
              // this is the callback for async.waterfall (first parameter is if there is an error)
                callback(null, daysEvents, topTracks, artistNames);
            }
            });
        },

        // function fourthCall(artistImages, daysEvents, topTracks,artistNames, callback) {
        //   console.log("fourth call just ran");
        //   async.each(artistImages, function(id, callback) {
        //     var artistId = "https://api.spotify.com/v1/artists/" + id;
        //     request(artistImages, function(error, response, body) {
        //       if (!error && response.statusCode == 200) {
        //         var result = JSON.parse(body);
        //         if (typeof result.images[1].url !== 'undefined') {
        //           artistImages.push(result.images[1].url);
        //           console.log(artistImages);
        //           callback();
        //         }
        //         else{
        //           callback();
        //         }
        //       }
        //     });
        //   },
        //   function(err) {
        //     if(err) {
        //       console.log("oops something went wrong");
        //     }
        //     else {
        //       callback(null, artistImages, daysEvents, topTracks, artistNames);
        //     }
        //   });
        // },

        ],



        function final(err, daysEvents){
            async.forEach(daysEvents, function(event,callback){
              db.FavShow.findOrCreate({
                where:{
                  artist: event.performance[0].displayName,
                  date: event.start.date
                  // venue: event.venue.displayName,
                  // time: event.start.time,
                  // location: event.location.city,
                  // track_id: event.uri,
                  // event_id: event.id,
                },
                defaults:{
                  artist: event.performance[0].displayName,
                  date: event.start.date,
                  venue: event.venue.displayName,
                  time: event.start.time,
                  location: event.location.city,
                  track_id: event.uri,
                  event_id: event.id,
                  artist_img: event.image
                }
              }).done(function(err,event){
              callback();
            }, function(taco){
              res.render("home");
            });
            });

        }
    );
    });

app.get('/logout', function(req,res){
    req.logout();
    res.redirect('/');
});


var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port 3000', server.address().port);
});