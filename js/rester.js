/**
 * Restaurant app.
 * These are the primary functions and bindings for the restaurant application.
 * Used in conjunction with restuils.js.
 * Call initialize on bodyLoad.
 *
 * Author: Brian Piltin. Copyright (C) 2012. All rights reserved.
 */
//"use strict";

var Rester = {
		
	// Change the debug level to 0 to suppress console output messages.
	DEBUG: 0,
	FORCE_PROXY: true,

	// The version number allows us to clear the cache between versions
	// without user intervention in case there was an error with the dates.
	DB_VERSION: "v1",
		
	// Data for each individual restaurant location
	locations: [
		{	
			'name': 'San Bernardo',
			'telephone': '956-729-8700',
			'email': 'supervic@laredoheat.com',
			'address': '4100 San Bernardo Avenue  Laredo, TX 78041',
			'latLong': {latitude: '27.536739', longitude: '-99.504507'},
			'menuURL': 'http://v2.laredoheat.com/?page_id=2227',
			'picturesURL': 'http://v2.laredoheat.com/?page_id=1846',
			'musicURL': 'http://api.soundcloud.com/users/vjdrock/tracks.json',
			'fbID': '184375751588144',
			'fbName': 'The official TKO Laredo mobile app.',
			'fbDescription': "Visit the Laredo Heat website and get the free TKO Laredo app for iPhone and Android.",
			'fbLink': "http://v2.laredoheat.com/?page_id=1846",
			'fbPicture': "http://www.brianpiltin.com/tkolaredo/tko-logo.png",
			'fbCaption': 'TKO rocks!',
			'customCSS': 'theme/tko-sb.css'
		},
		{
			'name': 'Shiloh',
			'telephone': '956-568-0447',
			'email': 'supervic@laredoheat.com',
			'address': '520 Shiloh Dr Laredo TX 78045',
			'latLong': {latitude: '27.590219', longitude: '-99.482717'},
			'menuURL': 'http://v2.laredoheat.com/?page_id=2227',
			'picturesURL': 'http://v2.laredoheat.com/?page_id=2250',
			'musicURL': 'http://api.soundcloud.com/users/vjdrock/tracks.json',
			'fbID': '100004085199809',
			'fbName': 'The official TKO Laredo mobile app.',
			'fbDescription': "Visit the Laredo Heat website and get the free TKO Laredo app for iPhone and Android.",
			'fbLink': "http://v2.laredoheat.com/?page_id=1846",
			'fbPicture': "http://www.brianpiltin.com/tkolaredo/tko-logo.png",
			'fbCaption': 'TKO rocks!',
			'customCSS': 'theme/tko-sh.css'
		}
	], 

	// Keep the current location around so we don't need to get it from the db.
	curLoc: 0,

	// Variables used to transfer data between pages.
	menuCategory: null,
	menuItem: null,
	galleryURL: null,
	audioURL: null,
	audioTitle: null,
	artworkURL: null,

	// Keep track of when we go on or offline.
	online: true,
	
	// The URL for the proxy server to convert html to jsonp
	proxyURL: "http://www.differentdezinellc.com/proxy.php?url=",
	// proxyURL: "http://www.brianpiltin.com/proxy.php?proxy_url=",

	// The timeout in milliseconds for ajax calls
	ajaxTimeout: 5000,
	
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
	fbToken: null,

	// Soundmanager2 initialized flag
	smReady: false,
	
	// SoundCloud client id
	scClientID: '1ea1ab57eb6ef387a5c5b2d02484da4d',
	// The currently playing scTrack
	scTrack: null,
	scBufferTimer: 0,
	
	winHeight: 0,
	winWidth: 0,
	androidScrollFix: false,
	
	// The lawnchair based database for our properties and cache.
	db: null, 

	/**
	 * Test to see if the data passed in is valid.
	 * Params:
	 *	data: the data to test for validity.
	 * Return:
	 * 	true if the data is valid (not undefined), false otherwise.
	 */
	isValid: function(data) {
		var valid = true;
		if (typeof(data) === 'undefined' || data === null) {
			valid = false;
		} else if ($.isArray(data) && data.length === 0) {
			valid = false;
		} else if (typeof(data) === 'string' && data === '') {
			valid = false;
		}
		return valid;
	},

	isFunction: function(func) {
		return (func && typeof(func) === "function");
	},
	
	setProp: function(id, value, callback) {
		Rester.db.save({key: id+Rester.DB_VERSION, val: value}, function(obj) {
			if (Rester.isFunction(callback)) {
				callback(obj.val);
			}
		});
	},
	
	getProp: function(id, callback) {
		Rester.db.get(id+Rester.DB_VERSION, function(obj) {
			if (Rester.isFunction(callback)) {
				callback((Rester.isValid(obj)) ? obj.val : obj);
			}
		});
	},

	cacheData: function(id, data, expDays, expHours, callback) {
		var expiration = new Date();
		if (expDays) { expiration.setDate(expiration.getDate() + expDays); }
		if (expHours) { expiration.setHours(expiration.getHours() + expHours); }
		Rester.setProp(id+"exp", expiration.toISOString(), function() {
			Rester.setProp(id, data, function(data) {
				if (Rester.isFunction(callback)) {
					callback(data);
				}
			});
		});
	},
	
	/**
	 * Get data from the cache if it hasn't expired yet.
	 * Params:
	 *	id: the id of the cached data to return.
	 *	callback: the callback function to call when the data has been 
	 *		retrieved. Will pass in "undefined" on expired as well.
	 */
	getCachedData: function(id, callback, forceLoad) {
		Rester.getProp(id+"exp", function(expiration) {
			var now = new Date().toISOString();
			if ((Rester.isValid(expiration) && now < expiration) || forceLoad) {
				Rester.getProp(id, function(val) {
					if (Rester.isFunction(callback)) {
						callback(val);
					}
				});
			} else if (Rester.isFunction(callback)) {
				callback();
			}
		});
	},
	
	/**
	 * Get the contents of JSON or XML data depending on the type.
	 */
	getDataContents: function(data) {
		return (Rester.isValid(data) && Rester.isValid(data.contents)) ? data.contents : data;
	},

	/**
	 * Uses either the cache or ajax to load data from a specific source.
	 * Options include:
	 *	key: the key used to cache this object. (required)
	 * 	expDays: the number of days to expire the cache.
	 *	expHours: the number of hours to expire the cahce.
	 *	url: the url used to retreive this object from the network. (required)
	 * 	timeout: the timeout used when calling ajax before error.
	 *	dataType: the dataType to use for the ajax call.
	 * 	success: a callback function with the data as a parameter if
	 * 		we were able to load from either the cache or the url. (required)
	 * 	error: a callback function to execute if the data could not
	 * 		be loaded.
	 */ 
	loadData: function(userOptions) {
		
		var options = {
			key: "",
			expDays: 0,
			expHours: 0,
			url: "",
			timeout: Rester.ajaxTimeout,
			dataType: Rester.dataType,
			success: null,
			error: null
		};
		
		// Merge options with the default settings
        if (userOptions) {
            $.extend(options, userOptions);
        }
		
		console.log("Rester.loadData() :: Attempting to load data from cache using key: "+options.key);

		Rester.getCachedData(options.key, function(data) {

			if (Rester.isValid(data)) {

				// The data in the cache is valid, use that.
				console.log("Rester.loadData() :: successfully loaded data from cache.");
				if (Rester.isFunction(options.success)) { options.success(data); }

			} else if (!Rester.online) {

				// Attempt to force load the data.
				console.log("Rester.loadData() :: "+
					"Attempting to load expired data from cache using key: "+options.key);
				Rester.getCachedData(options.key, function(data) {

					if (Rester.isValid(data)) {
						// The data in the cache is valid, use that.
						console.log("Rester.loadData() :: successfully loaded data from cache.");
						if (Rester.isFunction(options.success)) { options.success(data); }
					} else {
						// Object can't be loaded and not cached.
						console.log("Rester.loadData() :: error loading data from url and cache.");
						if (Rester.isFunction(options.error)) { options.error(); }
					}
				}, true);

			} else {

				// Attempt to refresh data.
				console.log("Rester.loadData() :: Loading data from ajax at url: " + options.url);

				$.ajax({
					url: options.url,
					timeout: options.timeout,
					dataType: options.dataType,
					success: function(data) {
						
						console.log("Rester.loadData() :: ajax success.");

						if (!Rester.isValid(data)) {

							// Attempt to force load the data.
							console.log("Rester.loadData() :: "+
								"Attempting to load expired data from cache using key: "+options.key);
							Rester.getCachedData(options.key, function(data) {
								if (Rester.isValid(data)) {
									// The data in the cache is valid, use that.
									console.log("Rester.loadData() :: successfully loaded data from cache.");
									if (Rester.isFunction(options.success)) { options.success(data); }
								} else {
									// Object can't be loaded and not cached.
									console.log("Rester.loadData() :: error loading data from url and cache.");
									if (Rester.isFunction(options.error)) { options.error(); }
								}
							}, true);

						} else {
							// Object successfully loaded
							console.log("Rester.loadData() :: successfully cached data using key: "+options.key);
							Rester.cacheData(options.key, data, options.expDays, options.expHours);
							if (Rester.isFunction(options.success)) { options.success(data); }
						}
					},

					error: function() {
						// Attempt to force load the data.
						console.log("Rester.loadData() :: "+
							"Attempting to load expired data from cache using key: "+options.key);
						Rester.getCachedData(options.key, function(data) {
							if (Rester.isValid(data)) {
								// The data in the cache is valid, use that.
								console.log("Rester.loadData() :: successfully loaded data from cache: " + data);
								if (Rester.isFunction(options.success)) { options.success(data); }
							} else {
								// Object can't be loaded and not cached.
								console.log("Rester.loadData() :: error loading data from url and cache.");
								if (Rester.isFunction(options.error)) { options.error(); }
							}
						}, true);
					}
				});
			}
		});
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

	proxifyURL: function(url) {
		return (Rester.proxyURL === '') ? url : Rester.proxyURL+encodeURIComponent(url);
	},
	
	setStatusMsg: function(text) {
		$('.statusMsg').html(text);
	},
	
	onDeviceReady: function() {
		console.log("Rester.onDeviceReady() :: event received.");
		document.addEventListener("online", Rester.onOnline, false);
		document.addEventListener("offline", Rester.onOffline, false);
		document.addEventListener("pause", Rester.onPause, false);
		document.addEventListener("resume", Rester.onResume, false);
    },

	onPause: function() {
	    console.log("Rester.onPause()");
	},
	
	onResume: function() {
	    console.log("Rester.onResume() :: Active Page: "+$.mobile.activePage.attr('id'));
	    var funcID =  
	    	$.mobile.activePage.attr('id').charAt(0).toUpperCase()+
	    	$.mobile.activePage.attr('id').slice(1);
	    var funcString = 'Rester.load'+funcID+'();';
	    console.log("Rester.onResume() :: Calling function: "+funcString);
	    Rester.setStatusMsg("");
	    eval(funcString);
	},
	
	onOnline: function() {
		console.log("Rester.onOnline()");
		Rester.online = true;
	},
	
	onOffline: function() {
		console.log("Rester.onOffline()");
		Rester.online = false;
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
			Rester.winHeight = $(window).height();
			Rester.winWidth = $(window).width();
			$('.menuItemDetailsDescription').css("float", "left");
		} else { // landscape
			Rester.winWidth = $(window).height();
			Rester.winHeight = $(window).width();
			$('.menuItemDetailsDescription').css("float", "none");								
		}
		
		console.log("Rester.updateOrientation() :: winHeight="+Rester.winHeight+" winWidth="+Rester.winWidth);
		
		// $(document).width($(window).width());
		// Prevent the icons from getting pushed off bottom of window.
		Rester.fixWindow();
		Rester.fixScroller();
	},

	proxyTest: function(callback) {
		if (Rester.online && Rester.FORCE_PROXY === false) {
			$.ajax({
				url: Rester.locations[0].picturesURL, 
				dataType: "html",
				async: false,
				timeout: 5000,
				success: function(data) {
					Rester.proxyURL = "";
					Rester.dataType = "html";
					console.log("Rester.proxyTest() :: Not using proxy server.");
					if (Rester.isFunction(callback)) {
						callback();
					}
				},
				error: function(data) {
					console.log("Rester.proxyTest() :: Using proxy server.");
					if (Rester.isFunction(callback)) {
						callback();
					}
				}
			});
		} else {
			console.log("Rester.proxyTest() :: Using proxy server.");
			if (Rester.isFunction(callback)) {
				callback();
			}
		}
	},
		
	getBasePath: function(callback) {
		Rester.getProp('basePath', function(val) {
			if (!Rester.isValid(val)) {
				Rester.setProp('basePath', $.mobile.path.get(window.location.href));
			}
			if (Rester.isFunction(callback)) {
				callback(val);
			}
		});
	},
	
	getFacebookToken: function(callback) {
		Rester.getCachedData('fbToken', function(data) {
			if (Rester.isFunction(callback)) {
				callback(data);
			}
		});
	},
	
	setFacebookToken: function(token, callback) {
		Rester.cacheData('fbToken', token, 1, 0, function(data) {
			if (Rester.isFunction(callback)) {
				callback(data);
			}
		});
	},
	
	initLocation: function(callback) {
		Rester.getProp('location', function(val) {
			console.log("Rester.initLocation() :: Initializing location. loc="+val);
			if (!Rester.isValid(val)) {
				console.log("Rester.initLocation() :: Location undefined.");
				Rester.setProp('location', 0);
				Rester.curLoc = 0;
			} else {
				Rester.curLoc = val;
			}
			if (Rester.isFunction(callback)) {
				callback(val);
			}
		});
	},
	
	getLocation: function() {
		return Rester.curLoc;
	},
	
	setLocation: function(toLocation) {
		Rester.curLoc = toLocation;
	},
	
	getLocProp: function(prop) {
		return Rester.locations[Rester.getLocation()][prop];
	},

	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// `load`, `deviceready`, `offline`, and `online`.
	bindEvents: function() {
		
		console.log("Rester.bindEvents() :: Binding events... ");
		
		document.addEventListener('deviceready', Rester.onDeviceReady, false);
		
		$(window).bind('orientationchange', function() {
			Rester.updateOrientation();
		});
		
		$(document).bind("mobileinit", function() {
			$.mobile.allowCrossDomainPages = true;
			$.mobile.defaultPageTransition = "none";
			$.mobile.transitionFallbacks.slideout = "none";
			$.mobile.loader.prototype.options.text = "loading";
			$.mobile.loader.prototype.options.textVisible = false;
			$.mobile.loader.prototype.options.theme = "a";
			$.mobile.loader.prototype.options.html = "";
		});

		$(document).bind("pagebeforeshow", function(event, ui) {
			Rester.setStatusMsg("");
		});

		$('#homePage').live('pageinit', function(e) {
			try {
				console.log("#homePage.pageinit :: loading home page.");
				Rester.loadHomePage();
			} catch (x) {
				alert("#homePage.pageinit :: " + x.message);
			}
		});
		
		$('#homePage').live('pageshow', function(e) {
			try {
				console.log("#homePage.pageshow :: updating map and scroller.");
				try {
					$('#map_canvas').gmap('refresh');
				} catch (x) {
				}
				if (!Rester.isValid($('#thelist').html())) {
					Rester.loadHomePage();
				} else if (Rester.isValid(window.myScroll)) {
					window.myScroll.refresh();
				}
			} catch (x) {
				alert("#homePage.pageshow :: " + x.message);
			}
		});

		$('#sharePage').live('pageinit', function(e) {
			try {
				Rester.loadSharePage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#sharePage.pageinit :: " + x.message);
			}
		});

		$('#menuPage').live('pageinit', function(e) {
			try {
				Rester.loadMenuPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#menuPage.pageinit :: " + x.message);
			}
		});

		$('#menuCategoryPage').live('pageinit', function(e) {
			try {
				Rester.loadMenuCategoryPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#menuCategoryPage.pageinit :: " + x.message);
			}
		});

		$('#menuItemPage').live('pageinit', function(e) {
			try {
				Rester.loadMenuItemPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#menuItemPage.pageinit :: " + x.message);
			}
		});

		$('#eventsPage').live('pageinit', function(e) {
			try {
				Rester.loadEventsPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#eventsPage.pageinit :: " + x.message);
			}
		});

		$('#picturesPage').live('pageinit', function(e) {
			try {
				Rester.loadPicturesPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#picturesPage.pageinit :: " + x.message);
			}
		});

		$('#picturesGalleryPage').live('pageinit', function(e) {
			try {
				Rester.loadPicturesGalleryPage(e);
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#picturesGalleryPage.pageinit :: " + x.message);
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
				alert("#picturesGalleryPage.pagehide :: " + x.message);
			}
		});

		$('#musicPage').live('pageinit', function(e) {
			try {
				Rester.loadMusicPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#musicPage.pageinit :: " + x.message);
			}
		});

		$('#musicPlayerPage').live('pageinit', function(e) {
			try {
				Rester.loadMusicPlayerPage();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#musicPlayerPage.pageinit :: " + x.message);
			}
		});
		
		$('#musicPlayerPage').live('pagehide', function(e) {
			try {
				Rester.initMusicTrack();
			} catch (x) {
				$.mobile.changePage("index.html");
				alert("#musicPlayerPage.pagehide :: " + x.message);
			}
		});
		
		MapsLoader.readyCallback = function() {
			try {
				Rester.createMap();
			} catch (x) {
				
			}
			try {
				$('#map_canvas').gmap('refresh');
			} catch (x) {
				
			}
		};
	},
	
	initDB: function(callback) {
		Rester.db = new Lawnchair({name:'db'+Rester.DB_VERSION}, function(store) {
			var testObj = {test:"ok"};
			store.save({key: "test", val: "ok"}, function(obj) {
				console.log("Rester.initDB() :: key: test, value: "+obj.val); 
				if (Rester.isFunction(callback)) {  
        			callback();
    			}
			});
		});
	},
	
	// Rester Constructor
	init: function(callback) {

		if (!Rester.DEBUG) { 
			console.log = function() {};
		}

		Rester.initDB(function(store) {
			Rester.initLocation(function() {
				Rester.bindEvents();
				Rester.initSoundManager();
				Rester.proxyTest(function() {
					if (Rester.isFunction(callback)) {  
	        			callback();  
	    			}
	    			Rester.loadHomePage();
				});
			});
		});
	},
	
	createLocationMenu: function() {
		console.log("Rester.createLocationMenu() :: Creating menu.");
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
		try {
			$('#locationMenu').listview('refresh');
		} catch (x) {
			console.log("Rester.createLocationMenu :: "+x.message);
		}
	},
	
	switchLocation: function(e) {
		var location = 0;
		for (var i = 0; i < Rester.locations.length; i++) {
			if (Rester.locations[i].name === e.currentTarget.innerHTML) {
				if (i !== Rester.getLocation()) {
					Rester.setProp('location', i);
					Rester.curLoc = i;
					Rester.loadHomePage();
				}
			}
		}
	},
	
	setHeaderImage: function() {
		if (Rester.isValid(Rester.getLocProp('customCSS'))) {
			$('#customLocationCSS').attr('href', Rester.getLocProp('customCSS'));
		}
	},
	
	setTelephoneLink: function() {
		if (Rester.isValid(Rester.getLocProp('telephone'))) {
			$('#telephone').attr('href', 'tel:' + Rester.getLocProp('telephone'));
		}
	},
	
	setEmailLink: function() {
		if (Rester.isValid(Rester.getLocProp('email'))) {
			$('#email').attr('href', 'mailto:' + Rester.getLocProp('email'));
		}
	},
	
	createMap: function() {
		try {
			$('#map_canvas').gmap('destroy');
			var latLong = Rester.getLocProp('latLong');
			var loc = new google.maps.LatLng(latLong.latitude, latLong.longitude);
			$('#map_canvas').gmap({'center': loc, 'zoom': 15});
			$('#map_canvas').gmap('addMarker', {'position': loc });
			// Rester.cacheData("map"+Rester.getLocation(), $('#map_canvas'), 0, 0);
		} catch (x) {
			// Rester.getCachedData("map"+Rester.getLocation(), function(map) {
			// 	if (!Rester.isValid(map)) {
			// 		console.log("Rester.createMap() :: Google maps not loaded. Could not create map.");
			// 	} else {
			// 		$(map);
			// 	}
			// });
		}
    },
	
	fixScroller: function() {
		var scrollMult = 1.0;
		if (Rester.winHeight != 0) {
			scrollMult = $(window).height() / Rester.winHeight;
		}
		if (scrollMult > 1.0 || Rester.androidScrollFix == true) {
			// Fix for Android 2.2 and 2.3 weirdness
			Rester.androidScrollFix = true;
			return;
		}
		console.log("Rester.fixScroller() :: using a multiplier of " + scrollMult);
		var scrollWidth = Rester.scrollWidth * scrollMult;
		$('#scroller ul li').css("width", scrollWidth + 'px');
		$('#wrapper').css('height', $(window).height() / 3 + 'px');
		$('#scroller').css('height', $(window).height() / 3 + 'px');
		$('#scroller ul li img').css('height', $(window).height() / 3 + 'px');
		$('#wrapper').css("width", $(window).width() + 'px');
		$('#scroller').css("width", scrollWidth * Rester.scrollSize + 'px');
		if (Rester.isValid(window.myScroll)) {
			window.myScroll.refresh();
		}
	},

	createScroller: function(data) {
					
		var style = "";
		var text = "";
		// var indicator = '<li class="active">1</li>';
		var images = $(Rester.getDataContents(data)).find('div.ngg-gallery-thumbnail-box');
		Rester.scrollSize = 0;

		for (var i = 0; i < images.length && i < Rester.MAX_SCROLL; i++) {
			Rester.scrollSize++;
			text += '<li>' + '<img src="' + $(images[i]).find('a').attr('href') + 
				'" alt="' + $(images[i]).find('img').attr('alt') + '"/>' + '</li>';
			// indicator += ((i === 0) ? '' : '<li>' + (i + 1) + '</li>');
		}

		if (text != '') {
			$('#thelist').html(text);
			try {
				if (Rester.isValid(window.myScroll)) {
					window.myScroll.destroy();
				}
				Rester.fixScroller();
				window.myScroll = new iScroll('wrapper', {
					snap: false,
					momentum: true,
					hScrollbar: false
				});
				console.log("Rester.createScroller() :: Scroller creation successful.");
			} catch(x) {
				console.log("Rester.createScoller() :: Error initializing scroller: "+x);
			}
		}
	},
	
	loadHomePage: function() {
		
		console.log("Rester.loadHomePage() :: Loading pictures from "+
			Rester.proxifyURL(Rester.getLocProp("picturesURL")));
		
		Rester.setHeaderImage();
		Rester.setTelephoneLink();
		Rester.setEmailLink();
		Rester.createLocationMenu();
		Rester.createMap();

		Rester.loadData({
			url: Rester.proxifyURL(Rester.getLocProp("picturesURL")),
			key: "pictures"+Rester.getLocation(),
			expDays: 1,
			success: function(data) {
				
				var temp = $(Rester.getDataContents(data)).find('div.ngg-album').get();
				var galleryURL = $(temp[temp.length - 1]).find('a').attr('href');

				Rester.loadData({
					url: Rester.proxifyURL(galleryURL),
					key: "scroll"+Rester.getLocation(),
					expDays: 1,
					success: Rester.createScroller,
					error: function() {
						Rester.setStatusMsg("Photos will be shown when a network connection is available.");
					}});
			},
			error: function() {
				Rester.setStatusMsg("Photos will be shown when a network connection is available.");
			}
		});
	},
	
	loadSharePage: function() {
		if (!Rester.online) {
			$.mobile.changePage("index.html");
			alert("You must be online to use this feature.");
			return;
		}
		Facebook.bodyLoad();
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
			'onclick=\'Rester.menuCategory = "' + encodeURIComponent(val) + '";\'>' + 
			'<img src="' + images[i] + '"/><div class="menuCategoryTitle">' + Rester.toTitleCase(val) + '</div></a></li>';
		});
		$('#menuCategories').html(newHTML);
		$('#menuCategories').listview('refresh');
	},
	
	loadMenuPage: function() {
		console.log("Rester.loadMenuPage() :: Loading menu from "+
			Rester.proxifyURL(Rester.getLocProp("menuURL")));
		
		Rester.loadData({
			url: Rester.proxifyURL(Rester.getLocProp("menuURL")),
			key: "menu"+Rester.getLocation(),
			expHours: 1,
			success: Rester.createMenu,
			error: function() {
				Rester.setStatusMsg("Menu will be shown when a network connection is available.");
			}});
	},

	createMenuCategories: function(data) {

		var menuCategory = decodeURIComponent(Rester.menuCategory);
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
					'onclick=\'Rester.menuItem = "' + encodeURIComponent(item) + '";\'>' +
					'<img src="' + image + '"/>' + '<div class="menuItemTitle">' + Rester.toTitleCase(item) + '</div>' + 
					'<div class="menuItemPrice">$' + price + '</div></a></li>';
			}
		});
		$('#menuItems').html(newHTML);
		$('#menuItems').listview('refresh');
	},
	
	loadMenuCategoryPage: function() {	
		
		Rester.loadData({
			url: Rester.proxifyURL(Rester.getLocProp("menuURL")),
			key: "menu"+Rester.getLocation(),
			expHours: 1,
			success: Rester.createMenuCategories,
			error: function() {
				Rester.setStatusMsg("Menu will be shown when a network connection is available.");
			}});
			
	},
	
	createMenuItem: function(data) {
		
		var menuItem = decodeURIComponent(Rester.menuItem);
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

	loadMenuItemPage: function() {
		Rester.loadData({
			url: Rester.proxifyURL(Rester.getLocProp("menuURL")),
			key: "menu"+Rester.getLocation(),
			expHours: 1,
			success: Rester.createMenuItem,
			error: function() {
				Rester.setStatusMsg("Menu will be shown when a network connection is available.");
			}});
	},
	
	loadEventsPage: function() {
		console.log("Rester.loadEventsPage() :: Loading events.");
		
		$('#wall').facebookWall({
			id: Rester.getLocProp('fbID'),
			access_token: Rester.fbAccessToken
		});
	},

	loadPicturesPage: function() {
		console.log("Rester.loadPicturesPage() :: Loading pictures from " + 
			Rester.proxifyURL(Rester.getLocProp("picturesURL")));
		
		Rester.loadData({
			url: Rester.proxifyURL(Rester.getLocProp("picturesURL")),
			key: "pictures"+Rester.getLocation(),
			expDays: 1,
			success: Rester.createGalleryList,
			error: function() {
				Rester.setStatusMsg("Photos will be shown when a network connection is available.");
			}});
	},

	createGalleryList: function(data) {
		$($(Rester.getDataContents(data)).find('div.ngg-album').get().reverse()).each(function(i) {
			$('#galleryList').append('<li class="galleryList">' + 
				'<a href="picturesgallery.html" ' + 
				'onclick=\'Rester.galleryURL = "' + $(this).find('a').attr('href') + '";\'>' +
				'<img src="' + $(this).find('img').attr('src') + '"/><div class="galleryTitle">' + 
				Rester.toTitleCase($(this).find('div.ngg-albumtitle').text()) + '</div></a></li>');
		});
		$('#galleryList').listview('refresh');
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
		} else {
			Rester.setStatusMsg("A connection error occurred. Please try again later.");
		}
	},
	
	loadPicturesGalleryPage: function() {

		var gallery = Rester.galleryURL;

		console.log("Rester.loadPicturesGalleryPage() :: Loading gallery from " + Rester.proxifyURL(gallery));
			
		Rester.loadData({
			url: Rester.proxifyURL(gallery),
			key: encodeURI(gallery),
			expDays: 1,
			success: Rester.createPicturesGallery,
			error: function() {
				Rester.setStatusMsg("Photos will be shown when a network connection is available.");
			}});
	}, 
	
	loadMusicPage: function() {
		
		console.log("Rester.loadMusicPage() :: Loading music page.");
		
		Rester.loadData({
			url: Rester.proxifyURL(Rester.getLocProp('musicURL') + '?client_id=' + Rester.scClientID),
			key: "music"+Rester.getLocation(),
			expDays: 1,
			success: Rester.createTrackList,
			error: function() {
				Rester.setStatusMsg("Tracklist will be shown when a network connection is available.");
			}});
	},
	
	createTrackList: function(data) {

		var audioTitle = "";
		var artworkURL = "";
		var audioURL = "";
		var avatarURL = "";
		var newHTML = "";

		data = eval(Rester.getDataContents(data));
		for (var i = 0; i < data.length; i++) {
				audioTitle = data[i].title;
				artworkURL = data[i].artwork_url;
				audioURL = data[i].stream_url;
				newHTML += '<li class="audioTrack">' + 
				'<a href="musicplayer.html" ' + 
				'onclick=\'' + 
					'Rester.audioURL = "' + encodeURIComponent(audioURL) + '";' + 
					'Rester.audioTitle = "' + encodeURIComponent(audioTitle) + '";' + 
					'Rester.artworkURL = "' + encodeURIComponent(artworkURL) + '";\'>' + 
				'<img src="' + artworkURL + '"/><div class="trackTitle">' + audioTitle + '</div></a></li>';
		}
		// $('#avatar').html('<img src="'+data[0].user.avatar_url+'"></img>'+data[0].user.username);
		$('#trackList').html(newHTML);
		$('#trackList').listview('refresh');
	},
	
	loadMusicPlayerPage: function() {
		
		console.log("Rester.loadMusicPlayerPage() :: Loading.");
	
		$('#artworkImg').html('<img src="' + 
			decodeURIComponent(Rester.artworkURL).replace("large", "crop") + '"></img>');
		$('#audioTitle').html(decodeURIComponent(Rester.audioTitle));
	
		if (Rester.smReady && Rester.online) {
			Rester.initMusicTrack();
			$('#playerStatus').html("Buffering");
		  	Rester.scTrack = soundManager.createSound({
		      	id: Rester.audioTitle,
		      	url: decodeURIComponent(Rester.audioURL)+'?client_id=' + Rester.scClientID,
		      	onbufferchange: function() {
		      		Rester.updateSoundState(this);
    			},
    			whileloading: function() {
		      		Rester.updateSoundState(this);
    			},
    			whileplaying: function() {
		      		Rester.updateSoundState(this);
    			},
				onfinish: function() {
				    $('#pauseBtn').hide();
					$('#playBtn').show();
					$('#playerStatus').html("Paused");
					if (Rester.scTrack != null) {
						Rester.scTrack.pause();
						Rester.scTrack.setPosition(0);
						Rester.scBufferTimer = 0;
					}
				}
		    });
		    Rester.playMusicTrack();
		} else {
			$('#pauseBtn').hide(); 
			$('#playBtn').hide();
			if (Rester.online) {
				$('#playerStatus').html("We're sorry, but Soundcloud playback is not currently supported on your device.");
			} else {
				$('#playerStatus').html("You must be online to use this feature.");
			}
			console.log("Rester.loadMusicPlayerPage() :: soundManager.ok() failed.");
		}
	},
	
	initSoundManager: function() {
		if (Rester.smReady) return;
		soundManager.setup({
		  	url: 'lib/soundmanager2/swf/',
			  useFlashBlock: false, // optionally, enable when you're ready to dive in
				preferFlash: false,
				debugMode: false,
		  onready: function() {
		  	console.log('SM2 ready!');
			Rester.smReady = true;
		  },
		  ontimeout: function() {
		  	console.log('SM2 init failed!');
		  },
		  defaultOptions: {
		    // set global default volume for all sound objects
		    volume: 100
		  }
		});
	},
	
	playMusicTrack: function() {
		if (Rester.scTrack != null) {
			Rester.scTrack.play();
			$('#playBtn').hide();
			$('#pauseBtn').show();
			$('#playerStatus').html("Playing");
		}
	},
	
	pauseMusicTrack: function() {
		if (Rester.scTrack != null) {
			Rester.scTrack.pause();
			$('#pauseBtn').hide(); 
			$('#playBtn').show();
			$('#playerStatus').html("Paused");
		}
	},
	
	initMusicTrack: function() {
		try {
			if (Rester.scTrack != null) {
				Rester.scTrack.destruct();
				Rester.scTrack = null;
				Rester.scBufferTimer = 0;
			}
		} catch (x) {
			console.log("Rester.initMusicTrack() :: problem destroying track.");
		}
	},

	updateSoundState: function(sound) {
		if (sound.isBuffering) {
			if (!sound.paused) {
				$('#playerStatus').html("Buffering");
			}
		} else {
			if (sound.paused) {
				$('#playerStatus').html("Paused");
			} else {
				$('#playerStatus').html("Playing");
			}
		}
	}
};
