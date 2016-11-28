/*************** LLEGENDA ********************/

function addLegend(){
	legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'info legend visor-legend mCustomScrollbar');
	    div.id = "mapLegend";
	    jQuery.each(mapLegend, function(i, row){
	    	for (var i = 0; i < row.length; i++) {
	    		if(row[i].chck){
	    			//console.debug(row[i]);
	    			if (row[i].symbol.indexOf("circle")>-1){
	    				var padding_left="0px";
	    				var midaStr = row[i].symbol.substring(row[i].symbol.indexOf("r="),row[i].symbol.indexOf("style"));
	    				midaStr=midaStr.substring(midaStr.indexOf("=")+2,midaStr.length-2);
	    				var mida=parseFloat(midaStr);
	    				if (mida>0 && mida<=6) padding_left="15px";
	    				else if (mida>6 && mida<=14) padding_left="10px";
	    				else if (mida>14 && mida<=22) padding_left="5px";
	    				div.innerHTML +='<div class="visor-legend-row">'+
		    				'<div class="visor-legend-symbol col-md-4 col-xs-4" style="padding-left:'+padding_left+'">'+row[i].symbol+'</div>'+
		    				'<div class="visor-legend-name col-md-8 col-xs-8" style="float:right;width:40%">'+row[i].name+'</div>'+
		    				'</div>'+
		    				'<div class="visor-separate-legend-row"></div>';	
	    			}
	    			else{
	    			div.innerHTML +='<div class="visor-legend-row">'+
						'<div class="visor-legend-symbol col-md-4 col-xs-4">'+row[i].symbol+'</div>'+
						'<div class="visor-legend-name col-md-8 col-xs-8" style="float:right;">'+row[i].name+'</div>'+
	    				'</div>'+
	    				'<div class="visor-separate-legend-row"></div>';	    			
	    			}	    			
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
		btllista.innerHTML = '<span class="fa fa-list-alt greenfort"></span>';
		return this._div;
	};
	ctr_legend.addTo(map);	
	legend.addTo(map);
}

/*Control llegenda buida o be, q hagi publicat el mapa amb llegenda, 
pero cap opcio de la llegenda marcada*/
function checkEmptyMapLegend(){
	var trobat = false;
	if(typeof mapLegend == "string" ) mapLegend = [mapLegend]
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
	var html = '<span lang="ca" id="llegenda-title-text"  style="width:20%;font-size: 18px;">'+window.lang.translate('Llegenda')+'</span><span>&nbsp;&nbsp;&nbsp;&nbsp;'+window.lang.translate('Marca els símbols que vols que es visualitzin')+'</span>';
	html += '<div class="separate-legend-row-all"></div>';
	html += '<div class="legend-row">'+
				'<div class="legend-subrow-all">'+
				'<input id="legend-chck-all" class="col-md-1 legend-chck" type="checkbox">'+
				'<div class="col-md-11 legend-name-all">'+
					window.lang.translate('Tots')+
				'</div>'+
			'</div>';
	var count = 0;
	var layersHtml = {order:[], notorder:[]};
	html += '<div class="sortable">';
	
	
	
	jQuery.each(controlCapes._layers, function(i, item){
		controlLegendPoint = [];
		controlLegendMarker = [];
		controlLegendLine = [];
		controlLegendPol = [];
		//console.debug(item);
		layersHtml = addLayerToLegend(item.layer, count,layersHtml);
		count++;
		jQuery.each(item._layers, function(i, sublayer){
			if (sublayer._layers!=undefined && sublayer._layer.length>0){
				jQuery.each(sublayer._layers, function(i, sublayer2){
					layersHtml = addLayerToLegend(sublayer2.layer, count, layersHtml, sublayer2.layerIdParent );
					count++;
				});
			}
			else {
				layersHtml = addLayerToLegend(sublayer.layer, count, layersHtml, sublayer.layerIdParent );
				count++;
			}
		});
	});
	
	jQuery.each(layersHtml.order, function(i, item){
		if(isValidValue(item)){
			html += item;
		}
	});
	jQuery.each(layersHtml.notorder, function(i, item){
		if(isValidValue(item)){
			html += item;
		}
	});
	html += '</div>';
	$('#dialgo_publicar .modal-body .modal-legend').html(html);
	$('#dialgo_publicar .modal-body .modal-legend').show();
	$('.legend-subrow input, .legend-subrow-all input').iCheck({
	    checkboxClass: 'icheckbox_flat-blue',
	    radioClass: 'iradio_flat-blue'
	});	
		
	
	$('.legend-subrow-all input').on('ifChecked', function(event){
		  $('.legend-subrow input').iCheck('check');
	});
	
	$('.legend-subrow-all input').on('ifUnchecked', function(event){
		  $('.legend-subrow input').iCheck('uncheck');
	});	
	
	$('.sortable').sortable();
	
	return html;
}



function generallegendaMapaEdicio(){
		
	var arbreHTML=createModalConfigLegend();	
	var mapLegendTMP = {};
		
	$(arbreHTML).find(".legend-subrow").each(function(index,element){
	
	var businessId = $(element).attr('data-businessId');
		var html=$(element).children(".legend-symbol").html();
		if(html.indexOf('GetLegendGraphic')!= -1){
			html=html.replace(/width:26px;/g,'');
			html=html.replace('png8','png');
		}
		var obj = {
			chck : true,
			symbol : html,
			name : $(element).children(".legend-name").children("input").val(),
			order: index
		};
		if(!mapLegendTMP[businessId]){
			mapLegendTMP[businessId] = [];
		}
		mapLegendTMP[businessId].push(obj);
	
	});
	
	/*
	$.each(arbreHTML.order,function(index,element){
		
	});
*/
			
	return mapLegendTMP;

}	


function obteLListatCapesEditor(idLayer){	
	var layerType={};

		jQuery.each(controlCapes._layers, function(i, item){
				if(item.layer.options.businessId==idLayer){					
					layerType.serverName=item.layer.options.nom.replace('##1','');
					layerType.capesOrdre=""+i+"";					
				}	
				
		jQuery.each(item._layers, function(j, item2){
				if(item2.layer.options.businessId==idLayer){					
					layerType.serverName=item2.layer.options.nom.replace('##1','');
					layerType.capesOrdre="sublayer";					
				}			
			});		
			
		});
		return layerType;		
}	





function addLayerToLegend(layer, count, layersHtml, layerIdParent){
	var html = "";
	html += '<div class="legend-row">';
	html+='<div class="separate-legend-row"></div>';
	var layerName = layer.options.nom;
	
	
	var checked = "";
	if(undefined != mapLegend[layer.options.businessId]){
		layerName = mapLegend[layer.options.businessId][0].name;
		if(mapLegend[layer.options.businessId][0].chck) checked = 'checked="checked"';
	}
	if (layerIdParent!=undefined){
		 layerName = layer.options.nom;
	}
	html += '<div class="legend-row" style="padding-left:15px">'+layerName+'</div>'; 
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
	//WMS
	}else if(layer.options.tipus == t_wms){
		
		try{
		var legend_layer = layer.getLegendGraphic();
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
		html += '<div class="col-md-2 legend-symbol">';
			if(!jQuery.isArray(legend_layer)){
				html += '<img src="'+layer.getLegendGraphic()+'" class="btn-paleta img-legend" style="width:26px;max-width:150px !important"/>';
			}else{
				jQuery.each(legend_layer, function(i, lay){
					html += '<img src="'+lay+'" class="btn-paleta img-legend" style="width:26px;max-width:150px !important"/>';
				});
			}
		html +=	'</div>'+
			'<div class="col-md-9 legend-name">'+
				'<input type="text" class="form-control my-border" value="'+layerName+'">'+
			'</div>';		
		html+='</div>';	
		
		}catch(exception){
            
        }

	//Dades obertes y JSON
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
				if (layer.options.tem == tem_size) mida = estil_do.iconSize;
				size = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';
			}
			var icon = "";
			var colorIcon=""; 
			var auxColor="";
			if(estil_do.divColor){
				auxColor = hexToRgb(estil_do.divColor);
				colorIcon = 'color: rgb('+auxColor.r+', '+auxColor.g+', '+auxColor.b+');';
			} 
			if(estil_do.fillColor){
				auxColor = hexToRgb(estil_do.fillColor);
			} 
			if(estil_do.icon){
				icon = "fa fa-"+estil_do.icon;
			}
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
			if (layer.options.tem != tem_size){
			html +=	'<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-punt_r '+icon+' legend-symbol" '+
							'style="background-color: rgb('+auxColor.r+', '+auxColor.g+', '+auxColor.b+'); '+
							' '+size+'">'+
						'</div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';
			}else{
				if(mida>=60) mida=60;
				var height=mida*2.8;
				var padding_left="0px";
				if (mida>0 && mida<=6) padding_left="28px";
				else if (mida>6 && mida<=14) padding_left="22px";
				else if (mida>14 && mida<=22) padding_left="16px";
				else if (mida>22 && mida<=34) padding_left="10px";
				else if (mida>34 && mida<=40) padding_left="5px";

				var color = hexToRgb(estil_do.fillColor);
				html +=	'<div class="col-md-2 legend-symbol" style="padding-left:'+padding_left+'">'+
						'<svg height="'+height+'">'+
							'<circle cx="'+mida+'" cy="'+mida+'" r="'+mida+'" '+
							'style="stroke:white; fill:rgb('+color.r+', '+color.g+', '+color.b+');"></circle>'+
							'</svg>';
						'</div>'+
						'<div class="col-md-9 legend-name" style="padding-left:45px">'+
							'<input type="text" class="form-control my-border" value="'+layerName+'">'+
						'</div>';
			}
			html+='</div>';
		}else{
			var color = hexToRgb(estil_do.iconColor);
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
		}
	//URL FILE
	}else if(layer.options.tipus == t_url_file){
		var type = "";
		var geometrytype = "";
		jQuery.each(layer._layers, function(i, lay){
			geometrytype = lay.feature.geometry.type.toLowerCase(); 
			return (geometrytype=="");
		});		
		geometrytype = transformTipusGeometry(geometrytype);
		
		if(layer.options.tem && (layer.options.tem == tem_clasic || layer.options.tem == tem_size)){
			var i = 0;
			var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
			var estils = layer.options.estil_do.estils;
			var label = layer.options.estil_do.dataField;
			if(geometrytype == t_marker){
					var map={};
					jQuery.each(layer._layers, function(i, lay){
						if (layer.options.tem=='sizeTematic'){
							var radius=lay.options.radius;
							if (radius!=undefined){
								if (map[radius]==undefined) map[radius]=1;
								else {
									var i=map[radius];
									map[radius]=i+1;
								}
							}
						}
						else{
							var color = lay.options.fillColor;
							if (color!=undefined){
								if (map[color]==undefined) map[color]=1;
								else {
									var i=map[color];
									map[color]=i+1;
								}
							}
						}
					});
					jQuery.each(estils, function(i, estilRang){
						
						var mida = getMidaFromRadius(estilRang.estil.simbolSize);
						if (layer.options.tem == tem_size) mida = estilRang.estil.simbolSize; 
						var iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';						
						var color = hexToRgb(estilRang.estil.color);
						if(mida>=60) mida=60;
						var height=mida*2.8;
						var padding_left="0px";
						if (mida>0 && mida<=6) padding_left="28px";
						else if (mida>6 && mida<=14) padding_left="22px";
						else if (mida>14 && mida<=22) padding_left="16px";
						else if (mida>22 && mida<=34) padding_left="10px";
						else if (mida>34 && mida<=40) padding_left="5px";
						
						
						
						var stringStyle =	'<svg height="'+height+'">'+
											'<circle cx="'+mida+'" cy="'+mida+'" r="'+mida+'" '+
												'style="stroke:white; fill:rgb('+color.r+', '+color.g+', '+color.b+');"></circle>'+
											'</svg>';
						if (layer.options.tem!=tem_size){
							stringStyle ='<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
											'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
											' '+iconSize+'">'+
										'</div>';
						}
						
						var labelNomCategoria = "";
						checked = "";
						var index=-1;
						if (undefined!=mapLegend[layer.options.businessId]) {
							index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						}
						
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							labelNomCategoria = mapLegend[layer.options.businessId][index].name;
							if(mapLegend!=undefined && mapLegend[layer.options.businessId]!=undefined && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}else{
							if(estilRang.valueMax == estilRang.valueMin){
								labelNomCategoria = estilRang.valueMax;
							}else{
								labelNomCategoria = estilRang.valueMin +" - "+ estilRang.valueMax;
							}
							
							if(labelNomCategoria == "Altres"){
								labelNomCategoria = window.lang.translate("Altres");
							}
							
						}						
						if (layer.options.tem=='sizeTematic'){
							if (labelNomCategoria.indexOf('('+map[estilRang.estil.simbolSize]+')')==-1){
								labelNomCategoria = labelNomCategoria+' ('+map[estilRang.estil.simbolSize]+')';
							}
							
						}
						else{
							if (labelNomCategoria.indexOf('('+map[estilRang.estil.color]+')')==-1){
								labelNomCategoria = labelNomCategoria+' ('+map[estilRang.estil.color]+')';
							}
							
						}
						
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
						if (layer.options.tem == tem_size){
							html +=	'<div class="col-md-2 legend-symbol" style="padding-left:'+padding_left+'">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name" style="padding-left:45px">'+
										'<input type="text" class="form-control my-border" value="'+labelNomCategoria+ '">'+
									'</div>';
						}
						else{
							html +=	'<div class="col-md-2 legend-symbol">'+
											stringStyle+
										'</div>'+
										'<div class="col-md-9 legend-name">'+
											'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
										'</div>';
						}
						html+='</div>';	
						
					});

				}else if(geometrytype == t_polyline){
					var map={};
					jQuery.each(layer._layers, function(i, lay){
						var color = lay.options.color;
						if (color!=undefined){
							if (map[color]==undefined) map[color]=1;
							else {
								var i=map[color];
								map[color]=i+1;
							}
						}
					});
					jQuery.each(estils, function(i, estilRang){
						
						var color = hexToRgb(estilRang.estil.color);
						var lineWidth = estilRang.estil.lineWidth;
						var stringStyle =	'<svg height="20" width="20">'+
												'<line x1="0" y1="20" x2="20" y2="0" '+
													'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
											'</svg>';	
						
						var labelNomCategoria = "";
						checked = "";
						
						var index=-1;
						if (undefined!=mapLegend[layer.options.businessId]) {
							index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						}
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							labelNomCategoria = mapLegend[layer.options.businessId][index].name;
							if(mapLegend!=undefined && mapLegend[layer.options.businessId]!=undefined && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}else{
							if(estilRang.valueMax == estilRang.valueMin){
								labelNomCategoria = estilRang.valueMax;
							}else{
								labelNomCategoria = estilRang.valueMin +" - "+ estilRang.valueMax;
							}
							
							if(labelNomCategoria == "Altres"){
								labelNomCategoria = window.lang.translate("Altres");
							}
						}						
						
						if (labelNomCategoria.indexOf("("+map[estilRang.estil.color]+")")==-1){
							labelNomCategoria = labelNomCategoria+ " ("+map[estilRang.estil.color]+")";
						}
						
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
						html +=	'<div class="col-md-2 legend-symbol">'+
											stringStyle+
										'</div>'+
										'<div class="col-md-9 legend-name">'+
											'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
										'</div>';				
						html+='</div>';	
					});					
				}else if(geometrytype == t_polygon){
					var map={};
					jQuery.each(layer._layers, function(i, lay){
						if (lay.options!=undefined){
							if (lay.options.fillColor!=undefined) {
								var color = lay.options.fillColor;
								if (color!=undefined){
									if (map[color]==undefined) map[color]=1;
									else {
										var i=map[color];
										map[color]=i+1;
									}
								}
							}				
						}
						else {
							if (lay.getLayers()[0].options!=undefined){
								if (lay.getLayers()[0].options.fillColor!=undefined) {
									var color = lay.getLayers()[0].options.fillColor;
									if (color!=undefined){
										if (map[color]==undefined) map[color]=1;
										else {
											var i=map[color];
											map[color]=i+1;
										}
									}
								}				
							}
						}
					});
					jQuery.each(estils, function(i, estilRang){
				
						var color = "";
						if (estilRang.estil.color) color=hexToRgb(estilRang.estil.color);
						else color=hexToRgb(estilRang.estil.borderColor);
						var borderColor = hexToRgb(estilRang.estil.borderColor);
						var opacity = estilRang.estil.opacity/100;
						var borderWidth = estilRang.estil.borderWidth;		
						if (borderWidth==0) borderWidth=1;
						var stringStyle =	'<svg height="30" width="30">'+
												'<polygon points="5 5, 5 25, 25 25, 25 5" stroke-linejoin="round" '+
													'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
											'</svg>';						
						
						
						var labelNomCategoria = "";
						checked = "";
						
						var index=-1;
						if (undefined!=mapLegend[layer.options.businessId]) {
							index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						}
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							labelNomCategoria = mapLegend[layer.options.businessId][index].name;
							if(mapLegend!=undefined && mapLegend[layer.options.businessId]!=undefined && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}else{
							if(estilRang.valueMax == estilRang.valueMin){
								labelNomCategoria = estilRang.valueMax;
							}else{
								labelNomCategoria = estilRang.valueMin +" - "+ estilRang.valueMax;
							}
							
							if(labelNomCategoria == "Altres"){
								labelNomCategoria = window.lang.translate("Altres");
							}
						}						
						if (labelNomCategoria.indexOf("("+map[estilRang.estil.color]+")")==-1){
							labelNomCategoria = labelNomCategoria+ " ("+map[estilRang.estil.color]+")";
						}
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
						html +=	'<div class="col-md-2 legend-symbol">'+
											stringStyle+
										'</div>'+
										'<div class="col-md-9 legend-name">'+
											'<input type="text" class="form-control my-border" value="'+labelNomCategoria+ '">'+
										'</div>';				
						html+='</div>';	
						
					});						
					
				}
			 
		 }else{
			 	var estil_do = layer.options.estil_do;
			 	if (layer.options.dinamic) estil_do = layer.options.style;
			
				if(geometrytype == t_marker){
					var mida = getMidaFromRadius(estil_do.radius);
					if (layer.options.tem == tem_size) mida = estil_do.simbolSize;
					size = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';			
					var color = hexToRgb(estil_do.fillColor);
					
					if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
						layerName=layerName+' ('+layer.getLayers().length+')';
					}
					
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
					
				}else if(geometrytype == t_polygon){
					var color = "";
					if (estil_do.fillColor) color=hexToRgb(estil_do.fillColor);
					else color=hexToRgb(estil_do.color);
					var borderColor = hexToRgb(estil_do.color);
					var opacity = estil_do.fillOpacity;
					var borderWidth = estil_do.weight;		
					if (borderWidth==0) borderWidth=1;
					var polStyle =	'<svg height="30" width="30">'+
											'<polygon points="5 5, 5 25, 25 25, 25 5" '+
												'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
										'</svg>';
					
					if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
						layerName=layerName+' ('+layer.getLayers().length+')';
					}
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';					
					html += '<div class="col-md-2 legend-symbol">'+
								polStyle+
							'</div>'+
							'<div class="col-md-9 legend-name">'+
								'<input type="text" class="form-control my-border" value="'+layerName+'">'+
							'</div>';					
					
					html+='</div>';			
					
				}else if(geometrytype == t_polyline){
					var color;
					if (layer.options.dinamic) color = hexToRgb(estil_do.color);
					else color = hexToRgb(estil_do.fillColor);
					var lineWidth = estil_do.weight;
					var lineStyle =	'<svg height="20" width="20">'+
											'<line  x1="0" y1="20" x2="20" y2="0" '+ 
												'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
										'</svg>';	
					
					if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
						layerName=layerName+' ('+layer.getLayers().length+')';
					}
					
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
	
	//VISUALITZACIO
	}else if(layer.options.tipus == t_visualitzacio){
		var rangs = getRangsFromLayerLegend(layer);
		var size = rangs.length;
		//Classic tematic
		if(layer.options.tipusRang && layer.options.tipusRang==tem_clasic){
			var geometryType = transformTipusGeometry(layer.options.geometryType);
			var i = 0;
			var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
			
			var estilsRangs = layer.options.estilsRangs;
			var rangsEstilsLegend = layer.options.rangsEstilsLegend;
			var arrRangsEstilsLegend = sortObject(rangsEstilsLegend);
			if(!layer.options.hasOwnProperty("trafficLightKey"))
				arrRangsEstilsLegend.sort(sortByValueMax);
			else
			{

				//Si és un semafòric no reordenem els valors de la llegenda, ja ens venen ben assignats i el sortByValueMax se'l carrega

			}
			if(geometryType == t_marker){
				
				jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
					var indexEstil = 0;
					while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
						indexEstil++;
					}
					var mida = getMidaFromRadius(layer.options.estil[indexEstil].simbolSize);
					if (layer.options.tem == tem_size) mida = layer.options.estil[indexEstil].simbolSize;
					var iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';						
					var color = hexToRgb(layer.options.estil[indexEstil].color);
					var stringStyle ='<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
										'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
										' '+iconSize+'">'+
									'</div>';
					
					var labelNomCategoria = "";
					checked = "";						
					
					var index=-1;
					if (undefined!=mapLegend[layer.options.businessId]) {
						index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
					}
					labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);					
					if(mapLegend!=undefined && mapLegend[layer.options.businessId]!=undefined && 
						-1!=index && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
					html +=	'<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+labelNomCategoria +'">'+
									'</div>';				
					html+='</div>';	
				});
			}else if(geometryType == t_polyline){
				
				jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
					var indexEstil = 0;
					while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
						indexEstil++;
					}
					
					var color = hexToRgb(layer.options.estil[indexEstil].color);
					var lineWidth = layer.options.estil[indexEstil].lineWidth;
					var stringStyle =	'<svg height="20" width="20">'+
											'<line x1="0" y1="20" x2="20" y2="0" '+
												'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
										'</svg>';	
					
					var labelNomCategoria = "";
					checked = "";						
					
					var index=-1;
					if (undefined!=mapLegend[layer.options.businessId]) {
						index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
					}
					
					labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);	
					if(mapLegend!=undefined && mapLegend[layer.options.businessId]!=undefined && 
						-1!=index && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
					html +=	'<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
									'</div>';				
					html+='</div>';	
				});				
				
			}else{
				
				jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
					var indexEstil = 0;
					while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
						indexEstil++;
					}
					var color = "";
					if (layer.options.estil[indexEstil].color) color=hexToRgb(layer.options.estil[indexEstil].color);
					else color = hexToRgb(layer.options.estil[indexEstil].borderColor);
					var borderColor = hexToRgb(layer.options.estil[indexEstil].borderColor);
					
					var opacity = layer.options.estil[indexEstil].opacity/100;
					var borderWidth = layer.options.estil[indexEstil].borderWidth;			
					if (borderWidth==0) borderWidth=1;
					var stringStyle =	'<svg height="30" width="30">'+
					
											'<polygon points="5 5, 5 25, 25 25, 25 5" stroke-linejoin="round" '+
												'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
										'</svg>';	
					
					var labelNomCategoria = "";
					checked = "";						
					
					var index=-1;
					if (undefined!=mapLegend[layer.options.businessId]) {
						index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
					}
					
					labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);	
					if(mapLegend!=undefined && mapLegend[layer.options.businessId]!=undefined && 
						-1!=index && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
					html +=	'<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
									'</div>';				
					html+='</div>';	
				});					
				
			}

		}else if(layer.options.tipusRang && layer.options.tipusRang==tem_size){
			
			var geometryType = transformTipusGeometry(layer.options.geometryType);
			var i = 0;
			var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
			
			var estilsRangs = layer.options.estilsRangs;
			var rangsEstilsLegend = layer.options.rangsEstilsLegend;
			
			var arrRangsEstilsLegend = sortObject(rangsEstilsLegend);
			arrRangsEstilsLegend.sort(sortByValueMax);
			
			if(geometryType == t_marker){

				jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
					var indexEstil = 0;
					while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
						indexEstil++;
					}
					var mida = getMidaFromRadius(layer.options.estil[indexEstil].simbolSize);
					if (layer.options.tipusRang == tem_size) mida =layer.options.estil[indexEstil].simbolSize;
					var color = hexToRgb(layer.options.estil[indexEstil].color);
					if (mida>60) mida=60;
					var height=mida*2.8;
					var padding_left="0px";
					if (mida>0 && mida<=6) padding_left="28px";
					else if (mida>6 && mida<=14) padding_left="22px";
					else if (mida>14 && mida<=22) padding_left="16px";
					else if (mida>22 && mida<=34) padding_left="10px";
					else if (mida>34 && mida<=40) padding_left="5px";
					 
					
					
					var stringStyle =	'<svg height="'+height+'">'+
										'<circle cx="'+mida+'" cy="'+mida+'" r="'+mida+'" '+
											'style="stroke:white; fill:rgb('+color.r+', '+color.g+', '+color.b+');"></circle>'+
										'</svg>';
					
					var labelNomCategoria = "";
					checked = "";						
					
					var index=-1;
					if (undefined!=mapLegend[layer.options.businessId]) {
						index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
					}
					labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);	
					var map={};
					jQuery.each(layer._layers, function(i, lay){
							var radius=lay.options.radius;
							if (radius!=undefined){
								if (map[radius]==undefined) map[radius]=1;
								else {
									var i=map[radius];
									map[radius]=i+1;
								}
							}
					});
					if (map[layer.options.estil[indexEstil].simbolSize]!=undefined && labelNomCategoria.indexOf('('+map[layer.options.estil[indexEstil].simbolSize]+')')==-1){
						labelNomCategoria = labelNomCategoria +' ('+map[layer.options.estil[indexEstil].simbolSize]+')';
					}
					if(undefined!=mapLegend[layer.options.businessId] && mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
					html +=	'<div class="col-md-2 legend-symbol" style="padding-left:'+padding_left+'">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name" style="padding-left:45px">'+
										'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
									'</div>';				
					html+='</div>';	
				});
			}
		}
		else{
			
			//Si es simpleTematic, amb el primer element de rang ja tenim prou, no ens cal recorrer tots el rangs 
			//pq seran tots iguals
			if(layer.options.tipusRang && layer.options.tipusRang==tem_simple){
				if(size > 0) size = 1;//Control rangs no buit
			}
			
			var geometryType = transformTipusGeometry(layer.options.geometryType);
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
							if (layer.options.tem == tem_size) mida = rangs[i].simbolSize;
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
							var index=-1;
							if (undefined!=mapLegend[layer.options.businessId]) {
								index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
							}
							if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
								layerName = mapLegend[layer.options.businessId][index].name;
								if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
							}		
							
							if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
								layerName=layerName+' ('+layer.getLayers().length+')';
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
							var index=-1;
							if (undefined!=mapLegend[layer.options.businessId]) {
								index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
							}
							if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
								layerName = mapLegend[layer.options.businessId][index].name;
								if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
							}		
							
							if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
								layerName=layerName+' ('+layer.getLayers().length+')';
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
				}				
			}else if(geometryType == t_polyline){
				
				for(var i=0;i<size;i++){
					
					var color = hexToRgb(rangs[i].color);
					var lineWidth = rangs[i].lineWidth;
	
					var obj = {color: color, lineWidth: lineWidth};
					var existeix = checkLineStyle(obj);
					
					if(!existeix){
						controlLegendLine.push(obj);
						
						var stringStyle =	'<svg height="20" width="20">'+
												'<line x1="0" y1="20" x2="20" y2="0" '+
													'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
											'</svg>';
						//Reinicialitzem
						layerName = layer.options.nom;
						checked = "";						
						var index=-1;
						if (undefined!=mapLegend[layer.options.businessId]) {
							index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						}
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							layerName = mapLegend[layer.options.businessId][index].name;
							if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}					
						if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
							layerName=layerName+' ('+layer.getLayers().length+')';
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
				
					var color = "";
					if (rangs[i].color) color=hexToRgb(rangs[i].color);
					else color=hexToRgb(rangs[i].borderColor);
					var borderColor = hexToRgb(rangs[i].borderColor);
					var opacity = rangs[i].opacity/100;
					var borderWidth = rangs[i].borderWidth;
					if (borderWidth==0) borderWidth=1;
					var obj = {color: color, borderColor: borderColor, opacity:opacity, borderWidth:borderWidth};
					var existeix = checkPolStyle(obj);					
					
					if(!existeix){
						controlLegendPol.push(obj);					
					
						var stringStyle =	'<svg height="30" width="30">'+
												'<polygon points="5 5, 5 25, 25 25, 25 5" '+
													'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
											'</svg>';
						
						//Reinicialitzem
						layerName = layer.options.nom;
						checked = "";						
						var index=-1;
						if (undefined!=mapLegend[layer.options.businessId]) {
							index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						}
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							layerName = mapLegend[layer.options.businessId][index].name;
							if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}						
						if (layerName.indexOf('('+layer.getLayers().length+')')==-1){
							layerName=layerName+' ('+layer.getLayers().length+')';
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
					}
					
				}
			}
		}		
	//TEMATIC
	}

	html+='</div>';
	if(undefined!=mapLegend[layer.options.businessId]){
		if (mapLegend[layer.options.businessId][0].order >= 0){
			layersHtml.order[mapLegend[layer.options.businessId][0].order] = html;
		}else{
			layersHtml.notorder.push(html);
		}
	}else{
		layersHtml.notorder.push(html);
	}
	
	
	return layersHtml;
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
		if(val.options.tipus && val.options.tipus.indexOf(t_multipolygon)!= -1){
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



function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    return arr;
}

function updateMapLegendData(){
	mapLegend = {};
	$(".legend-subrow").each(function(index,element){
		var businessId = $(element).attr('data-businessId');
		var html=$(element).children(".legend-symbol").html();
		if(html.indexOf('GetLegendGraphic')!= -1){
			html=html.replace(/width:26px;/g,'');
			html=html.replace('png8','png');
		}
		var obj = {
			chck : $(element).children(".icheckbox_flat-blue").hasClass("checked"),
			symbol : html,
			name : $(element).children(".legend-name").children("input").val(),
			order: index
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


/**** LLEGENDA TEMATICA MODE EDICIO ****/

function addLegendEdicio(){
	
	
	
	
	try{

			ctr_legend = L.control.legend({
				title: window.lang.translate('Llegenda'),
				tipusllegenda: "dinamica",  //"dinamica"
				llegendaOpt: true      //true
			});
			ctr_legend.addTo(map);
	
	}catch(Err){
		

	
		
	
	}	
	
	
	/*
	legend = L.control({position: 'bottomright'});
	legend.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'info legend visor-legend mCustomScrollbar');
	    div.id = "mapLegendEdicio";
	    return div;
	};
	ctr_legend = L.control({
		position : 'bottomright'
	});
	ctr_legend.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'div_barrabotons btn-group-vertical');
		var btllista = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_legend');
		this._div.appendChild(btllista);
		btllista.innerHTML = '<span class="fa fa-list-alt greenfort"></span>';
		return this._div;
	};
	ctr_legend.addTo(map);	
	legend.addTo(map);
	$("#mapLegendEdicio").mCustomScrollbar();
	$(".bt_legend").hide();
	activaLlegenda(false);
	
*/	
}

function emptyMapLegendEdicio(layer,isOrigen){
	if($("#mapLegendEdicio").data("businessid") == layer.options.businessId ){
		$("#mapLegendEdicio").html("");
		activaLlegenda(false);
		$(".bt_legend").hide();
	}
	else if (isOrigen){
		$("#mapLegendEdicio").html("");
		activaLlegenda(false);
		$(".bt_legend").hide();
	}
}

function loadMapLegendEdicio(layer){
		
	//Eliminem de la lleganda tematització anterior
	$("#mapLegendEdicio").html("");
	$("#mapLegendEdicio").data("businessid",layer.options.businessId);
	
	var html="";
	if(layer.options.tipus == t_wms){
		html = '<div class="titol-legend col-md-12 col-xs-12">'+layer.options.nom+'</div><div class="titol-separate-legend-row"></div>';
	}
	else{
		html = '<div class="titol-legend col-md-12 col-xs-12">'+layer.options.nom+' ('+layer.getLayers().length+')</div><div class="titol-separate-legend-row"></div>';
			
	}
	var geometryType = transformTipusGeometry(layer.options.geometryType);
	var i = 0;
//	var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
	if(layer.options.tipus == t_wms){	
		var legend_layer = layer.getLegendGraphic();
		html += '<div class="visor-legend-row ">';
		
		if(!jQuery.isArray(legend_layer)){
			html += '<img src="'+layer.getLegendGraphic()+'" class="btn-paleta img-legend"/>';
		}else{
			jQuery.each(legend_layer, function(i, lay){
				html += '<img src="'+lay+'" class="btn-paleta img-legend"/>';
			});
		}
		html+='</div><div class="visor-separate-legend-row"></div>';
	}
	else{
	var estilsRangs = layer.options.estilsRangs;
	var rangsEstilsLegend = layer.options.rangsEstilsLegend;
//	rangsEstilsLegend.sort(sortByValorMax);
	
	var arrRangsEstilsLegend = sortObject(rangsEstilsLegend);
	arrRangsEstilsLegend.sort(sortByValueMax);
	
	var totalLayers=0;
	
	if(geometryType == t_marker){

		jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
			var indexEstil = 0;
			while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
				indexEstil++;
				
			}
			totalLayers = totalLayers+layer.options.estil[indexEstil].geometria.features.length;
			//console.debug(layer.options.estil[indexEstil].geometria.features.length);
			var mida = getMidaFromRadius(layer.options.estil[indexEstil].simbolSize);
			if (layer.options.tipusRang == tem_size) mida = layer.options.estil[indexEstil].simbolSize;
			var iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';						
			var color = hexToRgb(layer.options.estil[indexEstil].color);
			if(mida>=60) mida=60;
			var height=mida*2.8;
			var padding_left="0px";
			if (mida>0 && mida<=6) padding_left="15px";
			else if (mida>6 && mida<=14) padding_left="10px";
			else if (mida>14 && mida<=22) padding_left="5px";
			
			
			
			var stringStyle =	'<svg height="'+height+'">'+
								'<circle cx="'+mida+'" cy="'+mida+'" r="'+mida+'" '+
									'style="stroke:white; fill:rgb('+color.r+', '+color.g+', '+color.b+');"></circle>'+
								'</svg>';
			if (layer.options.tipusRang!=tem_size){
				stringStyle ='<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
								'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
								' '+iconSize+'">'+
							'</div>';
			}
			
			var labelNomCategoria = "";
//			checked = "";						
			var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
			labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);	
			
			html += '<div class="visor-legend-row ">';
			if (layer.options.tipusRang == tem_size){
				html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4" style="padding-left:'+padding_left+'">'+
						stringStyle+
						'</div>'+
						'<div class="visor-legend-name col-md-8 col-xs-8" style="float:right;width:40%">'+labelNomCategoria+'</div>';	
			}
			else{
						html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4">'+
								stringStyle+
							'</div>'+
							'<div class="visor-legend-name col-md-8 col-xs-8">'+labelNomCategoria+'</div>';				
			}
			html+='</div><div class="visor-separate-legend-row"></div>';	
		});
	}else if(geometryType == t_polyline){
		
		jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
			var indexEstil = 0;
			while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
				indexEstil++;
			}
			totalLayers = totalLayers+layer.options.estil[indexEstil].geometria.features.length;
			var color = hexToRgb(layer.options.estil[indexEstil].color);
			var lineWidth = layer.options.estil[indexEstil].lineWidth;
			var stringStyle =	'<svg height="20" width="20">'+
									'<line x1="0" y1="20" x2="20" y2="0" '+
										'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
								'</svg>';	
			
			var labelNomCategoria = "";
			checked = "";						
			
			var index=-1;
			if (undefined!=mapLegend[layer.options.businessId]) {
				index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
			}
			labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);	
			
			html += '<div class="visor-legend-row ">';
			html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4">'+
								stringStyle+
							'</div>'+
							'<div class="visor-legend-name col-md-8 col-xs-8">'+labelNomCategoria+'</div>';				
//			
			html+='</div><div class="visor-separate-legend-row"></div>';
		});				
		
	}else{
		
		jQuery.each(arrRangsEstilsLegend, function(i, estilRang){
			var indexEstil = 0;
			while(indexEstil<layer.options.estil.length && estilRang.key!=layer.options.estil[indexEstil].businessId){
				indexEstil++;
			}
			totalLayers = totalLayers+layer.options.estil[indexEstil].geometria.features.length;
			var color = "";
			if (layer.options.estil[indexEstil].color) color=hexToRgb(layer.options.estil[indexEstil].color);
			else color=hexToRgb(layer.options.estil[indexEstil].borderColor);
			var borderColor = hexToRgb(layer.options.estil[indexEstil].borderColor);
			var opacity = layer.options.estil[indexEstil].opacity/100;
			var borderWidth = layer.options.estil[indexEstil].borderWidth;		
			if (borderWidth==0) borderWidth=1;
			var stringStyle =	'<svg height="30" width="30">'+
									'<polygon points="5 5, 5 25, 25 25, 25 5" stroke-linejoin="round" '+
										'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
								'</svg>';	
			
			var labelNomCategoria = "";
			checked = "";						
			
			var index=-1;
			if (undefined!=mapLegend[layer.options.businessId]) {
				index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
			}
			labelNomCategoria = getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil);	
			
			html += '<div class="visor-legend-row ">';
			html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4">'+
								stringStyle+
							'</div>'+
							'<div class="visor-legend-name col-md-8 col-xs-8">'+labelNomCategoria+'</div>';				
//			
			html+='</div><div class="visor-separate-legend-row"></div>';
		});					
		
	}	}
	html= html.replace("totalLayers",totalLayers);
	$("#mapLegendEdicio").html(html);
	//Afegim de nou les classes i l'scroll
	$("#mapLegendEdicio").addClass("info");
	$("#mapLegendEdicio").addClass("legend");
	$("#mapLegendEdicio").addClass("visor-legend");
	$("#mapLegendEdicio").addClass("mCustomScrollbar");
	$("#mapLegendEdicio").mCustomScrollbar();
	
	$(".bt_legend").show();
	activaLlegenda(true);
	
}


function loadMapLegendEdicioDinamics(layer){
	
	//Eliminem de la lleganda tematització anterior
	$("#mapLegendEdicio").html("");
	$("#mapLegendEdicio").data("businessid",layer.options.businessId);
	
	var html = '<div class="titol-legend col-md-12 col-xs-12">'+layer.options.nom+' ('+layer.getLayers().length+')</div><div class="titol-separate-legend-row"></div>';
	
	var geometryType = transformTipusGeometry(layer.options.geometryType);

	var rangsEstilsLegend = layer.options.estil_do.estils;
	
		if(geometryType == t_marker){
			var map={};
			jQuery.each(layer._layers, function(i, lay){
				if (layer.options.tem=='sizeTematic'){
					var radius=lay.options.radius;
					if (radius!=undefined){
						if (map[radius]==undefined) map[radius]=1;
						else {
							var i=map[radius];
							map[radius]=i+1;
						}
					}
				}
				else{
					var color = lay.options.fillColor;
					if (color!=undefined){
						if (map[color]==undefined) map[color]=1;
						else {
							var i=map[color];
							map[color]=i+1;
						}
					}
				}
			});
		jQuery.each(rangsEstilsLegend, function(i, estilRang){
			var mida = getMidaFromRadius(estilRang.estil.simbolSize);
			if (layer.options.tem == tem_size) mida = estilRang.estil.simbolSize;
			var padding_left="0px";
			if (mida>0 && mida<=6) padding_left="15px";
			else if (mida>6 && mida<=14) padding_left="10px";
			else if (mida>14 && mida<=22) padding_left="5px";
			var color = hexToRgb(estilRang.estil.color);
			var height=mida*2.8;
			var iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';						
			
			var stringStyle =	'<svg height="'+height+'">'+
								'<circle cx="'+mida+'" cy="'+mida+'" r="'+mida+'" '+
									'style="stroke:white; fill:rgb('+color.r+', '+color.g+', '+color.b+');"></circle>'+
								'</svg>';	

			if (layer.options.tem != tem_size) {
				stringStyle ='<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
				'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
				' '+iconSize+'">'+
				'</div>';
			}	
			var labelNomCategoria = "";
//			checked = "";						
			
			if (estilRang.valueMax == estilRang.valueMin){
				labelNomCategoria = estilRang.valueMax;
			}
			else {
				labelNomCategoria = estilRang.valueMin+"-"+ estilRang.valueMax;
			}
			
			if (layer.options.tem=='sizeTematic'){
				if (labelNomCategoria.indexOf('('+map[estilRang.estil.simbolSize]+')')==-1){
					labelNomCategoria = labelNomCategoria+' ('+map[estilRang.estil.simbolSize]+')';
				}
			}
			else{
				if (labelNomCategoria.indexOf('('+map[estilRang.estil.color]+')')==-1){
					labelNomCategoria = labelNomCategoria+' ('+map[estilRang.estil.color]+')';
				}
			}
			
			html += '<div class="visor-legend-row ">';
			if (layer.options.tem == tem_size) {
				html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4" style="margin-top:4px;padding-left:'+padding_left+'">'+
						stringStyle+
						'</div>'+
						'<div class="visor-legend-name col-md-8 col-xs-8" style="padding-left:50px;">'+labelNomCategoria+'</div>';	
					}
			else {
				html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4">'+
								stringStyle+
							'</div>'+
							'<div class="visor-legend-name col-md-8 col-xs-8">'+labelNomCategoria+'</div>';
			}
//			
			html+='</div><div class="visor-separate-legend-row"></div>';	
			
		});
	}else if(geometryType == t_polyline){
		var map={};
		jQuery.each(layer._layers, function(i, lay){
			var color = lay.options.color;
			if (color!=undefined){
				if (map[color]==undefined) map[color]=1;
				else {
					var i=map[color];
					map[color]=i+1;
				}
			}
		});
		jQuery.each(rangsEstilsLegend, function(i, estilRang){
		
			
			var color = hexToRgb(estilRang.estil.color);
			var lineWidth = estilRang.estil.lineWidth;
			var stringStyle =	'<svg height="20" width="20">'+
									'<line x1="0" y1="20" x2="20" y2="0" '+
										'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
								'</svg>';	
			
			var labelNomCategoria = "";
								
			if (estilRang.valueMax == estilRang.valueMin){
				labelNomCategoria = estilRang.valueMax;
			}
			else {
				labelNomCategoria = estilRang.valueMin+"-"+ estilRang.valueMax;
			}	
			
			if (labelNomCategoria.indexOf('('+map[estilRang.estil.color]+')')==-1){
				labelNomCategoria = labelNomCategoria+' ('+map[estilRang.estil.color]+')';
			}
			
			html += '<div class="visor-legend-row ">';
			html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4">'+
								stringStyle+
							'</div>'+
							'<div class="visor-legend-name col-md-8 col-xs-8">'+labelNomCategoria+'</div>';			
//			
			html+='</div><div class="visor-separate-legend-row"></div>';
		});				
		
	}else{
		var map={};
		jQuery.each(layer._layers, function(i, lay){
			if (lay.options!=undefined){
				if (lay.options.fillColor!=undefined) {
					var color = lay.options.fillColor;
					if (color!=undefined){
						if (map[color]==undefined) map[color]=1;
						else {
							var i=map[color];
							map[color]=i+1;
						}
					}
				}				
			}
			else {
				if (lay.getLayers()[0].options!=undefined){
					if (lay.getLayers()[0].options.fillColor!=undefined) {
						var color = lay.getLayers()[0].options.fillColor;
						if (color!=undefined){
							if (map[color]==undefined) map[color]=1;
							else {
								var i=map[color];
								map[color]=i+1;
							}
						}
					}				
				}
			}
		});
		jQuery.each(rangsEstilsLegend, function(i, estilRang){
			
			
			var color = "";
			if (estilRang.estil.color) color=hexToRgb(estilRang.estil.color);
			else color=hexToRgb(estilRang.estil.borderColor);
			var borderColor = hexToRgb(estilRang.estil.borderColor);
			var opacity = estilRang.estil.opacity/100;
			var borderWidth = estilRang.estil.borderWidth;
			if (borderWidth==0) borderWidth=1;
			var stringStyle =	'<svg height="30" width="30">'+
									'<polygon points="5 5, 5 25, 25 25, 25 5" stroke-linejoin="round" '+
										'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
								'</svg>';	
			
			var labelNomCategoria = "";
			
			if (estilRang.valueMax == estilRang.valueMin){
				labelNomCategoria = estilRang.valueMax;
			}
			else {
				labelNomCategoria = estilRang.valueMin+"-"+ estilRang.valueMax;
			}	
			
			if (labelNomCategoria.indexOf('('+map[estilRang.estil.color]+')')==-1){
				labelNomCategoria = labelNomCategoria+' ('+map[estilRang.estil.color]+')';
			}
			
			html += '<div class="visor-legend-row ">';
			html +=	'<div class="visor-legend-symbol col-md-4 col-xs-4">'+
								stringStyle+
							'</div>'+
							'<div class="visor-legend-name col-md-8 col-xs-8">'+labelNomCategoria+'</div>';
//			
			html+='</div><div class="visor-separate-legend-row"></div>';
		});					
		
	}	
	
	$("#mapLegendEdicio").html(html);
	//Afegim de nou les classes i l'scroll
	$("#mapLegendEdicio").addClass("info");
	$("#mapLegendEdicio").addClass("legend");
	$("#mapLegendEdicio").addClass("visor-legend");
	$("#mapLegendEdicio").addClass("mCustomScrollbar");
	$("#mapLegendEdicio").mCustomScrollbar();
	
	$(".bt_legend").show();
	activaLlegenda(true);
	
}

function getLabelNomCategoria(layer,rangsEstilsLegend,index,indexEstil){
	var labelNomCategoria="";
	if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
		labelNomCategoria = mapLegend[layer.options.businessId][index].name;
		if (labelNomCategoria.indexOf(rangsEstilsLegend[""+layer.options.estil[indexEstil].businessId+""])==-1) {
			labelNomCategoria=rangsEstilsLegend[""+layer.options.estil[indexEstil].businessId+""];
		}
		if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
	}else{
		labelNomCategoria = rangsEstilsLegend[""+layer.options.estil[indexEstil].businessId+""];
		
		if(labelNomCategoria == "Altres"){
			labelNomCategoria = window.lang.translate("Altres");
		}
	}						
	
	if (labelNomCategoria.indexOf('('+layer.options.estil[indexEstil].geometria.features.length+')')==-1){
		labelNomCategoria = labelNomCategoria +' ('+layer.options.estil[indexEstil].geometria.features.length+')';
	}
	return labelNomCategoria;
	
}

/**** fi/LLEGENDA TEMATICA MODE EDICIO ****/


function activaLlegenda(obre) {
	var dfd = $.Deferred();
	var cl = jQuery('.bt_legend span').attr('class');
	var funcioObrir = (obre!=undefined ? obre : cl.indexOf('grisfort') != -1);
	if (funcioObrir) {
		jQuery('.bt_legend span').removeClass('grisfort');
		jQuery('.bt_legend span').addClass('greenfort');
		$(".bt_legend").transition({ x: '0px', y: '0px',easing: 'in', duration: 500 });
		$(".visor-legend").transition({ x: '0px', y: '0px',easing: 'in', opacity: 1,duration: 500 });
	} else {
		jQuery('.bt_legend span').removeClass('greenfort');
		jQuery('.bt_legend span').addClass('grisfort');
		var height = $(".visor-legend").height();
		var y1 = $(".visor-legend").height() - 20;
		var y2 = $(".visor-legend").height() +50;
		$(".bt_legend").transition({ x: '225px', y: y1+'px',duration: 500 });
		$(".visor-legend").transition({ x: '250px', y: y2+'px',  opacity: 0.1,duration: 500 });		
	}	
	dfd.resolve();
	return dfd.promise();
}