var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser');
    request = require('request'),
    _ = require('underscore');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));


// Home
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/datepicker', function(req, res) {
    res.render('datepicker');
});

// app.get('/home', function(req, res) {
//     var artist = "https://api.spotify.com/v1/search?q=shakira&type=artist";
//     res.render('home');
// });

app.get('/home', function(req, res) {
    var daysEvents = [];
    // API call to Songkick pulling all events in our metro area
    var allEvents = "http://api.songkick.com/api/3.0/metro_areas/26330-us-sf-bay-area/calendar.json?apikey=z4nSxDMJEbSNuTKt";
    request(allEvents, function(error, response, body) {

        // making sure theres no error and getting a successful 200 back
        if (!error && response.statusCode == 200) {
            console.log("FIRST API CALL")
            var obj = JSON.parse(body);

            var allEvents = obj.resultsPage.results.event;

            daysEvents = _.filter(allEvents, function(event){
                return event.start.date === "2014-10-29" && event.type === "Concert";
            });

            // artist name string from event list
            var artistString = (daysEvents[0].performance[0].displayName);
            // console.log(artistString);


            // trying to get all artist name strings for days events
            artistNames = [];
            daysEvents.forEach(function(event) {
                artistNames.push(event.performance[0].displayName);
            });
            // console.log(artistNames);

            // request artist obj from Spotify by artist name string search
            var artistIds = [];
            artistNames.forEach(function(name) {
                var artistObject = "https://api.spotify.com/v1/search?q=" + name + "&type=artist";
                request(artistObject, function(error, response, body) {
                    console.log("SECOND API CALL")
                    if (!error && response.statusCode == 200) {
                    var obj2 = JSON.parse(body);
                    artistIds.push(obj2.artists.items[0].id);
                    console.log(artistIds);
                }});
            });

            // request artist top tracks based on artist ID
            console.log(artistIds);
            artistIds.forEach(function(id) {
                var artistTopTracks = "https://api.spotify.com/v1/artists/" + id + "/top-tracks?country=US";
                request(artistTopTracks, function(error, response, body) {

                    if (!error && response.statusCode == 200) {
                        var tracks = JSON.parse(body);
                        // console.log(body);
                        // console.log("TOP TRACK 1" + tracks[0].album.id);
                    }
                });
            });


            }
            res.render("home", {listOfEvents: daysEvents});
        });

    });


var server = app.listen(3000, function() {
    console.log('Listening on port 3000', server.address().port);
});