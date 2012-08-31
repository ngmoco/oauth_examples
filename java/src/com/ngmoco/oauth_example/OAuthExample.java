package com.ngmoco.oauth_example;

import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;

import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import oauth.signpost.commonshttp.CommonsHttpOAuthConsumer;
import oauth.signpost.commonshttp.CommonsHttpOAuthProvider;
import oauth.signpost.http.HttpParameters;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

public class OAuthExample {
	public static final String APP_KEY = "";
	public static final String CLIENT_KEY = "";
	public static final String CLIENT_SECRET = "";

	public static void main(String[] args) throws Exception {
		if (APP_KEY == "" || CLIENT_KEY == "" || CLIENT_SECRET == "") {
			System.out.println("You need to edit this program to fill in the CLIENT_KEY, CLIENT_SECRET and APP_KEY for your app in the developer portal");
			return;
		}
    OAuthConsumer consumer = new CommonsHttpOAuthConsumer(CLIENT_KEY, CLIENT_SECRET);

    OAuthProvider provider = new CommonsHttpOAuthProvider(
            "https://app-sandbox.mobage.com/1/"+ APP_KEY +"/request_temporary_credential",
            "https://app-sandbox.mobage.com/1/"+ APP_KEY +"/request_token",
            "");

		// Leg 1
		// This is to get temporary credential
    System.out.println("Getting temporary credential");
    provider.retrieveRequestToken(consumer, "oob");

    System.out.println("Temporary credential token: " + consumer.getToken());
    System.out.println("Temporary credential secret: " + consumer.getTokenSecret());

		// Leg 2
		// Now you must send the token portion of the temporary credential token to the phone and
		// use the Social.Common.Auth.authorizeToken function to authorize the temporary token
		// Send the oauth_verifier from the phone back to your app server
		// For testing, this script just reads the oauth_verifier from stdin
    System.out.println("Call Social.Common.Auth.authorizeToken(\""+ consumer.getToken() +"\") from the phone and enter the oauth_verifier:");


    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String verificationCode = br.readLine();

		// Leg 3
    System.out.println("Getting token credential");
    provider.retrieveAccessToken(consumer, verificationCode);
		HttpParameters hp = provider.getResponseParameters();
		String oauth2Token = hp.getFirst("oauth2_token");

		System.out.println();
		System.out.println("Save the following credentials for 24 hours to sign Mobage REST API requests:");
    System.out.println("Token credential token: " + consumer.getToken());
    System.out.println("Token credential secret: " + consumer.getTokenSecret());
    System.out.println("OAuth2 Token: " + oauth2Token);
		System.out.println();


		//
		// End 3-Legged OAuth flow
		//

		// REST API call
		// Get the current user information
		System.out.println("Calling the REST API to get the user information:");
		HttpGet request = new HttpGet("https://app-sandbox.mobage.com/1/"+ APP_KEY + "/opensocial/people/@me/@self");
    consumer.sign(request);

    HttpClient httpClient = new DefaultHttpClient();
    HttpResponse response = httpClient.execute(request);
		// read the whole body
		BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
    StringBuilder sb = new StringBuilder();
    String line = reader.readLine();
    while (line != null) {
        sb.append(line);
        line = reader.readLine();
    }

    System.out.println("User: " + sb.toString());
		
	}
}