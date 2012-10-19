var MapsLoader = {
	
	state: "",
	
	readyCallback: null,
	
	init: function() {
		
		if (MapsLoader.state == "" || MapsLoader.state == "error") {
			MapsLoader.load();
		}
		
		console.log("MapsLoader.setup() :: Setting up Google maps loader.");
				
	    document.addEventListener("online", function(e) {
	        if (MapsLoader.state == "" || MapsLoader.state == "error") {
	            MapsLoader.load();
	        }
	    }, false);
	},

	load: function() {
		
		console.log("MapsLoader.load() :: Loading Google maps API.");
		
	    MapsLoader.state = "loading";

	    var script = document.createElement("script");
	    script.src = "http://maps.google.com/maps/api/js?v=3.7&sensor=true&callback=MapsLoader.ready";
	    script.type = "text/javascript";

	    script.addEventListener("error", function(e) {
	        MapsLoader.state = "error";
	    }, false);

	    script.addEventListener("load", function(e) {
	        setTimeout(function() {
	            if (MapsLoader.state == "loading") MapsLoader.state = "error";
	        }, 5000);
	    }, false);

	    document.getElementsByTagName("head")[0].appendChild(script);
	},

	ready: function() {
		console.log("MapsLoader.ready() :: Google maps API loaded.");
	    MapsLoader.state = "ready";
		if (MapsLoader.readyCallback) {
			MapsLoader.readyCallback();
		}
	},

	checkAvailability: function() {
	    var connectionState = navigator.network.connection.type;
	    if (connectionState == Connection.NONE || connectionState == Connection.UNKNOWN) {
	        return "No network connection available";
	    }

	    if (MapsLoader.state == "" || MapsLoader.state == "error") {
	        return "Maps are not currently available";
	    }

	    if (MapsLoader.state == "loading") {
	        return "Maps are loading, try again aoon";
	    }

	    return "";
	}
}
