

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function activaModul() {
	var dfd = new jQuery.Deferred();

	var modul = getParameterByName('modul');

	if (modul == "psolar") {

		/*
		jQuery('#BetterWMS_js').remove();

		var script0 = document.createElement("script");
		script0.type = "text/javascript";
		script0.src = "https://www.google.com/jsapi";
		jQuery("head").append(script0);

		
		var script2 = document.createElement("script");
		script2.type = "text/javascript";
		script0.src =  "/moduls/" + modul + "/js/google_chart.js";
		
		jQuery("head").append(script2);
		
		
		
		
		var script1 = document.createElement("script");
		script1.type = "text/javascript";
		script1.src = "/moduls/" + modul + "/js/L.TileLayer.BetterWMS.PSolar.js";
		jQuery("body").append(script1);

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "/moduls/" + modul + "/js/modul_" + modul + ".js";
		jQuery("body").append(script);

		var css = document.createElement("link");
		css.rel = "stylesheet";
		css.href = "/moduls/" + modul + "/css/modul_" + modul + ".css";
		jQuery("head").append(css);

		dfd.resolve();

	} else {

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "/llibreries/js/leaflet/plugin/L.TileLayer.BetterWMS.js";
		jQuery("body").append(script);

		dfd.resolve();*/
	}

	return dfd.promise();

};

