/**
 * Restaurant app.
 * These are the primary functions and bindings for the restaurant application.
 * Used in conjunction with restuils.js.
 * Call initialize on bodyLoad.
 *
 * Author: Brian Piltin. Copyright (C) 2012. All rights reserved.
 */
// "use strict";

var Rester = {
		
	// Change the debug level to 0 to suppress console output messages.
	DEBUG: 1,
	
	// Data for each individual restaurant location
	locations: [
		{	
			'name': 'San Bernardo',
			'telephone': '956-729-8700',
			'email': 'supervic@laredoheat.com',
			'address': '4100 San Bernardo Avenue  Laredo, TX 78041',
			'latitude': '27.536739',
			'longitude': '-99.504507',
			'menuURL': 'http://v2.laredoheat.com/?page_id=2227',
			'picturesURL': 'http://v2.laredoheat.com/?page_id=1846',
			'musicURL': 'http://soundcloud.com/vjdrock',
			'fbID': '184375751588144',
			'fbName': 'The TKO Laredo app for iPhone.',
			'fbDescription': "Visit the Laredo Heat website and get the TKO app for iPhone.",
			'fbLink': "http://v2.laredoheat.com/?page_id=1846",
			'fbPicture': "http://www.brianpiltin.com/tkolaredo/tko-logo.png",
			'fbCaption': 'TKO rocks!',
			'customCSS': 'jquery-mobile/tko-sb.css'
		},
		{
			'name': 'Shiloh',
			'telephone': '956-568-0447',
			'email': 'supervic@laredoheat.com',
			'address': '520 Shiloh Dr Laredo TX 78045',
			'latitude': '27.590219',
			'longitude': '-99.482717',
			'menuURL': 'http://v2.laredoheat.com/?page_id=2227',
			'picturesURL': 'http://v2.laredoheat.com/?page_id=2250',
			'musicURL': 'http://soundcloud.com/vjdrock',
			'fbID': '100004085199809',
			'fbName': 'The TKO Laredo app for iPhone.',
			'fbDescription': "Visit the Laredo Heat website and get the TKO app for iPhone.",
			'fbLink': "http://v2.laredoheat.com/?page_id=1846",
			'fbPicture': "http://www.brianpiltin.com/tkolaredo/tko-logo.png",
			'fbCaption': 'TKO rocks!',
			'customCSS': 'jquery-mobile/tko-sh.css'
		}
	], 
		
	// The URL for the proxy server to convert html to jsonp
	proxyURL: "http://www.differentdezinellc.com/proxy.php?url=",

	ajaxTimeout: 10000,
	
	// proxyURL: "http://query.yahooapis.com/v1/public/yql",
	dataType: "jsonp",
	
	// The width in pixels for each scroller image
	scrollWidth: 120,
	// The maximum number of photos on the front page scroll
	MAX_SCROLL: 12,
	// The current number of photos in the front page scroll
	scrollSize: 0,
	
	// Facebook access token
	fbAccessToken: '512052125490353|_kF0WEqfTTkguYp853eydB0Bayk',
	
	// SoundCloud client id
	scClientID: '1ea1ab57eb6ef387a5c5b2d02484da4d',
	// The currently playing scTrack
	scTrack: null,
	
	/**
	 * Utility function for debugging. Use:
	 * console.log("MyClass.someFunction()", "This is my output message");
	 */
	debug: function(functionName, message) {
		if (console.log !== undefined) {
			console.log(functionName + " :: " + message);
		}
	},
	
	db: new Lawnchair({adapter: 'dom', name:'db'}, function(store) {
		console.log("Rester.db", "Database created succesfully. Using DOM adapter.");
	}),
	
	setProp: function(id, value) {
		Rester.db.save({key: id, val: value});
	},
	
	getProp: function(id) {
		var val = "";
		Rester.db.get(id, function(obj) {
			if (obj === undefined || obj === null) { return undefined; }
			val = obj.val;
		});
		return val;
	},
	
	/**
	 * Change the case of a string to title case.
	 */
	toTitleCase: function(str) {
		if (str == str.toLowerCase()) {
			return str.replace(/\w\S*/g, function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		} 
		return str;
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
		if (results === null) {
			return null;
		} else {
			return results[1] || 0;
		}
	},
	
	setStatusMsg: function(text) {
		$('.statusMsg').html(text);
	},
	
	// Rester Constructor
	initialize: function() {
		Rester.proxyTest();
		Rester.bindEvents();
	},
	
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// `load`, `deviceready`, `offline`, and `online`.
	bindEvents: function() {
		
		console.log("Rester.bindEvents()", "Binding events... ");
		
		document.addEventListener('deviceready', Rester.onDeviceReady, false);
		
		$(window).bind('orientationchange', function() {
			Rester.updateOrientation();
		});
		
		$(document).bind("mobileinit", function() {
			
			$.mobile.allowCrossDomainPages = true;
			$.mobile.pushStateEnabled = false;
			$.mobile.transitionFallbacks.slideout = "none";
			// $.mobile.phonegapNavigationEnabled = true;
			
			// $.mobile.page.prototype.options.domCache = true;
			
			// // This allows jQuery to access the cached data for ajax failures.
			// $.ajaxPrefilter( function(options, originalOptions, jqXHR) {
			// 		if ( applicationCache &&
			// 			 applicationCache.status != applicationCache.UNCACHED &&
			// 			 applicationCache.status != applicationCache.OBSOLETE ) {
			// 			 // the important bit
			// 			 options.isLocal = true;
			// 		}
			// 	});
		});
		
		// $(document).bind("pagebeforechange", function( event, data ) {
		//            $.mobile.pageData = (data && data.options && data.options.pageData)
		//                                   ? data.options.pageData
		//                                   : null;
		//         });

		$(document).delegate("#homePage", "pageinit", function(e) {
			try {
								
				Rester.initializeLocation();
				Rester.createLocationMenu();
				Rester.setHeaderImage();
				Rester.setTelephoneLink();
				Rester.setEmailLink();
				Rester.createLocationMenu();
				
			} catch (x) {
				alert(x.message);
			}
		});
		
		$(document).bind("pageshow", function(event, ui) {
			Rester.setStatusMsg("");
		});
		
		$('#homePage').live('pageshow', function(e) {
			try {
				$('#map_canvas').gmap('refresh');
				Rester.loadHomePage();
			} catch (x) {
				alert(x.message);
			}
		});
			
		$('#sharePage').live('pageshow', function(e) {
			try {
				Rester.loadSharePage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});
				
		$('#menuPage').live('pageshow', function(e) {
			try {
				Rester.loadMenuPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});

		$('#menuCategoryPage').live('pageshow', function(e) {
			try {
				Rester.loadMenuCategoryPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});

		$('#menuItemPage').live('pageshow', function(e) {
			try {
				Rester.loadMenuItemPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});

		$('#eventsPage').live('pageshow', function(e) {
			try {
				Rester.loadEventsPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});

		$('#picturesPage').live('pageshow', function(e) {
			try {
				Rester.loadPicturesPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});

		$('#picturesGalleryPage').live('pageshow', function(e) {
			try {
				Rester.loadPicturesGalleryPage(e);
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});
		
		$('#picturesGalleryPage').live('pagehide', function(e) {
			try {
				var
				currentPage = $(e.target),
					photoSwipeInstance = window.photoSwipe; // PhotoSwipe.getInstance(currentPage.attr('id'));
				
				if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
					delete photoSwipeInstance;
				}
				return true;
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});

		$('#musicPage').live('pageshow', function(e) {
			try {
				Rester.loadMusicPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert(x.message);
			}
		});
	},
	
	onDeviceReady: function() {
 		navigator.splashscreen.hide();
    },

	fixWindow: function() {
		$(document).width($(window).width());
		$('html').css("width", $(window).width());
		$('body').css("width", $(window).width());
	},
	
	/**
	 * Fix the orientation of any css based widgets after the
	 * orientation has changed.
	 */
	updateOrientation: function() {
		var winOr = window.orientation;
		if (winOr === 0 || winOr === 180) { // portrait
			$('#cssSCWidgetOrientation').attr('href', 'lib/sc-player/css/sc-player-standard/structure-vertical.css');
		} else { // landscape
			$('#cssSCWidgetOrientation').attr('href', 'lib/sc-player/css/sc-player-standard/structure-horizontal.css');								
		}
		// $(document).width($(window).width());
		// Prevent the icons from getting pushed off bottom of window.
		Rester.fixWindow();
		Rester.fixScroller();
		Rester.fixMusicPlayer();
		// // if ($.mobile.activePage === $("#homePage")) {
		// 	Rester.loadHomePage();
		// 	console.log("Rester.updateOrientation()", "Reloading home page.");
		// // }
	},

	proxyTest: function() {
		$.ajax({
			url: Rester.albumURL, 
			dataType: "html",
			success: function(data) {
				Rester.proxyURL = "";
				Rester.dataType = "html";
				console.log("Rester.proxyTest()", "Not using proxy server.");
			},
			error: function(data) {
				console.log("Rester.proxyTest()", "Using proxy server.");
			}
		});
	},
		
	getBasePath: function() {
		if (Rester.getProp('basePath') === undefined || Rester.getProp('basePath') === "") {
			Rester.setProp('basePath', $.mobile.path.get(window.location.href));
		}
		return Rester.getProp('basePath');
	},
	
	getFacebookToken: function() {
		return Rester.getProp('fbToken');
	},
	
	setFacebookToken: function(token) {
		Rester.setProp('fbToken', token);
	},
	
	initializeLocation: function() {
		var loc = Rester.getLocation();
		if (loc === undefined || loc === "") {
			console.log("initializeLocation()", "Location undefined.");
			Rester.setLocation(0);	// TODO: Temp fix until we can get dialog to popup.
			// $("#popupLocation").popup("open");
		}
	},
	
	getLocation: function() {
		return Rester.getProp('location');
	},
	
	setLocation: function(toLocation) {
		Rester.setProp('location', toLocation);
		// localStorage.setItem('tkoLastLocToken', toLocation);
	},
	
	getLocProp: function(prop) {
		return Rester.locations[Rester.getLocation()][prop];
	},
	
	createLocationMenu: function() {
		// <li><a data-rel="popup" onClick="Rester.switchLocation(event); return false" href="#locationMenuLevel1">San Bernardo</a></li>
		// <li><a data-rel="popup" href="#locationMenuLevel1">Shiloh</a></li>
		
		var text = "";
		var active = "";
		
		for (var i = 0; i < Rester.locations.length; i++) {
			if (i === Rester.getLocation()) {
				active = 'class="ui-list-active"';
			}
			text += 
				'<li><a data-rel="popup" href="#locationMenuLevel1" onClick="Rester.switchLocation(event);" ' +
				active + '>' +
				Rester.locations[i].name + 
				'</a></li>';
		}
		
		$('#locationMenu').html(text);
		$('#locationMenu').listview('refresh');
	},
	
	switchLocation: function(e) {
		var location = 0;
		for (var i = 0; i < Rester.locations.length; i++) {
			if (Rester.locations[i].name === e.currentTarget.innerHTML) {
				if (i !== Rester.getLocation()) {
					Rester.setLocation(i);
					if (Rester.getLocProp('customCSS') !== '') {
						$('#customLocationCSS').attr('href', Rester.getLocProp('customCSS'));
					}
					Rester.loadHomePage();
				}
			}
		}
	},
	
	loadHomePage: function() {
		
		var galleryURL = "";
		
		console.log("Rester.loadHomePage()", "Loading pictures from " + Rester.proxyURL + Rester.getLocProp('picturesURL'));
							
		Rester.createMap();
						
		$.ajax({
			
			url: Rester.proxyURL + Rester.getLocProp('picturesURL'),
			dataType: Rester.dataType,
			timeout: Rester.ajaxTimeout,
			ifModified: 'true',
			
			success: function(data) {
				
				temp = $(Rester.getDataContents(data)).find('div.ngg-album').get();
				galleryURL = $(temp[temp.length - 1]).find('a').attr('href');
				
				$.ajax({
					url: Rester.proxyURL + galleryURL,
					dataType: Rester.dataType,
					success: function(data) {
		
						var style = "";
						var text = "";
						var indicator = '<li class="active">1</li>';
						var images = $(Rester.getDataContents(data)).find('div.ngg-gallery-thumbnail-box');
						Rester.scrollSize = 0;
		
						for (var i = 0; i < images.length && i < Rester.MAX_SCROLL; i++) {
							Rester.scrollSize++;
							text += '<li>' + '<img src="' + $(images[i]).find('a').attr('href') + 
								'" alt="' + $(images[i]).find('img').attr('alt') + '"/>' + '</li>';
							indicator += ((i === 0) ? '' : '<li>' + (i + 1) + '</li>');
						}
		
						if (text !== '') {
							$('#thelist').html(text);
							Rester.fixScroller();
							window.myScroll = new iScroll('wrapper', {
								snap: false,
								momentum: true,
								hScrollbar: false
							});
						}
					},
					error: function() {
						console.log("loadHomePage()", 
							"An error occured loading the pictures. Please be sure you are connected to the internet.");
					}
				});
			},
			error: function() {
				console.log("loadHomePage()", 
					"An error occured loading the pictures. Please be sure you are connected to the internet.");
			}
		});
	},
	
	fixScroller: function() {
		var scrollMult = $(window).height() / 480.0;
		// var scrollStr = $('#scroller li').css('width');
		// var scrollWidth = scrollStr.substring(0, scrollStr.length - 2) * scrollMult;
		var scrollWidth = Rester.scrollWidth * scrollMult;
		$('#scroller li').css("width", scrollWidth + 'px');
		$('#wrapper').css('height', $(window).height() / 3 + 'px');
		$('#scroller').css('height', $(window).height() / 3 + 'px');
		$('#scroller li img').css('height', $(window).height() / 3 + 'px');
		$('#wrapper').css("width", $(window).width() + 'px');
		$('#scroller').css("width", scrollWidth * Rester.scrollSize);
	},
	
	setHeaderImage: function() {
		if (Rester.getLocProp('customCSS') !== '') {
			$('#customLocationCSS').attr('href', Rester.getLocProp('customCSS'));
		}
	},
	
	setTelephoneLink: function() {
		$('#telephone').attr('href', 'tel:' + Rester.getLocProp('telephone'));
	},
	
	setEmailLink: function() {
		$('#email').attr('href', 'mailto:' + Rester.getLocProp('email'));
	},
	
	createMap: function() {
		if (!googleMaps) { return; }
		$('#map_canvas').gmap('destroy');
		var loc = new google.maps.LatLng(Rester.getLocProp('latitude'), Rester.getLocProp('longitude'));
		$('#map_canvas').gmap({'center': loc, 'zoom': 15});
		$('#map_canvas').gmap('addMarker', {'position': loc });
    },
	
	loadSharePage: function() {
		Facebook.bodyLoad();
	},
	
	loadMenuPage: function() {
		console.log("Rester.loadMenuPage()", "Loading menu from " + Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('menuURL'),
			dataType: Rester.dataType,
			ifModified: 'true',
			timeout: Rester.ajaxTimeout,
			success: function(data) {
		
				var categories = [];
				var images = [];
				var description = "";
				var category = "";
				var image = "";
				var newHTML = "";
		
				$(Rester.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
					description = $(this).find('a').attr('title');
					image = $(this).find('img').attr('src');
					category = description.split(';')[0];
					if (categories.indexOf(category) === -1) {
						categories.push(category);
						images.push(image);
					}
				});
		
				$.each(categories, function(i, val) {
					if (val === ' ') {
						val = 'Uncategorizable';
					}
					newHTML += '<li class="menuCategory">' + 
					'<a href="menucategory.html" ' + 
					'onclick=\'Rester.setProp("menuCategory", "' + encodeURIComponent(val) + '");\'>' + 
					'<img src="' + images[i] + '"/><div class="menuCategoryTitle">' + Rester.toTitleCase(val) + '</div></a></li>';
				});
				$('#menuCategories').html(newHTML);
				$('#menuCategories').listview('refresh');
			},
			error: function() {
				Rester.setStatusMsg("Menu will be shown when a network connection is available.");
			}
		});
	},

	loadMenuCategoryPage: function() {

		var menuCategory = decodeURIComponent(Rester.getProp("menuCategory"));
		
		console.log(
			"Rester.loadMenuCategoryPage()", 
			"Loading menu category " + menuCategory + " from " + 
			Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('menuURL'),
			dataType: Rester.dataType,
			ifModified: 'true',
			timeout: Rester.ajaxTimeout,
			success: function(data) {

				var description = "";
				var category = "";
				var item = "";
				var image = "";
				var price = "";
				var newHTML = "";
									
				$(Rester.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
					description = $(this).find('a').attr('title');
					category = description.split(';')[0];
					price = description.split(';')[2];
					if (category === menuCategory) {
						item = $(this).find('img').attr('title');
						image = $(this).find('img').attr('src');
						newHTML += '<li class="menuItem">' +
							'<a href="menuitem.html" ' + 
							'onclick=\'Rester.setProp("menuItem", "' + encodeURIComponent(item) + '");\'>' +
							'<img src="' + image + '"/>' + '<div class="menuItemTitle">' + Rester.toTitleCase(item) + '</div>' + 
							'<div class="menuItemPrice">$' + price + '</div></a></li>';
					}
				});
				$('#menuItems').html(newHTML);
				$('#menuItems').listview('refresh');
			}, 
			error: function() {
				Rester.setStatusMsg("Menu will be shown when a network connection is available.");
			}
		});
	},

	loadMenuItemPage: function() {
		
		var menuItem = decodeURIComponent(Rester.getProp("menuItem"));

		console.log(
			"Rester.loadMenuItemPage()", 
			"Loading menu item " + menuItem + " from " + Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('menuURL'),
			dataType: Rester.dataType,
			ifModified: 'true',
			timeout: Rester.ajaxTimeout,
			success: function(data) {

				var title = "";
				var alt = "";
				var attributes = "";
				var category = "";
				var description = "";
				var price = "";
				var src = "";

				$(Rester.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
					title = $(this).find('img').attr('title');
					alt = $(this).find('img').attr('alt');
					if (title === menuItem) {
						attributes = $(this).find('a').attr('title');
						attributes = attributes.split(';');
						category = attributes[0];
						description = attributes[1];
						price = '$' + attributes[2];
						src = $(this).find('a').attr('href');
						$('#menuItem').html('<div class="menuItemDetails">' + 
							'<div class="menuItemDetailsTitle">' + Rester.toTitleCase(menuItem) + '</div>' + 
							'<div class="menuItemDetailsImage">' +
							'<img src="' + src + '" title="' + title + '" alt="' + alt +'"></img></div>' + 
							'<div class="menuItemDetailsDescription">' + description + '</div>' + 
							'<div class="menuItemDetailsPrice">Price: ' + price + '</div></div>');
					}
				});
			}, 
			error: function() {
				Rester.setStatusMsg("Menu will be shown when a network connection is available.");
			}
		});
	},

	loadEventsPage: function() {
		console.log("Rester.loadEventsPage()", "Loading events.");
		
		$('#wall').facebookWall({
			id: Rester.getLocProp('fbID'),
			access_token: Rester.fbAccessToken
		});
	},

	loadPicturesPage: function() {
		console.log("Rester.loadPicturesPage()", "Loading pictures from " + 
			Rester.proxyURL + Rester.getLocProp('picturesURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('picturesURL'),
			dataType: Rester.dataType,
			ifModified: 'true',
			timeout: Rester.ajaxTimeout,
			success: function(data) {
				$($(Rester.getDataContents(data)).find('div.ngg-album').get().reverse()).each(function(i) {
					$('#galleryList').append('<li class="galleryList">' + 
						'<a href="picturesgallery.html" ' + 
						'onclick=\'Rester.setProp("galleryURL", "' + $(this).find('a').attr('href') + '");\'>' +
						'<img src="' + $(this).find('img').attr('src') + '"/><div class="galleryTitle">' + 
						Rester.toTitleCase($(this).find('div.ngg-albumtitle').text()) + '</div></a></li>');
				});
				$('#galleryList').listview('refresh');
			},
			error: function() {
				Rester.setStatusMsg("Photos will be shown when a network connection is available.");
			}
		});
	},

	loadPicturesGalleryPage: function(e) {

		var galleryURL = Rester.getProp("galleryURL");

		console.log("Rester.loadPicturesGalleryPage()", "Loading gallery from " + Rester.proxyURL + galleryURL);
				
		$.ajax({
			url: Rester.proxyURL + galleryURL,
			dataType: Rester.dataType,
			ifModified: 'true',
			timeout: Rester.ajaxTimeout,
			success: function(data) {

				var text = "";
				var style = "";

				$(Rester.getDataContents(data)).find('div.ngg-gallery-thumbnail-box').each(function(i) {
					text += '<div class="pictureThumb">' + 
						'<a href="' + $(this).find('a').attr('href') + '" rel="external">' + 
						'<img src="' + $(this).find('img').attr('src') + '" alt="' + $(this).find('img').attr('alt') + '"/>' + '</a></div>';
				});

				if (text !== "") {
					$('#Gallery').html(text);
					window.photoSwipe = $("#Gallery a").photoSwipe({
						'jQueryMobile': true,
						'backButtonHideEnabled': false,
						'enableMouseWheel': false,
						'enableKeyboard': false
					});
				}
			},
			error: function() {
				Rester.setStatusMsg("Photos will be shown when a network connection is available.");
			}
		});
	}, 
	
	fixMusicPlayer: function() {
		// $('#playerWidget').css('width', $(window).width());
		// $('.sc-player').css('width', $(window).width());
	},
	
	loadMusicPage: function() {
		
		console.log("Rester.loadMusicPage()", "Loading music using SC-PLayer.");
		
		var url = "http://api.soundcloud.com/users/vjdrock/tracks.json?client_id=1ea1ab57eb6ef387a5c5b2d02484da4d";
		
			SC.initialize({
			    client_id: "1ea1ab57eb6ef387a5c5b2d02484da4d"
			  });
			
		var track_url = 'http://api.soundcloud.com/tracks/62759488';
		    SC.get('/resolve', {
		        url : track_url
		    }, function(track) {

		        $("#playSound").live("click", function() {
		            SC.stream("/tracks/" + track.id, function(sound) {
		                if (sound == null) { return; }
						alert("got here");
						Rester.scTrack = sound;
						Rester.scTrack.play();
		            });
		        });
		
				$("#stopSound").live("click", function(){
					if (Rester.scTrack == null) { return; }
					alert("got here");
					Rester.scTrack.stop();
				});
				
		    });
		
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
	}
};
