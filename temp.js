/*
 * jQuery FacebookFeed Plugin
 * Requires jQuery 1.4.2
 * Requires jQuery Templates Plugin 1.0.0pre
 * Author Vladimir Shugaev <vladimir.shugaev@junvo.com>
 * Copyright Vladimir Shugaev <vladimir.shugaev@junvo.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function($){
    $.fn.facebookfeed=function(options){
		var settings={
			id: '145975662131224', //id of the facebook entity
			template: '<h3>${from.name}</h3><h4>${created_time}</h4><p>${message}</p><p>Read more:&nbsp;<a href="${link}">${name}</a></p>', //template for formatting each feed entry
			query: {},
			access_token: ''
		};
		
		if (options)
			$.extend(settings, options);
		var container=this;
		var requestURL='https://graph.facebook.com/'+settings.id+'/feed?access_token='+settings.access_token+'&'+$.param(settings.query)+'&callback=?'; //calback=? is required to get JSONP behaviour
		var template=$.template(null, settings.template);

		$.getJSON(requestURL, function(json) {
			for (var i = 0; i < json.data.length; i++) {
				if (json.data[i].created_time) {
					json.data[i].created_time = Date.parse(json.data[i].created_time).toString('dddd, MMMM d, yyyy');
				}
			}
			var messages=$.tmpl(template, json.data).appendTo(container);
		});
		return this;
	};
})(jQuery);


	loadMenuPage: function() {
		var error = "";
		var page = "http://v2.laredoheat.com/?page_id=2227";
		var cssClass = "ngg-gallery-thumbnail";
		var select = encodeURIComponent('select * from html where url="' + page + '" and xpath=\'//div[@class="' + cssClass + '"]\'');
var site = 'http://query.yahooapis.com/v1/public/yql?q=' + select + '&format=json&callback=?';
	
	
//http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fv2.laredoheat.com%2F%3Fpage_id%3D2227%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22ngg-gallery-thumbnail%22%5D'&format=json&callback=

		$.ajax(
		  {
			url: site,
			dataType: 'jsonp',
			// url: 'http://query.yahooapis.com/v1/public/yql?q=' + 
			// 				encodeURIComponent('select * from html where url="http://v2.laredoheat.com/?page_id=2227" and xpath=\'//div[@class="ngg-gallery-thumbnail"]\''),
			// 		// url: "http://query.yahooapis.com/v1/public/yql",
			// 		    q: "select * from html where url=\"http://v2.laredoheat.com/?page_id=2227\"" +
			// 		 		" and xpath=\'//div[@class=\"ngg-gallery-thumbnail\"]\'\"?fmt=JSON\"",
		    // fmt: "json", 
		  	success: function(data){
				console.log(data);
		    	if (data.query.results) {
					var categories = [];
					var images = [];
					var description = "";
					var category = "";
					var image = "";
					var newHTML = "";
					var element;
					
					for (var i = 0; i < data.query.results.div.length; i++) {
						element = data.query.results.div[i];
						description = element.a.title;
						image = element.a.img.src;
						category = description.split(';')[0];
						if (categories.indexOf(category) == -1) {
							categories.push(category);
							images.push(image);
						}
					}
			
					$.each(categories, function(i, val) {
						if (val === ' ') val = 'Uncategorizable';
						newHTML += '<li class="menuCategory"><a href="menucategory.html?category=' + 
							encodeURIComponent(val) + '">' + 
							'<img src="' + images[i] + '"/>' + RestUtils.toTitleCase(val) + '</a></li>';
					});
					$('#menuCategories').html(newHTML);
					$('#menuCategories').listview('refresh');
			    } else {
			    	error = "An error occured loading the menu. The source page contains no data.";
			    }
			  },
			error: function() {
				error = "An error occured loading the menu. Please be sure you are connected to the internet.";
			}
		});
		
		RestUtils.debug("Rester.loadMenuPage()", "Loading menu from " + Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		// $.ajax({
		// 	url: Rester.proxyURL + Rester.getLocProp('menuURL'),
		// 	dataType: Rester.dataType,
		// 	success: function(data) {
		// 
		// 		var categories = [];
		// 		var images = [];
		// 		var description = "";
		// 		var category = "";
		// 		var image = "";
		// 		var newHTML = "";
		// 
		// 		$(RestUtils.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
		// 			description = $(this).find('a').attr('title');
		// 			image = $(this).find('img').attr('src');
		// 			category = description.split(';')[0];
		// 			if (categories.indexOf(category) == -1) {
		// 				categories.push(category);
		// 				images.push(image);
		// 			}
		// 		});
		// 
		// 		$.each(categories, function(i, val) {
		// 			if (val === ' ') val = 'Uncategorizable';
		// 			newHTML += '<li class="menuCategory"><a href="menucategory.html?category=' + 
		// 				encodeURIComponent(val) + '">' + 
		// 				'<img src="' + images[i] + '"/>' + RestUtils.toTitleCase(val) + '</a></li>';
		// 		});
		// 		$('#menuCategories').html(newHTML);
		// 		$('#menuCategories').listview('refresh');
		// 	},
		// 	error: function() {
		// 		error = 'An error occured loading the menu. Please be sure you are connected to the internet.';
		// 	}
		// });
		
		if (error != "") throw error;
	},
	
	// Accepts a url and a callback function to run.
	requestCrossDomain: function( site, callback ) {
		
		// Take the provided url, and add it to a YQL query. Make sure you encode it!
		var yql = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fv2.laredoheat.com%2F%3Fpage_id%3D2227%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22ngg-gallery-thumbnail%22%5D'&format=json&callback=?";
		// var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + 
		// 	encodeURIComponent('select * from html where url="' + 
		// 	site + '"') + 
		// 	'&format=xml&callback=cbFunc';
			
		// Request that YSQL string, and run a callback function.
		// Pass a defined function to prevent cache-busting.
		$.getJSON( yql, function(data) {
			// If we have something to work with...
			if ( data.results[0] ) {
				// Strip out all script tags, for security reasons.
				// BE VERY CAREFUL. This helps, but we should do more.
				data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
				// If the user passed a callback, and it
				// is a function, call it, and send through the data var.
				if ( typeof callback === 'function') {
					callback(data);
				}
			}
			// Else, Maybe we requested a site that doesn't exist, and nothing returned.
			else throw new Error('Nothing returned from getJSON.');
		});
	},
	
	
	<script>
	if (typeof jQuery == 'undefined')
	{
	    document.write(unescape("%3Cscript src='/Scripts/jquery-1.3.2.min.js' type='text/javascript'%3E%3C/script%3E"));
	}
	</script>
	
	
	
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
	
	// 
	// 	SC.initialize({
	// 	    client_id: "1ea1ab57eb6ef387a5c5b2d02484da4d"
	// 	  });
	// 	
	// var track_url = 'http://api.soundcloud.com/tracks/62759488.json?client_id=1ea1ab57eb6ef387a5c5b2d02484da4d';
	// 	    SC.get('/resolve', {
	// 	        // url : track_url
	// 	 		url : Rester.proxyURL + track_url
	// 	    }, function(track) {
	// 
	// 	        $("#playSound").live("click", function() {
	// 	            SC.stream("/tracks/" + track.id, function(sound) {
	// 	                if (sound == null) { return; }
	// 			alert("got here");
	// 			Rester.scTrack = sound;
	// 			Rester.scTrack.play();
	// 	            });
	// 	        });
	// 	
	// 	$("#stopSound").live("click", function(){
	// 		if (Rester.scTrack == null) { return; }
	// 		alert("got here");
	// 		Rester.scTrack.stop();
	// 	});
	// 	
	// 	    });
	// 
	// SC.initialize({
	//     client_id: "1ea1ab57eb6ef387a5c5b2d02484da4d"
	//   });
	// 
	//   $("#playSound").live("click", function(){
	// 	
	//     SC.stream("/tracks/293", function(sound){
	// 		if (sound == null) { return; }
	// 		alert("got here");
	// 		Rester.scTrack = sound;
	// 		Rester.scTrack.play();
	// 	});
	//   });
	// 
	// $("#stopSound").live("click", function(){
	// 	if (Rester.scTrack == null) { return; }
	// 	alert("got here");
	// 	Rester.scTrack.stop();
	// });
	
	// var api = $.sc.api(Rester.scClientID, {
	//     onAuthSuccess: function(user, container) {
	//       $('<span class="username">Logged in as: <strong>' + user.username + '</strong></a>').prependTo(container);
	//       console.log('you are SoundCloud user ' + user.username);
	//     }
	//   });
	// 
	//   // wait for the API to be available
	//   $(document).bind($.sc.api.events.AuthSuccess, function(event) {
	//     var user = event.user;
	//     // call the api
	//     api.get('/vjdrock/tracks', function(data) {
	//       console.log('and here are your tracks', data);
	//       // you can use new jQuery templating for generating the track list
	//       $('#track').render(data).appendTo("#track-list");
	//     });
	//   });
	// 
	// $.ajax({
	// 	url: Rester.proxyURL + Rester.getLocProp('musicURL'),
	// 	dataType: Rester.dataType,
	// 	ifModified: 'true',
	// 	timeout: Rester.ajaxTimeout,
	// 	success: function(data) {
	//   		$(Rester.getDataContents(data)).each(function(data) {
	//     		console.log(data.title);
	//   		});
	// 	},
	// 	error: function() {
	// 		Rester.setStatusMsg("Songs will be shown when a network connection is available.");
	// 	}
	// });
	// 		
	// $('a.sc-player, div.sc-player').attr('href', Rester.getLocProp('musicURL'));
	// $('a.sc-player, div.sc-player').scPlayer();
	// Rester.fixMusicPlayer();