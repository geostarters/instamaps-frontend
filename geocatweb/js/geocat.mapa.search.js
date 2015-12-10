var ctr_cerca; 


function filterJSON(rawjson) {
	var jsonData = JSON.parse(rawjson.resposta);
	var json = {},
	key, loc, disp = [];
	console.debug(jsonData);
	
	if (jsonData.resultats.length>1){
		for (var i = 0; i < jsonData.resultats.length; i++) {
		    var resultat = jsonData.resultats[i];
		    var coordsSplit = resultat.coordenades.split(",");
		    json[ resultat.nom ] = L.latLng(coordsSplit[0], coordsSplit[1]);
		}
	}
	else {
		var coords= jsonData.resultats[0].coordenades;
		var nom = jsonData.resultats[0].nom;
		console.debug(jsonData);
		var coordsSplit = [];
		if (coords) {
			coordsSplit = coords.split(",");
			loc = L.latLng(coordsSplit[0], coordsSplit[1] );
			ctr_cerca.showLocation(loc,coords,nom); 
		}
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
		autoType: true,
		text: window.lang.convert('Cercar llocs al món o coordenades  ...'),
		idInputText : '#ctr_cerca',
		zoom : 14,
		textSize : 22,
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
		text : window.lang.convert('Cercar llocs mudialment...'),
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
