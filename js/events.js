/*
	Note: this file was updated on June 19th 2011, to reflect
	changes in the Facebook API, so some lines differ from those
	in the tutorial.
*/

// Creating our plugin. You can optionally
// place it in a separate file.

(function($){
	
	$.fn.facebookWall = function(options){
		
		options = options || {};
		
		if(!options.id){
			throw new Error('You need to provide an user/page id!');
		}
		
		if(!options.access_token){
			throw new Error('You need to provide an access token!');
		}
		
		// Default options of the plugin:
		var sinceTime = new Date();
		sinceTime.setDate(sinceTime.getDate()-7);
		sinceTime = Math.round(sinceTime.getTime() / 1000);
		
		options = $.extend({
			limit: 10,	// You can also pass a custom limit as a parameter.
			since: sinceTime
		},options);

		// Putting together the Facebook Graph API URLs:
		
		// TODO: Use ajax call to timeout and display status on failure.
		
		// var graphUSER = 'https://graph.facebook.com/'+options.id+'/?fields=name,picture&access_token='+options.access_token+'&callback=?',
		var graphUSER = 'https://graph.facebook.com/'+options.id+'/',
			graphPOSTS = 'https://graph.facebook.com/'
				+options.id+'/posts/?access_token='+
				options.access_token+'&callback=?&date_format=U&since='+options.since;
			graphPICTURE = 'https://graph.facebook.com/'
					+options.id+'/picture/';
					
		console.log("facebookWall() :: graphUser url="+graphUSER+" graphPosts url="+graphPOSTS);
		
		var wall = this;
		
		// if (Rester.isExpired("events"+Rester.getLocation()) && Rester.online) {
			
		Rester.loadData({
			url: graphUSER,
			key: "eventsUser"+Rester.getLocation(),
			expHours: 1,
			dataType: "json",
			success: function(user) {

				var fb = {
					user : user[0],
					posts : []
				};

				Rester.loadData({
					url: graphPOSTS,
					key: "events"+Rester.getLocation(),
					expHours: 1,
					dataType: "json",
					success: function(posts) {
						
						$.each(posts.data,function(){
							this.from.picture = graphPICTURE;
							this.created_time = relativeTime(this.created_time*1000);
							if (this.message == null) {
								this.message = urlHyperlinks(this.story);
							} else {
								this.message = urlHyperlinks(this.message);
							}
							fb.posts.push(this);
						});
						
						if (fb.posts.length == 0) {
							$('#wall').html('<h3>There are no events to display.</h3>');
							return this;
						}

						// Rendering the templates:
						$('#headingTpl').tmpl(fb.user).appendTo(wall);

						// Creating an unordered list for the posts:
						var ul = $('<ul>').appendTo(wall);

						// Generating the feed template and appending:
						$('#feedTpl').tmpl(fb.posts).appendTo(ul);
					},
					error: function() {
						Rester.setStatusMsg("Events will be shown when a network connection is available.");
					}});
			},
			error: function() {
				Rester.setStatusMsg("Events will be shown when a network connection is available.");
			}});
		
		return this;

	};

	// Helper functions:

	function urlHyperlinks(str){
		return str.replace(/\b((http|https):\/\/\S+)/g,'<a href="$1" target="_blank">$1</a>');
	}

	function relativeTime(time){
		
		// Adapted from James Herdman's http://bit.ly/e5Jnxe
		
		var period = new Date(time);
		var delta = new Date() - period;

		if (delta <= 10000) {	// Less than 10 seconds ago
			return 'Just now';
		}
		
		var units = null;
		
		var conversions = {
			millisecond: 1,		// ms -> ms
			second: 1000,		// ms -> sec
			minute: 60,			// sec -> min
			hour: 60,			// min -> hour
			day: 24,			// hour -> day
			month: 30,			// day -> month (roughly)
			year: 12			// month -> year
		};
		
		for (var key in conversions) {
			if (delta < conversions[key]) {
				break;
			}
			else {
				units = key;
				delta = delta / conversions[key];
			}
		}
		
		// Pluralize if necessary:
		
		delta = Math.floor(delta);
		if (delta !== 1) { units += 's'; }
		return [delta, units, "ago"].join(' ');
		
	}
	
})(jQuery);