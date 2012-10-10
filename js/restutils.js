/**
 * Basic utility class containing functions that are used throughout
 * the restaurant app.
 */
var RestUtils = {
	
	// Change the debug level to 0 to suppress console output messages.
	debugLevel: 1,
	
	/**
	 * Utility function for debugging. Use:
	 * RestUtils.debug("MyClass.someFunction()", "This is my output message");
	 */
	debug: function(functionName, message) {
		if (this.debugLevel > 0) {
			console.debug(functionName + " :: " + message);
		}
	},
	
	/**
	 * Change the case of a string to title case.
	 */
	toTitleCase: function(str) {
		return str.replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	},
	
	/**
	 * Get the contents of JSON or XML data depending on the type.
	 */
	getDataContents: function(data) {
		return (typeof data === 'string') ? data : data.contents;
	},

	/**
	 * Get a parameter from a URL.
	 */
	getURLParameter: function(name) {
		var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results == null) {
			return null;
		} else {
			return results[1] || 0;
		}
	},

	
	// /**
	//  * Get a parameter from a URL.
	//  */
	// getURLParameter: function(name) {
	// 	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	// 	var regexS = "[\\?&]"+name+"=([^&#]*)";
	// 	var regex = new RegExp( regexS );
	// 	var results = regex.exec( window.location.href );
	// 	if( results == null )
	// 	 	return "";
	// 	else
	// 	 	return results[1];
	// },
	
	/**********************
	 FaceBook Share
	 **********************/
	// this function share the article on facebook
	// text : the text to share
	// image : the image to display near the link
	// url : the url of the article
	shareOnFaceBook: function(text, image, url) {
		var client_id = "512052125490353"; //TODO customize your FaceBook AppID : http://developers.facebook.com/setup/
		var redir_url = "http://www.facebook.com/connect/login_success.html";
		navigator.notification.activityStart(); //Phonegap function to show a waiting message
		if (typeof fbPlugin === 'undefined') {
			console.log('install FBConnect');
			fbPlugin = FBConnect.install();
		}
		fbPlugin.connect(client_id, redir_url, 'touch');
		fbPlugin.onConnect = function() {
			console.log('onFBConnected id = ' + window.plugins.fbConnect.accessToken);
			window.plugins.fbConnect.postFBWall(text, url, image, function() {
				console.log('inside callback after postFBWall');
				alert('Successfully shared on Facebok(check your status)');
				navigator.notification.activityStop(); //Phonegap function to hide a waiting message
			});
		};
	}
}
