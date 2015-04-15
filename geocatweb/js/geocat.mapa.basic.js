/**
 * Gestio del temàtic de tipus Basic 
 */

function createTematicLayerBasic(tematic, styles){
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'estils', 'basic', 1]);
	//_kmq.push(['record', 'estils', {'from':'mapa', 'tipus user':tipus_user, 'tipus tematic':'basic'}]);
	
	var rangs = getRangsFromStyles(tematic, styles);
	var capaMare = controlCapes._layers[tematic.leafletid].layer;
	
//	if (jQuery.isArray(styles)){
//		
//	}else{
////		var layer = controlCapes._layers[tematic.leafletid];
////		if (tematic.geometrytype == t_marker){
////			jQuery.each(capaMare._layers, function( key, value ) {	
////				canviaStyleSinglePoint(styles,this,capaMare,false)
////			});
////		}else if (tematic.geometrytype == t_polyline){
////			jQuery.each(layer.layer._layers, function( key, value ) {
////				this.setStyle(styles);
////			});
////		}else if (tematic.geometrytype == t_polygon){
////			jQuery.each(layer.layer._layers, function( key, value ) {
////				this.setStyle(styles);
////			});
////		}
//	}
	
	if(capaMare.options.tipus == t_dades_obertes){
		
		var options = {
			dataset: capaMare.options.dataset,
			tem: tem_simple,
			style: rangs[0],
			origen: capaMare.options.businessId
		};
			
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: capaMare.options.nom+" "+window.lang.convert("Bàsic"),
			serverType: capaMare.options.tipus,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: capesOrdre_sublayer,				
            epsg: '4326',
            imgFormat: 'image/png',
            infFormat: 'text/html',
            tiles: true,	            
            transparency: true,
            opacity: 1,
            visibilitat: 'O',
			options: JSON.stringify(options)
		};
		
		createServidorInMap(data).then(function(results){
			loadDadesObertesLayer(results.results);
		});
		
	}else if(capaMare.options.tipus == t_url_file){
		
		console.debug("creem tematic simple de t_url_file...");
//		nom : nomCapa,
//		tipus : t_url_file,
//		estil_do: estil_do,
//		style: estil_lin_pol,//Estil de poligons i linies
//		businessId : '-1',
//		 options: '{"tipusFile":"'+tipusFile+'","epsgIN":"'+epsgIN+'", "geometryType":"'+geometryType+'","colX":"'+colX+'","colY":"'+colY+'", "dinamic":"'+dinamic+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
		var estil_do = capaMare.options.estil_do;
		
		if(capaMare.options.geometryType.indexOf("line")!=-1){
			rangs[0].weight = rangs[0].lineWidth;
		}else if(capaMare.options.geometryType.indexOf("polygon")!=-1){
				
		}else{
			var markerStyle2 = rangs[0];
			
//			if(markerStyle2.isCanvas){
				estil_do.color = markerStyle2.borderColor;
				estil_do.fillColor = markerStyle2.color;
				estil_do.fillOpacity = 1;
				estil_do.opacity = 1;
				estil_do.radius = markerStyle2.simbolSize;
				estil_do.weight = markerStyle2.borderWidth;
//			}
		}
		
		var options = {
			url: capaMare.options.url,
			tem: tem_simple,
			style: rangs[0],
			origen: capaMare.options.businessId,
			tipus : t_url_file,
			businessId : '-1',
			tipusFile: capaMare.options.tipusFile,
			estil_do: estil_do,
			epsgIN: capaMare.options.epsgIN,
			geometryType: capaMare.options.geometryType,
			colX: capaMare.options.colX,
			colY: capaMare.options.colY,
			dinamic: capaMare.options.dinamic
		};
	
		console.debug(options);
		
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: capaMare.options.nom+" "+window.lang.convert("Bàsic"),
			serverType: capaMare.options.tipus,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: capesOrdre_sublayer,				
            epsg: capaMare.options.epsgIN,
//            imgFormat: 'image/png',
//            infFormat: 'text/html',
//            tiles: true,	            
            transparency: true,
            opacity: 1,
            visibilitat: 'O',
            url: capaMare.options.url,
			options: JSON.stringify(options)
		};
		
		createServidorInMap(data).then(function(results){
//			loadDadesObertesLayer(results.results);
			console.debug("createServidorInMap:");
			console.debug(results);
			loadURLfileLayer(results.results);
		});
		
	}else if(capaMare.options.tipus == t_json){

	    var capaMareOptions = capaMare.options.options;
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: capaMare.options.nom+" "+window.lang.convert("Bàsic"),
			serverType: t_json,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: capesOrdre_sublayer,
            epsg: '4326',
            imgFormat: 'image/png',
            infFormat: 'text/html',
            tiles: true,	            
            transparency: true,
            opacity: 1,
            visibilitat: 'O',
            url: capaMare.options.url,//Provar jQuery("#txt_URLJSON")
            calentas: false,
            activas: true,
            visibilitats: true,
            options: '{"origen":"'+capaMare.options.businessId+'","tem":"'+tem_simple+'","x":"'+capaMareOptions.x+'", "y":"'+capaMareOptions.y+'","titol":"'+capaMareOptions.titol+'","descripcio":"'+capaMareOptions.descripcio+'", "imatge":"'+capaMareOptions.imatge+'","vincle":"'+capaMareOptions.vincle+'","estil_do":{"radius":"'+styles.options.radius+'","fillColor":"'+styles.options.fillColor+'","color":"'+styles.options.color+'","weight":"'+styles.options.weight+'","opacity":"'+styles.options.opacity+'","fillOpacity":"'+styles.options.fillOpacity+'","isCanvas":"'+styles.options.isCanvas+'"}}'
		};		
		
		createServidorInMap(data).then(function(results){
//			console.debug(results.results);
			loadCapaFromJSON(results.results);
		});
		
	}else if (tematic.tipus == t_tematic){
		rangs = JSON.stringify({rangs:rangs});
		
		var data = {
			businessId: tematic.businessid,
			uid: $.cookie('uid'),
            mapBusinessId: url('?businessid'),	           
            nom: capaMare.options.nom+" "+window.lang.convert("Bàsic"),
			calentas: false,
            activas: true,
            visibilitats: true,    
            order: capesOrdre_sublayer,
			tipusRang: tematic.from,
			rangs: rangs
		};
		
		duplicateTematicLayer(data).then(function(results){
			if(results.status == 'OK'){
//				console.debug(results.results);
				loadTematicLayer(results.results);
				activaPanelCapes(true);
			}else{
				//TODO error
				console.debug("updateTematicRangs ERROR");					
			}
		},function(results){
			//TODO error
			console.debug("updateTematicRangs ERROR");
		});
	//NOU MODEL	
	}else if (tematic.tipus == t_visualitzacio){
		var data = {
			businessId: tematic.businessid,//businessId id de la visualización de origen
			uid: $.cookie('uid'),//uid id de usuario
            mapBusinessId: url('?businessid'),//mapBusinessId id del mapa donde se agrega la visualización	           
            nom: capaMare.options.nom+" "+window.lang.convert("Bàsic"),//nom nombre de la nueva visualizacion
            activas: true,
            order: capesOrdre_sublayer,//order (optional) orden de la capa en el mapa
			tem: tematic.from,//tem_simple
            estils: JSON.stringify(rangs[0])
		};	
		
		createVisualitzacioSimple(data).then(function(results){
			if(results.status == 'OK'){
				var defer = $.Deferred();
				readVisualitzacio(defer, results.visualitzacio, results.layer);
				activaPanelCapes(true);
			}else{
				//TODO error
				console.debug("createVisualitzacioSimple ERROR");					
			}
		},function(results){
			//TODO error
			console.debug("createVisualitzacioSimple ERROR");
		});		
		
	}
}