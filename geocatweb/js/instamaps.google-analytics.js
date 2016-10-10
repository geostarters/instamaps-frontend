/**
 * Se encargar de agregar el ga y controlar los eventos
 * 
 * require jQuery.cookie
 * require geocat.utils
 */
var _gaq = _gaq || [];
 
(function() {
	$.subscribe('loadConfig', function(e, data){
		var mapConfig = data,
			perfil = Cookies.get('perfil');
		//Diferenciem entre usuari Geolocal i Instamaps
		if (isGeolocalUser() || $(location).attr('href').indexOf('geolocal.html') != -1 || perfil === 'geolocal') {	  
			_gaq.push(['_setAccount', 'UA-46332195-6']);
		}else if (mapConfig && mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL){
			_gaq.push(['_setAccount', 'UA-46332195-6']);
		}else{ 
			_gaq.push(['_setAccount', 'UA-46332195-3']);
		}
	  	_gaq.push(['_trackPageview']);

		//TODO poner el subscriber
		$.publish('loadGaEvents');
	});
	
	$.subscribe('trackEvent', function(e, data){
		checkIfAnalyticsLoaded(data);
	});
	
	$.subscribe('trackPageview', function(e, data){
		_gaq.push(['_trackPageview']);
	});
})();

function checkIfAnalyticsLoaded(data) {
	if($.isArray(_gaq)){
		setTimeout(function(){
			checkIfAnalyticsLoaded(data);
		}, 500);
	}else{
		_gaq.push(data.event);
	}
}
 
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
