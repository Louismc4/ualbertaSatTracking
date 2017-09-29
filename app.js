var express      = require("express"),
    app          = express(),
    bodyParser   = require("body-parser"),
    session      = require('express-session'),
    satellite    = require('./public/satellite/dist/satellite.js').satellite;
//Configurations---------------------------------------------------------->>>>>>

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.use(session({
    cookieName: 'session',
    secret: "Secret Louis",
    resave: false,
    saveUninitialized: false,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    secure : true
}));

//Routes------------------------------------------------------------------>>>>>>

    var norad = '42734'
    var tleArray = ["1 42734U 98067MP  17271.37578549  .00053290  00000-0  67532-3 0  9991", "2 42734  51.6373 241.7621 0007335 317.3911  42.6512 15.58902816 19367"];
    var satname = 'Ex-Alta';
    var myLat = '';
    var myLng = '';
    var altitude = 0;
    
    setInterval(sat, 1000);
    
    function sat(){
        
        // Initialize a satellite record
        var satrec = satellite.twoline2satrec(tleArray[0], tleArray[1]);
        
        //  Propagate satellite using time since epoch (in minutes).
        // var positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);
        
        //  Or you can use a JavaScript Date
        var positionAndVelocity = satellite.propagate(satrec, new Date());
        
        // The position_velocity result is a key-value pair of ECI coordinates.
        // These are the base results from which all other coordinates are derived.
        var positionEci = positionAndVelocity.position,
            velocityEci = positionAndVelocity.velocity;
        
        var deg2rad = Math.PI/180;
        // Set the Observer at 122.03 West by 36.96 North, in RADIANS
        var observerGd = {
            longitude: -122.0308 * deg2rad,
            latitude: 36.9613422 * deg2rad,
            height: 0.370
        };
        
        // You will need GMST for some of the coordinate transforms.
        // http://en.wikipedia.org/wiki/Sidereal_time#Definition
        var gmst = satellite.gstimeFromDate(new Date());
        
        // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
        var positionEcf   = satellite.eciToEcf(positionEci, gmst),
            observerEcf   = satellite.geodeticToEcf(observerGd),
            positionGd    = satellite.eciToGeodetic(positionEci, gmst),
            lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf);
            // dopplerFactor = satellite.dopplerFactor(observerCoordsEcf, positionEcf, velocityEcf);
        
        // The coordinates are all stored in key-value pairs.
        // ECI and ECF are accessed by `x`, `y`, `z` properties.
        var satelliteX = positionEci.x,
            satelliteY = positionEci.y,
            satelliteZ = positionEci.z;
        
        // Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
        var azimuth   = lookAngles.azimuth,
            elevation = lookAngles.elevation,
            rangeSat  = lookAngles.rangeSat;
        
        // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
        var longitude = positionGd.longitude,
            latitude  = positionGd.latitude,
            height    = positionGd.height;
        
        //  Convert the RADIANS to DEGREES for pretty printing (appends "N", "S", "E", "W", etc).
        var longitudeStr = satellite.degreesLong(longitude),
            latitudeStr  = satellite.degreesLat(latitude);
            
        console.log(longitudeStr + " " + latitudeStr + " " + height + " " + azimuth);
    
    }

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started!");
});