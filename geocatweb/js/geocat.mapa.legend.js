/*************** LLEGENDA ********************/

function addLegend(){
	
	legend = L.control({position: 'bottomright'});
	
	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend visor-legend mCustomScrollbar');
	    div.id = "mapLegend";
	    jQuery.each(mapLegend, function(i, row){
	    	for (var i = 0; i < row.length; i++) {
	    		if(row[i].chck){
	    			div.innerHTML +='<div class="visor-legend-row">'+
						    			'<div class="visor-legend-symbol col-md-4 col-xs-4">'+row[i].symbol+'</div>'+
						    			'<div class="visor-legend-name col-md-8 col-xs-8">'+row[i].name+'</div>'+
	    							'</div>'+
	    							'<div class="visor-separate-legend-row"></div>';
	    		}
	    	}
	    });
	    return div;
	};
	
	ctr_legend = L.control({
		position : 'bottomright'
	});
	ctr_legend.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'div_barrabotons btn-group-vertical');

		var btllista = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_legend');
		this._div.appendChild(btllista);
		btllista.innerHTML = '<span class="glyphicon glyphicon-list-alt greenfort"></span>';

		return this._div;
	};
	ctr_legend.addTo(map);	
	legend.addTo(map);
}


/*Control llegenda buida o be, q hagi publicat el mapa amb llegenda, 
pero cap opcio de la llegenda marcada*/
function checkEmptyMapLegend(){
	var trobat = false;
	jQuery.each(mapLegend, function(i, row){
    	for (var i = 0; i < row.length && !trobat; i++) {
    		if(row[i].chck){
    			trobat = true;
    		}
    	}		
	});
	if(trobat){
		addLegend();
		$("#mapLegend").mCustomScrollbar();
	}
}

function createModalConfigLegend(){
	//Obrim modal llegenda
	//console.debug(controlCapes);
	//console.debug(map._layers);
	var html = '<h4 lang="ca" id="llegenda-title-text" class="modal-title">'+window.lang.convert('Llegenda')+'</h4>';
	html += '<div class="separate-legend-row-all"></div>';
	html += '<div class="legend-row">'+
				'<div class="legend-subrow-all">'+
				'<input id="legend-chck-all" class="col-md-1 legend-chck" type="checkbox">'+
				'<div class="col-md-11 legend-name-all">'+
					window.lang.convert('Tots')+
				'</div>'+
			'</div>';
	html += '<div class="separate-legend-row-all"></div>';
	var count = 0;
	jQuery.each(controlCapes._layers, function(i, item){
		
		controlLegendPoint = [];
		controlLegendMarker = [];
		controlLegendLine = [];
		controlLegendPol = [];
		
		html += '<div class="legend-row" id="row-'+count+'">';
		html += addLayerToLegend(item.layer, count);
		count++;
		jQuery.each(item._layers, function(i, sublayer){
			html += addLayerToLegend(sublayer.layer, count, sublayer.layerIdParent);
		});
		
		html+='</div><div class="separate-legend-row"></div>';
		//console.debug(html);
	});	
	$('#dialgo_publicar .modal-body .modal-legend').html(html);
	$('#dialgo_publicar .modal-body .modal-legend').show();
//	$('#dialog_llegenda').modal('show');

	
		$('#legend-chck-all').on('click', function(e){
		 if($('#legend-chck-all').is(':checked')){
			 $('.legend-chck').prop('checked', true);
		 }else{
			 $('.legend-chck').prop('checked', false);
		 }
	});	
	
//	$('.legend-subrow input, .legend-subrow-all input').iCheck({
//	    checkboxClass: 'icheckbox_flat-blue',
//	    radioClass: 'iradio_flat-blue'
//	});	
//	
//	$('.legend-subrow-all input').on('ifChecked', function(event){
//		  //alert(event.type + ' callback');
//		  $('.legend-subrow input').iCheck('check');
//	});
//	
//	$('.legend-subrow-all input').on('ifUnchecked', function(event){
////		  alert(event.type + ' callback');
//		  $('.legend-subrow input').iCheck('uncheck');
//	});	
	
}

function addLayerToLegend(layer, count, layerIdParent){
	var html = "";

	//checked="checked", layer.options.nom
	var layerName = layer.options.nom;
	var checked = "";
	if(mapLegend[layer.options.businessId]){
		layerName = mapLegend[layer.options.businessId][0].name;
		if(mapLegend[layer.options.businessId][0].chck) checked = 'checked="checked"';
	}
	
	//Cluster
	if(layer.options.tipusRang && layer.options.tipusRang == tem_cluster){
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
		
		html += '<div class="col-md-2 legend-symbol">'+
					'<img src="img/clustering.png" class="btn-paleta" style=""/>'+
				'</div>'+
				'<div class="col-md-9 legend-name">'+
					'<input type="text" class="form-control my-border" value="'+layerName+'">'+
				'</div>';
		html+='</div>';
		
	//Heatmap
	}else if(layer.options.tipusRang && layer.options.tipusRang == tem_heatmap){
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
		html += '<div class="col-md-2 legend-symbol">'+
					'<img src="img/heatmap.png" class="btn-paleta" style=""/>'+
				'</div>'+
				'<div class="col-md-9 legend-name">'+
					'<input type="text" class="form-control my-border" value="'+layerName+'">'+
				'</div>';		
		html+='</div>';
//		html+='<div class="separate-legend-subrow" ></div>';
		
	//Dades Obertes y JSON
	}else if(layer.options.tipus == t_dades_obertes || layer.options.tipus == t_json){//es un punt
		
		
		var estil_do = layer.options.estil_do;
		if(layer.options.options && layer.options.options.estil_do) estil_do = layer.options.options.estil_do;//Si es JSON
		else if(estil_do.options) estil_do = estil_do.options;
		
		if(estil_do.isCanvas || estil_do.markerColor.indexOf("punt_r")!=-1){
			var size="";
			if(estil_do.iconSize){
				size = 'width: '+estil_do.iconSize.x+'px; height: '+estil_do.iconSize.y+'px;';
			}else{
				var mida = getMidaFromRadius(estil_do.radius);
				size = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';
			}
			
			var color = hexToRgb(estil_do.fillColor);
			var icon = "";
			var colorIcon=""; 
			if(estil_do.divColor){
				var auxColor = hexToRgb(estil_do.divColor);
				colorIcon = 'color: rgb('+auxColor.r+', '+auxColor.g+', '+auxColor.b+');';
			} 
			
			if(estil_do.icon){
				icon = "fa fa-"+estil_do.icon;
			}
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
			html +=	'<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-punt_r '+icon+' legend-symbol" '+
							'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+colorIcon+
							' '+size+'">'+
						'</div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';
			html+='</div>';
//			html+='<div class="separate-legend-subrow" ></div>';		
			
		}else{
			
			var color = hexToRgb(estil_do.iconColor);
//			console.debug(estil_do);
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
			html += '<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-'+estil_do.markerColor+
							' fa fa-'+estil_do.icon+'" style="width: 28px; height: 42px; font-size: 14px;'+ 
							'background-color: transparent; color: rgb('+color.r+', '+color.g+', '+color.b+');">'+
						'</div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';
			html+='</div>';
//			html+='<div class="separate-legend-subrow" ></div>';			
		}
		
	//URL FILE
	}else if(layer.options.tipus == t_url_file){		
		var type = "";
		var geometrytype = "";
		jQuery.each(layer._layers, function(i, lay){
//			html += addLayerToLegend(sublayer.layer, count, sublayer.layerIdParent);
			geometrytype = lay.feature.geometry.type.toLowerCase(); 
			return (geometrytype=="");
			//			break;
		});		
		type = transformTipusGeometry(geometrytype);
		
		var estil_do = layer.options.estil_do;
		
		if(type == t_marker){
			console.debug("type");
			console.debug(type);
			
			var mida = getMidaFromRadius(estil_do.radius);
			size = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';			
			var color = hexToRgb(estil_do.fillColor);
			
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
			html +=	'<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
							'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
							' '+size+'">'+
						'</div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';
			html+='</div>';
			
		}else if(type == t_polygon){
			var color = hexToRgb(estil_do.fillColor);
			var borderColor = hexToRgb(estil_do.color);
			var opacity = estil_do.fillOpacity;
			var borderWidth = estil_do.weight;						
			var polStyle =	'<svg height="40" width="40">'+
									'<polygon points="5.13 15.82, 25.49 5.13, 37.08 13.16, 20.66 38.01, 2.06 33.67,5.13 15.82" '+
										'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
								'</svg>';
			
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';					
			html += '<div class="col-md-2 legend-symbol">'+
						polStyle+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';					
			
			html+='</div>';			
			
		}else if(type == t_polyline){
			var color = hexToRgb(estil_do.fillColor);
			var lineWidth = estil_do.weight;
			var lineStyle =	'<svg height="30" width="30">'+
									'<line x1="0" y1="0" x2="30" y2="30" '+
										'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
								'</svg>';	
			
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
			html += '<div class="col-md-2 legend-symbol">'+
						lineStyle +
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';					
			html+='</div>';				
		}
		
		
	//XARXES SOCIALS
	}else if(layer.options.tipus == t_xarxes_socials){
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
		if(layer.options.hashtag){
			html += '<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-blue fa fa-twitter" style="width: 28px; height: 42px; font-size: 14px; background-color: transparent;"></div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';			
		}else if(layer.options.maxLoad){
			
			html += '<div class="col-md-2 legend-symbol">'+
						'<img src="http://mw2.google.com/mw-panoramio/photos/small/43954089.jpg" class="leaflet-marker-icon photo-panoramio leaflet-zoom-animated leaflet-clickable" style="" tabindex="0"/>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';				
		}else{
			html += '<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-gray fa fa-book" style="width: 28px; height: 42px; font-size: 14px; background-color: transparent;"></div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';				
		}
		html+='</div>';
		
	//TEMATIC
	}else if(layer.options.tipus == t_tematic){
		
		var rangs = getRangsFromLayerLegend(layer);
		//console.debug(rangs);
		var size = rangs.length;
		
		//Classic tematic
		if(layer.options.tipusRang && layer.options.tipusRang==tem_clasic){
			var geometryType = transformTipusGeometry(layer.options.geometrytype);
			var i = 0;
			var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
			
			var listRangs = layer.options.rangs;
			listRangs.sort(sortByValorMax);
			
			for(i;i<listRangs.length && controlColorCategoria.length<10;i++){

				var color = hexToRgb(listRangs[i].color);
				var existeix = checkColorAdded(controlColorCategoria, color);
				if(!existeix){
					
					controlColorCategoria.push(color);
					
					if(geometryType == t_marker){
						var mida = getMidaFromRadius(rangs[i].simbolSize);
						var iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';						
						var stringStyle ='<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
											'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
											' '+iconSize+'">'+
										'</div>';						
					}else if(geometryType == t_polyline){
						var lineWidth = rangs[i].lineWidth;
						var stringStyle =	'<svg height="30" width="30">'+
												'<line x1="0" y1="0" x2="30" y2="30" '+
													'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
											'</svg>';						
					}else{
						var borderColor = hexToRgb(rangs[i].borderColor);
						var opacity = rangs[i].opacity/100;
						var borderWidth = rangs[i].borderWidth;						
						var stringStyle =	'<svg height="40" width="40">'+
												'<polygon points="5.13 15.82, 25.49 5.13, 37.08 13.16, 20.66 38.01, 2.06 33.67,5.13 15.82" '+
													'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
											'</svg>';						
					}

					
					//Reinicialitzem
					var labelNomCategoria = "";
					if(color.r == 153 && color.g==153 && color.b==153 ||
							color.r == 217 && color.g==217 && color.b==217 ||
							color.r == 218 && color.g==218 && color.b==218 ) labelNomCategoria = window.lang.convert("Altres");
					else labelNomCategoria = findLabelCategoria(listRangs[i], layer.options.rangsField);
//					else labelNomCategoria = findLabelCategoria(layer.options.dataField, rangs[i].featureLeafletId, layer._leaflet_id, layerIdParent);
					checked = "";						
					
					var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
					if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
						labelNomCategoria = mapLegend[layer.options.businessId][index].name;
						if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
					}				
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
					html +=	'<div class="col-md-2 legend-symbol">'+
								stringStyle+
							'</div>'+
							'<div class="col-md-9 legend-name">'+
								'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
							'</div>';				
//					
					html+='</div>';						
				}
			}

		}else{
			
			//Si ve de fitxer (te source) o si es simpleTematic, 
			//amb el primer element de rang ja tenim prou, no ens cal recorrer tots el rangs 
			//pq seran tots iguals
			if(layer.options.source || (layer.options.tipusRang && layer.options.tipusRang==tem_simple) ){
				if(size > 0) size = 1;//Control rangs no buit
			}
			
//			console.debug("///"+layer.options.nom+"///");
			
			var geometryType = transformTipusGeometry(layer.options.geometrytype);
			
			if(geometryType == t_marker){
				for(var i=0;i<size;i++){
					
					
					//Si es un punt
					if(rangs[i].isCanvas || rangs[i].marker.indexOf("punt_r")!=-1){
						
						var iconSize="";
						if(rangs[i].iconSize){
							var mides = rangs[i].iconSize.split("#");
							iconSize = 'width: '+mides[0]+'px; height: '+mides[1]+'px;';
						}else{
							var mida = getMidaFromRadius(rangs[i].simbolSize);
							iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';
						}
						
						var color = hexToRgb(rangs[i].color);
						var icon = "";
						var colorIcon=""; 
						if(rangs[i].simbolColor){
							var auxColor = hexToRgb(rangs[i].simbolColor);
							colorIcon = 'color: rgb('+auxColor.r+', '+auxColor.g+', '+auxColor.b+');';
						} 
						
						if(rangs[i].simbol){
							icon = "fa fa-"+rangs[i].simbol;
						}
						
						var obj = {iconSize: iconSize, color: color, icon:icon, colorIcon: colorIcon};
						var existeix = checkPointStyle(obj);
						
						if(!existeix){
							controlLegendPoint.push(obj);
							
							var stringStyle =	'<div class="awesome-marker-web awesome-marker-icon-punt_r '+icon+' legend-symbol" '+
													'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+colorIcon+
													' '+iconSize+'">'+
												'</div>';

							//Reinicialitzem
							layerName = layer.options.nom;
							checked = "";						
							var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
							if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
								layerName = mapLegend[layer.options.businessId][index].name;
								if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
							}							
							
							html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
							html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';					
							html +=	'<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+layerName+'">'+
									'</div></div>';								
						}
					}else{//Si es un pintxo
						var color = hexToRgb(rangs[i].simbolColor);
						
						var obj = {color: color, marker: rangs[i].marker, simbol: rangs[i].simbol};
						var existeix = checkMarkerStyle(obj);
						
						if(!existeix){
							controlLegendMarker.push(obj);
							
							var stringStyle =	'<div class="awesome-marker-web awesome-marker-icon-'+rangs[i].marker+
													' fa fa-'+rangs[i].simbol+'" style="width: 28px; height: 42px; font-size: 14px;'+ 
													'background-color: transparent; color: rgb('+color.r+', '+color.g+', '+color.b+');">'+
												'</div>';
	
							//Reinicialitzem
							layerName = layer.options.nom;
							checked = "";						
							var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
							if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
								layerName = mapLegend[layer.options.businessId][index].name;
								if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
							}							
							
							html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
							html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';						
							html += '<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+layerName+'">'+
									'</div></div>';							
						}

					}
					
//					html+='<div class="separate-legend-subrow" ></div>';			
				}				
			}else if(geometryType == t_polyline){
				
				for(var i=0;i<size;i++){
					
					var color = hexToRgb(rangs[i].color);
					var lineWidth = rangs[i].lineWidth;
	
					var obj = {color: color, lineWidth: lineWidth};
					var existeix = checkLineStyle(obj);
					
					if(!existeix){
						controlLegendLine.push(obj);
						
						var stringStyle =	'<svg height="30" width="30">'+
												'<line x1="0" y1="30" x2="30" y2="0" '+
													'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
											'</svg>';
						//Reinicialitzem
						layerName = layer.options.nom;
						checked = "";						
						var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							layerName = mapLegend[layer.options.businessId][index].name;
							if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}					
						
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
						html += '<div class="col-md-2 legend-symbol">'+
											stringStyle +
								'</div>'+
								'<div class="col-md-9 legend-name">'+
									'<input type="text" class="form-control my-border" value="'+layerName+'">'+
								'</div>';					
						
						html+='</div>';						
					}
				}				
			}else if(geometryType == t_polygon){
				
				for(var i=0;i<size;i++){
				
					var color = hexToRgb(rangs[i].color);
					var borderColor = hexToRgb(rangs[i].borderColor);
					var opacity = rangs[i].opacity/100;
					var borderWidth = rangs[i].borderWidth;
					
					var obj = {color: color, borderColor: borderColor, opacity:opacity, borderWidth:borderWidth};
					var existeix = checkPolStyle(obj);					
					
					if(!existeix){
//						console.debug("No existeix:")
//						console.debug(rangs[i]);
//						console.debug(rangs[i].borderColor);
//						console.debug(borderColor);
						controlLegendPol.push(obj);					
					
						var stringStyle =	'<svg height="40" width="40">'+
												'<polygon points="5.13 15.82, 25.49 5.13, 37.08 13.16, 20.66 38.01, 2.06 33.67,5.13 15.82" '+
													'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
											'</svg>';
						
						//Reinicialitzem
						layerName = layer.options.nom;
						checked = "";						
						var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							layerName = mapLegend[layer.options.businessId][index].name;
							if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}						
						
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';					
						html += '<div class="col-md-2 legend-symbol">'+
										stringStyle+
								'</div>'+
								'<div class="col-md-9 legend-name">'+
									'<input type="text" class="form-control my-border" value="'+layerName+'">'+
								'</div>';					
						
						html+='</div>';
					}else{
						console.debug("Existeix:")
						console.debug(rangs[i].borderColor);
						console.debug(borderColor);
					}
					
				}
//				console.debug("controlLegendPol:");
//				console.debug(controlLegendPol);				
			}
		}
	}
	return html;
}

function checkLineStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendLine.length && !existeix;i++){
		var item = controlLegendLine[i];
		if(item.lineWidth == obj.lineWidth && 
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function checkPolStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendPol.length && !existeix;i++){
		var item = controlLegendPol[i];
		if(item.opacity == obj.opacity && 
				item.borderWidth == obj.borderWidth &&
				item.borderColor.r == obj.borderColor.r && 
				item.borderColor.g == obj.borderColor.g && 
				item.borderColor.b == obj.borderColor.b	&&			
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function checkPointStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendPoint.length && !existeix;i++){
		var item = controlLegendPoint[i];
		if(item.iconSize == obj.iconSize && 
				item.icon == obj.icon &&
				item.colorIcon.r == obj.colorIcon.r && 
				item.colorIcon.g == obj.colorIcon.g && 
				item.colorIcon.b == obj.colorIcon.b	&&			
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function checkMarkerStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendMarker.length && !existeix;i++){
		var item = controlLegendMarker[i];
		if(item.marker == obj.marker && 
				item.simbol == obj.simbol &&
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function getRangsFromLayerLegend(layer){
	
	var styles = jQuery.map(layer.getLayers(), function(val, i){
		//Si la layer es multipoligon ha d'agafa l'estil de les seves layers de dins
		if(val.options.tipus.indexOf(t_multipolygon)!= -1){
			return {key: val.properties.businessId, style: val.getLayers()[0]};
		}else{
			return {key: val.properties.businessId, style: val};
		}
	});
	
	var tematic = layer.options;
	tematic.tipusRang = tematic.tipusRang ? tematic.tipusRang : tem_origen;
	tematic.businessid = tematic.businessId; 
	tematic.leafletid = layer._leaflet_id;
	tematic.geometrytype = tematic.geometryType;
	tematic.from = tematic.tipusRang;
	
	var rangs = getRangsFromStyles(tematic, styles);
    //rangs = JSON.stringify({rangs:rangs});	
	
    return rangs;
}

function findLabelCategoria(rang, rangsField){
	if(rang.valorMin){
		return rangsField +": "+rang.valorMin +" - "+ rang.valorMax;
	}else{
		return rang.valorMax;
	}
}

//This will sort your array
function sortByValorMax(a, b){
	var aName = a.valorMax.toLowerCase();
	var bName = b.valorMax.toLowerCase(); 
	return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
//	if (a.valorMax < b.valorMax) return -1;
//	if (a.valorMax > b.valorMax) return 1;
//	return 0;	
}

function updateMapLegendData(){
	mapLegend = {};
	$(".legend-subrow").each(function(index,element){
		
		var businessId = $(element).attr('data-businessId');
		var obj = {
				chck : $(element).children( ".legend-chck").is(':checked'),
				symbol : $(element).children( ".legend-symbol").html(),
				name : $(element).children( ".legend-name").children("input").val()					
		};
		if(!mapLegend[businessId]){
			mapLegend[businessId] = [];			
		}
		mapLegend[businessId].push(obj);
	});	
}

function findStyleInLegend(legend,stringStyle){
	var index = -1;
	for(var i=0; i<legend.length;i++){
		if(legend[i].symbol.trim() == stringStyle.trim()){
//		if(stringCompare(legend[i].symbol.trim(),stringStyle.trim())){			
			index = i;
			break;
		}		
	}
	return index;
}

function checkColorAdded(controlColorCategoria, color){
	var existeix = false;
	for(var i=0; i<controlColorCategoria.length && !existeix;i++){	
		if (controlColorCategoria[i].r == color.r &&
				controlColorCategoria[i].g == color.g &&
				controlColorCategoria[i].b == color.b) existeix = true;
	}
	return existeix;
}

function addHtmlModalLegend(){
	
	jQuery('#mapa_modals').append(
	'<!-- Modal Llegenda -->'+
	'		<div id="dialog_llegenda" class="modal fade">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 lang="ca" class="modal-title">Llegenda</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button lang="ca" type="button" class="btn btn-default"'+
	'						data-dismiss="modal">Cancel·lar</button>'+
	'					<button lang="ca" type="button" class="btn btn-primary">Preview</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- Fi Modal Llegenda -->'		
	);
}

/*************** FI:LLEGENDA ********************/

/*addLegend que estava a geocat.mapa
function addLegend(){
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend visor-legend');
	    	div.id = "mapLegend";
	    
	    jQuery.each(mapLegend, function(i, row){
	    	console.debug(row);
	    	for (var i = 0; i < row.length; i++) {
	    		console.debug(row[i]);
	    		if(row[i].chck){
	    			div.innerHTML +='<div class="visor-legend-row">'+
						    			'<div class="visor-legend-symbol col-md-6">'+row[i].symbol+'</div>'+
						    			'<div class="visor-legend-name col-md-6">'+row[i].name+'</div>'+
	    							'</div>'+
	    							'<div class="visor-separate-legend-row"></div>';
	    		}
	    	}
	    });
	    return div;
	};
	legend.addTo(map);	
}*/