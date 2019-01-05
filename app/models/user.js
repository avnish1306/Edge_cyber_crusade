// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Tournament = require('./tournament');
// define the schema for our user model
var userSchema = mongoose.Schema({
    userId: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isHero: {
        type: Boolean,
        default: false
    },

    idStatus: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
        default: ".../public/images/dummy.png"
    },
    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    qrcode: {
        type: String
    },
    name: {
        type: String,
        default: "none"
    },
    displayName: {
        type: String,

    },
    location: {
        type: String,
        default: "NULL"
    },
    members: [{

        name: String,
        streamId: String,
        location: String,
        mobileNumber: String,
        email: String
    }],
    score: {
        type: Number,
        default: 0
    },
    tournaments: [{
        name: {
            type: String
        },
        tournamentId: {
            type: mongoose.Schema.Types.String,
            refs: 'Tournament'
        },
        rank: {
            type: Number,
            default: -1
        },
        status: {
            type: String,
            default: "pending"
        }
    }]


});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);