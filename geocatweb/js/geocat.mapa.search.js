//var ctr_cerca;


function filterJSONICC(rawjson) {	
	var json = {},
		key, loc, disp = [];
	for(var i in rawjson)
	{
		key = rawjson[i].nom +" ("+  rawjson[i].nomMunicipi+")";
		loc = L.latLng( rawjson[i].coordenadesETRS89LonLat.y, rawjson[i].coordenadesETRS89LonLat.x );
		json[ key ]= loc;	//key,value format
	}
	return json;
}


function addControlCercaEdit(){
	
	var jsonpurl = 'http://open.mapquestapi.com/nominatim/v1/search.php?q={s}'+
	'&format=json&osm_type=N&limit=100&addressdetails=0';
	var jsonpName = 'json_callback';
	
	var ctr_cerca=new L.Control.Search({url: paramUrl.urlGeoCoder,
		position:'topcenter',
		jsonpParam:'jsonp',
		filterJSON: filterJSONICC,
		animateLocation: false,
		markerLocation: false,
		zoom: 12,
		minLength: 3,
		autoType: false,
		text: window.lang.convert('Cercar llocs a Catalunya ...'),
		idInputText : '#ctr_cerca',
		zoom : 14,
		textSize : 22,
		minLength : 3,
		autoType : true,
		/*
		textEdit:'<a id="act_move" href="#" >Moure <span class="glyphicon glyphicon-move"></span></a> | '+
		'<a id="act_remove" href="#" >Esborrar <span class="glyphicon glyphicon-trash"></span></a> | '+
		'<a id="act_end" href="#" >Finaltzar Edició <span class="glyphicon glyphicon-check"></span></a>',
		*/
		textEdit:'<a id="act_end" href="#" >Finaltzar Edicio <span class="glyphicon glyphicon-check"></span></a>'
		
		}).addTo(map);
	
	var ctr_cercaNomen = new L.Control.Search({
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
	});
	
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

	map.addControl(ctr_cercaNomen ); 
	
	jQuery("ul li").on('click', function() {

		if (jQuery('a', this).attr('id') == 'ctr_cat') {
			jQuery("#ctr_cerca").show();
//			jQuery("#ctr_cercaCarrers").show();
			jQuery("#ctr_cercaNomen").hide();
			jQuery("ul li").removeClass('active');
			jQuery(this).addClass('active');

		} else if (jQuery('a', this).attr('id') == 'ctr_nomen') {
			jQuery("#ctr_cerca").hide();
//			jQuery("#ctr_cercaCarrers").hide();
			jQuery("#ctr_cercaNomen").show();
			jQuery("ul li").removeClass('active');
			jQuery(this).addClass('active');

		}
	});	
	
	jQuery('.search-edit a').on("click", function(e) {	
		var id=jQuery(this).attr('id');
		if(id=="act_move"){

			/*
			featureActive.disable();
			crt_Editing.enable();
			*/
		}else if(id=="act_remove"){
			/*
			featureActive.disable();
			crt_Remove.enable();
			*/

			
			
		}else if(id=="act_end"){
			
			objEdicio.esticEnEdicio=false;
			featureActive.disable();
			if(crt_Editing){
			crt_Editing.disable();
			}
//			showEditText('hide');
			jQuery('.search-edit').animate({
				height :'hide'
			});			
		}
	});
	
}

function filterJSONCall(rawjson) {	//callback that remap fields name
	var json = {},
	key, loc, disp = [];
	
	for(var i in rawjson)
	{
		disp = rawjson[i].display_name.split(',');	
		key = disp[0] +', '+ disp[1];
		loc = L.latLng( rawjson[i].lat, rawjson[i].lon );
		json[ key ]= loc;	//key,value format
	}
	return json;
}
