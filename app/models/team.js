var mongoose = require('mongoose');
var teamSchema = mongoose.Schema({
    teamName: {
        type: String,
        unique: true
    },
    teamId: {
        type: String
    },
    teamLogo: {
        type: String,
        default: 0
    },
    location: {
        type: String
    },
    members: [{

        userId: {
            type: String
        }
    }]

});




module.exports = mongoose.model('Team', teamSchema);