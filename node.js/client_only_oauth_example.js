var util= require('util')

// npm install oauth
var OAuth= require('oauth').OAuth;

// Cut and paste your client key and secret and your app_key from the developer portal here
// Your app must already be setup to send push notifications for this example to work
var app_key = ""
var client_key = ""
var client_secret = ""

if(app_key == '' || client_key == '' || client_secret == '') {
	util.puts("You need to edit this script to fill in the client_key, client_secret and app_key for your app in the developer portal")
} else {
	// Use HTTPS!
	var oa= new OAuth(
		"https://app-sandbox.mobage.com/1/"+ app_key + "/request_temporary_credential",
		"https://app-sandbox.mobage.com/1/"+ app_key + "/request_token",
		client_key,
		client_secret,
		"1.0",
		"oob",
		"HMAC-SHA1",
		null,
		{"Accept" : "application/json"}
	);
										
	// For client-only signing the token credentials (access token and secret) are null------------------v-----v
	oa.post("https://app-sandbox.mobage.com/1/"+ app_key + "/opensocial/remote_notification/@app/@all", null, null, {"payload" : '{"message":"hello everybody"}' }, null, function (error, data, response) {
		if(error) console.log(util.inspect(error, false, null, true))
		util.puts("Response: " + data);
	});
}
