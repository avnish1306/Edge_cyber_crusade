var mongoose = require('mongoose');
var eventsSchema = mongoose.Schema({
    eventCode: {
        type: String,
        unique: true
    },
    eventName: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    participationCount: {
        type: Number,
        default: 0
    },
    participatedUsers: [{
        date: {
            type: Date
        },
        userId: {
            type: String
        }
    }],
    icon: {
        type: String,
        default: " .../public/images/img-02.png"
    }

});




module.exports = mongoose.model('Events', eventsSchema);