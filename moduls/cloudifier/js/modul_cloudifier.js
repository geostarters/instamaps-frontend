/**
 * MODUL CLOUDIFIER 
 */

jQuery(document).ready(function(){
	
	if(!url('?businessid')){
		if (!$.cookie('uid')){
			createRandomUser().then(function(results){
				if (results.status==='OK'){
					var user_login = results.results.uid;
					var pass_login = "user1234";
					var dataUrl = {user:user_login, password:pass_login};
					doLogin(dataUrl).then(function(results){
						if(results.status==='OK'){
							jQuery.cookie('uid', user_login, {path:'/'});
							createNewMap();
						}				
					});
				}
			});
		}else{	
			mapConfig.newMap = true;
			createNewMap(url('?urlcloudifier'), url('?layername'),url('?epsg'));
		}			
	}else{

		if (url('?urlcloudifier') &&  url('?layername') && url('?epsg')){
			loadUrlCloudifier(url('?urlcloudifier'), url('?layername'),url('?epsg'));
		}else{
			console.debug("ERROR: Falten paràmetres a modul cloudifier");
		}
	}
});

function loadUrlCloudifier(p_url, p_layername, p_crs){
//	
	console.debug(p_url);
	console.debug(p_layername);
	console.debug(p_crs);
	
	var wmsLayer = L.tileLayer.betterWms(p_url, {
		layers :p_layername,
		crs : L.CRS.EPSG4326, //cloudifierWMS.epsg,
		transparent : true,
		format : 'image/png'
	});

	wmsLayer.options.businessId = '-1';
	wmsLayer.options.nom = p_layername;
	wmsLayer.options.tipus = t_wms;
	
	var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: p_layername,
			serverType: t_wms,
			version: "1.1.1",
			calentas: false,
            activas: true,
            visibilitats: true,
            order: 1,
            epsg: p_crs,
            imgFormat: 'image/png',
            infFormat: 'text/html',
            tiles: true,	            
            transparency: true,
            opacity: 1,
            visibilitat: 'O',
            url: p_url,
            layers: JSON.stringify([{name:p_layername,title:p_layername,group:0,check:true,query:true}]),
            calentas: false,
            activas: true,
            visibilitats: true,
			options: '{"url":"'+p_url+'","layers":"'+p_layername+'"}'
	};
	
	createServidorInMap(data).then(function(results){
		if (results.status == "OK"){
			wmsLayer.options.businessId = results.results.businessId;
			map.addLayer(wmsLayer); //wmsLayer.addTo(map);
			wmsLayer.bringToFront();
			wmsLayer.options.zIndex = 1; //controlCapes._lastZIndex+ 1;
			controlCapes.addOverlay(wmsLayer, p_layername, true);
			controlCapes._lastZIndex++;
			activaPanelCapes(true);
		}else{
			console.debug("1. ERROR createServidorInMap modul_cloudifier");
		}
	}, function(){
		console.debug("2. ERROR createServidorInMap modul_cloudifier");
	});
}


function createNewMap(url, layername, epsg){
	console.debug("createNewMap");
	console.debug(url);
	console.debug(layername);
	console.debug(epsg);	
	var data = {
		nom: layername + " cloudifier",//getTimeStamp(),
		uid: $.cookie('uid'),
		visibilitat: visibilitat_privat,
		tipusApp: 'vis',
	};
	
//	createMap(data).then(function(results){
//		if (results.status == "ERROR"){
//			console.debug("1.ERROR createMap modul cloudifier");
//			gestioCookie('createMapError');
//		}else{
//			try{
//				mapConfig = results.results;
//				mapConfig.options = jQuery.parseJSON( mapConfig.options );
//				jQuery('#businessId').val(mapConfig.businessId);
//				mapConfig.newMap = false;
//				window.location = paramUrl.visorCloudifier+"?businessid="+mapConfig.businessId+"&urlcloudifier="+url+"&layername="+layername+"&epsg="+epsg;
//			}catch(err){
//				console.debug("2.ERROR createMap modul cloudifier");
//				gestioCookie('createMap');
//			}
//		}
//	});
}