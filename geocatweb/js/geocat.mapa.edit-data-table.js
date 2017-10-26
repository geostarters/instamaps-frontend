//var per controlar si hi ha hagut edicio dels elements de la capa, i si cal fer refresh
var editat = false;
var geomBusinessId = '-1';
var geomRowIndex = 0;
var numRows = 0;
var dataFormatter = new DataFormatter();
var optionsF={};
var hiHaError = false;

function reloadSingleLayer(capaEdicio, layerServidor) {

	map.closePopup();
	map.removeLayer(capaEdicio.layer);
	controlCapes.removeLayer(capaEdicio);
	
	//Recarrego la capa origen
	loadVisualitzacioLayer(layerServidor).then(function(results){
		//recarrego les sublayers si les te
		jQuery.each(capaEdicio._layers, function(i, sublayer){
			
			if(jQuery.type(capaEdicio.layer.options)== "string"){
				capaEdicio.layer.options = $.parseJSON(capaEdicio.layer.options);
			}	            	  
			//Sublayer visualitzacio, carrego la capa
			if(sublayer.layer.options.tipus.indexOf(t_visualitzacio)!=-1){
		  		  sublayer.layer.serverName = sublayer.layer.options.nom;
		  		  sublayer.layer.serverType = sublayer.layer.options.tipus;
		  		  sublayer.layer.capesActiva = "true";
		  		  sublayer.layer.options.origen = capaEdicio.layer.options.businessId;//layer.properties.capaBusinessId;//BusinessIdCapaorigen
		  		  //tipusRang
		  		  sublayer.layer.businessId = sublayer.layer.options.businessId;//Si no, no ho trobarà després
		  		  sublayer.layer.options = JSON.stringify(sublayer.layer.options);
		  		  
		  		  //eliminem sublayer del mapa, i recarreguem
		  		  map.closePopup();
		  		  map.removeLayer(sublayer.layer);
		  		  
		  		  loadVisualitzacioLayer(sublayer.layer);
	  	  	}
		});	
	});		

}

function addFuncioEditDataTable(){
	
	addHtmlModalDataTable();
	addHtmlModalDeleteDataTableRow();
	
	$('#dialog_delete_row .btn-danger').on('click', function(event){
		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient = button.data('whatever');
		
    	var geometryid = $('#dialog_delete_row .btn-danger').data("geometryid");
    	var geometriesBusinessId = $('#dialog_delete_row .btn-danger').data("geometriesBusinessId");
    	var businessId = $('#dialog_delete_row .btn-danger').data("businessId");		
		
    	removeGeometryDB(geometryid,businessId,geometriesBusinessId);
	});
	
	$('#modal_data_table').on('hidden.bs.modal', function (e) {

		//Comprovem que no hi hagi cap select amb errors
		var selects = $('.dataTableSelect');
		var hasError = false;
		for(var i=0, len=selects.length; i<len && !hasError; ++i) {

			var val = $(selects[i]).val();
			hasError = (val === null);

		}

		if(!hasError) {

			var capaEdicio = $('#modal_data_table').data("capaEdicio");
	//		console.debug(controlCapes);
			//Update options amb les propietats de cada camp
			
			if (!$.isEmptyObject(optionsF)){
				var optionsNoves = {
						propFormat: optionsF	
					};
				var data={
						businessId:  capaEdicio.layer.options.businessId,
						uid: Cookies.get('uid'),
						options:  JSON.stringify(optionsNoves)					
				};
				updateServidorWMSOptions(data).then(function(results){
					$('#modal_data_table').data("layerServidor", results.results);
					var layerServidor = $('#modal_data_table').data("layerServidor");				
					layerServidor.capesOrdre = capaEdicio.layer.options.zIndex.toString();		
					optionsF={};
					//Eliminem la capa de controlCapes i mapa
					reloadSingleLayer(capaEdicio, layerServidor);
				});
			}
			
			//si hem editat dades recarreguem la capa per visualitzar els canvis
			if(editat && $.isEmptyObject(optionsF)){
				var layerServidor = $('#modal_data_table').data("layerServidor");
				layerServidor.capesOrdre = capaEdicio.layer.options.zIndex.toString();
				//Eliminem la capa de controlCapes i mapa
				reloadSingleLayer(capaEdicio, layerServidor);
			}
			editat = false;
			geomBusinessId = '-1';
			geomRowIndex = 0;
			numRows = 0;
			$('#modal_data_table').off('post-body.bs.table');
			$('#modal_data_table_body #layer-data-table').bootstrapTable('destroy');

		}

	});	
	
}

function editableColumnFormatter(inValue, row, index, name, pk, columnIndex) {

	var value = inValue;
	
	var format = $('.dataTableSelect[data-column="' + name + '"]').val();
	//console.debug(value);
	if(0 == index) {
		//Data type row
	}
	else {

		value = dataFormatter.formatValue(inValue, format);
		var rawValue = dataFormatter.removeDecorators(inValue);

		return '<a id="dataTable_' + index + '_' + columnIndex + '" href="javascript:void(0)" data-name="' + name + '" data-pk="' + pk + '"' + 
			' data-value="' + value.replace("<span style='color:red'>","").replace("</span>","") + '"' +
			' data-start-value="' + rawValue + '"' + 
			'>' + value + '</a>';
	}

	return value;

}

function nonEditableColumnFormatter(inValue, row, index, name, pk) {
	
	var value = inValue;

	return value;

}

function fillModalDataTable(obj, geomBid){
	
	var columNames = [];
	var widthColumn;
	var geometriesBusinessId = "";
	var modeMapa = ($(location).attr('href').indexOf('/mapa.html')!=-1);
	
	if(isValidValue(geomBid)){
		geomBusinessId = geomBid;
		
		$('#modal_data_table').on('post-body.bs.table	', function(event, name, row, 	oldValue, param) {
			event.preventDefault();
			event.stopImmediatePropagation();
			
//			var scroll = ($('div.fixed-table-body #layer-data-table tbody')[0].scrollHeight * (geomRowIndex+1)) / numRows;
//			console.debug("scroll:");
//			console.debug(scroll);
			
			 var parentDiv =  $('div.fixed-table-body');
			 var innerListItem = $('div.fixed-table-body #layer-data-table tbody tr.success');
			 if(!editat) parentDiv.scrollTo(innerListItem);
			 
		});
	}
	
	$('#modal_data_table').data("capaEdicio", obj);
	
	//obj.layer.serverName	
	//$('#modal_data_table_title').html(obj.name.toUpperCase());
	$('#modal_data_table_title').text(obj.name.toUpperCase());	

	var rowNum = $('#layer-data-table > tbody').children('tr').length;
	if(rowNum !== 0) {
		$('#modal_data_table_body #layer-data-table').bootstrapTable('destroy');
	}
	
	var options = obj.layer.options;
	var totalColumns=1;
	if (obj.layer.options!=undefined && obj.layer.options.estil!=undefined){
		
		//Primer trobem column names
		jQuery.each(obj.layer.options.estil, function(indexEstil, estil){
			
			jQuery.each(estil.geometria.features, function(indexFeature, feature){
				
				
				var isADrawMarker=false;
				
				
				if (feature.properties!=undefined && feature.properties.length!=undefined) {
					totalColumns = totalColumns + feature.properties.length;
					for(var x in feature.properties){	
						if (!isADrawMarker && (x=='text' || x=='TEXT')) {
							isADrawMarker=true;
						}				
						else if (!isADrawMarker) isADrawMarker=false;
					}
				}
				if (options.propName!=undefined && options.propName.length!=undefined) {
					totalColumns = totalColumns + options.propName.length;
					for(var x in options.propName){	
						if (!isADrawMarker && (options.propName[x]=='text' || options.propName[x]=='TEXT')) {
							isADrawMarker=true;
						}				
						else if (!isADrawMarker) isADrawMarker=false;
					}
				}
				if (isADrawMarker && feature.geometry.type=="Point") totalColumns = totalColumns + 4;
				
				 widthColumn = 100/totalColumns;
				//console.debug(feature);
				//Geometry Id
				var objGeomId = {
						field: 'geometryid',
						title: 'ID',
						visible: false
				}
				columNames.push(objGeomId);	
	
				//Geometry Bid 
				var objGeomBid = {
						field: 'geometrybid',
						title: 'BID',
						visible: false
				}
				columNames.push(objGeomBid);			
				
				//geometryBBOX
				var objGeomBBOX = {
						field: 'geometryBBOX',
						title: 'BBOX',
						visible: false 
				}
				columNames.push(objGeomBBOX);			
				
				//console.debug(options);
				if(modeMapa){
					//properties headers
					//console.debug(feature);
					var propName;
					if(typeof (options.propName)=="string"){	
						try {
							propName = JSON.parse(options.propName);
						}
						catch (err) {
							propName = options.propName;		
						}
					}else{			
						propName = options.propName;	
					}
					if (propName!=undefined && propName.toString().indexOf("nom,text")==-1) {
						
						for(var x in propName){	
							if (propName[x].toLowerCase()!="geomorigen") {
								//console.debug(propName[x]);
								var obj = {
									title: propName[x].toUpperCase(),
									field: propName[x].toLowerCase(),
									sortable: true,
									editable: {
										emptytext : '-'
									},
									formatter: editableColumnFormatter,
									withoutLink: true,
									width:widthColumn+"% !important"
								}
							
								columNames.push(obj);
							}
						}		
					}
					else {
						for(var x in feature.properties){
							if (x.toLowerCase()!="geomorigen"){
								var obj = {
									title: x.toUpperCase(),
									field: x.toLowerCase(),
									sortable: true,
									editable: {
										emptytext : '-'
									},
									formatter: editableColumnFormatter,
									withoutLink: true,
									width:widthColumn+"% !important"
								}
								if (x=='text' || x=='TEXT') isADrawMarker=true;
								else isADrawMarker=false;
								columNames.push(obj);
							}
						}
					}
					if (isADrawMarker && feature.geometry.type=="Point"){ //Nomes pintem longitud/latitud quan és un punt. Afegim ETRS89
						var obj = {
								title: "latitud".toUpperCase(),
								field: "latitud".toLowerCase(),
								sortable: true,
								width:widthColumn+"%"
							}
						columNames.push(obj);
						 obj = {
									title: "longitud".toUpperCase(),
									field: "longitud".toLowerCase(),
									sortable: true,
									width:widthColumn+"% !important"
								}
						 columNames.push(obj);
						 obj = {
									title: "etrs89_x".toUpperCase(),
									field: "etrs89_x".toLowerCase(),
									sortable: true,
									width:widthColumn+"% !important"
								}
						 columNames.push(obj);
						 obj = {
									title: "etrs89_y".toUpperCase(),
									field: "etrs89_y".toLowerCase(),
									sortable: true,
									width:widthColumn+"% !important"
								}
						 columNames.push(obj);
					}
					
					//Actions
					var objActions = {
							title: window.lang.translate("ACCIONS"),
							field: 'Accions',
							formatter: actionFormatter,
							events: 'actionEvents',
							width:widthColumn+"% !important"
					}	
					columNames.push(objActions);
					
				}else{
					//Taula no editable pel visor
					//properties headers
					if (options.propName!=undefined && options.propName.toString().indexOf("nom,text")==-1) {
						
							for(var x in options.propName){
								if (options.propName[x].toLowerCase()!="geomorigen") {
									var obj = {
										title: options.propName[x].toUpperCase(),
										field: options.propName[x].toLowerCase(),
										sortable: true,
										formatter: nonEditableColumnFormatter,
										withoutLink: true,
										width:widthColumn+"% !important"
									}
									if (options.propName[x]=='text' || options.propName[x]=='TEXT') isADrawMarker=true;
									else isADrawMarker=false;
									columNames.push(obj);
								}
							}
					}
					else {
						for(var x in feature.properties){
							if (x.toLowerCase()!="geomorigen"){
								var obj = {
									title: x.toUpperCase(),
									field: x.toLowerCase(),
									sortable: true,
									formatter: nonEditableColumnFormatter,
									withoutLink: true,
									width:widthColumn+"% !important"				
								}
								if (x=='text' || x=='TEXT') isADrawMarker=true;
								else isADrawMarker=false;
								columNames.push(obj);
							}
						}
					}	
					if (isADrawMarker){
						var obj = {
								title: "latitud".toUpperCase(),
								field: "latitud".toLowerCase(),
								sortable: true,
								width:widthColumn+"% !important"
							}
						columNames.push(obj);
						 obj = {
									title: "longitud".toUpperCase(),
									field: "longitud".toLowerCase(),
									sortable: true,
									width:widthColumn+"% !important"
								}
						 columNames.push(obj);
						 obj = {
									title: "etrs89_x".toUpperCase(),
									field: "etrs89_x".toLowerCase(),
									sortable: true,
									width:widthColumn+"% !important"
								}
						 columNames.push(obj);
						 obj = {
									title: "etrs89_y".toUpperCase(),
									field: "etrs89_y".toLowerCase(),
									sortable: true,
									width:widthColumn+"% !important"
								}
						 columNames.push(obj);
					}
					
					//Actions
					var objActions = {
							title: window.lang.translate("ACCIONS"),
							field: 'Accions',
							formatter: actionFormatterVisor,
							events: 'actionEvents'
					}	
					columNames.push(objActions);
				}
				return false;
			});
			
			return false;
		});	
	}
	else {//Primer cop que dibuixem una geometria
		//Geometry Id
		totalColumns = totalColumns+ 2;
		
		widthColumn = 100/totalColumns;
		var objGeomId = {
				field: 'geometryid',
				title: 'ID',
				visible: false
		}
		columNames.push(objGeomId);	

		//Geometry Bid 
		var objGeomBid = {
				field: 'geometrybid',
				title: 'BID',
				visible: false
		}
		columNames.push(objGeomBid);			
		
		//geometryBBOX
		var objGeomBBOX = {
				field: 'geometryBBOX',
				title: 'BBOX',
				visible: false 
		}
		columNames.push(objGeomBBOX);		
		//console.debug(options);
		if(modeMapa){
			var isADrawMarker=true;
			//properties headers
			//console.debug(feature);
		
			var obj2 = {
					title: "nom".toUpperCase(),
					field: "nom".toLowerCase(),
					sortable: true,
					width:widthColumn+"% !important",
					editable: {
						emptytext : '-'
					}
				}
				
			columNames.push(obj2);
			obj2 = {
					title: "text".toUpperCase(),
					field: "text".toLowerCase(),
					sortable: true,
					width:widthColumn+"% !important",
					editable: {
						emptytext : '-'
					}
				}
				
			columNames.push(obj2);
			
			if (isADrawMarker && options.geometryType=="marker"){ //Nomes pintem longitud/latitud quan és un punt. Afegim ETRS89
				var obj2 = {
						title: "latitud".toUpperCase(),
						field: "latitud".toLowerCase(),
						width:widthColumn+"% !important",
						sortable: true
					}
				columNames.push(obj2);
				 obj2 = {
							title: "longitud".toUpperCase(),
							field: "longitud".toLowerCase(),
							width:widthColumn+"% !important",
							sortable: true
						}
				 columNames.push(obj2);
				 obj2 = {
							title: "etrs89_x".toUpperCase(),
							field: "etrs89_x".toLowerCase(),
							sortable: true,
							width:widthColumn+"% !important"
						}
				 columNames.push(obj2);
				 obj2 = {
							title: "etrs89_y".toUpperCase(),
							field: "etrs89_y".toLowerCase(),
							sortable: true,
							width:widthColumn+"% !important"
						}
				 columNames.push(obj2);
			}
			
			//Actions
			var objActions = {
					title: window.lang.translate("ACCIONS"),
					field: 'Accions',
					formatter: actionFormatter,
					events: 'actionEvents',
					width:widthColumn+"% !important",
			}	
			columNames.push(objActions);
			
		}
		
	}
	
	window.actionEvents = {
		    'click .remove': function (e, value, row, index) {
		    	//Afegim parametres al button del dialog, per despres poder fer crida al remove
		    	$('#dialog_delete_row .btn-danger').data("geometryid", row.geometryid);
		    	$('#dialog_delete_row .btn-danger').data("geometriesBusinessId", geometriesBusinessId);
		    	$('#dialog_delete_row .btn-danger').data("businessId", obj.layer.options.businessId);
		    	
		    	$('#dialog_delete_row').modal('show');
		    },
	        'click .zoomTo': function (e, value, row, index) {
	        	$('#modal_data_table').modal('hide');
	        	var coords = row.geometryBBOX.split("#"); 
				var bbox = L.latLngBounds(L.latLng(coords[1], coords[0]), L.latLng(coords[3], coords[2]));
				map.fitBounds(bbox);
	        }
		};	

	//Portem properties del servidor
	var data ={
			businessId: obj.layer.options.businessId,
			uid:Cookies.get('uid')
		};
	
	
	getGeometriesPropertiesLayer(data).then(function(results){
			
			if (results.status == "OK"){
				
				geometriesBusinessId = results.geometriesBusinessId;
				$('#modal_data_table').data("layerServidor", results.layer);
				var resultats = results.results;
				var coords = resultats.split("#");
				var lon = parseFloat(coords[2]);
				var lat = parseFloat(coords[1]);
				//resultats = resultats.replace("}]",",\"longitud\":\""+lon.toFixed(5)+"\",\"latitud\":\""+lat.toFixed(5)+"\"}]");
				var resultats2 = $.parseJSON(resultats);
				var propFormat; 
				if (results.layer.options!=undefined){
					var opts = $.parseJSON(results.layer.options);
					if (opts.propFormat!=undefined){
						propFormat= opts.propFormat;
					}
				}
				var resultatsMod = [];
				var resultI=0;
				var haveGeomOrigen=false;
				jQuery.each(resultats2, function(i, result){
					var coords = result.geometryBBOX.split("#");  
					if (obj.layer.options.geometryType!="polygon" || obj.layer.options.geometryType!="polyline" ){
						var lon = parseFloat(coords[2]);
						var lat = parseFloat(coords[1]);
						if (result.longitud==undefined)  result.longitud=lon.toFixed(5);
						if (result.latitud==undefined)  result.latitud=lat.toFixed(5);
						var etrs89 = latLngtoETRS89(lat, lon);
						if (result.etrs89_x==undefined)  result.etrs89_x=etrs89.x;
						if (result.etrs89_y==undefined)  result.etrs89_y=etrs89.y;
					}
					$.each( result, function( key, value ) {
						if (key.toLowerCase()!="geomorigen"){
							if (propFormat!=undefined && propFormat[key]!=undefined){
								var errors = { num: 0 };
								result[key] = dataFormatter.formatValue(value, propFormat[key]);

							}
							else {
								var valorStr=value.toString();
								if (valorStr.indexOf("src")>-1){
									value=valorStr.replaceAll('"',"'");//Issue #560
									//console.debug(value);
									result[key]=value;
								}
								else result[key]=value;
							}
						}
						else {
							result[key] = null;
							delete result[key];
						}
					});
					
					resultatsMod[resultI]=result;
					
					resultI++;
					//console.debug(result);
					
				});
				//Add the first row with the column type selection
				if (modeMapa){
					var selectsRow = {};
					$.each(columNames, function(i, name) {
						var nameF = name.field.toLowerCase();
						if("accions" != nameF && "geometryid"!= nameF && "latitud"!= nameF && "longitud"!= nameF
								&& "geometrybbox"!= nameF && "geometrybid"!= nameF  && "etrs89_x"!= nameF && "etrs89_y"!= nameF) {						
							if (!$.isEmptyObject(optionsF) && optionsF[name.field]!=undefined){
								selectsRow[name.field] = dataFormatter.createOptions(name.field, optionsF[name.field], i);
							}
							else if (propFormat!=undefined && propFormat[name.field]!=undefined){
								selectsRow[name.field] = dataFormatter.createOptions(name.field, propFormat[name.field], i);
							}
							else{
								selectsRow[name.field] = dataFormatter.createOptions(name.field, 't', i);
							}
	
						}
						else if ("latitud"== nameF && "longitud"== nameF){
							selectsRow[name.field] = "";
						}
	
					});
					resultatsMod.unshift(selectsRow);
				}

				var showRefresh=false;
				if (mapConfig.tipusAplicacioId == TIPUS_APLIACIO_AOC) showRefresh=true;

				$('#modal_data_table_body #layer-data-table').bootstrapTable({
					search: true,
					striped: true,
					height: '600',
					idField: 'geometryid',
//					clickToSelect: true,
//					checkboxHeader: true,
//					showColumns: true,
//					 showHeader: true,
					rowStyle: 'rowStyle',
				    columns: columNames,
				    showExport: true,			
				    showRefresh: showRefresh,
				    exportTypes: ['json', 'csv', 'txt', 'excel'],
				    ignoreColumn: [columNames.length-4],
				    data: resultatsMod,
				    icons: {
				       refresh: 'glyphicon-refresh'
				    },
				    width: widthColumn
				});	
				

				$('#modal_data_table').on('editable-save.bs.table', function(event, name, row, 	oldValue, param) {
					event.preventDefault();
					event.stopImmediatePropagation();					
					
					if(isValidValue(name)){
						var newValue = row[name];
						var format = $('.dataTableSelect[data-column="' + name + '"]').val();
						var errors = { num: 0 };
						var formatValue = dataFormatter.formatValue(row[name], format, true, errors);
						if (errors.num > 0){
							alert("Format no permés. Adapta’l al format 123.45,67 o 12345,67.");
							hiHaError = false;
							dataTableSelectChanged($('.dataTableSelect[data-column="' + name + '"]'), false);
						}
						else{
							//Trigger an update to format the value
							//If we had the cell name we could modify it directly...
							dataTableSelectChanged($('.dataTableSelect[data-column="' + name + '"]'));
							var dataUpdate ={
									uid:Cookies.get('uid'),
									geometryid: row["geometryid"],
									key:  name,
									newValue: row[name]
								};
							updateGeometriaProperties(dataUpdate).then(function(results){
								if (results.status == "OK"){
									editat = true;
									row[name] = formatValue;
								}else{
									console.debug('error updateGeometriaProperties');
								}
							},function(results){
								console.debug('error updateGeometriaProperties');
							});		
						}
					}
				});	
				
				$('[name="refresh"]').on('click',function(){

					var capaEdicio = $('#modal_data_table').data("capaEdicio");
					$('#modal_data_table').modal('hide');
					carregarModalFitxer(true,obj.layer.options.businessId,obj.name,this.dataset.servertype,capaEdicio);
					
				});

				$('.dataTableSelect').on('change', function() {

					dataTableSelectChanged(this);

				});				
			
				
			}else{
				console.debug('error getGeometriesPropertiesLayer');
			}
		},function(results){
			console.debug('error getGeometriesPropertiesLayer');
		});
	
}

function dataTableSelectChanged(ctx, showAlert) {

	var doAlert = (undefined == showAlert ? true : showAlert);
	var format = $(ctx).val();
	var column = $(ctx).data('column');
	var columnIndex = $(ctx).data('column-idx');
	var errors = { num: 0 };
	var rowNum = $('#layer-data-table > tbody').children('tr').length;
	var originalTableNode = document.getElementById('layer-data-table');
	var tableNode = originalTableNode.cloneNode(true);

	for(var i=1; i<rowNum; ++i)
	{

		//TODO: Potser és millor pillar tots els nodes amb la classe de la columna
		//amb una sola crida al querySelector enlloc de fer rowNum crides?
		//Per fer-ho hauríem de passar les classes del td al a
		var anchor = tableNode.querySelector('#dataTable_' + i + '_' + columnIndex);
		var value = "" + anchor.getAttribute('data-start-value');

		anchor.innerHTML = dataFormatter.formatValue(value, format, true, errors);

	}

	var newFormat = "";
	if (errors.num > 0) {
		
		if(doAlert) {

			if (errors.num > 1) alert("Hem remarcat en vermell " + errors.num +" valors dubtosos. Si us plau, adapta’ls al format 12.345,67 o 12345,67, i torna a canviar el format de la columna.");
			else alert("Hem remarcat en vermell 1 valor dubtós. Si us plau, adapta’l al format 12.345,67 o 12345,67, i torna a canviar el format de la columna.");

		}

	}
	else {


		optionsF[column] = format;
		newFormat = format;

	}

	originalTableNode.parentNode.replaceChild(tableNode, originalTableNode);

	//Set the selector to the new value 
	//We use jQuery because it adds a new option if the value is not found
	var newSelect = $('.dataTableSelect[data-column-idx="' + columnIndex + '"]:first');
	$(newSelect).off('change');
	$(newSelect).val(newFormat);
	$(newSelect).on('change', function() {
		dataTableSelectChanged(newSelect);
	});

}

function rowStyle(row, index) {
	
	numRows = numRows + 1;
	if (row.geometrybid == geomBusinessId) {
//    	console.debug("rowStyle:");
   
//    	console.debug(index);
    	geomRowIndex = index;
        return {
            classes: 'success'//classes[index / 2]
        };
    }
    return {};
	
//    var classes = ['active', 'success', 'info', 'warning', 'danger'];
//    
//    if (index % 2 === 0 && index / 2 < classes.length) {
//    	console.debug("rowStyle:");
//    	console.debug(row);
//        return {
//            classes: classes[index / 2]
//        };
//    }
//    return {};
}

function actionFormatter(value, row, index) {
    return [
        '<a class="zoomTo" href="javascript:void(0)" title="ZoomTo">',
        '<i class="glyphicon glyphicon-zoom-in data-table-icon-zoom"></i>',            
        '<a class="remove ml10" href="javascript:void(0)" title="Remove">',
        '<i class="glyphicon glyphicon-trash data-table-icon-remove"></i>',
        '</a>'
    ].join('');
}

function actionFormatterVisor(value, row, index) {
    return [
        '<a class="zoomTo" href="javascript:void(0)" title="ZoomTo">',
        '<i class="glyphicon glyphicon-zoom-in data-table-icon-zoom"></i>',            
        '</a>'
    ].join('');
}

function removeGeometryDB(geometryid, businessId, geometriesBusinessId){
	
	var data ={
			businessId: businessId,
			uid:Cookies.get('uid'),
			geometryid: geometryid,
			geometriesBusinessId: geometriesBusinessId
		};
	
	removeGeometriaFromProperties(data).then(function(results){
		
		if(results.status == "OK"){
			editat = true;
		    $('#modal_data_table_body #layer-data-table').bootstrapTable('remove', {
	            field: 'geometryid',
	            values: [geometryid]
	        }); 
		}else{
			console.debug("ERROR removeGeometriaFromProperties");
		}
		
	},function(results){
		console.debug("ERROR removeGeometriaFromProperties");
	});
	
}

function addHtmlModalDataTable(){
	
	jQuery('#mapa_modals').append(
	'<!-- Modal Data Table -->'+
	'		<div id="modal_data_table" class="modal fade">'+
	'		<div class="modal-dialog modal-lg">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
	'					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
	'					<h4 lang="ca" id="modal_data_table_title"  class="modal-title"></h4>'+
	'				</div>'+
	'				<div id="modal_data_table_body" class="modal-body">'+
//	'					<div id="div-table">'+
//	'						<div class="cell-left">'+
	'							<table id="layer-data-table"></table>'+
//	'						</div>'+
//	'						<div class="cell-right"></div>'+
//	'						<div class="clearfix"></div>'+
//	'					</div>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button type="button" class="btn btn-default" data-dismiss="modal" lang="ca">Tancar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'<!-- fi Data Table -->'		
	);
}

function addHtmlModalDeleteDataTableRow(){
	
	jQuery('#mapa_modals').append(
	'<!-- Modal delete data table row -->'+
	'		<div id="dialog_delete_row" class="modal fade">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-body">'+
	'					<h4><span lang="ca">Vols esborrar la fila?</span></h4>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button lang="ca" type="button" class="btn btn-default"'+
	'						data-dismiss="modal">Cancel·lar</button>'+
	'					<button lang="ca" type="button" class="btn btn-danger"'+
	'						data-dismiss="modal">Esborrar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- Fi Modal delete -->	'		
	);
}

