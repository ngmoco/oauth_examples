// Original example taken from https://github.com/ciaranj/node-oauth/blob/master/examples/term.ie.oauth-HMAC-SHA1.js
var https = require('https');
var util = require('util');

// Node.js' https module defaults to SSLv2, which Mobage does not support. The solution is to force
// the global HTTPS agent to use SSLv3.
https.globalAgent.options.secureProtocol = 'SSLv3_method';

// npm install oauth
var OAuth = require('oauth').OAuth;

var oa;

// Cut and paste your client key and secret and your appKey from the developer portal here
var appKey = '';
var clientKey = '';
var clientSecret = '';

if (appKey === '' || clientKey === '' || clientSecret === '') {
	util.puts('You need to edit this script to fill in the clientKey, clientSecret and appKey for your app in the developer portal');
} else {
	// Use HTTPS!
	oa = new OAuth(
		'https://app-sandbox.mobage.com/1/' + appKey + '/request_temporary_credential',
		'https://app-sandbox.mobage.com/1/' + appKey + '/request_token',
		clientKey,
		clientSecret,
		'1.0',
		'oob',
		'HMAC-SHA1'
	);

	// Leg 1
	// This is to get temporary credential
	oa.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
		var oauthVerifier = '';

		if (error) {
			util.puts('error :' + error);
		} else {
			util.puts('temporary token:' + oauthToken);
			util.puts('temporary secret:' + oauthTokenSecret);
			util.puts('requestoken results :' + util.inspect(results));
			util.puts('Requesting access token');
			util.puts('Call Social.Common.Auth.authorizeToken("' + oauthToken + '") from the phone and enter the oauth_verifier:');

			// Leg 2
			// Now you must send the token portion of the temporary credential token to the phone and
			// use the Social.Common.Auth.authorizeToken function to authorize the temporary token
			// Send the oauth_verifier from the phone back to your app server
			// For testing, this script just reads the oauth_verifier from stdin
			process.stdin.on('data', function (chunk) {
				oauthVerifier = chunk.replace(/(\n|\r)+$/, '');
				process.stdin.pause();

				// Leg 3
				// This is to get the token credential
				oa.getOAuthAccessToken(oauthToken, oauthTokenSecret, oauthVerifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results2) {
					var data = '';

					if (error) {
						console.log(util.inspect(error, false, null, true));
					}

					util.puts('Save these credentials to use to sign REST API calls for 24 hours:');
					util.puts('token credential token: ' + oauthAccessToken);
					util.puts('token credential secret: ' + oauthAccessTokenSecret);
					util.puts('oauth2 token: ' + results2.oauth2_token);
					util.puts('');

					// End of 3-legged OAuth

					// Use the credentials to make Mobage platform API calls
					oa.get('https://app-sandbox.mobage.com/1/' + appKey + '/opensocial/people/@me/@self', oauthAccessToken, oauthAccessTokenSecret, function (error, data, response) {
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
