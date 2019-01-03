// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth': {
        'clientID': '1104610676378540', // your App ID
        'clientSecret': '11021f783d97034ddc18cc0e09ff7a27', // your App Secret
        'callbackURL': 'https://localhost:3000/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields': ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'twitterAuth': {
        'consumerKey': 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL': 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth': {
        'clientID': '578137863773-u15u4fmbeppf2lp1pum7ce71et22o736.apps.googleusercontent.com',
        'clientSecret': 'w3vOr1q7lWRP0fK1tHzk8su0',
        'callbackURL': 'http://localhost:8080/auth/google/callback'
            //'callbackURL': 'http://192.168.43.223:8080/auth/google/callback'

    }

};