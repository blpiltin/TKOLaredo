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
			'musicURL': 'http://api.soundcloud.com/users/vjdrock/tracks.json',
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
			'musicURL': 'http://api.soundcloud.com/users/vjdrock/tracks.json',
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
	// proxyURL: "http://www.brianpiltin.com/proxy.php?proxy_url=",
	
	ajaxTimeout: 6000,
	
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
			$.mobile.loadingMessageTheme = 'a';
			$.mobile.loadingMessageTextVisible = true;
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
				try {
					$('#map_canvas').gmap('refresh');
				} catch (x2) {
				}
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
		
		$('#musicPlayerPage').live('pageshow', function(e) {
			try {
				Rester.loadMusicPlayerPage();
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
			// $('#cssSCWidgetOrientation').attr('href', 'lib/sc-player/css/sc-player-standard/structure-vertical.css');
			$('.menuItemDetailsDescription').css("float", "left");
		} else { // landscape
			// $('#cssSCWidgetOrientation').attr('href', 'lib/sc-player/css/sc-player-standard/structure-horizontal.css');
			$('.menuItemDetailsDescription').css("float", "none");								
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
			timeout: Rester.ajaxTimeout,
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
		if (loc == null) {
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
		
		var exp = Rester.getProp("scrollExpiration"+Rester.getLocation());
		var today = new Date();
		
		if (exp == null || today >= exp) {
			$.ajax({
			
				url: Rester.proxyURL + Rester.getLocProp('picturesURL'),
				dataType: Rester.dataType,
				timeout: Rester.ajaxTimeout,
				ifModified: 'true',
			
				success: function(data) {
				
					var temp = $(Rester.getDataContents(data)).find('div.ngg-album').get();
					galleryURL = $(temp[temp.length - 1]).find('a').attr('href');
				
					$.ajax({
						url: Rester.proxyURL + galleryURL,
						dataType: Rester.dataType,
						timeout: Rester.ajaxTimeout,
						ifModified: 'true',
						success: function(data) {
						
							var expiration=new Date();
							expiration.setDate(expiration.getDate()+1);
							Rester.setProp("scroll"+Rester.getLocation(), data);
							Rester.setProp("scrollExpiration"+Rester.getLocation(), expiration);
							Rester.createScroller(data);
						},
						error: function() {
							var data = Rester.getProp("scroll"+Rester.getLocation());
							if (data == null) {
								Rester.setStatusMsg("Photos will be shown when a network connection is available.");
							} else {
								Rester.createScroller(data);
							}
						}
					});
				},
			
				error: function() {
					var data = Rester.getProp("scroll"+Rester.getLocation());
					if (data == null) {
						Rester.setStatusMsg("Photos will be shown when a network connection is available.");
					} else {
						Rester.createScroller(data);
					}
				}
			});
		} else {
			Rester.createScroller(Rester.getProp("scroll"+Rester.getLocation()));
		}
	},
	
	createScroller: function(data) {
		
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
		try {
			$('#map_canvas').gmap('destroy');
			var loc = new google.maps.LatLng(Rester.getLocProp('latitude'), Rester.getLocProp('longitude'));
			$('#map_canvas').gmap({'center': loc, 'zoom': 15});
			$('#map_canvas').gmap('addMarker', {'position': loc });
			Rester.setProp("map"+Rester.getLocation(), $('#map_canvas').gmap());
		} catch (x) {
			console.log("createMap :: Google maps not loaded. Could not create map.");
		}
    },
	
	loadSharePage: function() {
		Facebook.bodyLoad();
	},
	
	loadMenuPage: function() {
		console.log("Rester.loadMenuPage()", "Loading menu from " + Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		var exp = Rester.getProp("menuExpiration"+Rester.getLocation());
		var today = new Date();
		
		if (exp == null || today >= exp) {
			$.ajax({
				url: Rester.proxyURL + Rester.getLocProp('menuURL'),
				dataType: Rester.dataType,
				ifModified: 'true',
				timeout: Rester.ajaxTimeout,
				success: function(data) {
		
					if (data == null) {
						data = Rester.getProp("menu"+Rester.getLocation());
						if (data == null) {
							Rester.setStatusMsg("There are currently no menu items available. Please check back later.");
							return;
						}
					} else {
						var expiration=new Date();
						expiration.setDate(expiration.getDate()+1);
						Rester.setProp("menuExpiration"+Rester.getLocation(), expiration);
						Rester.setProp("menu"+Rester.getLocation(), data);
					}
				
					Rester.createMenu(data);
				},
				error: function() {
				
					var data = Rester.getProp("menu"+Rester.getLocation());
					if (data == null) {
						Rester.setStatusMsg("Menu will be shown when a network connection is available.");
						return;
					}
					Rester.createMenu(data);
				}
			});
		} else {
			Rester.createMenu(Rester.getProp("menu"+Rester.getLocation()));
		}
	},

	createMenu: function(data) {
		
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
	
	loadMenuCategoryPage: function() {	
		var data = Rester.getProp("menu"+Rester.getLocation());
		if (data == null) {
			$.ajax({
				url: Rester.proxyURL + Rester.getLocProp('menuURL'),
				dataType: Rester.dataType,
				ifModified: 'true',
				timeout: Rester.ajaxTimeout,
				success: function(data) {
					Rester.setProp("menu"+Rester.getLocation(), data);
					Rester.createMenuCategories(data);
				},
				error: function() {
					Rester.setStatusMsg("Menu will be shown when a network connection is available.");
				}
			});
		} else {
			Rester.createMenuCategories(data);
		}
	},
	
	createMenuCategories: function(data) {
		var menuCategory = decodeURIComponent(Rester.getProp("menuCategory"));

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

	loadMenuItemPage: function() {
		
		var data = Rester.getProp("menu"+Rester.getLocation());
		if (data == null) {
			$.ajax({
				url: Rester.proxyURL + Rester.getLocProp('menuURL'),
				dataType: Rester.dataType,
				ifModified: 'true',
				timeout: Rester.ajaxTimeout,
				success: function(data) {
					Rester.setProp("menu"+Rester.getLocation(), data);
					Rester.createMenuItem(data);
				},
				error: function() {
					Rester.setStatusMsg("Menu will be shown when a network connection is available.");
				}
			});
		} else {
			Rester.createMenuItem(data);
		}
	},

	createMenuItem: function(data) {
		
		var menuItem = decodeURIComponent(Rester.getProp("menuItem"));
		
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
		
		var exp = Rester.getProp("picturesExpiration"+Rester.getLocation());
		var today = new Date();
		
		if (exp == null || today >= exp) {
			$.ajax({
				url: Rester.proxyURL + Rester.getLocProp('picturesURL'),
				dataType: Rester.dataType,
				ifModified: 'true',
				timeout: Rester.ajaxTimeout,
				success: function(data) {
					if (data == null) {
						data = Rester.getProp("pictures"+Rester.getLocation());
						if (data == null) {
							Rester.setStatusMsg("There are currently no photo galleries available. Please check back later.");
							return;
						}
					} else {
						var expiration=new Date();
						expiration.setDate(expiration.getDate()+1);
						Rester.setProp("picturesExpiration"+Rester.getLocation(), expiration);
						Rester.setProp("pictures"+Rester.getLocation(), data);
					}
					Rester.createGalleryList(data);
				},
				error: function() {
					var data = Rester.getProp("pictures"+Rester.getLocation());
					if (data == null) {
						Rester.setStatusMsg("Photos will be shown when a network connection is available.");
						return;
					}
					Rester.createGalleryList(data);
				}
			});
		} else {
			Rester.createGalleryList(Rester.getProp("pictures"+Rester.getLocation()));
		}
	},

	createGalleryList: function(data) {
		$($(Rester.getDataContents(data)).find('div.ngg-album').get().reverse()).each(function(i) {
			$('#galleryList').append('<li class="galleryList">' + 
				'<a href="picturesgallery.html" ' + 
				'onclick=\'Rester.setProp("galleryURL", "' + $(this).find('a').attr('href') + '");\'>' +
				'<img src="' + $(this).find('img').attr('src') + '"/><div class="galleryTitle">' + 
				Rester.toTitleCase($(this).find('div.ngg-albumtitle').text()) + '</div></a></li>');
		});
		$('#galleryList').listview('refresh');
	},
	
	loadPicturesGalleryPage: function(e) {

		var galleryURL = Rester.getProp("galleryURL");

		console.log("Rester.loadPicturesGalleryPage()", "Loading gallery from " + Rester.proxyURL + galleryURL);
				
		var exp = Rester.getProp(galleryURL+"Expiration");
		var today = new Date();
		
		if (exp == null || today >= exp) {
		
			$.ajax({
				url: Rester.proxyURL + galleryURL,
				dataType: Rester.dataType,
				ifModified: 'true',
				timeout: Rester.ajaxTimeout,
				success: function(data) {
					if (data == null) {
						data = Rester.getProp(galleryURL);
						if (data == null) {
							Rester.setStatusMsg("There are currently no photos available. Please check back later.");
							return;
						}
					} else {
						var expiration=new Date();
						expiration.setDate(expiration.getDate()+1);
						Rester.setProp(galleryURL+"Expiration", expiration);
						Rester.setProp(galleryURL, data);
					}
					Rester.createPicturesGallery(data);
				},
				error: function() {
					var data = Rester.getProp(galleryURL);
					if (data == null) {
						Rester.setStatusMsg("Photos will be shown when a network connection is available.");
						return;
					}
					Rester.createPicturesGallery(data);
				}
			});
		} else {
			Rester.createPicturesGallery(Rester.getProp(galleryURL));
		}
	}, 
	
	createPicturesGallery: function(data) {
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
	
	loadMusicPage: function() {
		
		console.log("Rester.loadMusicPage()", "Loading music using SC-PLayer.");
	
		var exp = Rester.getProp("musicExpiration"+Rester.getLocation());
		var today = new Date();
		
		if (exp == null || today >= exp) {
					
			$.ajax({
				url: Rester.getLocProp('musicURL') + '?client_id=' + Rester.scClientID,
				dataType: Rester.dataType,
				ifModified: 'true',
				timeout: Rester.ajaxTimeout,
				success: function(data) {
					
					if (data == null) {
						data = Rester.getProp("music"+Rester.getLocation());
						if (data == null) {
							Rester.setStatusMsg("There are currently no tracks available. Please check back later.");
							return;
						}
					} else {
						var expiration=new Date();
						expiration.setDate(expiration.getDate()+1);
						Rester.setProp("musicExpiration"+Rester.getLocation(), expiration);
						Rester.setProp("music"+Rester.getLocation(), data);
					}
				
					data = eval(data);
					Rester.createTrackList(data);
				
				},
				error: function() {
					var data = Rester.getProp("music"+Rester.getLocation());
					if (data == null) {
						Rester.setStatusMsg("Tracklist will be shown when a network connection is available.");
						return;
					}
					data = eval(data);
					Rester.createTrackList(data);
				}
			});
		} else {
			Rester.createTrackList(eval(Rester.getProp("music"+Rester.getLocation())));
		}
	},
	
	createTrackList: function(data) {
		var audioTitle = "";
		var artworkURL = "";
		var audioURL = "";
		var avatarURL = "";
		var newHTML = "";
		for (var i = 0; i < data.length; i++) {
				audioTitle = data[i].title;
				artworkURL = data[i].artwork_url;
				audioURL = data[i].download_url;
				newHTML += '<li class="audioTrack">' + 
				'<a href="musicplayer.html" ' + 
				'onclick=\'' + 
					'Rester.setProp("audioURL", "' + encodeURIComponent(audioURL) + '");' + 
					'Rester.setProp("audioTitle", "' + encodeURIComponent(audioTitle) + '");' + 
					'Rester.setProp("artworkURL", "' + encodeURIComponent(artworkURL) + '");\'>' + 
				'<img src="' + artworkURL + '"/><div class="trackTitle">' + audioTitle + '</div></a></li>';
		};
		// $('#avatar').html('<img src="'+data[0].user.avatar_url+'"></img>'+data[0].user.username);
		$('#trackList').html(newHTML);
		$('#trackList').listview('refresh');
	},
	
	fixMusicPlayer: function() {
		// $('#audioPlayer').css('width', $(window).width() + "px");
		// 	$('#artworkImg').css('width', $(window).width() + "px");
	},
	
	loadMusicPlayerPage: function() {
		
		console.log("loadMusicPlayerPage() :: loading...");
		
		// $('#artworkImg').css('background-image', 'url(' + decodeURIComponent(Rester.getProp("artworkURL")) + ')');
		$('#artworkImg').html('<img src="' + decodeURIComponent(Rester.getProp("artworkURL")) + '"></img>');
		$('#audioTitle').html(decodeURIComponent(Rester.getProp("audioTitle")));
		// if (Modernizr.audio.mp3) {
			$('#playerWidget').html(
				'<audio src="' + decodeURIComponent(Rester.getProp("audioURL")) + 
					'?client_id=' + Rester.scClientID + '" preload="auto"></audio>'
			);
			audiojs.events.ready(function() {
				var as = audiojs.createAll();
			});
		// } else {
		// 	$('#playerWidget').html('We appologize, but your system does not support this service.');
		// }
		Rester.fixMusicPlayer();
	}
};
