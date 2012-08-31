#!/usr/bin/env ruby

# gem install simple_oauth
require 'rubygems'
require 'net/https'
require 'uri'
require 'simple_oauth'

# Cut and paste your client key and secret from the developer portal here
client_key = ''
client_secret = ''
app_key = ''

if client_key == '' || client_secret = '' || app_key = '' {
  puts "You need to edit this script to fill in the client_key, client_secret and app_key for your app in the developer portal"
  exit
}

# When you start, only your client credentials are available
oauth_config = {
    :consumer_key => client_key,
    :consumer_secret => client_secret
  }

# Use HTTPS!
server = "https://app-sandbox.mobage.com"
uri = URI.parse(server)

# Use HTTPS!
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
http.verify_mode = OpenSSL::SSL::VERIFY_NONE

# Leg 1 of Three-legged OAuth procedure
path = "/1/#{app_key}/request_temporary_credential"
request = Net::HTTP::Get.new(path)

# Setup the OAuth header
method = "GET"
url = "#{server}#{path}"
params = {}
oauth_header = SimpleOAuth::Header.new(method, url, params, oauth_config)

# Add the OAuth header to the request
request['Authorization'] = oauth_header.to_s

# Perform request to get the temporary credential
response = http.request(request)
puts "/request_temporary_credential: #{response.body}"
# parse the response
temporary_credentials = CGI.parse(response.body)

# add the temporary_credentials to the oauth_config
oauth_config[:token] = temporary_credentials['oauth_token'][0]
oauth_config[:token_secret] = temporary_credentials['oauth_token_secret'][0]


# Leg 2
#
# Now you must send the token portion of the temporary credential token to the phone and
# use the Social.Common.Auth.authorizeToken function to authorize the temporary token
# Send the oauth_verifier from the phone back to your app server
#
puts "Call Social.Common.Auth.authorizeToken(\"#{oauth_config[:token]}\") from the phone and enter the oauth_verifier:"
oauth_verifier = gets.chomp

# Leg 3
path = "/1/#{app_key}/request_token"
path_with_parameter = "#{path}?oauth_verifier=#{URI.escape(oauth_verifier)}"
request = Net::HTTP::Get.new(path_with_parameter)

# Setup the OAuth header
method = "GET"
url = "#{server}#{path}"
params = {:oauth_verifier => oauth_verifier }
oauth_header = SimpleOAuth::Header.new(method, url, params, oauth_config)

# Add the OAuth header to the request
request['Authorization'] = oauth_header.to_s

response = http.request(request)
puts "/request_token: #{response.body}"
# parse the response
token_credentials = CGI.parse(response.body)

# Replace the temporary credential with the token credential; 
# Save the token credential and oauth2 token for each user for 24 hours to sign REST api calls
oauth_config[:token] = token_credentials['oauth_token'][0]
oauth_config[:token_secret] = token_credentials['oauth_token_secret'][0]
oauth2_token = token_credentials['oauth2_token']

#
# End of 3-legged OAuth flow
#

# Call Rest API to get the user info
path = "/1/#{app_key}/opensocial/people/@me/@self"
request = Net::HTTP::Get.new(path)

# Setup the OAuth header
method = "GET"
url = "#{server}#{path}"
params = {}
oauth_header = SimpleOAuth::Header.new(method, url, params, oauth_config)

# Add the OAuth header to the request
request['Authorization'] = oauth_header.to_s

response = http.request(request)
puts "User: #{response.body}"
