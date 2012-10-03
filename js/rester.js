/**
 * Restaurant app.
 * These are the primary functions and bindings for the restaurant application.
 * Used in conjunction with restuils.js.
 * Call initialize on bodyLoad.
 *
 * Author: Brian Piltin. Copyright (C) 2012. All rights reserved.
 */

var Rester = {
		
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
			'musicURL': 'http://soundcloud.com/hayashi-1',
			'fbID': '184375751588144',
			'fbName': 'The TKO Laredo app for iPhone.',
			'fbDescription': "Visit the Laredo Heat website and get the TKO app for iPhone.",
			'fbLink': "http://v2.laredoheat.com/?page_id=1846",
			'fbPicture': "http://www.brianpiltin.com/tkolaredo/tko-logo.png",
			'fbCaption': 'TKO rocks!',
			'customCSS': ''
		},
		{
			'name': 'Shiloh',
			'telephone': '956-568-0447',
			'email': 'supervic@laredoheat.com',
			'address': '520 Shiloh Dr Laredo TX 78045',
			'latitude': '27.590219',
			'longitude': '-99.482717',
			'menuURL': 'http://v2.laredoheat.com/?page_id=2227',
			'picturesURL': 'http://v2.laredoheat.com/?page_id=2215',
			'musicURL': 'http://soundcloud.com/vjdrock',
			'fbID': '100004085199809',
			'fbName': 'The TKO Laredo app for iPhone.',
			'fbDescription': "Visit the Laredo Heat website and get the TKO app for iPhone.",
			'fbLink': "http://v2.laredoheat.com/?page_id=1846",
			'fbPicture': "http://www.brianpiltin.com/tkolaredo/tko-logo.png",
			'fbCaption': 'TKO rocks!',
			'customCSS': ''
		}
	], 
	
	// The current restaurant location
	currentLoc: 0, 
	lastLocToken: 'tkoLastLocToken',
	
	// The URL for the proxy server to convert html to jsonp
	proxyURL: "http://differentdezinellc.com/proxy.php?url=",
	dataType: "jsonp",
	
	// The maximum number of photos on the front page scroll
	MAX_SCROLL: 5,
	// The current number of photos in the front page scroll
	scrollSize: 0,
	
	// Facebook access token
	fbAccessToken: '512052125490353|_kF0WEqfTTkguYp853eydB0Bayk',

	// Rester Constructor
	initialize: function() {
		this.proxyTest();
		this.bindEvents();
	},
	
	getLocProp: function(prop) {
		return _.pluck(this.locations, prop)[this.currentLoc];
	},
	
	fixWindow: function() {
		$(document).width($(window).width() - 5);
		$('html').css("width", $(window).width() - 5);
		$('body').css("width", $(window).width() - 5);
	},
	
	/**
	 * Fix the orientation of any css based widgets after the
	 * orientation has changed.
	 */
	updateOrientation: function() {
		var winOr = window.orientation;
		if (winOr == 0 || winOr == 180) { // portrait
			$('#cssSCWidgetOrientation').attr('href', 'lib/sc-player/css/sc-player-standard/structure-vertical.css');
		} else { // landscape
			$('#cssSCWidgetOrientation').attr('href', 'lib/sc-player/css/sc-player-standard/structure-horizontal.css');								
		}
		// $(document).width($(window).width());
		// Prevent the icons from getting pushed off bottom of window.
		this.fixWindow();
		this.fixScroller();
		this.fixMusicPlayer90;
		// if ($.mobile.activePage === $("#homePage")) {
			Rester.loadHomePage();
			RestUtils.debug("Rester.updateOrientation()", "Reloading home page.");
		// }
	},

	proxyTest: function() {
		$.ajax({
			url: Rester.albumURL, 
			dataType: "xml",
			success: function(data) {
				Rester.proxyURL = "";
				Rester.dataType = "xml";
				RestUtils.debug("Rester.proxyTest()", "Not using proxy server.");
			},
			error: function(data) {
				RestUtils.debug("Rester.proxyTest()", "Using proxy server.");
			}
		});
	},
	
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// `load`, `deviceready`, `offline`, and `online`.
	bindEvents: function() {
		
		RestUtils.debug("Rester.bindEvents()", "Binding events... ");
		
		$(window).bind('orientationchange', function() {
			Rester.updateOrientation();
		});
		
		$(document).bind("mobileinit", function() {
			// Make your jQuery Mobile framework configuration changes here!
			$.mobile.allowCrossDomainPages = true;
			$.mobile.defaultPageTransition = 'slide';
			// $.mobile.touchOverflowEnabled = true;
			$.mobile.pushStateEnabled = false;
		});

		$(document).delegate("#homePage", "pageinit", function(e) {
			try {
				if (localStorage.getItem(this.lastLocToken)) {
					this.currentLoc = localStorage.getItem(this.lastLocToken);
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
				currentPage = $(x.target),
					photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

				if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
					PhotoSwipe.detatch(photoSwipeInstance);
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

	loadHomePage: function() {
		
		var error = "";
		var galleryURL = "";
		
		RestUtils.debug("Rester.loadHomePage()", "Loading pictures from " + Rester.proxyURL + Rester.getLocProp('picturesURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('picturesURL'),
			dataType: Rester.dataType,
			success: function(data) {
				temp = $(RestUtils.getDataContents(data)).find('div.ngg-album').get();
				galleryURL = $(temp[temp.length - 1]).find('a').attr('href');
				galleryURL = encodeURIComponent(galleryURL);
				
				$.ajax({
					url: Rester.proxyURL + galleryURL,
					dataType: Rester.dataType,
					success: function(data) {

						var style = "";
						var text = "";
						var indicator = '<li class="active">1</li>';
						var images = $(RestUtils.getDataContents(data)).find('div.ngg-gallery-thumbnail-box');
						Rester.scrollSize = 0;

						for (var i = 0; i < images.length && i < Rester.MAX_SCROLL; i++) {
							Rester.scrollSize++;
							text += '<li>' + '<img src="' + $(images[i]).find('a').attr('href') + 
								'" alt="' + $(images[i]).find('img').attr('alt') + '"/>' + '</li>';
							indicator += (i == 0) ? '' : '<li>' + (i + 1) + '</li>';
						};

						if (text != '') {
							$('#thelist').html(text);
							$('#indicator').html(indicator);
							Rester.fixScroller();
							window.myScroll = new iScroll('wrapper', {
								snap: true,
								momentum: false,
								hScrollbar: false,
								onScrollEnd: function() {
									document.querySelector('#indicator > li.active').className = '';
									document.querySelector('#indicator > li:nth-child(' + (this.currPageX + 1) + ')').className = 'active';
								}
							});
						}
					},
					error: function() {
						error = "An error occured loading the pictures. Please be sure you are connected to the internet.";
					}
				});
			},
			error: function() {
				error = 'An error occured loading the pictures. Please be sure you are connected to the internet.';
			}
		});
		
		this.setTelephoneLink();
		this.setEmailLink();
		this.createLocationMenu();
		
		if (error != "") throw error;
	},
	
	fixScroller: function() {

		$('#wrapper').css('height', $(window).height() / 3 + 'px');
		$('#wrapper').css("width", $(window).width() + 'px');
		// $('#scroller').css("width", $('#scroller li').css("width") * scrollSize + 'px');
		$('#scroller').css("width", ($(window).width() * this.scrollSize) + 'px');
		$('#scroller li').css("height", $(window).height() / 3 + 'px');
		$('#scroller li').css("width", $(window).width() + 'px');
		$('#scroller li img').css("height", $(window).height() / 3 + 'px');
		//$('#nav').css("width", $(window).width());
	},
	
	createLocationMenu: function() {
		// <li><a data-rel="popup" onClick="Rester.switchLocation(event); return false" href="#locationMenuLevel1">San Bernardo</a></li>
		// <li><a data-rel="popup" href="#locationMenuLevel1">Shiloh</a></li>
		
		var text = "";
		var active = "";
		
		for (var i = 0; i < this.locations.length; i++) {
			if (i === this.currentLoc) active = 'class="ui-list-active"';
			text += 
				'<li><a data-rel="popup" href="#locationMenuLevel1" onClick="Rester.switchLocation(event);" ' +
				active + '>' +
				this.locations[i].name + 
				'</a></li>'
		}
		
		$('#locationMenu').html(text);
		$('#locationMenu').listview('refresh');
	},
	
	switchLocation: function(e) {
		var location = 0;
		for (var i = 0; i < this.locations.length; i++) {
			if (this.locations[i].name === e.currentTarget.innerHTML) {
				if (i != this.currentLoc) {
					this.currentLoc = i;
					localStorage.setItem(this.lastLocToken, this.currentLoc);
					if (Rester.getLocProp('customCSS') != '') 
						$('#customLocationCSS').attr('href', Rester.getLocProp('customCSS'));
					document.getElementById('mapPage').contentDocument.location.reload(true);
					this.loadHomePage();
				}
			}
		}
		
	},
	
	setTelephoneLink: function() {
		$('#telephone').attr('href', 'tel:' + Rester.getLocProp('telephone'));
	},
	
	setEmailLink: function() {
		$('#email').attr('href', 'mailto:' + Rester.getLocProp('email'));
	},
	
	loadMapPage: function(mapDoc) {
        var myLatlng = new google.maps.LatLng(Rester.getLocProp('latitude'), Rester.getLocProp('longitude'));
        var myOptions = {
            zoom: 15,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        var map = new google.maps.Map( mapDoc.getElementById( "map_canvas" ), myOptions );
		var marker = new google.maps.Marker({"map": map, "position": myLatlng });
    },
	
	loadSharePage: function() {
		Facebook.bodyLoad();
	},
	
	loadMenuPage: function() {
		var error = "";
		
		RestUtils.debug("Rester.loadMenuPage()", "Loading menu from " + Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('menuURL'),
			dataType: Rester.dataType,
			success: function(data) {

				var categories = [];
				var images = [];
				var description = "";
				var category = "";
				var image = "";
				var newHTML = "";

				$(RestUtils.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
					description = $(this).find('a').attr('title');
					image = $(this).find('img').attr('src');
					category = description.split(';')[0];
					if (categories.indexOf(category) == -1) {
						categories.push(category);
						images.push(image);
					}
				});

				$.each(categories, function(i, val) {
					if (val === ' ') val = 'Uncategorizable';
					newHTML += '<li class="menuCategory"><a href="menucategory.html?category=' + 
						encodeURIComponent(val) + '">' + 
						'<img src="' + images[i] + '"/>' + RestUtils.toTitleCase(val) + '</a></li>';
				});
				$('#menuCategories').html(newHTML);
				$('#menuCategories').listview('refresh');
			},
			error: function() {
				error = 'An error occured loading the menu. Please be sure you are connected to the internet.';
			}
		});
		
		if (error != "") throw error;
	},

	loadMenuCategoryPage: function() {

		var error = "";
		var menuCategory = decodeURIComponent(RestUtils.getURLParameter("category"));
		
		RestUtils.debug(
			"Rester.loadMenuCategoryPage()", 
			"Loading menu category " + menuCategory + " from " + 
			Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('menuURL'),
			dataType: Rester.dataType,
			success: function(data) {

				var description = "";
				var category = "";
				var item = "";
				var image = "";
				var price = "";
				var newHTML = "";
				
				$(RestUtils.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
					description = $(this).find('a').attr('title');
					category = description.split(';')[0];
					price = description.split(';')[2];
					if (category === menuCategory) {
						item = $(this).find('img').attr('title');
						image = $(this).find('img').attr('src');
						newHTML += '<li class="menuItem"><a href="menuitem.html?item=' + 
							encodeURIComponent(item) + '">' + 
							'<img src="' + image + '"/>' + '<div class="menuItemTitle">' + RestUtils.toTitleCase(item) + '</div>' + 
							'<div class="menuItemPrice">$' + price + '</div></a></li>';
					}
				});
				$('#menuItems').html(newHTML);
				$('#menuItems').listview('refresh');
			},
			error: function() {
				error = 'An error occured loading the menu. Please be sure you are connected to the internet.';
			}
		});
		if (error != "") throw error;
	},

	loadMenuItemPage: function() {
		var error = "";
		var menuItem = decodeURIComponent(RestUtils.getURLParameter("item"));

		RestUtils.debug(
			"Rester.loadMenuItemPage()", 
			"Loading menu item " + menuItem + " from " + Rester.proxyURL + Rester.getLocProp('menuURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('menuURL'),
			dataType: Rester.dataType,
			success: function(data) {

				var title = "";
				var attributes = "";
				var category = "";
				var description = "";
				var price = "";
				var src = "";

				$(RestUtils.getDataContents(data)).find('div.ngg-gallery-thumbnail').each(function(i) {
					title = $(this).find('img').attr('title');
					if (title === menuItem) {
						attributes = $(this).find('a').attr('title');
						attributes = attributes.split(';');
						category = attributes[0];
						description = attributes[1];
						price = '$' + attributes[2];
						src = $(this).find('img').attr('src');
						$('#menuItem').html('<div class="menuItemDetails">' + 
							'<div class="menuItemDetailsTitle">' + RestUtils.toTitleCase(menuItem) + '</div>' + 
							'<div class="menuItemDetailsImage">' + $(this).find('img').outerHTML() + '</div>' +
							//'<img href="' + src + '"></img><br/>' + 
							'<div class="menuItemDetailsDescription">' + description + '</div>' + 
							'<div class="menuItemDetailsPrice">Price: ' + price + '</div></div>');
					}
				});
			},
			error: function() {
				error = 'An error occured loading the menu. Please be sure you are connected to the internet.';
			}
		});
		if (error != "") throw error;
	},

	loadEventsPage: function() {
		var error = "";
		
		RestUtils.debug("Rester.loadEventsPage()", "Loading events.");
		
		$('#wall').facebookWall({
			id: Rester.getLocProp('fbID'),
			access_token: Rester.fbAccessToken
		});
		
		// //$("#facebookFeed").facebookfeed({access_token:'208593485852783|DR_IYpYWIqC5wZ1cE6TouXcXOOI'});
		//  $("#facebookFeed").facebookfeed(
		// 	{
		// 		access_token:'512052125490353|_kF0WEqfTTkguYp853eydB0Bayk', 
		// 		id: Rester.getLocProp('fbID'), 
		// 		template: '<h3>${from.name}</h3><h4>${created_time}</h4><p>${message}</p><p>Read more:&nbsp;<a href="${link}">${name}</a></p>',
		// 		query:{limit:10, date_format: 'F j, Y, g:i a'}
		// 	});
	},

	loadPicturesPage: function() {
		var error = "";
		
		RestUtils.debug("Rester.loadPicturesPage()", "Loading pictures from " + Rester.proxyURL + Rester.getLocProp('picturesURL'));
		
		$.ajax({
			url: Rester.proxyURL + Rester.getLocProp('picturesURL'),
			dataType: Rester.dataType,
			success: function(data) {
				$($(RestUtils.getDataContents(data)).find('div.ngg-album').get().reverse()).each(function(i) {
					$('#galleryList').append('<li class="galleryList">' + 
						'<a href="picturesgallery.html?galleryURL=' + encodeURIComponent($(this).find('a').attr('href')) + '">' + 
						'<img src="' + $(this).find('img').attr('src') + '"/>' + RestUtils.toTitleCase($(this).find('div.ngg-albumtitle').text()) + '</a></li>');
					//$('#galleryList').append('<li>' + $(this).find('div.ngg-albumtitle').text() + '</li>');
					//$('#picturesDivTest').append($('div.ngg-albumtitle', $(this)).text());
				});
				$('#galleryList').listview('refresh');
			},
			error: function() {
				error = 'An error occured loading the pictures. Please be sure you are connected to the internet.';
			}
		});
		if (error != "") throw error;
	},

	loadPicturesGalleryPage: function(e) {
		var error = "";
		// var galleryURL = decodeURIComponent(getURLParameter("galleryURL"));
		var galleryURL = RestUtils.getURLParameter("galleryURL");

		RestUtils.debug("Rester.loadPicturesGalleryPage()", "Loading gallery from " + Rester.proxyURL + galleryURL);
				
		$.ajax({
			url: Rester.proxyURL + galleryURL,
			dataType: Rester.dataType,
			success: function(data) {

				var text = "";
				var style = "";

				$(RestUtils.getDataContents(data)).find('div.ngg-gallery-thumbnail-box').each(function(i) {
					text += '<div class="pictureThumb" style="float:left;margin-left:5px">' + 
						'<a href="' + $(this).find('a').attr('href') + '" rel="external">' + 
						'<img src="' + $(this).find('img').attr('src') + '" alt="' + $(this).find('img').attr('alt') + '"/>' + '</a></div>';
				});

				if (text != "") {
					$('#Gallery').html(text);
					window.photoSwipe = $("#Gallery a").photoSwipe({
						'jQueryMobile': true,
						'backButtonHideEnabled': false,
						'enableMouseWheel': false,
						'enableKeyboard': false,
						'allowUserZoom': true
					});
				}
			},
			error: function() {
				error = "An error occured loading the pictures. Please be sure you are connected to the internet.";
			}
		});
		if (error != "") throw error;
	}, 
	
	fixMusicPlayer: function() {
		// $('#playerWidget').css('width', $(window).width());
		// $('.sc-player').css('width', $(window).width());
	},
	
	loadMusicPage: function() {
		
		RestUtils.debug("Rester.laodMusicPage()", "Loading music usinc SCPLayer.");
				
		$('a.sc-player, div.sc-player').attr('href', Rester.getLocProp('musicURL'));
		$('a.sc-player, div.sc-player').scPlayer();
		this.fixMusicPlayer();
	},
};
