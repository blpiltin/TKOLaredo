// PROJECT: Phonegap Facebook application
// AUTHOR: Drew Dahlman ( www.drewdahlman.com )
// DATE: 1.26.2012
/*
NOTES:
The current solution for working with Facebook within Phonegap is confusing and very limiting.
This solution uses the Childbrowser to create your access_token, save that, and then allow you to
do what ever you want within the graph API.

This example will allow you to post to a users wall
*/

// GLOBAL VARS
var fb_client_id = "512052125490353",
	// YOUR Facebook ID
	fb_secret = "5c4c96b4ac4be884c4a62b946d81971e",
	// YOUR Facebook SECRET 
	fb_redirect_uri = "https://www.facebook.com/connect/login_success.html",
	// LEAVE THIS
	fb_type = "user_agent",
	fb_display = "touch"; // LEAVE THIS
var facebook_token = "fbToken"; // OUR TOKEN KEEPER
var client_browser;

// FACEBOOK
var Facebook = {

	init: function() {

		console.log("Facebook.init() :: Initializing facebook object.");
		
		// Begin Authorization
		var authorize_url = "https://graph.facebook.com/oauth/authorize?";
		authorize_url += "client_id=" + fb_client_id;
		authorize_url += "&redirect_uri=" + fb_redirect_uri;
		authorize_url += "&display=" + fb_display;
		authorize_url += "&scope=publish_stream,offline_access";

		console.log("Facebook.init() :: childbrowser == " + window.plugins.childBrowser);
		
		if (window.plugins.childBrowser == null) {
			console.log("Facebook.init() :: Installing childbrowser.");
			ChildBrowser.install();
		}
		
		client_browser = window.plugins.childBrowser;

		client_browser.onLocationChange = function(loc) {
			console.log("Facebook.init() :: Setting onLocationChange callback.");
			Facebook.facebookLocChanged(loc);
		}
		
		if (client_browser != null) {
			console.log("Facebook.init()", "Showing login.");
			window.plugins.childBrowser.showWebPage(authorize_url);
		}
	},

	facebookLocChanged: function(loc) {

		// When the childBrowser window changes locations we check to see if that page is our success page.
		if (loc.indexOf("https://www.facebook.com/connect/login_success.html") >= 0) {
			
			var fbCode = loc.match(/code=(.*)$/)[1]
			fbCode = fbCode.replace("#_=_","");
			
			var tempUrl = 'https://graph.facebook.com/oauth/access_token?client_id=' + 
				fb_client_id + '&client_secret=' + fb_secret + '&code=' + 
				fbCode + '&redirect_uri=https://www.facebook.com/connect/login_success.html';
				
			console.log("Facebook.facebookLocChanged()", 
				"Attempting to login using " + tempUrl);
			
			$.ajax({
				url: 'https://graph.facebook.com/oauth/access_token?client_id=' + 
					fb_client_id + '&client_secret=' + fb_secret + '&code=' + 
					fbCode + '&redirect_uri=https://www.facebook.com/connect/login_success.html',
				data: {},
				dataType: 'text',
				type: 'POST',
				success: function(data, status) {
					
					console.log("Facebook.facebookLocChanged()", "Login success.");
					
					// We store our token in a localStorage Item called facebook_token
					Rester.setFacebookToken(data.split("=")[1], function() {
						window.plugins.childBrowser.close();
						Facebook.bodyLoad();
					});
				},
				error: function(xhr, ajaxOptions, thrownError) {
		
					console.log("Facebook.facebookLocChanged()", "Login failure: " + thrownError + "...aborting.");
					
					window.plugins.childBrowser.close();
					
					alert("Authorization attempt failed. Please try again later.");
					
					$.mobile.changePage("index.html");
				}
			});
		}
	},

	share: function(url) {

		// Create our request and open the connection
		var req = new XMLHttpRequest();
		req.open("POST", url, true);
		req.send(null);
		
		return req;
	},

	post: function(_fbType, params) {

		Rester.getFacebookToken(function(token) {
			// Our Base URL which is composed of our request type and our localStorage facebook_token
			var url = 'https://graph.facebook.com/me/' + _fbType + '?access_token=' + token;

			console.log("Facebook.post() :: Creating a post at url: "+url);
		
			// Build our URL
			for (var key in params) {
				if (key == "message") {
					// We will want to escape any special characters here vs encodeURI
					url = url + "&" + key + "=" + escape(params[key]);
				} else {
					url = url + "&" + key + "=" + encodeURIComponent(params[key]);
				}
			}

			var req = Facebook.share(url);

			// Our success callback
			req.onload = Facebook.success();
		});
	},

	success: function() {
		
		$("#fbStatusText").show();
		$("#fbStatusButton").show();

		// hide our info
		$("#fbInfo").hide();

		// reset our field
		$("#fbStatusText").val('');

		alert("Wall post created successfully.");
		
		console.log("Facebook.success()", "Post created succesfully.");
		
		$.mobile.changePage("index.html");
	},

	bodyLoad: function() {
		
		Rester.getFacebookToken(function(token) {
			// First lets check to see if we have a user or not
			if (!Rester.isValid(token)) {
				
				console.log("Facebook.bodyLoad()", "Don't have local token yet.");

				$("#fbStatus").hide();			
				$("#fbLoginArea").show();

				$("#fbLoginButton").click(function() {
					Facebook.init();
				});
			} else {
				
				console.log("Facebook.bodyLoad()", "Logged in.");
				
				$("#fbLoginArea").hide();
				$("#fbStatus").show();

				$("#fbStatusButton").click(function() {
					if ($("#fbStatusText").val() == "") {
						alert("Make sure you've filled out the message area!");
					} else {
						// hide our assets
						$("#fbStatusText").hide();
						$("#fbStatusButton").hide();

						// show our info
						$("#fbInfo").show();
						Facebook.createPost();
					}
				});
			}
		});
		
	},

	createPost: function() {

		if (!Rester.online) {
			$.mobile.changePage("index.html");
			alert("You must be online to use this feature.");
		}
		// Define our message!
		var msg = $("#fbStatusText").val();

		// Define the part of the Graph you want to use.
		var _fbType = 'feed';

		// You can change
		var params = {};
		params['message'] = msg;
		params['name'] = Rester.getLocProp('fbName'); 
		params['description'] = Rester.getLocProp('fbDescription'); 
		params['link'] = Rester.getLocProp('fbLink'); 
		params['picture'] = Rester.getLocProp('fbPicture'); 
		params['caption'] = Rester.getLocProp('fbCaption'); 

		// When you're ready send you request off to be processed!
		Facebook.post(_fbType, params);
	}
};
