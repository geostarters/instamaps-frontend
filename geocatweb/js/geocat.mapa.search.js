var ctr_cerca; 


function filterJSON(rawjson) {
	var jsonData = JSON.parse(rawjson.resposta);
	var json = {},
	key, loc, disp = [];
	
	if (jsonData.resultats.length>0){
		for (var i = 0; i < jsonData.resultats.length; i++) {
		    var resultats = jsonData.resultats[i];
		    if (resultats.nom) {
			    key = resultats.nom +" ("+ resultats.nomMunicipi+")";
			    loc = L.latLng( resultats.coordenadesETRS89LonLat.y, resultats.coordenadesETRS89LonLat.x );
			    json[ key ]= loc;
		    }
		    else if (resultats.display_name){
		    	disp = resultats.display_name.split(',');	
				key = disp[0] +', '+ disp[1];
				loc = L.latLng(resultats.lat, resultats.lon );
				json[ key ]= loc;	//key,value format
		    }
		    
		   
		}
	}
	else {
		var coords= jsonData.resultats.coordenades;
		var coordsSplit = [];
		if (coords) {
			coordsSplit = coords.split(",");
			loc = L.latLng(coordsSplit[0], coordsSplit[1] );
			ctr_cerca.showLocation(loc,coords); 
			//json[ coords ]= loc;
			//jQuery('.search-tip').mousedown();
			//map.setView(loc, this.options.zoom);
		}
		
	}
	return json;
	
}


function addControlCercaEdit(){
	
	addHtmlInterficieCerca();
	

	ctr_cerca=new L.Control.Search({url: "http://localhost/geocat/aplications/map/search.action?searchInput={s}",
		position:'topcenter',
		filterJSON: filterJSON,
		animateLocation: false,
		markerLocation: false,
		zoom: 12,
		minLength: 3,
		autoType: false,
		text: window.lang.convert('Cercar llocs al món o coordenades  ...'),
		idInputText : '#ctr_cerca',
		zoom : 14,
		textSize : 22,
		minLength : 3,
		autoType : true,
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
