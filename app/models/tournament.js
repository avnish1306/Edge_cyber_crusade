var mongoose = require('mongoose');
var User = require('./user');
var tournamentSchema = mongoose.Schema({
    name: {
        type: String
    },
    tournamentId: {
        type: String
    },
    status: {
        type: String,
        default: "running"
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    teams: [{
        userId: {
            type: mongoose.Schema.Types.String,
            refs: 'User'
        },
        name: {
            type: String
        },
        status: {
            type: String,
            default: "pending"
        }

    }],
    rounds: [{
        roundNumber: {
            type: Number
        },
        teams: [{
            userId: {
                type: mongoose.Schema.Types.String,
                refs: 'User'
            },
            name: {
                type: String
            }
        }],
        status: {
            type: String
        }
    }]

});




module.exports = mongoose.model('Tournament', tournamentSchema);