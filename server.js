// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var configDB = require('./config/database.js');
var QRCode = require('qrcode')
const _ = require('lodash');
const dotenv = require('dotenv')
dotenv.config();
console.log(" env " + process.env.request_url);

var fs = require('fs');
var https = require('https');
https.createServer({
        key: fs.readFileSync('./extra/certificate/server.key'),
        cert: fs.readFileSync('./extra/certificate/server.crt'),
        passphrase: 'python',
        requestCert: false,
        rejectUnauthorized: false

    }, app)
    .listen(3000, function() {
        console.log(" https start");
    });

QRCode.toDataURL('I am a pony!', function(err, url) {
    //console.log(url)
})






// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(__dirname + '/public'));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/admin.js')(app, passport);
// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);