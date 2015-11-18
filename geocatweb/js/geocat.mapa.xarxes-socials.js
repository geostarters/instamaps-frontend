/**
 * Gestió de la creació i carrega de capes de tipus social:
 * - L.Panoramio.custom.js
 * - L.Wikipedia.custom.js
 * - L.Twitter.custom.js
 */

function addPanoramioLayer(){
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'panoramio', 'label panoramio', 1]);
	//_kmq.push(['record', 'panoramio', {'from':'mapa', 'tipus user':tipus_user}]);
	
	var panoramio = new L.Panoramio.custom({
		maxLoad: 10, 
		maxTotal: 250, 
		nom : 'panoramio',
		businessId: '-1',
		tipus: t_xarxes_socials
	});
	
	if(typeof url('?businessid') == "string"){
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: 'panoramio',
			serverType: t_xarxes_socials,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: controlCapes._lastZIndex+1,
            epsg: '4326',
            transparency: true,
            visibilitat: visibilitat_open,
			options: '{"xarxa_social": "panoramio"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				panoramio.options.businessId = results.results.businessId;
				panoramio.addTo(map);
				panoramio.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(panoramio, 'panoramio', true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});	
	}else{
		panoramio.addTo(map);
		panoramio.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(panoramio, 'panoramio', true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
}

function loadPanoramioLayer(layer){	
	var panoramio = new L.Panoramio.custom({
		maxLoad: 10, 
		maxTotal: 250, 
		zIndex: parseInt(layer.capesOrdre),
		nom : layer.serverName,
		tipus : layer.serverType,
		businessId: layer.businessId
	});	
	
	var options = jQuery.parseJSON( layer.options );
	if (options.group){
		panoramio.options.group=options.group;
	}
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		panoramio.addTo(map);
	}
	controlCapes.addOverlay(panoramio, layer.serverName, true);
	controlCapes._lastZIndex++;
}

function addTwitterLayer(){
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'twitter', hashtag, 1]);	
	//_kmq.push(['record', 'twitter', {'from':'mapa', 'tipus user':tipus_user, 'hashtag':hashtag}]);
	
	var hashtag = $('#twitter-collapse .input-group #hashtag_twitter_layer').val();
	//Control no afegit #
	if(hashtag.indexOf("#") == 0) hashtag = hashtag.substr(1);
	
	if(hashtag == null || hashtag == "") return;
	
	$('#twitter-collapse .input-group #hashtag_twitter_layer').val("");
	var twitter = new L.Twitter({
		hashtag: hashtag,
		nom: 'twitter #'+ hashtag,
		businessId: '-1',
		tipus: t_xarxes_socials
	});

	//Si el mapa existeix a BD
	if(typeof url('?businessid') == "string"){	
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: 'twitter #'+ hashtag,
				serverType: t_xarxes_socials,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            order: controlCapes._lastZIndex+1,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: visibilitat_open,
				options: '{"xarxa_social": "twitter", "hashtag": "'+hashtag+'"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				twitter.options.businessId = results.results.businessId;
				twitter.addTo(map);
				twitter.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(twitter, 'twitter #'+ hashtag, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});	
	}else{
		twitter.addTo(map);
		twitter.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(twitter, 'twitter #'+ hashtag, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
	//Tanquem input twitter
	$('#twitter-collapse').hide();
} 

function loadTwitterLayer(layer, hashtag){
	var twitter = new L.Twitter({
		hashtag: hashtag,
		nom: layer.serverName,
		tipus : layer.serverType,
		zIndex: parseInt(layer.capesOrdre), 
		businessId: layer.businessId
	});	
	
	
	var options = jQuery.parseJSON( layer.options );
	if (options.group){
		twitter.options.group=options.group;
	}
	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		twitter.addTo(map);
	}
	controlCapes.addOverlay(twitter, layer.serverName, true);
	controlCapes._lastZIndex++;
}





function addWikipediaLayer(){	
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'wikipedia', 'label wikipedia', 1]);
	//_kmq.push(['record', 'wikipedia', {'from':'mapa', 'tipus user':tipus_user}]);
	
	var keyName = $('#wikipedia-collapse .input-group #name_wikipedia_layer').val();	
	
	var wikipedia = new L.Wikipedia({
		nom : 'wikipedia',
		businessId: '-1',
		tipus: t_xarxes_socials,
		key: keyName
	});
	
	if(typeof url('?businessid') == "string"){
		
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: 'wikipedia',
			serverType: t_xarxes_socials,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: controlCapes._lastZIndex+1,
            epsg: '4326',
            transparency: true,
            visibilitat: visibilitat_open,
			options: '{"xarxa_social": "wikipedia", "key": "'+keyName+'"}'
		};
		
		
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				wikipedia.options.businessId = results.results.businessId;
				wikipedia.addTo(map);
				wikipedia.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(wikipedia, 'wikipedia', true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});
	}else{
		
		
		
		
		wikipedia.addTo(map);
		wikipedia.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(wikipedia, 'wikipedia', true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
}

function loadWikipediaLayer(layer){
	
	var wikipedia = new L.Wikipedia({
		zIndex: parseInt(layer.capesOrdre),
		nom : layer.serverName,
		tipus : layer.serverType,
		businessId: layer.businessId
	});	
	
	var options = jQuery.parseJSON( layer.options );
	if (options.group){
		wikipedia.options.group=options.group;
	}
	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		wikipedia.addTo(map);
	}
	controlCapes.addOverlay(wikipedia, layer.serverName, true);
	controlCapes._lastZIndex++;
}
