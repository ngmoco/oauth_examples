#!/usr/local/bin/php
<?php

# Find these on the Mobage developer portal
$client_key = '';
$client_secret = '';
$app_key = '';

if ($client_key == '' || $client_secret == '' || $app_key == '') {
    exit('You must edit this script to fill in the client_key, client_secret, and app_key');
}

#
# Leg 1 of the three-legged OAuth procedure
#
# This requests temporary credentials from mobage that can be sent
# to the client.

# Use HTTPS!
$server = 'https://app-sandbox.mobage.com';

$url = "$server/1/$app_key/request_temporary_credential";

$oauth = new OAuth($client_key, $client_secret);
$oauth->enableDebug();

$temporary_credentials = $oauth->getRequestToken($url);
echo '$temporary_credentials: ';
print_r($temporary_credentials);

$oauth->setToken($temporary_credentials['oauth_token'],
                 $temporary_credentials['oauth_token_secret']);
#
# Leg 2
#
# Now you must send the token portion of the temporary credential token to
# the phone and authorize it using: 
#  - ngCore/Javascript: Social.Common.Auth.authorizeToken
#  - iOS: [MBAuth authorizeToken:withCallbackQueue:onComplete:]
#  - Android: com.mobage.global.android.social.common.Auth.authorizeToken
# Send the oauth_verifier from the phone back to your app server

echo 'Authorize this token on the device: ' . $temporary_credentials['oauth_token'];
echo "\n - ngCore/Javascript: Social.Common.Auth.authorizeToken";
echo "\n - iOS: [MBAuth authorizeToken:withCallbackQueue:onComplete:]";
echo "\n - Android: com.mobage.global.android.social.common.Auth.authorizeToken\n";

$oauth_verifier = trim(readline('Enter the oauth_verifier: '));

#
# Leg 3
#

$path = "/1/$app_key/request_token";
$params = array('oauth_verifier'=>$oauth_verifier);
$url = $server . $path . '?' . http_build_query($params);

$token_credentials = $oauth->getAccessToken($url);
echo '$token_credentials: ';
print_r($token_credentials);

$oauth->setToken($token_credentials['oauth_token'],
                 $token_credentials['oauth_token_secret']);

#
# End of three-legged OAuth!
# Now let's do something with our authorization.

# Call the REST API to get the user info
$url = "$server/1/$app_key/opensocial/people/@me/@self";
$oauth->fetch($url);
$response = $oauth->getLastResponse();

echo 'User: ';
print_r($response);
echo "\n";
