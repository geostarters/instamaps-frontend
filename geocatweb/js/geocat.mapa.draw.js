var drawControl;
var featureActive,crt_Editing,crt_Remove;
var defaultPunt;
var canvas_linia={"id":"cv_linia","strokeStyle":"#FFC500","lineWidth":"3","tipus":"linia"};
var canvas_pol={"id":"cv_pol","strokeStyle":"#FFC500","opacity":"0.5","fillStyle":"rgba(255, 197, 0,0.5)","lineWidth":"3","tipus":"pol"};
var canvas_obj_l,cv_ctx_l;
var canvas_obj_p,cv_ctx_p;
var objEdicio={'esticEnEdicio':false,'obroModalFrom':'creaCapa','featureID':null,'esticSobre':false,'edicioPopup':'textFeature'};
var opcionsSel={
	color: '#FF1EE5',
	"weight": 7,
	opacity: 0.6,
	dashArray: '1, 1',
	fill: true,
	fillColor: '#fe57a1',
	fillOpacity: 0.1
};


//drawControl.options.edit.selectedPathOptions
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



function obrirMenuModal(_menuClass,estat,_from){

	objEdicio.obroModalFrom=_from;	
	jQuery('.modal').modal('hide');	
	jQuery(_menuClass).modal(estat);
}




function initCanvas(){


	addGeometryInitP(document.getElementById(canvas_pol.id));
	addGeometryInitP(document.getElementById(canvas_pol.id+"0"));
	addGeometryInitL(document.getElementById(canvas_linia.id));	
	addGeometryInitL(document.getElementById(canvas_linia.id+"0"));
	
    $('#colorpalette_pf').colorPalette().on('selectColor', function(e) {   	
    $('.fill_color_pol').css('background-color',e.color);
    $('.fill_color_pol').css('color',e.color);
    	canvas_pol.fillStyle="rgba("+hexToRgb(e.color).r+", "+hexToRgb(e.color).g+", "+hexToRgb(e.color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));

    });	
    
    $('#colorpalette_pl').colorPalette().on('selectColor', function(e) {   	
    $('.border_color_pol').css('border-color',e.color);

    	canvas_pol.strokeStyle=e.color;
    	addGeometryInitP(document.getElementById("cv_pol0"));  
    });
	
	$('#colorpalette_ll').colorPalette().on('selectColor', function(e) {   	
    $('.border_color_linia').css('background-color',e.color);
		canvas_linia.strokeStyle=e.color;
		addGeometryInitL(document.getElementById("cv_linia0"));

	});
    	 



	$('#colorpalette_icon').colorPalette().on('selectColor', function(e) {  
		 $('.fill_color_icon').css('background-color',e.color);
			estilP.colorGlif=e.color;
			
			jQuery('.bs-glyphicons li').css('color',estilP.colorGlif);
			if(e.color=="#FFFFFF"){
				jQuery('.bs-glyphicons li').css('background-color','#aaaaaa');	
			}else{
				jQuery('.bs-glyphicons li').css('background-color','#FFFFFF');	
			}
			jQuery('#div_punt0').css('color',estilP.colorGlif);
			jQuery(this).addClass("estil_selected");
	});
	



	$('#colorpalette_punt').colorPalette().on('selectColor', function(e) {  
		 $('.fill_color_punt').css('background-color',e.color);
			
		 console.info(jQuery('#div_puntZ').hasClass("estil_selected"));
		 if(jQuery('#div_puntZ').hasClass("estil_selected")){
				
			 estilP.divColor=e.color;
				
				jQuery('#div_punt0').css('background-color',estilP.divColor);
			}
		    jQuery('#div_punt9').css('background-color',e.color);
			
		});





	jQuery("#cmb_trans").on('change', function(e) { 
    	var color=rgb2hex($('.fill_color_pol').css('background-color'));
    	
    	canvas_pol.opacity=jQuery(this).val();
    	canvas_pol.fillStyle="rgba("+hexToRgb(color).r+", "+hexToRgb(color).g+", "+hexToRgb(color).b+","+canvas_pol.opacity+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));

    });
    
    jQuery("#cmb_gruix").on('change', function(e) { 
    	canvas_pol.lineWidth=jQuery(this).val();
    	addGeometryInitP(document.getElementById("cv_pol0"));

    });
    
    jQuery("#cmb_gruix_l").on('change', function(e) { 
    	canvas_linia.lineWidth=jQuery(this).val();
    	addGeometryInitL(document.getElementById("cv_linia0"));

    });




}

var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 



function rgb2hex(rgb) {
	rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
	return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

function addGeometryInitL(canvas){
	var	cv_ctx_l=canvas.getContext("2d");
	cv_ctx_l.clearRect(0, 0, canvas.width, canvas.height);
	cv_ctx_l.moveTo(0.7,39.42);
	cv_ctx_l.lineTo(2.05,34.43);
	cv_ctx_l.lineTo(3.62,31.00);
	cv_ctx_l.lineTo(5.95,27.72);
	cv_ctx_l.lineTo(8.17,25.61);
	cv_ctx_l.lineTo(10.72,23.84);
	cv_ctx_l.lineTo(13.059,22.73);
	cv_ctx_l.lineTo(15.32,22.28);
	cv_ctx_l.lineTo(17.76,22.08);
	cv_ctx_l.lineTo(20.30,21.47);
	cv_ctx_l.lineTo(23.28,20.51);
	cv_ctx_l.lineTo(25.88,18.90);
	cv_ctx_l.lineTo(28.265,16.83);
	cv_ctx_l.lineTo(29.9,14.71);
	cv_ctx_l.lineTo(31.89,12.195);
	cv_ctx_l.lineTo(33.62,9.42);
	cv_ctx_l.lineTo(34.81,6.64);
	cv_ctx_l.lineTo(35.46,3.92);
	cv_ctx_l.lineTo(35.52,0.54);
	//cv_ctx_l.setLineDash([1,2]);
	cv_ctx_l.strokeStyle=canvas_linia.strokeStyle;
	cv_ctx_l.lineWidth=canvas_linia.lineWidth;
	cv_ctx_l.stroke(); 	
}

function addGeometryInitP(canvas){
	var	cv_ctx_p=canvas.getContext("2d");
	cv_ctx_p.clearRect(0, 0, canvas.width, canvas.height);

	cv_ctx_p.moveTo(5.13,15.82);
	cv_ctx_p.lineTo(25.49,5.13);
	cv_ctx_p.lineTo(37.08,13.16);
	cv_ctx_p.lineTo(20.66,38.01);
	cv_ctx_p.lineTo(2.06,33.67);
	cv_ctx_p.closePath();
	cv_ctx_p.strokeStyle=canvas_pol.strokeStyle;
	cv_ctx_p.fillStyle=canvas_pol.fillStyle;
	cv_ctx_p.lineWidth=canvas_pol.lineWidth;
	cv_ctx_p.fill();
	cv_ctx_p.stroke(); 

}


function addDrawToolbar() {
	initCanvas();
	capaUsrPunt = new L.FeatureGroup();
	capaUsrPunt.options = {
		businessId : '-1',
		nom : 'capaPunts1',
		zIndex :  -1,
		tipus : t_tematic,
		geometryType: t_marker

	};
	capaUsrLine = new L.FeatureGroup();
	capaUsrLine.options = {
		businessId : '-1',
		nom : 'capaLinea1',
		zIndex :  -1,
		tipus : t_tematic,
		geometryType: t_polyline

	};
	capaUsrPol = new L.FeatureGroup();
	capaUsrPol.options = {
		businessId : '-1',
		nom : 'capaPol1',
		zIndex :  -1,
		tipus : t_tematic,
		geometryType: t_polygon

	};
	
	map.addLayer(capaUsrPunt);
	map.addLayer(capaUsrLine);
	map.addLayer(capaUsrPol);

	var ptbl = L.Icon.extend({
		options : {
			shadowUrl : null,
			iconAnchor : new L.Point(14, 40),
			iconSize : new L.Point(28, 40)

		}
	});
	


	defaultPunt= L.AwesomeMarkers.icon({
		icon : '',
		markerColor : 'orange',
		divColor:'transparent',
		iconAnchor : new L.Point(14, 42),
		iconSize : new L.Point(28, 42),
		iconColor : '#000000',
		opacity:0.8,
		prefix : 'fa',
		tipus: t_marker
	});



	var options = {
		draw : false,
		polyline : {
			guidelineDistance : 2,
			repeatMode:false,
			shapeOptions : {
				color : '#FFC400',
				weight : 3,
				opacity : 1,
				tipus: t_polyline
			}
		},
		polygon : {
			allowIntersection : true, // Restricts shapes
			repeatMode:false,
			guidelineDistance : 2,
			shapeOptions : {
				color : '#FFC400',
				weight : 3,
				fillOpacity : 0.5,
				tipus: t_polygon
			}
		},
		 
		marker:{repeatMode:false,
			icon:L.icon({iconUrl:'/geocatweb/css/images/blank.gif'})
		},
		
		edit : false

	};

	drawControl = new L.Control.Draw(options);
	map.addControl(drawControl);




}




function showEditText(accio){

	jQuery('.search-edit').animate({
		height :accio
	});

}

function activaEdicioUsuari() {



	jQuery('#div_punt').on('click', function() {
		if(featureActive){featureActive.disable();}

		 featureActive = new L.Draw.Marker(map, drawControl.options.marker);		 
		featureActive.enable();



	});

	jQuery('#div_linia').on('click', function() {
		if(featureActive){featureActive.disable();}
		 featureActive = new L.Draw.Polyline(map, drawControl.options.polyline);
		featureActive.enable();
	});

	jQuery('#div_area').on('click', function() {
		if(featureActive){featureActive.disable();}
		featureActive = new L.Draw.Polygon(map, drawControl.options.polygon);
		featureActive.enable();
	});

	map.on('draw:drawstart',function(e){

		//showEditText('show');
		objEdicio.esticEnEdicio=true;

	});
	
	map.on('click',function(e){

		if(crt_Editing){
			crt_Editing.disable();
		}

		if(objEdicio.esticEnEdicio){
			if(crt_Editing){
				crt_Editing.disable();
			}
			updateFeatureMove(objEdicio.featureID, crt_Editing._featureGroup._leaflet_id);			
			//featureActive.enable();	
		}

	});
	
	map.on('preclick',function(e){

		if(crt_Editing){
			crt_Editing.disable();
		}

		//if(objEdicio.esticEnEdicio){
			//if(crt_Editing){
			//crt_Editing.disable();
			//}
			//featureActive.enable();	
		//}
		/*
		if(objEdicio.esticEnEdicio){
			if(!objEdicio.esticSobre){
				//console.info(objEdicio.esticSobre);
			featureActive.enable();				
			}else{
				featureActive.disable();		
			}
		}
		*/
	});
		
	map.on('draw:created', function(e) {
		var type = e.layerType, layer = e.layer;
		var totalFeature;
		var tipusCat,tipusCatDes;
		
		
		if (type === t_marker) {
			tipusCat=window.lang.convert('Titol Punt');
			tipusCatDes=window.lang.convert('Descripcio Punt');
			
			if(defaultPunt.options.icon!=""){
				layer=L.marker([layer.getLatLng().lat,layer.getLatLng().lng],
					{icon: defaultPunt, 
					 tipus: t_marker}).addTo(map);
			}else{
				layer= L.circleMarker([layer.getLatLng().lat,layer.getLatLng().lng],
					 { radius : parseInt(parseInt(defaultPunt.options.iconSize.x)/3), 
					 fillColor : defaultPunt.options.divColor,
					 color : "#dddddd", weight : 2,
					  opacity : 1, fillOpacity : 0.9, tipus: t_marker}).addTo(map);
			}
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_marker){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva=capaUsrPunt;
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}else if(capaUsrActiva == null){
				capaUsrActiva=capaUsrPunt;
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			
			//MODIFICAR FICAR PROPERTIES QUE NECESSITO
			layer.properties={'name':tipusCat+' '+capaUsrActiva.getLayers().length,
					'description':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'capaNom':capaUsrActiva.options.nom,//desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_marker};			
			
			capaUsrActiva.addLayer(layer);
			
		} else if (type === t_polyline) {
			tipusCat=window.lang.convert('Titol Linia');
			tipusCatDes=window.lang.convert('Descripcio Linia');
			
//			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_polyline){
//				capaUsrActiva.removeEventListener('layeradd');
//				capaUsrActiva=capaUsrLine;
//				capaUsrActiva.on('layeradd',objecteUserAdded);
//			}else if(capaUsrActiva == null){
//				capaUsrActiva=capaUsrPunt;
//				capaUsrActiva.on('layeradd',objecteUserAdded);
//			}
//			
//			//MODIFICAR FICAR PROPERTIES QUE NECESSITO
//			layer.properties={'name':tipusCat+' '+capaUsrActiva.getLayers().length,
//					'description':tipusCatDes+' '+capaUsrActiva.getLayers().length,
//					'capaNom':capaUsrActiva.options.nom,//desactualitzat quan es canvii nom capa!
//					'capaBusinessId':capaUsrActiva.options.businessId,
//					'capaLeafletId': capaUsrActiva._leaflet_id,
//					'tipusFeature':t_marker};			
//			
//			capaUsrActiva.addLayer(layer);			
			
			capaUsrLine.on('layeradd',objecteUserAdded);
			capaUsrLine.addLayer(layer);
			totalFeature=capaUsrLine.toGeoJSON().features.length;
			if (totalFeature == 1) {							
				controlCapes.addOverlay(capaUsrLine,capaUsrLine.options.nom, true);
				activaPanelCapes(true);
			}
			capaUsrActiva=capaUsrLine;
		} else if (type === t_polygon) {
			tipusCat=window.lang.convert('Titol area');
			tipusCatDes=window.lang.convert('Descripcio area');	
			capaUsrPol.on('layeradd',objecteUserAdded);
			capaUsrPol.addLayer(layer);
			totalFeature=capaUsrPol.toGeoJSON().features.length;
			if (totalFeature == 1) {	
				controlCapes.addOverlay(capaUsrPol,
						capaUsrPol.options.nom, true);
				activaPanelCapes(true);
			}
			capaUsrActiva=capaUsrPol;
		}
	});
	
//	map.on('draw:edited', function (e) {
//	    var layers = e.layers;
//	    layers.eachLayer(function (layer) {
//	       console.debug("draw:edited");
//	       console.info(layer);
//	    });
//	});	
	
}

function finishAddFeatureToTematic(layer){
	console.debug('finishAddFeatureToTematic');
	var type = layer.options.tipus;
	objEdicio.esticEnEdicio=true;
	
	//Afegir capa edicio a control de capes en cas que sigui nova
	if (capaUsrPunt.toGeoJSON().features.length == 1) {
		//Actualitzeem zIndex abans d'afegir al control de capes
		capaUsrPunt.options.zIndex = controlCapes._lastZIndex+1; 
		controlCapes.addOverlay(capaUsrPunt, capaUsrPunt.options.nom, true);
		activaPanelCapes(true);
	}
	if (capaUsrLine.toGeoJSON().features.length == 1) {
		//Actualitzeem zIndex abans d'afegir al control de capes
		capaUsrLine.options.zIndex = controlCapes._lastZIndex+1; 							
		controlCapes.addOverlay(capaUsrLine, capaUsrLine.options.nom, true);
		//showEditText(layer);
		activaPanelCapes(true);
	}
	if (capaUsrPol.toGeoJSON().features.length == 1) {
		//Actualitzeem zIndex abans d'afegir al control de capes
		capaUsrPol.options.zIndex = controlCapes._lastZIndex+1; 								
		controlCapes.addOverlay(capaUsrPol,	capaUsrPol.options.nom, true);
		//showEditText(layer);
		activaPanelCapes(true);
	}	
	
	var html = createPopUpContent(layer,type);
//	var html = "";
	layer.bindPopup(html,{'offset':[0,-25]}).openPopup();
//	fillSelectCapesUsr(type,layer._leaflet_id);
	layer.on('popupopen',function(e){
		//actualitzem popup
		var html = createPopUpContent(layer,layer.options.tipus);
		layer.setPopupContent(html);


























































































































































		jQuery('#titol_pres').text(layer.properties.name).append(' <i class="glyphicon glyphicon-pencil blau"></i>');	
		jQuery('#des_pres').text(layer.properties.description).append(' <i class="glyphicon glyphicon-pencil blau"></i>');		





	});	




	
	jQuery(document).on('click', "#titol_pres", function(e) {
		modeEditText();
	});
	
	jQuery(document).on('click', "#des_pres", function(e) {
		modeEditText();
	});




	jQuery(document).on('click', ".bs-ncapa li a", function(e) {
		e.preventDefault();

		var accio;
		if(jQuery(this).attr('id').indexOf('#')!=-1){			
			accio=jQuery(this).attr('id').split("#");				
		}
		
		objEdicio.featureID=accio[1];
		if(accio[0].indexOf("layer_edit")!=-1){

			objEdicio.edicioPopup='textCapa';
			jQuery('#layer_accio').text(window.lang.convert('Canviar nom capa'))
			jQuery('#capa_edit').val(jQuery('#cmbCapesUsr').val());
			modeLayerTextEdit();

		}else if(accio[0].indexOf("layer_add")!=-1){
			objEdicio.edicioPopup='nouCapa';
			jQuery('#layer_accio').text(window.lang.convert('Nom nova capa'))
			jQuery('#capa_edit').val("").attr('placeholder',window.lang.convert('Nova capa'));
			modeLayerTextEdit();


		}else{
			
		}

		//bs-ncapa	

	});
	
	 jQuery(document).on('focus', ".bs-ncapa li select", function(e) {
		 $(this).data('cmbCapesUsr_old',$(this).val());
	 });	 
	 
	 jQuery(document).on('change', ".bs-ncapa li select", function(e) {
//		    e.preventDefault();
		    e.stopImmediatePropagation();
		    console.debug('on change select cmbusrcapa');
			var accio;
			if(jQuery(this).attr('id').indexOf('#')!=-1){			
				accio=jQuery(this).attr('id').split("#");				
			}
			objEdicio.featureID=accio[1];
			
			var toBusinessId = jQuery(this).val().split("#");
			var fromBusinessId = $(this).data('cmbCapesUsr_old').split("#");
			//Actualitzem valor antic
			$(this).data('cmbCapesUsr_old',$(this).val());
			
			objEdicio.featureID=accio[1];
			var obj = map._layers[objEdicio.featureID];
			
			//Accio de moure la feature a la nova capa tematic creada
			//moveFeatureToLayer(obj.properties.businessId,fromBusinessId[0],toBusinessId[0]);
			var data = {
					uid: $.cookie('uid'),
		            businessId: obj.properties.businessId, //businessId de la feature
		            fromBusinessId: fromBusinessId[0], //businessId del tematico de origen
		            toBusinessId: toBusinessId[0] //businessId del tematico de destino
		    }
			
			moveFeatureToTematic(data).then(function(results){
					if(results.status=='OK'){
						var toLayer = map._layers[''+toBusinessId[1]+''];
						var fromLayer = map._layers[''+fromBusinessId[1]+''];
						fromLayer.removeLayer(obj);
						toLayer.addLayer(obj);
						//Refresh de la capa
						controlCapes._map.removeLayer(toLayer);
						controlCapes._map.addLayer(toLayer);
						//Actualitzem capa activa
						capaUsrActiva.removeEventListener('layeradd');
						capaUsrActiva = toLayer;
						capaUsrActiva.on('layeradd',objecteUserAdded);	
						//Actualitzem properties de la layer
						obj.properties.capaBusinessId = capaUsrActiva.options.businessId;
						obj.properties.capaNom = capaUsrActiva.options.nom;
						obj.properties.capaLeafletId = capaUsrActiva._leaflet_id;
						//Actualitzem popup del marker
						var html = createPopUpContent(obj,obj.options.tipus);
						obj.setPopupContent(html);
						obj.openPopup();
					}else{
						console.debug("moveFeatureToTematic ERROR");
					}
				},function(results){
					console.debug("moveFeatureToTematic ERROR");
				});						
	 });
	 
	jQuery(document).on('click', ".bs-popup li a", function(e) {
		e.stopImmediatePropagation();
		var accio;
		console.debug('click bspopup');
		if(jQuery(this).attr('id').indexOf('#')!=-1){			
			accio=jQuery(this).attr('id').split("#");				
		}
		objEdicio.featureID=accio[1];
		
		if(accio[0].indexOf("feature_edit")!=-1){

			if(accio[2].indexOf("marker")!=-1){
				obrirMenuModal('#dialog_estils_punts','toggle','creaPopup');
			}else if(accio[2].indexOf("polygon")!=-1){
				obrirMenuModal('#dialog_estils_arees','toggle','creaPopup');
			}else{

				obrirMenuModal('#dialog_estils_linies','toggle','creaPopup');
			}

		}else if(accio[0].indexOf("feature_remove")!=-1){
			map.closePopup();
			var data = {
	            businessId: map._layers[objEdicio.featureID].properties.businessId,
	            uid: $.cookie('uid')
	        };
			deleteFeature(data).then(function(results){
						if(results.status == 'OK'){
							console.debug("OK deletefeature");
							var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;
							map._layers[capaLeafletId].removeLayer(map._layers[objEdicio.featureID]);
							map.removeLayer(map._layers[objEdicio.featureID]);
						}else{
							console.debug("ERROR deleteFeature");
						}
			},function(results){
				console.debug("ERROR deleteFeature");
			});	

			
		}else if(accio[0].indexOf("feature_text")!=-1){


			modeEditText();
			
		}else if(accio[0].indexOf("feature_move")!=-1){

			
			var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;						
			//Actualitzem capa activa
			capaUsrActiva.removeEventListener('layeradd');
			capaUsrActiva = map._layers[capaLeafletId];
			//capaUsrActiva.on('layeradd',objecteUserAdded);				





			
			var capaEdicio = new L.FeatureGroup();
			capaEdicio.addLayer(map._layers[objEdicio.featureID]);
			capaUsrActiva.removeLayer(map._layers[objEdicio.featureID]);
			map.addLayer(capaEdicio);



			
			crt_Editing=new L.EditToolbar.Edit(map, {
				featureGroup: capaEdicio,
				selectedPathOptions: opcionsSel
			});
			crt_Editing.enable();
			map.closePopup();

			











		}else if(accio[0].indexOf("feature_no")!=-1){

			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();
			

		}else if(accio[0].indexOf("feature_ok")!=-1){

			if(objEdicio.edicioPopup=='textFeature'){

				var txtTitol=jQuery('#titol_edit').val();
				var txtDesc=jQuery('#des_edit').val();
				
				updateFeatureNameDescr(map._layers[objEdicio.featureID],txtTitol,txtDesc);


//				map._layers[objEdicio.featureID].properties.name=txtTitol;
//				map._layers[objEdicio.featureID].properties.description=txtDesc;
				







			}else if(objEdicio.edicioPopup=='textCapa'){
				if(jQuery('#capa_edit').val()!=""){
					jQuery('#cmbCapesUsr option:selected').text(jQuery('#capa_edit').val());	
					jQuery('.popup_pres').show();
					jQuery('.popup_edit').hide();
				}else{
					alert(window.lang.convert('Has de posar un nom de capa'));	

				}
			}else if(objEdicio.edicioPopup=='nouCapa'){

				if(jQuery('#capa_edit').val()!=""){
//					jQuery('#cmbCapesUsr').append("<option selected value=\""+jQuery('#capa_edit').val()+"\">"+jQuery('#capa_edit').val()+"</option>");	
//					jQuery('.popup_pres').show();
//					jQuery('.popup_edit').hide();

					generaNovaCapaUsuari(map._layers[objEdicio.featureID],jQuery('#capa_edit').val());

				}else{
					alert(window.lang.convert('Has de posar un nom de capa'));	

				}

			}





		}else{
		//accio tanca
			map.closePopup();
		}


	});	
}

function updateFeatureNameDescr(layer, titol, descr){
	
	layer.properties.name=titol;
	layer.properties.description=descr;	
	layer.properties.feature.properties.nom = titol;
	layer.properties.feature.properties.text = descr;
	
	var feature = layer.toGeoJSON();
	feature.properties = layer.properties.feature.properties;
	feature.geometry = layer.properties.feature.geometry;	
    
	var features = JSON.stringify(feature);
	
    var data = {
			uid : jQuery.cookie('uid'),
			features : features,
			businessId: layer.properties.businessId
		};
    
    updateFeature(data).then(function(results){
    	if(results.status == 'OK'){
			jQuery('#titol_pres').text(titol).append(' <i class="glyphicon glyphicon-pencil blau"></i>');	
			jQuery('#des_pres').text(descr).append(' <i class="glyphicon glyphicon-pencil blau"></i>');
			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();    		
    	}else{
    		console.debug("updateFeature ERROR");
    	}
    }, function(results){
    	console.debug("updateFeature ERROR");
    });
	
}

function updateFeatureMove(featureID, capaEdicioID){
	
	var layer = map._layers[featureID];
	var feature = layer.toGeoJSON();
	feature.properties = layer.properties.feature.properties;
	feature.geometry = layer.properties.feature.geometry;	
	
	if(layer.properties.tipusFeature == t_marker){
		var newLatLng = layer.getLatLng();
		feature.geometry.coordinates[0] = newLatLng.lng;
		feature.geometry.coordinates[1] = newLatLng.lat;		
	}else if(layer.properties.tipusFeature == t_polyline){
		//TODO
	}else if(layer.properties.tipusFeature == t_polygon){
		//TODO
	}

	
	var features = JSON.stringify(feature);


	
    var data = {
			uid : jQuery.cookie('uid'),
			features : features,
			businessId: layer.properties.businessId






		};
    
    updateFeature(data).then(function(results){
    	if(results.status == 'OK'){
			jQuery('.popup_pres').show();
//			jQuery('.popup_edit').hide();    		
    	}else{
    		console.debug("updateFeature ERROR");
    	}
    }, function(results){
    	console.debug("updateFeature ERROR");
    });	
    
    //Retornem la geometria a la seva capa original
    capaUsrActiva.addLayer(layer);
    capaUsrActiva.on('layeradd',objecteUserAdded);//Deixem activat event layeradd, per la capa activa
    map._layers[capaEdicioID].removeLayer(layer);
	//Refresh de la capa
	controlCapes._map.removeLayer(capaUsrActiva);
	controlCapes._map.addLayer(capaUsrActiva);    
    map.removeLayer(map._layers[capaEdicioID]);
    console.debug("updateFeatureMove FI");
}

function createPopUpContent(player,type){
var html='<div class="div_popup">' 
	+'<div class="popup_pres">'							
	+'<div id="titol_pres">'+player.properties.name+' <i class="glyphicon glyphicon-pencil blau"></i></div>'	
	+'<div id="des_pres">'+player.properties.description+' <i class="glyphicon glyphicon-pencil blau"></i></div>'	
	//+'<div id="capa_pres">'
	+'<ul class="bs-ncapa">'
		+'<li><span lang="ca" class="small">Capa actual: </span>'
			+'<select id="cmbCapesUsr#'+player._leaflet_id+'#'+type+'" data-leaflet_id='+player._leaflet_id+'>';
				$.each( controlCapes._layers, function(i,val) {
					var layer = val.layer.options;
					if(layer.tipus==t_tematic && layer.geometryType==type){
				        html += "<option value=\"";
				        html += layer.businessId +"#"+val.layer._leaflet_id+"\"";
				        if(capaUsrActiva.options.businessId ==layer.businessId) html += " selected";
				        html += ">"+ layer.nom + "</option>";            		
					}
				});					
	html+=	
			'</select></li>'
		+'<li><a id="layer_edit#'+player._leaflet_id+'#'+type+'" lang="ca" title="Canviar el nom de la capa" href="#"><span class="glyphicon glyphicon-pencil blau12"></span></a></li>'
	+'<li><a id="layer_add#'+player._leaflet_id+'#'+type+'" lang="ca" title="Crear una nova capa" href="#"><span class="glyphicon glyphicon-plus verd12"></span></a></li>'
	+'</ul>'	
	//'</div>'	
	+'<div id="footer_edit"  class="modal-footer">'
	+'<ul class="bs-popup">'						
	+'<li><a id="feature_edit#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">Estils<span class="glyphicon glyphicon-map-marker verd"></span></a>   </li>'
	+'<li><a id="feature_move#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">Editar<span class="glyphicon glyphicon-move magenta"></span></a>   </li>'
	+'<li><a id="feature_remove#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">Esborrar<span class="glyphicon glyphicon-trash vermell"></span></a>   </li>'													
	+'</ul>'														
	+'</div>'
	+'</div>'	
	+'<div class="popup_edit">'
	+'<div style="display:block" id="feature_txt">'
	+'<input class="form-control" id="titol_edit" type="text" value="'+player.properties.name+'" placeholder="">'
	+'<textarea id="des_edit" class="form-control" rows="2">'+player.properties.description+'</textarea>'							
	+'</div>'	
	+'<div  style="display:block" id="capa_txt">'
	+'<div id="layer_accio"></div>'
	+'<input class="form-control" id="capa_edit" type="text" value="'+player.properties.capaGrup+'" placeholder="">'
	+'</div>'
	+'<div class="modal-footer">'
	+'<ul class="bs-popup">'
	+'<li><a id="feature_no#'+player._leaflet_id+'#'+type+'"  class="btn btn-default btn-xs">Cancel.lar</a></li>'			
	+'<li><a id="feature_ok#'+player._leaflet_id+'#'+type+'"  class="btn btn-success btn-xs">Acceptar</a></li>'								
	+'</ul>'														
	+'</div>'								
	+'</div>'								
	+'</div>';
	return html;
}

function generaNovaCapaUsuari(feature,nomNovaCapa){
	console.debug('generaNovaCapa');
	var data = {
        uid: $.cookie('uid'),
        description: jQuery('#des_edit').val(),
        nom: nomNovaCapa,
        geometryType: feature.options.tipus,
        publica: true,
        geomField: 'the_geom',
        idGeomField: 'nom',
        dataField: 'slotd1',
        idDataField: 'slotd1',
        mapBusinessId: url('?businessid')
    };
	//Creem nova capa tematic
	createTematicLayerEmpty(data).then(function(results){
			if(results.status==='OK'){
				console.debug("createTematicLayerEmpty OK");
				
				capaUsrActiva2= new L.FeatureGroup();
				capaUsrActiva2.options = {
					businessId : results.results.businessId,
					nom : nomNovaCapa,
					tipus: t_tematic,
					geometryType : feature.options.tipus,
					zIndex : controlCapes._lastZIndex+1		
				};
				//Afegim nova capa al combo
				jQuery('#cmbCapesUsr').append("<option selected value=\""+results.results.businessId+"\">"+nomNovaCapa+"</option>");	
				jQuery('.popup_pres').show();
				jQuery('.popup_edit').hide();
				

				map.addLayer(capaUsrActiva2);
				controlCapes.addOverlay(capaUsrActiva2,	capaUsrActiva2.options.nom, true);
				activaPanelCapes(true);
				
				//Accio de moure la feature a la nova capa tematic creada
				//moveFeatureToLayer(feature.properties.businessId,capaUsrActiva.options.businessId,capaUsrActiva2.options.businessId);
				var data = {
						uid: $.cookie('uid'),
			            businessId: feature.properties.businessId, //businessId de la feature
			            fromBusinessId: capaUsrActiva.options.businessId, //businessId del tematico de origen
			            toBusinessId: capaUsrActiva2.options.businessId //businessId del tematico de destino
			        }				
				moveFeatureToTematic(data).then(function(results){
						if(results.status=='OK'){
							console.debug("moveFeatureToTematic OK");
							capaUsrActiva.removeLayer(feature);
							capaUsrActiva2.addLayer(feature);//.on('layeradd', objecteUserAdded);
							//feature.openPopup();
							//Actualitzem capa activa
							capaUsrActiva.removeEventListener('layeradd');
							capaUsrActiva = capaUsrActiva2;//map._layers[capaUsrActiva2._leaflet_id];;
							capaUsrActiva.on('layeradd',objecteUserAdded);	
							//Actualitzem properties de la layer
							feature.properties.capaBusinessId = capaUsrActiva.options.businessId;
							feature.properties.capaNom = capaUsrActiva.options.nom;	
							feature.properties.capaLeafletId = capaUsrActiva._leaflet_id;
							//Actualitzem popup del marker
							var html = createPopUpContent(feature,feature.options.tipus);
							feature.setPopupContent(html);
							feature.openPopup();							
						}else{
							console.debug("moveFeatureToTematic ERROR");
						}
					},function(results){
						console.debug("moveFeatureToTematic ERROR");
					});		
			}else{
				console.debug("createTematicLayerEmpty ERROR");
			}

			
		},function(results){
			console.debug("createTematicLayerEmpty ERROR");
		}
	);
}





function moveFeatureToLayer(feature_businessId,layer_fromBusinessId,layer_toBusinessId){



	
	var data = {
			uid: $.cookie('uid'),
            businessId: feature_businessId, //businessId de la feature
            fromBusinessId: layer_fromBusinessId, //businessId del tematico de origen
            toBusinessId: layer_toBusinessId //businessId del tematico de destino
        }				
		moveFeatureToTematic(data).then(function(results){
			if(results.status=='OK'){
				console.debug("moveFeatureToTematic OK");
				capaUsrActiva.removeLayer(feature);
				capaUsrActiva2.addLayer(feature);//.on('layeradd', objecteUserAdded);
				feature.openPopup();				
			}else{
				console.debug("moveFeatureToTematic ERROR");
			}
		},function(results){
			console.debug("moveFeatureToTematic ERROR");
		});	







}

function modeLayerTextEdit(){

	jQuery('#capa_txt').show();
	jQuery('#feature_txt').hide();
	jQuery('.popup_pres').hide();
	jQuery('.popup_edit').show();	


}


function modeEditText(){
	objEdicio.edicioPopup='textFeature';
	jQuery('#capa_txt').hide();
	jQuery('#feature_txt').show();
	var txtTitol=jQuery('#titol_pres').text();
	var txtDesc=jQuery('#des_pres').text();
	jQuery('#titol_edit').val(txtTitol);	
	jQuery('#des_edit').val(txtDesc);
	jQuery('.popup_pres').hide();
	jQuery('.popup_edit').show();	
}



