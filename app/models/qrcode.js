var mongoose = require('mongoose');
var qrcodeSchema = mongoose.Schema({
    code: {
        type: String,
        unique: true
    },
    fileName: {
        type: String
    },
    balance: {
        type: Number,
        default: 0
    },
    email: {
        type: String
    },
    history: [{
        date: {
            type: Date
        },
        description: {
            type: String
        }
    }]

});




module.exports = mongoose.model('QRcode', qrcodeSchema);