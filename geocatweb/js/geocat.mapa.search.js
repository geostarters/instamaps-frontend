var ctr_cerca; 


function filterJSON(rawjson) {
	var jsonData = JSON.parse(rawjson.resposta);
	var json = {},
	key, loc, disp = [];
	//console.debug(jsonData);

	var sortedResults = jsonData.resultats;
	sortedResults.sort(
		function compare(a, b) {

			if (undefined === a.source || undefined === b.source)
				return 0;

			if ("PELIAS" == a.source && "ICGC" == b.source) {
				return -1;
			}
			if ("PELIAS" == b.source && "ICGC" == a.source) {
				return 1;
			}

			return 0;
			
		}
	);
	
	if (sortedResults.length>1){
		for (var i = 0; i < sortedResults.length; i++) {
		    var resultat = sortedResults[i];
		    var coordsSplit = resultat.coordenades.split(",");
		    json[ resultat.nom ] = L.latLng(coordsSplit[0], coordsSplit[1]);
		}
	}
	else {
		if (sortedResults.length>0){
			var coords= sortedResults[0].coordenades;
			var nom = sortedResults[0].nom;
			//console.debug(jsonData);
			var coordsSplit = [];
			if (coords) {
				coordsSplit = coords.split(",");
				loc = L.latLng(coordsSplit[0], coordsSplit[1] );
				ctr_cerca.showLocation(loc,nom,nom); 
			}
		}
		else ctr_cerca.showAlert(ctr_cerca.options.textErr);
	}
	return json;
}


function addControlCercaEdit(){
	
	addHtmlInterficieCerca();

	ctr_cerca=new L.Control.Search({url: paramUrl.searchAction+"searchInput={s}",
		position:'topcenter',
		filterJSON: filterJSON,
		animateLocation: false,
		markerLocation: false,
		zoom: 12,
		minLength: 3,
		autoType: false,
		text: window.lang.translate('Cercar llocs al món o coordenades  ...'),
		idInputText : '#ctr_cerca',
		zoom : 14,
		textSize : 22,
		autoCollapseTime: 3200,
		scope:'mapa',
		textEdit:'<a id="act_end" href="#" >Finaltzar Edicio <span class="glyphicon glyphicon-check"></span></a>'
		
	}).addTo(map);
	
	/*var ctr_cercaNomen = new L.Control.Search({
		url: jsonpurl,
		jsonpParam: jsonpName,
		filterJSON: filterJSONCall,
		animateLocation: false,
		markerLocation: false, //true,
		autoType: true, //false		
		position : 'topcenter',
		propertyName : 'nom',
		markerLocation : false,
		rectangleLocation:false,
		autoCollapse : false,
		botoCerca : true,
		idInputText : '#ctr_cercaNomen',
		zoom : 14,
		initial:false,
		textSize : 22,
		minLength : 1,
		text : window.lang.translate('Cercar llocs mudialment...'),
	});*/
	
//	ctr_cercaNomen.on('search_locationfound', function(e) {
//
//		e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
//
//		}).on('search_collapsed', function(e) {
//
//		featuresLayer.eachLayer(function(layer) {	//restore feature color
//		featuresLayer.resetStyle(layer);
//		});	
//		});

	//map.addControl(ctr_cercaNomen ); 
	
	jQuery('.search-edit a').on("click", function(e) {	
		var id=jQuery(this).attr('id');
		if(id=="act_move"){

		}else if(id=="act_remove"){
					
		}else if(id=="act_end"){
			
			objEdicio.esticEnEdicio=false;
			featureActive.disable();
			if(crt_Editing){
			crt_Editing.disable();
			}
			jQuery('.search-edit').animate({
				height :'hide'
			});			
		}
	});
	
}


function addHtmlInterficieCerca(){
	
	jQuery('#searchBar').addClass("input-group");
	
	jQuery('#searchBar').append(
	   		   '<div id="ctr_cerca"></div>'			
	);
}
