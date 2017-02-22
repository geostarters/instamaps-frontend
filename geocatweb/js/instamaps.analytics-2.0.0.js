

var _gaq = _gaq || [];
//var ga;
(function() {
	$.subscribe('loadConfig', function(e, data){

		var _mapConfig = {};
		var perfil = Cookies.get('perfil');
		var _userID="0000";
		var _userDimension="entitatUser";
		var visibilitat="none";
		if(data){
			_mapConfig =data;
			data.id?_userID=data.id:_userID=_userID;
			data.entitatUid?_userDimension=data.entitatUid:_userDimension=_userDimension;
			data.visibilitat?visibilitat=data.visibilitat:visibilitat=visibilitat;
			}


		if (isGeolocalUser() || $(location).attr('href').indexOf('geolocal.html') != -1 || perfil === 'geolocal') {
			ga('create', 'UA-46332195-6', 'auto');
		}else if (_mapConfig && _mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL || _mapConfig.tipusAplicacioId == TIPUS_APLIACIO_AOC){
			ga('create', 'UA-46332195-6', 'auto');
		}else{

			ga('create', 'UA-46332195-3', 'auto');
		}


		ga('set', 'transport', 'beacon');
	  ga('send', 'pageview');
		ga('set', 'dimension1', _userDimension);
		ga('set', 'userId', _userID);
		ga('send', 'event', 'aplicacio','visibilitat',visibilitat,2);

		//TODO poner el subscriber
		$.publish('loadGaEvents');
	});

	$.subscribe('trackEvent', function(e, data){
		checkIfAnalyticsLoaded(data);

	});

	$.subscribe('trackPageview', function(e, data){
		//$.publish('trackPageview', null);
		 ga('send', 'pageview');
	});

	$.subscribe('analyticsEvent', function(e, data){

		addAnalyticsEvent(data);
	});





})();

//$.publish('analyticsEvent',{event:['mapa', tipus_user+'fons', fons, 1]});

//_gaq.push(['_trackEvent', 'galeria privada', tipus_user+'veure mapa']);


function addAnalyticsEvent(dataEvents){
		var dataEventArray=[];
		try{
			dataEvents.event?dataEventArray=dataEvents.event:dataEventArray=dataEvents;
			var label_num=1;
			var event_label="";
			dataEventArray.length==4?label_num=dataEventArray[3]:label_num=label_num;
			dataEventArray.length<=2?event_label=event_label:event_label=dataEventArray[2];
													// category,action,label
/*
			console.info(dataEventArray[0])	;
			console.info(dataEventArray[1])	;
			console.info(event_label)	;
			*/													
			ga('send', 'event', dataEventArray[0],dataEventArray[1],event_label,label_num);
		}catch(err){


			ga('send', 'event', 'error','addAnalyticsEvent',err);
		}

}


function checkIfAnalyticsLoaded(data) {
	if($.isArray(_gaq)){
		setTimeout(function(){
			checkIfAnalyticsLoaded(data);
		}, 500);
	}else{
		//_gaq.push(data.event);
		addAnalyticsEvent(data);
	}
}



(function() {


  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

 /*
	console.info("entro");
	ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl'
			: 'http://www')
			+ '.google-analytics.com/analytics.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);


		*/

})();









/*

var dimensionValue = 'SOME_DIMENSION_VALUE';
ga('set', 'dimension1', dimensionValue);
ga('send', 'event', 'Videos', 'play', 'Fall Campaign',1);

ga('set', 'userId', {{USER_ID}}); // Set the user ID using signed-in user_id.

*/
