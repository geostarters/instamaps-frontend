var ctr_cerca;

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

var urlGeoCoder="http://miyazaki.icc.local:8080/geocodificador/json?maxresultats=10&obtenirCoordGeografiques=si&metode=localitzaToponim&ordre=alfabetic&trobaTots=no&nom={s}&";
function addControlCercaEdit(){
	
	ctr_cerca=new L.Control.Search({url: urlGeoCoder,
		position:'topcenter',
		jsonpParam:'jsonp',
		filterJSON: filterJSONICC,
		animateLocation: false,
		markerLocation: false,
		zoom: 12,
		minLength: 3,
		autoType: false,
		text: window.lang.convert('Cercar llocs a Catalunya ...'),
		textEdit:'<a id="act_move" href="#" >Moure <span class="glyphicon glyphicon-move"></span></a> | '+
		'<a id="act_remove" href="#" >Esborrar <span class="glyphicon glyphicon-trash"></span></a> | '+
		'<a id="act_end" href="#" >Finaltzar Edició <span class="glyphicon glyphicon-check"></span></a>',
		
		}).addTo(map);
	
	jQuery('.search-edit a').on("click", function(e) {	
		var id=jQuery(this).attr('id');
		if(id=="act_move"){
			featureActive.disable();
			crt_Editing.enable();
		}else if(id=="act_remove"){
			featureActive.disable();
			crt_Remove.enable();
		}else if(id=="act_end"){
			crt_Editing.save();
			crt_Remove.save();;
			crt_Editing.disable();
			crt_Remove.disable();;
			featureActive.disable();
			showEditText('hide');
		}
	});
}
