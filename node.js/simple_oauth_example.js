// Original example taken from https://github.com/ciaranj/node-oauth/blob/master/examples/term.ie.oauth-HMAC-SHA1.js
var util = require('util');

// npm install oauth
var OAuth = require('oauth').OAuth;

// Cut and paste your client key and secret and your app_key from the developer portal here
var app_key = '';
var client_key = '';
var client_secret = '';

if (app_key === '' || client_key === '' || client_secret === '') {
	util.puts('You need to edit this script to fill in the client_key, client_secret and app_key for your app in the developer portal');
} else {
	// Use HTTPS!
	var oa= new OAuth(
		'https://app-sandbox.mobage.com/1/'+ app_key + '/request_temporary_credential',
		'https://app-sandbox.mobage.com/1/'+ app_key + '/request_token',
		client_key,
		client_secret,
		'1.0',
		'oob',
		'HMAC-SHA1'
	);

	// Leg 1
	// This is to get temporary credential
	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
		if (error) {
			util.puts('error :' + error);
		} else {
			util.puts('temporary token:' + oauth_token);
			util.puts('temporary secret:' + oauth_token_secret);
			util.puts('requestoken results :' + util.inspect(results));
			util.puts('Requesting access token');
			util.puts('Call Social.Common.Auth.authorizeToken("' + oauth_token + '") from the phone and enter the oauth_verifier:');

			// Leg 2
			// Now you must send the token portion of the temporary credential token to the phone and
			// use the Social.Common.Auth.authorizeToken function to authorize the temporary token
			// Send the oauth_verifier from the phone back to your app server
			// For testing, this script just reads the oauth_verifier from stdin
			var oauth_verifier = '';
			process.stdin.on('data', function (chunk) {
				oauth_verifier = chunk.replace(/(\n|\r)+$/, '');
				process.stdin.pause();

				// Leg 3
				// This is to get the token credential
				oa.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results2) {
					if (error) {
						console.log(util.inspect(error, false, null, true));
					}

					util.puts('Save these credentials to use to sign REST API calls for 24 hours:');
					util.puts('token credential token: ' + oauth_access_token);
					util.puts('token credential secret: ' + oauth_access_token_secret);
					util.puts('oauth2 token: ' + results2.oauth2_token);
					util.puts('');

					// End of 3-legged OAuth

					// Use the credentials to make Mobage platform API calls
					var data = '';
					oa.get('https://app-sandbox.mobage.com/1/' + app_key + '/opensocial/people/@me/@self', oauth_access_token, oauth_access_token_secret, function (error, data, response) {
						if (error) {
							console.log(util.inspect(error, false, null, true));
						}

						util.puts('User: ' + data);
					});
				});
			});

			process.stdin.resume();
			process.stdin.setEncoding('utf8');
		}
	});
}
