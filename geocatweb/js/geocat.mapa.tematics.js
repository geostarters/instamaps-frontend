var paletasColors = [
  ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#999999'],
  ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#bc80bd','#d9d9d9']
];

function showTematicLayersModal(tipus,className){
//	console.debug("showTematicLayersModal");
	var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('No hi ha capes disponibles per aquest estil de mapa !!')+"<strong>  <span class='fa fa-warning sign'></span></div>";
	jQuery('.modal').modal('hide');
	
	jQuery('#dialog_layers_tematic').modal('show');
	
	jQuery('#stActiu').removeClass();
	jQuery('#stActiu').addClass(className);
	
	var layers = [];
	jQuery.each( controlCapes._layers, function( key, value ) {
		var layerOptions = this.layer.options;
		var tipusCapa = layerOptions.tipus;
		
		//Si la capa no esta tematitzada
		if(!layerOptions.tipusRang){
			if(tipus==tem_simple || tipus==tem_clasic) {
				if (tipusCapa == t_tematic){ //tematic
					if (tipus==tem_simple){
						layers.push(this);
					}else if (tipus==tem_clasic){
						if (this.layer.options.dades){
							layers.push(this);
						}
					}
				}else if(tipusCapa == t_dades_obertes){ //dades obertes
					var dataset = layerOptions.dataset;
					if (dataset != "incidencies" &&
						dataset != "cameres" &&
						dataset != "meteo_comarca" &&
						dataset != "meteo_costa"){
						layers.push(this);
					}
				}
			}else if (tipus==tem_cluster || tipus==tem_heatmap) {
				
				if(tipusCapa == t_dades_obertes || (tipusCapa == t_tematic && layerOptions.geometryType == t_marker))
				{
					layers.push(this);
				}
				
			}else if (tipus==tem_size) {
				$('#list_tematic_layers').html(warninMSG);
				return;
			}else{		
				$('#list_tematic_layers').html(warninMSG);
				return;
			}
		}
	});// fi each
	if(layers.length ==0){
		$('#list_tematic_layers').html(warninMSG);		
		return;
	}
	layers = {layers: layers};

	var source = jQuery("#tematic-layers-template").html();
	var template = Handlebars.compile(source);
	var html = template(layers);
	$('#list_tematic_layers').html(html);
	
	$('.usr_wms_layer').on('click',function(e){
		var _this = jQuery(this);
		var data = _this.data();
		data.from = tipus;
		if (tipus == tem_simple){
			if (data.geometrytype == t_marker  || data.tipus == t_dades_obertes || data.tipus == t_xarxes_socials){
				obrirMenuModal('#dialog_estils_punts','toggle',data);
			}else if (data.geometrytype == t_polyline){
				obrirMenuModal('#dialog_estils_linies','toggle',data);
			}else if (data.geometrytype == t_polygon){
				obrirMenuModal('#dialog_estils_arees','toggle',data);
			}
		}else if(tipus == tem_clasic){
			createTematicClasic(data);
		}else if(tipus == tem_heatmap){
			createHeatMap(controlCapes._layers[data.leafletid]);
			jQuery('#dialog_layers_tematic').modal('hide');
		}else if(tipus == tem_cluster){
			creaClusterMap(controlCapes._layers[data.leafletid]);
			jQuery('#dialog_layers_tematic').modal('hide');
		}else if(tipus == tem_size){
			
		}
	});
}

function createTematicClasic(data){
	console.debug("createTematicClasic");
	console.debug(data);
	jQuery('.modal').modal('hide');
	jQuery('#dialog_tematic_rangs').modal('show');
	//console.debug(data);
	
	jQuery('#palet_warning').hide();
	
	jQuery(".btn-paleta").on('click',function(evt){
		var _this = jQuery(this);
		if (_this.attr('id') == 'paletaPaired'){
			jQuery("#dialog_tematic_rangs").data("paleta", 0);
		}else if (_this.attr('id') == 'paletaPastel'){
			jQuery("#dialog_tematic_rangs").data("paleta", 1);
		}else{
			jQuery("#dialog_tematic_rangs").data("paleta", 0);
		}
		if (jQuery('#list_tematic_values').html() != ""){
			updatePaletaRangs();
		}
	});
	
	jQuery("#dialog_tematic_rangs").data("capamare", data);
	
		
	jQuery('#dialog_tematic_rangs .btn-success').on('click',function(e){
		updateClasicTematicFromRangs();
	});
	
	jQuery('#tipus_agrupacio_grp').hide();
	jQuery('#num_rangs_grp').hide();
	jQuery('#list_tematic_values').html("");
	jQuery('#dialog_tematic_rangs .btn-success').hide();
	
	var dataTem={
		businessId: data.businessid,
		uid: jQuery.cookie('uid')
	};
		
	getTematicLayer(dataTem).then(function(results){
		if (results.status == "OK"){
			var tematic = results.results;
			console.debug(tematic);
			jQuery("#dialog_tematic_rangs").data("tematic", tematic);
			var fields = {};
			fields[window.lang.convert('Escull el camp')] = '---';
			if (tematic.capes){
				var dataNames = tematic.capes.fieldsName.split(',');
				jQuery.each(dataNames, function( index, value ) {
					fields[value] = "slotd"+(index+1);
				});
			}else{ //sin datos
				fields['nom'] = 'nom';
				var geomNames = tematic.geometries.fieldsName.split(',');
				jQuery.each(geomNames, function( index, value ) {
					fields[value] = "slotf"+(index+1);
				});
			}
			//creamos el select con los campos
			var source1 = jQuery("#tematic-layers-fields").html();
			var template1 = Handlebars.compile(source1);
			var html1 = template1({fields:fields});
			jQuery('#dataField').html(html1);
			
			jQuery('#dataField').on('change',function(e){
				var this_ = jQuery(this);
				if (this_.val() == "---"){
					jQuery('#tipus_agrupacio_grp').hide();
					jQuery('#num_rangs_grp').hide();
					jQuery('#list_tematic_values').html("");
					jQuery('#dialog_tematic_rangs .btn-success').hide();
				}else{
					readDataTematicFromSlotd(tematic, this_.val()).then(function(results){
						updateSelecTipusRangs(results);
					});
				}
			});
		}
	});	
}

function updateSelecTipusRangs(results){
	//console.debug("updateSelecTipusRangs");
	jQuery("#dialog_tematic_rangs").data("values", results);
	getTipusValues();
}

function getTipusValues(){
	console.debug("getTipusValues");
	var results = jQuery("#dialog_tematic_rangs").data("values");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var arr = jQuery.grep(results, function( n, i ) {
		return !jQuery.isNumeric(n);
	});
	if (arr.length == 0){
		jQuery('#tipus_agrupacio_grp').show();
		jQuery('#num_rangs_grp').show();
		jQuery('#list_tematic_values').html("");
		
		jQuery( "input:radio[name=rd_tipus_agrupacio]").on('change',function(e){
			var this_ = jQuery(this);
			if (this_.val() == "U"){
				jQuery('#num_rangs_grp').hide();
				showTematicRangsUnic().then(function(results1){
					loadTematicValueUnicTemplate(results1);
				});
			}else{
				jQuery('#list_tematic_values').html("");
				jQuery('#dialog_tematic_rangs .btn-success').hide();
				jQuery('#num_rangs_grp').show();
				jQuery('#cmb_num_rangs').val("---");
				jQuery('#list_tematic_values').html("");
				jQuery('#dialog_tematic_rangs .btn-success').hide();
				//createRangsValues(jQuery('#cmb_num_rangs').val());
			}
		});
		
		jQuery('#cmb_num_rangs').on('change',function(e){
			var this_ = jQuery(this);
			if (this_.val() == "---"){
				jQuery('#list_tematic_values').html("");
				jQuery('#dialog_tematic_rangs .btn-success').hide();
			}else{
				createRangsValues(this_.val());
			}
		});
		
		jQuery('#rd_tipus_rang').click().change();		
	}else{ //unicos
		jQuery('#tipus_agrupacio_grp').hide();
		jQuery('#num_rangs_grp').hide();
		showTematicRangsUnic().then(function(results1){
			loadTematicValueUnicTemplate(results1);
		});
	}
}

function createRangsValues(rangs){
	console.debug("createRangsValues");
	var values = jQuery("#dialog_tematic_rangs").data("values");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	values.sort();
	var min = parseFloat(values[0]);
	var max = parseFloat(values[values.length-1]);
	var deltaR = (max - min)/rangs;
	deltaR = parseFloat(deltaR.toFixed(2));
	var newRangs = [];
	var i = 0;
	while (min < max && i < rangs){
		if (i == (rangs-1)){
			newRangs.push({min: min, max: max});
		}else{
			var tmpmax = parseFloat((min+deltaR).toFixed(2));
			newRangs.push({min: min, max: tmpmax});
			min = tmpmax;
		}
		i++;
	}
	jQuery("#dialog_tematic_rangs").data("rangs", newRangs);
	showTematicRangs().then(function(results){
		loadTematicValueRangsTemplate(results);
	});
}

function loadTematicValueUnicTemplate(results1){
	var source1;
	var geometryType = results1[0].style.geometryType;
	if (geometryType == t_marker){
		source1 = jQuery("#tematic-values-unic-punt-template").html();
	}else if (geometryType == t_polyline){
		source1 = jQuery("#tematic-values-unic-polygon-template").html();
	}else if (geometryType == t_polygon){
		source1 = jQuery("#tematic-values-unic-polygon-template").html();
	}
	var template1 = Handlebars.compile(source1);
	var html1 = template1({values:results1});
	jQuery('#list_tematic_values').html(html1);
	jQuery('#dialog_tematic_rangs .btn-success').show();
	if (geometryType == t_polyline){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitLRang(val, results1[i]);
		});
	}else if (geometryType == t_polygon){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitPRang(val, results1[i]);
		});
	}
	if (jQuery('#list_tematic_values tr').length > 9){
		jQuery('#palet_warning').show();
	}else{
		jQuery('#palet_warning').hide();
	}
}

function loadTematicValueRangsTemplate(results){
	var source1;
	var geometryType = results[0].style.geometryType;
	if (geometryType == t_marker){
		source1 = jQuery("#tematic-values-rangs-punt-template").html();
	}else if (geometryType == t_polyline){
		source1 = jQuery("#tematic-values-rangs-polygon-template").html();
	}else if (geometryType == t_polygon){
		source1 = jQuery("#tematic-values-rangs-polygon-template").html();
	}
	var template1 = Handlebars.compile(source1);
	var html1 = template1({values:results});
	jQuery('#list_tematic_values').html(html1);
	jQuery('#dialog_tematic_rangs .btn-success').show();
	if (geometryType == t_polyline){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitLRang(val, results[i]);
		});
	}else
	if (geometryType == t_polygon){
		jQuery('#list_tematic_values canvas').each(function(i, val){
			addGeometryInitPRang(val, results[i]);
		});
	}
	if (jQuery('#list_tematic_values tr').length > 9){
		jQuery('#palet_warning').show();
	}else{
		jQuery('#palet_warning').hide();
	}
}

function showTematicRangs(){
	var values = jQuery("#dialog_tematic_rangs").data("rangs");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	
	var defer = jQuery.Deferred();
	var valuesStyle = [];
	if (tematic.geometryType == t_marker){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,tematic.geometryType,paleta), index: i};
		});
	}else if (tematic.geometryType == t_polyline){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: default_line_style};
		});
	}else if (tematic.geometryType == t_polygon){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,tematic.geometryType,paleta), index: i};
		});
	}
	defer.resolve(valuesStyle);
	return defer.promise();
}

function showTematicRangsUnic(){
	var defer = jQuery.Deferred();
	var pvalues = jQuery("#dialog_tematic_rangs").data("values");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	//Eliminem valors repetits de values
	var seen = {};
	var values = [];
	$(pvalues).each(function(i, val) {
	    if (!seen[val]){
	    	seen[val] = true;
	    	values.push(val);	    	
	    }
	});
	//Ordenar valores
	values.sort();
	
	var rangs = tematic.rangs;
	var valuesStyle = [];
	if (tematic.geometryType == t_marker){
		valuesStyle = jQuery.map( values, function( a, i) {
			return {v: a, style: createIntervalStyle(i,tematic.geometryType,paleta), index: i};
		});
	}else if (tematic.geometryType == t_polyline){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: default_line_style};
		});
	}else if (tematic.geometryType == t_polygon){
		valuesStyle = jQuery.map( values, function( a, i ) {
			return {v: a, style: createIntervalStyle(i,tematic.geometryType,paleta), index: i};
		});
	}
	defer.resolve(valuesStyle);
	
	return defer.promise();
}

function readDataTematicFromSlotd(tematic, slotd){
	var defer = jQuery.Deferred();
	var dades = tematic.capes.dades;
	var values = jQuery.map( dades, function( a ) {
		return a[slotd];
	});
	defer.resolve(values);
	return defer.promise();
}

function canviaStyleSinglePoint(cvStyle,feature,capaMare,openPopup){
	var isCanvas=false;
	if(feature._ctx){isCanvas=true;}
	var featureID=feature._leaflet_id
	
	var noCanvi=(isCanvas==cvStyle.options.isCanvas);

	if(noCanvi && !isCanvas){//pinxo i/o glifons
		map._layers[featureID].setIcon(cvStyle);		
	}else if (noCanvi && isCanvas){//Nomes punt
		map._layers[featureID].setStyle(cvStyle.options);
		map._layers[featureID].setRadius(cvStyle.options.radius);
	}else if (!noCanvi ){
		capaMare.removeLayer(map._layers[featureID]);
		var layerTMP;
		if(isCanvas){//hi ha canvi de punt a pinxo i/o glifon
			layerTMP=L.marker([feature.getLatLng().lat,feature.getLatLng().lng],
					{icon: cvStyle,isCanvas:cvStyle.options.isCanvas,
					 tipus: t_marker});
		}else{//hi ha canvia de pinxo a punt canvas
			layerTMP= L.circleMarker([feature.getLatLng().lat,feature.getLatLng().lng],
				{ radius : cvStyle.options.radius, 
				  isCanvas:cvStyle.options.isCanvas,
				  fillColor : cvStyle.options.fillColor,
				  color :  cvStyle.options.color,
				  weight :  cvStyle.options.weight,
				  opacity :  cvStyle.options.opacity,
				  fillOpacity : cvStyle.options.fillOpacity,
				  tipus: t_marker}	
			);
		}
		layerTMP.properties=feature.properties;	
		layerTMP.addTo(capaMare);
		if (capaMare.options.tipus == t_dades_obertes){
			//popUp(feature, capaMare);
		}else{
			createPopupWindow(layerTMP,layerTMP.options.tipus);	
			if(!openPopup){
				map.closePopup();
			}
		}
	}
}

/*
function changeTematicLayerStyle_old(tematic, styles){
	console.debug("changeTematicLayerStyle_old");
	var rangs = getRangsFromStyles(tematic, styles);
	var capaMare = map._layers[tematic.leafletid];
	
	if (jQuery.isArray(styles)){
		
	}else{
		var layer = controlCapes._layers[tematic.leafletid];
		if (tematic.geometrytype == t_marker){
			jQuery.each(capaMare._layers, function( key, value ) {	
				canviaStyleSinglePoint(styles,this,capaMare,false)
			});
		}else if (tematic.geometrytype == t_polyline){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setStyle(styles);
			});
		}else if (tematic.geometrytype == t_polygon){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setStyle(styles);
			});
		}
	}
	
	if(capaMare.options.tipus == t_dades_obertes){
		var options = {
			dataset: capaMare.options.dataset,
			tem: tem_simple,
			style: styles.options
		};
		
		var data = {
			uid:$.cookie('uid'),
			businessId: capaMare.options.businessId,
			mapBusinessId: url('?businessid'),
			serverName: capaMare.options.nom,
			serverType: capaMare.options.tipus,
			calentas: false,
            activas: true,
            visibilitats: true,
            epsg: '4326',
            transparency: true,
            visibilitat: 'O',
			options: JSON.stringify(options)
		};
		
		updateServidorWMS(data).then(function(results){
		});
		
	}else if (tematic.tipus == t_tematic){
		rangs = JSON.stringify({rangs:rangs});
		
		var data = {
			businessId: tematic.businessid,
			uid: $.cookie('uid'),
            mapBusinessId: url('?businessid'),	           
            nom: capa.layer.options.nom+" heatmap",			
            calentas: false,           
            activas: true,
            visibilitats: true,	 			
			tipusRang: tematic.from,
			rangs: rangs
		};
		
		updateTematicRangs(data).then(function(results){ 
			//console.debug(results);
		});
	}
}
*/

function getRangsFromStyles(tematic, styles){
	console.debug("getRangsFromStyles");
	if (tematic.tipus == t_dades_obertes){
		tematic.geometrytype = t_marker;
	}
	var rangs = [];
	if (jQuery.isArray(styles)){
		jQuery.each(styles, function(i, val){
			var rang = getRangsFromStyles(tematic, val.style);
			rang = rang[0];
			rang.valorMax = val.key;
			rangs.push(rang);
		});
	}else{
		if (tematic.geometrytype == t_marker){
			
			if (styles.options.isCanvas){
				var rang = {
					simbolSize : styles.options.radius, 
					color :  jQuery.Color(styles.options.fillColor).toHexString(),
					borderColor :  styles.options.color,
					borderWidth :  styles.options.weight,
					opacity: (styles.options.fillOpacity * 100)
				};
			}else{
//				if (!styles.options.iconSize){
//					styles = styles.options.icon;
//				}
//				var rang = {
//					simbol: jQuery.trim(styles.options.icon),
//					simbolSize: styles.options.iconSize.y, 
//					simbolColor: styles.options.iconColor, 
//					marker: styles.options.markerColor
//				};
				
				if(jQuery.trim(styles.options.icon) != "" && jQuery.isPlainObject(styles.options.icon)){
					styles.options = styles.options.icon.options;
				}
								
				var rang = {
					llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
//					valorMax : "feature" + fId,
					color : styles.options.fillColor,//Color principal
					marker: styles.options.markerColor,//Si es de tipus punt_r o el color del marker
					simbolColor: styles.options.iconColor,//Glyphon
					radius : styles.options.radius,//Radius
					iconSize : styles.options.iconSize.x+"#"+styles.options.iconSize.y,//Size del cercle
					iconAnchor : styles.options.iconAnchor.x+"#"+styles.options.iconAnchor.y,//Anchor del cercle
					simbol : styles.options.icon,//tipus glyph
					opacity : (styles.options.opacity * 100),
					label : false,
					labelSize : 10,
					labelFont : 'arial',
					labelColor : '#000000',
				};				
				
			}
		}else if (tematic.geometrytype == t_polyline){
			var rang = {
				color: styles.options.color,
				lineWidth: styles.options.weight,
				opacity: (styles.options.opacity * 100),
			};
			/*var rang = {
				borderWidth: 2,
				borderColor: '#000000',
				color: styles.options.iconColor,
				label: false,
				labelColor: '#000000',
				labelFont: 'arial',
				labelHaloColor: '#ffffff',
				labelHaloWidth: 2,
				labelSize: 10,
				lineWidth: styles.lineWidth,
				lineStyle: 'solid',			
				llegenda: '',
				opacity: (styles.opacity * 100),
				poligonStyle: '',
				simbol: styles.options.icon,
				simbolSize: , 
				simbolColor: styles.options.markerColor, 
				valorMax: '',
				valorMin: '',
				marker: ''
			};
			*/
		}else if (tematic.geometrytype == t_polygon){
			if (styles._options){
				styles = styles._options;
			}else if(styles.options){
				styles = styles.options;
			}
			styles.fillColor = jQuery.Color(styles.fillColor).toHexString();
			var rang = {
				borderWidth: styles.weight,
				borderColor: styles.color,
				color: styles.fillColor,
				opacity: (styles.fillOpacity * 100)
			};
		}
		rangs.push(rang);
	}
	return rangs;
}

function loadTematicLayer(layer){
	var data={
		businessId: layer.businessId,
		uid: $.cookie('uid')
	};
	
	var layerWms = layer;
	
	//console.time("loadTematicLayer " + layerWms.serverName);
	getTematicLayer(data).then(function(results){
		//console.timeEnd("loadTematicLayer " + layerWms.serverName);
		if(results.status == "OK" ){
			var tematic = results.results;
			
			if(tematic.tipusRang == tem_heatmap){
				loadTematicHeatmap(tematic, layer.capesOrdre, layer.options);
			}else if(tematic.tipusRang == tem_cluster){
				loadTematicCluster(tematic, layer.capesOrdre, layer.options);
			}else{
				console.debug(tematic);
				var Lgeom = tematic.geometries.features.features;
				var idDataField = tematic.idDataField;
				var idGeomField = tematic.idGeomField;
				var dataField = tematic.dataField;
				var Lrangs = tematic.rangs;
				var Ldades = (tematic.capes ? tematic.capes.dades : []);
				
				var capaTematic = new L.FeatureGroup();
				
				var hasDades = false;
				if (tematic.capes && tematic.capes.fieldsName){
					hasDades = true;
				}
				
				capaTematic.options = {
					businessId : layerWms.businessId,
					nom : layerWms.serverName,
					tipus : layerWms.serverType,
					tipusRang: tematic.tipusRang, 
					geometryType: tematic.geometryType,
					dades: hasDades
				};
				
				if (!layerWms.capesActiva || layerWms.capesActiva == true || layerWms.capesActiva == "true"){
					capaTematic.addTo(map);
				}
				
				for(var g=0;g<Lgeom.length;g++){
					var geom = Lgeom[g];
					var rangStyle;
					if (geom.geometry){
						var dataGeom = jQuery.grep(Ldades, function(e){ return e[idDataField] == geom.properties[idGeomField]; });
						if (dataGeom.length > 0){
							dataGeom = dataGeom[0];
							jQuery.extend(geom.properties, {data: dataGeom});
						}else{
							dataGeom = null;
						}
						var ftype = geom.geometry.type;
						ftype = ftype.toLowerCase();
						if (ftype === t_point){
							ftype = t_marker;
						}else if (ftype === t_linestring){
							ftype = t_polyline;
						}
						//Sin rangos
						if (Lrangs.length == 0){
							rangStyle = createRangStyle(ftype, null, Lgeom.length);
						}
						//1 Rango
						else if (Lrangs.length == 1){
							rangStyle = Lrangs[0];
							rangStyle = createRangStyle(ftype, rangStyle, null);
						}
						//Multiples rangos
						else{
							if (dataGeom){
								rangStyle = jQuery.grep(Lrangs, function(e){
									if (e.valorMax && e.valorMin){
										return (e.valorMin <= dataGeom[dataField] &&  dataGeom[dataField] <= e.valorMax);
									}else{
										return e.valorMax == dataGeom[dataField];
									}
								});
							}else{
								rangStyle = jQuery.grep(Lrangs, function(e){ return e.valorMax == geom.properties.businessId; });
							}
							if (rangStyle.length > 0){
								rangStyle = rangStyle[0];
								rangStyle = createRangStyle(ftype, rangStyle, null);
							}else{
								rangStyle = createRangStyle(ftype, null, Lgeom.length);
							}
							/*
							if (dataGeom){
								rangStyle = jQuery.grep(Lrangs, function(e){ return e.valorMax == dataGeom[dataField]; });
								if (rangStyle.length > 0){
									rangStyle = rangStyle[0];
									rangStyle = createRangStyle(ftype, rangStyle);
								}else{
									rangStyle = createRangStyle(ftype);
								}
							}else{
								rangStyle = createRangStyle(ftype);
							}
							*/
						}
						var featureTem;
						if (ftype === t_marker){
							var coords=geom.geometry.coordinates;
							if(!rangStyle.isCanvas){//hi ha canvi de punt a pinxo i/o glifon
								featureTem = L.marker([coords[0],coords[1]],
									{icon: rangStyle, isCanvas:false, tipus: t_marker});
							}else{//hi ha canvia de pinxo a punt canvas
								featureTem= L.circleMarker([coords[0],coords[1]],
									rangStyle	
								);
							}
						}else if (ftype === t_polyline){
							var coords=geom.geometry.coordinates;
							var llistaPunts=[];
							for (var i = 0; i < coords.length; i++){
								var c=coords[i];
								var punt=new L.LatLng(c[0], c[1]);
								llistaPunts.push(punt);
							}
							featureTem = L.polyline(llistaPunts, rangStyle);
						}else if (ftype === t_polygon){
							var coords=geom.geometry.coordinates;
							var llistaLines=[];
							for (var i = 0; i < coords.length; i++){
								var lines=coords[i];
								var llistaPunts=[];
								for (var k = 0; k < lines.length; k++){
									var c=lines[k];
									var punt=new L.LatLng(c[0], c[1]);
									llistaPunts.push(punt);
								}
								llistaLines.push(llistaPunts);
							}
							featureTem = new L.Polygon(llistaLines, rangStyle);
						}else if (ftype === t_multipolygon){
							var coords=geom.geometry.coordinates;
							var llistaPoligons=[];
							for (var p = 0; p < coords.length; p++){
								var poligons=coords[p];
								var llistaLines=[];
								for (var i = 0; i < poligons.length; i++){
									var lines=poligons[i];
									var llistaPunts=[];
									for (var k = 0; k < lines.length; k++){
										var c=lines[k];
										var punt=new L.LatLng(c[0], c[1]);
										llistaPunts.push(punt);
									}
									llistaLines.push(llistaPunts);
								}
								llistaPoligons.push(llistaLines);
							}
							featureTem = new L.multiPolygon(llistaPoligons, rangStyle);
						}
						if (featureTem){
							featureTem.properties = geom.properties;
							featureTem.properties.capaLeafletId = capaTematic._leaflet_id;
							featureTem.properties.capaNom = capaTematic.options.nom;
							featureTem.properties.capaBusinessId = capaTematic.options.businessId;
							featureTem.properties.tipusFeature = ftype;
							if (featureTem.options){
								featureTem.options.tipus = ftype;
							}else{
								featureTem.options = {tipus: ftype};
							}
							featureTem.properties.feature = {};
							featureTem.properties.feature.geometry = geom.geometry;
							capaTematic.addLayer(featureTem);
							
//							if(rangStyle.options.markerColor=='punt_r'){
////								var num=rangStyle.options.radius;
////								featureTem.options.icon.options.shadowSize = new L.Point(1, 1);
//								var color = hexToRgb(featureTem.options.icon.options.fillColor);
//								featureTem._icon.style.setProperty("background-color", color);
//							}							
//							
							if($(location).attr('href').contains('mapa')){
								createPopupWindow(featureTem,ftype);
							}else{
								createPopupWindowVisor(featureTem,ftype);
							}
							
							map.closePopup();
						}
					}
				}
				
				var options = jQuery.parseJSON( layerWms.options );				
				if(options.origen){//Si es una sublayer
					var origen = getLeafletIdFromBusinessId(options.origen);
					controlCapes.addOverlay(capaTematic, layerWms.serverName, true, origen);					
				}
				else {
					if (!layerWms.capesOrdre){
						capaTematic.options.zIndex = controlCapes._lastZIndex + 1;
					}else{
						capaTematic.options.zIndex = parseInt(layerWms.capesOrdre);
					}
					controlCapes.addOverlay(capaTematic, layerWms.serverName, true);
					controlCapes._lastZIndex++;					
				}

				
			}
		}else{
			alert("Error getTematicLayer");
		}		
	},function(results){
		//console.debug('getTematicLayer ERROR');
	});
}

function createRangStyle(ftype, style, num_geometries){
	var rangStyle;
	if (style){
		if (ftype === t_marker){
			rangStyle = createFeatureMarkerStyle(style, num_geometries);
		}else if (ftype === t_polyline){
			rangStyle = createFeatureLineStyle(style);
		}else if (ftype === t_polygon){
			rangStyle = createFeatureAreaStyle(style);
		}else if (ftype === t_multipolygon){
			rangStyle = createFeatureAreaStyle(style);
		}
	}else{
		if (ftype === t_marker){
			rangStyle = L.AwesomeMarkers.icon(default_point_style);
		}else if (ftype === t_polyline){
			rangStyle = default_line_style;
		}else if (ftype === t_polygon){
			rangStyle = default_area_style;
		}else if (ftype === t_multipolygon){
			rangStyle = default_area_style;
		}
	}
	return rangStyle;
}

function changeDefaultLineStyle(canvas_linia){
	var estilTMP = default_line_style;
	estilTMP.color=canvas_linia.strokeStyle;
	estilTMP.weight=canvas_linia.lineWidth;
	estilTMP.tipus=t_polyline;
	if(objEdicio.obroModalFrom==from_creaCapa){
		 drawControl.options.polyline.shapeOptions= estilTMP;
	}
	return estilTMP;
}

function createFeatureLineStyle(style){
	var estilTMP = default_line_style;
	estilTMP.color=style.color;
	estilTMP.weight=style.lineWidth;
	estilTMP.tipus=t_polyline;
	return estilTMP;
}

function changeDefaultAreaStyle(canvas_pol){
	var estilTMP= default_area_style;
	estilTMP.fillColor=canvas_pol.fillStyle;
	estilTMP.fillOpacity=canvas_pol.opacity;
	estilTMP.weight=canvas_pol.lineWidth;
	estilTMP.color=canvas_pol.strokeStyle;
	estilTMP.tipus=t_polygon;
	
	if(objEdicio.obroModalFrom==from_creaCapa){
		drawControl.options.polygon.shapeOptions= estilTMP;
	}
	return estilTMP;
	/*
	if(estil.tipus=="pol"){
		drawControl.options.polygon.shapeOptions.fillColor=estil.fillStyle;
		drawControl.options.polygon.shapeOptions.fillOpacity=estil.opacity;
		drawControl.options.polygon.shapeOptions.weight=estil.lineWidth;
		drawControl.options.polygon.shapeOptions.color=estil.strokeStyle;
	}else{
		drawControl.options.polyline.shapeOptions.color=estil.strokeStyle;
		drawControl.options.polyline.shapeOptions.weight=estil.lineWidth;
		drawControl.options.polyline.shapeOptions.dashArray='3';
	}
	*/	
}

function createFeatureAreaStyle(style){
	var estilTMP= default_area_style;
	estilTMP.fillColor=style.color;
	estilTMP.fillOpacity=(style.opacity/100);
	estilTMP.weight=style.borderWidth;
	estilTMP.color=style.borderColor;
	estilTMP.tipus=t_polygon;
	return estilTMP;
}

function changeDefaultPointStyle(estilP) {
	//console.debug("changeDefaultPointStyle");
	var puntTMP= new L.AwesomeMarkers.icon(default_point_style);
	var _iconFons=estilP.iconFons.replace('awesome-marker-web awesome-marker-icon-','');
	var _iconGlif=estilP.iconGlif;	
	var cssText="";
	
	if(_iconGlif.indexOf("fa fa-")!=-1){
		_iconGlif=estilP.iconGlif.replace('fa fa-','');
	};
	
	var _colorGlif=estilP.colorGlif;
	
	if(_iconFons.indexOf("_r")!=-1){ //sóc rodó		
		var num=estilP.size;
		puntTMP.options.shadowSize = new L.Point(1, 1);
		var tt=estilP.fontsize;
		puntTMP.options.divColor=estilP.divColor;
		if(tt=="9px"){
			cssText="font9";			
		}else if(tt=="11px"){
			cssText="font11";
		}else if(tt=="12px"){
			cssText="font12";
		}else if(tt=="14px"){
			cssText="font14";
		}else if(tt=="15px"){
			cssText="font15";		
		}
				
		puntTMP.options.fillColor =estilP.divColor;
		if(_iconGlif==""){//no tin glif soc Canvas
			puntTMP.options.icon="";
			puntTMP.options.radius = parseInt(estilP.size/2.4);
			puntTMP.options.isCanvas=true;
		}else{
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);	
			puntTMP.options.icon=_iconGlif + " "+cssText;
			puntTMP.options.isCanvas=false;
		}
	}else{ // sóc pinxo
		puntTMP.options.iconAnchor= new L.Point(14, 42);
		puntTMP.options.iconSize = new L.Point(28, 42);
		puntTMP.options.shadowSize = new L.Point(36, 16);
		puntTMP.options.divColor='transparent';
		puntTMP.options.icon=_iconGlif + " "+cssText;
		puntTMP.options.isCanvas=false;
	}
	puntTMP.options.markerColor=_iconFons;
	puntTMP.options.iconColor=_colorGlif;
	if(objEdicio.obroModalFrom==from_creaCapa){
		defaultPunt=puntTMP;
	}
	return puntTMP;
}

function createFeatureMarkerStyle(style, num_geometries){
	if (style.marker && num_geometries <= num_max_pintxos){
			var puntTMP = new L.AwesomeMarkers.icon(default_point_style);
			puntTMP.options.iconColor = style.simbolColor;
			puntTMP.options.icon = style.simbol;
			puntTMP.options.markerColor = style.marker;
			puntTMP.options.isCanvas=false;
						
			//Especifiques per cercle amb glyphon
			if(style.marker == 'punt_r'){
				puntTMP.options.divColor= style.color;
				puntTMP.options.shadowSize = new L.Point(1, 1);
				puntTMP.options.radius = style.radius;
				var anchor = style.iconAnchor.split("#");
				var size = style.iconSize.split("#");
				puntTMP.options.iconAnchor.x = parseInt(anchor[0]);
				puntTMP.options.iconAnchor.y = parseInt(anchor[1]);
				puntTMP.options.iconSize.x = size[0];
				puntTMP.options.iconSize.y = size[1];
			}
	}else{
		var puntTMP = { 
			radius: style.simbolSize, 
			isCanvas: true,
			fillColor: style.color,
			color:  style.borderColor,
			weight:  style.borderWidth,
			fillOpacity:  style.opacity/100,
			opacity: 1,
			tipus: t_marker
		};
	}
	return puntTMP;
}

function getRangsFromLayer(layer){
	console.debug("getRangsFromLayer");
	if (layer.options.tipus == t_tematic){
		var styles = jQuery.map(layer.getLayers(), function(val, i){
			return {key: val.properties.businessId, style: val};
		});
		
		var tematic = layer.options;
		tematic.tipusRang = tematic.tipusRang ? tematic.tipusRang : tem_simple;
		tematic.businessid = tematic.businessId; 
		tematic.leafletid = layer._leaflet_id;
		tematic.geometrytype = tematic.geometryType;
		tematic.from = tematic.tipusRang;
		
		var rangs = getRangsFromStyles(tematic, styles);
        rangs = JSON.stringify({rangs:rangs});
        
        var data = {
              businessId: tematic.businessid,
              uid: $.cookie('uid'),
              tipusRang: tematic.from,
              rangs: rangs
        };
              
        updateTematicRangs(data).then(function(results){
              console.debug(results);
        });
	}
}

function changeTematicLayerStyle(tematic, styles){
	console.debug("changeTematicLayerStyle");
	console.debug(styles);
	var rangs = getRangsFromStyles(tematic, styles);
	var capaMare = controlCapes._layers[tematic.leafletid].layer;
	
	if (jQuery.isArray(styles)){
		
	}else{
//		var layer = controlCapes._layers[tematic.leafletid];
//		if (tematic.geometrytype == t_marker){
//			jQuery.each(capaMare._layers, function( key, value ) {	
//				canviaStyleSinglePoint(styles,this,capaMare,false)
//			});
//		}else if (tematic.geometrytype == t_polyline){
//			jQuery.each(layer.layer._layers, function( key, value ) {
//				this.setStyle(styles);
//			});
//		}else if (tematic.geometrytype == t_polygon){
//			jQuery.each(layer.layer._layers, function( key, value ) {
//				this.setStyle(styles);
//			});
//		}
	}
	
	if(capaMare.options.tipus == t_dades_obertes){
		
		var options = {
			dataset: capaMare.options.dataset,
			tem: tem_simple,
			style: rangs[0],
			origen: capaMare.options.businessId
		};
			
		var data = {
			uid:$.cookie('uid'),
			//businessId: capaMare.options.businessId,
			mapBusinessId: url('?businessid'),
			serverName: capaMare.options.nom+" basic",
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
			console.debug(results.results);
			loadDadesObertesLayer(results.results);
		});
		
	}else if (tematic.tipus == t_tematic){
		rangs = JSON.stringify({rangs:rangs});
		
		var data = {
			businessId: tematic.businessid,
			uid: $.cookie('uid'),
            mapBusinessId: url('?businessid'),	           
            nom: capaMare.options.nom+" basic",
			calentas: false,
            activas: true,
            visibilitats: true,    
            order: capesOrdre_sublayer,
			tipusRang: tematic.from,
			rangs: rangs
		};
		
		duplicateTematicLayer(data).then(function(results){
			if(results.status == 'OK'){
				console.debug(results.results);
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
	}
}

function createIntervalStyle(index, geometryType, paleta){
	var defStyle;
	var markerColors = (paleta)? paletasColors[paleta] : paletasColors[0];
	if (index > 9){
		index = 9;
	}
	if (geometryType == t_marker){
		defStyle = jQuery.extend({}, default_point_style);
		defStyle.fillColor = markerColors[index];
		defStyle.isCanvas = true;		
	}else if (geometryType == t_polyline){
		defStyle = jQuery.extend({}, default_line_style);
		defStyle.color = markerColors[index];
	}else if (geometryType == t_polygon){
		defStyle = jQuery.extend({}, default_area_style);
		defStyle.color = markerColors[index];
	}
	defStyle.geometryType = geometryType;
	
	return defStyle;
}

function div2RangStyle(tematic, tdElem){
	var rangStyle;
	if (tematic.geometrytype == t_marker){
		var divElement = tdElem.find('div');
		rangStyle = {
			borderColor :  "#ffffff",
			borderWidth :  2,
			simbolSize: parseInt(parseInt(divElement.css('height'))/2.4),
			color: jQuery.Color(divElement.css('background-color')).toHexString(),
			opacity: 90
		};
	}else if (tematic.geometrytype == t_polyline){
		//TODO
	}else if (tematic.geometrytype == t_polygon){
		var divElement = tdElem.find('canvas')[0].getContext("2d");
		rangStyle = {
			borderColor :  divElement.strokeStyle,
			borderWidth :  divElement.lineWidth,
			color: jQuery.Color(divElement.fillStyle).toHexString(),
			opacity: (jQuery.Color(divElement.fillStyle).alpha()*100)
		};
	}
	return rangStyle;
}

function updateClasicTematicFromRangs(){
	console.debug("updateClasicTematicFromRangs");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var tematicFrom = jQuery("#dialog_tematic_rangs").data("capamare");
	var capaMare = controlCapes._layers[tematicFrom.leafletid].layer;
	var rangsTr = jQuery('#list_tematic_values tbody tr');
		
	var rangs = [];
	jQuery.each(rangsTr, function( index, value ) {
		var _this = jQuery(value);
		var tdRang, tdMin, tdMax;
		var tdVal;
		if (_this.children().length == 2){
			tdRang = _this.find('td:eq(0)');
			tdVal = _this.find('td:eq(1)');
			var rang = div2RangStyle(tematicFrom, tdVal);
			rang.valorMax = tdRang.text();
			rangs.push(rang);
		}else{
			tdMin = _this.find('td:eq(0)');
			tdMax = _this.find('td:eq(1)');
			tdVal = _this.find('td:eq(2)');
			var rang = div2RangStyle(tematicFrom, tdVal);
			rang.valorMin = tdMin.find('input').val();
			rang.valorMax = tdMax.find('input').val();
			rangs.push(rang);
		}
	});
	rangs = JSON.stringify({rangs:rangs});
	
	var data = {
		businessId: tematicFrom.businessid,
		uid: $.cookie('uid'),
        mapBusinessId: url('?businessid'),	           
        nom: capaMare.options.nom+" clasic",
		calentas: false,
        activas: true,
        visibilitats: true,
        dataField: jQuery('#dataField').val(),
		tipusRang: tematicFrom.from,
		rangs: rangs
	};
	
	duplicateTematicLayer(data).then(function(results){
		if(results.status == 'OK'){
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
	
	jQuery('#dialog_tematic_rangs').modal('hide');
}

function addGeometryInitLRang(canvas, style){
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
	cv_ctx_l.strokeStyle=style.style.color;
	cv_ctx_l.lineWidth=3;
	cv_ctx_l.stroke(); 	
}

function addGeometryInitPRang(canvas, style){
	var	cv_ctx_p=canvas.getContext("2d");
	cv_ctx_p.clearRect(0, 0, canvas.width, canvas.height);
	cv_ctx_p.moveTo(5.13,15.82);
	cv_ctx_p.lineTo(25.49,5.13);
	cv_ctx_p.lineTo(37.08,13.16);
	cv_ctx_p.lineTo(20.66,38.01);
	cv_ctx_p.lineTo(2.06,33.67);
	cv_ctx_p.closePath();
	cv_ctx_p.strokeStyle=style.style.color; //hex
	cv_ctx_p.fillStyle=jQuery.Color(style.style.color).alpha(0.75).toRgbaString(); //rgba
	cv_ctx_p.lineWidth=2;
	cv_ctx_p.fill();
	cv_ctx_p.stroke(); 
}

function updatePaletaRangs(){
	var paleta = jQuery("#dialog_tematic_rangs").data("paleta");
	var tematic = jQuery("#dialog_tematic_rangs").data("tematic");
	var tematicFrom = jQuery("#dialog_tematic_rangs").data("capamare");
	//solo para los 9 primeros (cuando usuario pueda cambiar los estilos)
	//console.debug(jQuery('#list_tematic_values canvas:lt(9)'));
	if (tematicFrom.geometrytype == t_marker){
		jQuery('#list_tematic_values tbody td div').each(function(i, elm){
			if (i > 9){
				i = 9;
			}
			var color = paletasColors[paleta][i];
			jQuery(elm).css('background-color', color);
		});
	}else if (tematicFrom.geometrytype == t_polyline){
		jQuery('#list_tematic_values canvas').each(function(i, elm){
			if (i > 9){
				i = 9;
			}
			var color = paletasColors[paleta][i];
			addGeometryInitLRang(elm, {style:{color: color}});
		});
	}else if (tematicFrom.geometrytype == t_polygon){
		jQuery('#list_tematic_values canvas').each(function(i, elm){
			if (i > 9){
				i = 9;
			}
			var color = paletasColors[paleta][i];
			addGeometryInitPRang(elm, {style:{color: color}});
		});
	}
}