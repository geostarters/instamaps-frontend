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
	addHtmlModalAddColumn();
	
	$('#dialog_delete_row .btn-danger').on('click', function(event){
		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient = button.data('whatever');
		
    	var geometryid = $('#dialog_delete_row .btn-danger').data("geometryid");
    	var geometriesBusinessId = $('#dialog_delete_row .btn-danger').data("geometriesBusinessId");
    	var businessId = $('#dialog_delete_row .btn-danger').data("businessId");		
    	$('#modal_data_table').modal('hide');
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

			e.preventDefault();
			e.stopImmediatePropagation();
			var capaEdicio = $('#modal_data_table').data("capaEdicio");
	//		console.debug(controlCapes);
			//Update options amb les propietats de cada camp
			var optionsPrivacitat={};
			$( ".privacitatSpan" ).each(function( index ) {
				var id = $(this).attr('id');
				var classe= $(this).attr('class');
				var privacitat=true;
				if (classe.indexOf("close")>-1) privacitat=false;
				id = id.replace("privacitat_","");
				if (optionsPrivacitat[id]===undefined) {
					optionsPrivacitat[id]=privacitat;
				}
				
			});
			var jaRefrescat = false;
			if (!$.isEmptyObject(optionsF) || !$.isEmptyObject(optionsPrivacitat)) {
				jaRefrescat=true;
				var optionsNoves = {
					propFormat: optionsF,
					propPrivacitat: optionsPrivacitat
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
			else {//si hem editat dades recarreguem la capa per visualitzar els canvis
				if (!jaRefrescat){
					if(editat && $.isEmptyObject(optionsF)){
						var layerServidor = $('#modal_data_table').data("layerServidor");
						layerServidor.capesOrdre = capaEdicio.layer.options.zIndex.toString();
						//Eliminem la capa de controlCapes i mapa
						reloadSingleLayer(capaEdicio, layerServidor);
					}
					//si hem editat dades recarreguem la capa per visualitzar els canvis
					else if(editat  && $.isEmptyObject(optionsPrivacitat)){
						var layerServidor = $('#modal_data_table').data("layerServidor");
						layerServidor.capesOrdre = capaEdicio.layer.options.zIndex.toString();
						//Eliminem la capa de controlCapes i mapa
						reloadSingleLayer(capaEdicio, layerServidor);
					}
				}
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
		var rawValue = (undefined === inValue) ? "" : dataFormatter.removeDecorators(inValue);

		return '<a id="dataTable_' + index + '_' + columnIndex + '" class="dataTable_column_' + 
			columnIndex + ' dataTable_row_' + index + '" href="javascript:void(0)" data-name="' + 
			name + '" data-pk="' + pk + '"' + ' data-value="' + 
			value.replace("<span style='color:red'>","").replace("</span>","") + '"' +
			' data-start-value="' + rawValue + '"' + '>' + value + '</a>';
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
			 var elementToScrollTo = $('div.fixed-table-body #layer-data-table tbody tr.success').prev();
			 if(!editat) {
				 try {
					 parentDiv.scrollTo(elementToScrollTo);
				 }catch(e){
					 
				 }
			 }
			 
		});
	}
	
	$('#modal_data_table').data("capaEdicio", obj);
	
	//obj.layer.serverName	
	//$('#modal_data_table_title').html(obj.name.toUpperCase());
	$('#modal_data_table_title').text(obj.name.toUpperCase());	

	var rowNum = $('#layer-data-table > tbody').children('tr').length;
	if(rowNum !== 0) {
		$('#modal_data_table_body').html('<table id="layer-data-table"></table>');
	}
	
	var options = obj.layer.options;
	var totalColumns=1;
	if (obj.layer.options!=undefined && obj.layer.options.estil!=undefined){
		
		//Primer trobem column names
		jQuery.each(obj.layer.options.estil, function(indexEstil, estil){
			
			jQuery.each(estil.geometria.features, function(indexFeature, feature){
				if (feature.properties!=undefined && feature.properties.length!=undefined) {
					totalColumns = totalColumns + feature.properties.length;
				}
				if (options.propName!=undefined && options.propName.length!=undefined) {
					totalColumns = totalColumns + options.propName.length;
				}
				//if (isADrawMarker && feature.geometry.type=="Point") totalColumns = totalColumns + 4;
				
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
					if (propName!=undefined ) {
						
						for(var x in propName){	
							if (propName[x].toLowerCase()!="geomorigen") {
								//console.debug(propName[x]);
								var obj = {
									title: propName[x].toUpperCase(),
									field: propName[x].toLowerCase(),
									sortable: false,
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
									sortable: false,
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
					if (options.propName!=undefined ) {
						var propPrivacitat =null ;
						
						if  (options.propPrivacitat!=undefined) {
							propPrivacitat=options.propPrivacitat;
						}
						//Recalculem el widthcolumn mirant les columnes que s'oculten i les que es mostren
						for(var x in options.propName){
							if (propPrivacitat!=null && (propPrivacitat[options.propName[x]]==false || propPrivacitat[options.propName[x].toLowerCase()]==false)){
								totalColumns = totalColumns-1;
							}
						}
						 widthColumn = 100/totalColumns;
						for(var x in options.propName){
								
								var isVisible=true;
								if  (options.propPrivacitat!=undefined) {
									propPrivacitat=options.propPrivacitat;
									isVisible=(propPrivacitat[options.propName[x].toLowerCase()] || propPrivacitat[options.propName[x]]);
								}
								
								try{
									if (options.propName[x].toLowerCase()!="geomorigen" && isVisible) {
										var obj = {
											title: options.propName[x].toUpperCase(),
											field: options.propName[x].toLowerCase(),
											sortable: false,
											formatter: nonEditableColumnFormatter,
											withoutLink: true,
											width:widthColumn+"% !important"
										}
										
										columNames.push(obj);
									}
								}catch(e){
									
								}
						}
					}
					else {
						for(var x in feature.properties){
							if (x.toLowerCase()!="geomorigen"){
								var obj = {
									title: x.toUpperCase(),
									field: x.toLowerCase(),
									sortable: false,
									formatter: nonEditableColumnFormatter,
									withoutLink: true,
									width:widthColumn+"% !important"				
								}
							
								columNames.push(obj);
							}
						}
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
	else {
		//Primer cop que dibuixem una geometria
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
			
			//properties headers
			//console.debug(feature);
		
			var obj2 = {
					title: "nom".toUpperCase(),
					field: "nom".toLowerCase(),
					sortable: false,
					width:widthColumn+"% !important",
					editable: {
						emptytext : '-'
					}
				}
				
			columNames.push(obj2);
			obj2 = {
					title: "text".toUpperCase(),
					field: "text".toLowerCase(),
					sortable: false,
					width:widthColumn+"% !important",
					editable: {
						emptytext : '-'
					}
				}
				
			columNames.push(obj2);
			
			if (obj.layer.options.geometryType==t_marker){
				obj2 = {
						title: "latitud".toUpperCase(),
						field: "latitud".toLowerCase(),
						sortable: false,
						width:widthColumn+"%"
					}
				columNames.push(obj2);
				obj2 = {
							title: "longitud".toUpperCase(),
							field: "longitud".toLowerCase(),
							sortable: false,
							width:widthColumn+"% !important"
						}
				 columNames.push(obj2);
				obj2 = {
							title: "etrs89_x".toUpperCase(),
							field: "etrs89_x".toLowerCase(),
							sortable: false,
							width:widthColumn+"% !important"
						}
				 columNames.push(obj2);
				obj2 = {
							title: "etrs89_y".toUpperCase(),
							field: "etrs89_y".toLowerCase(),
							sortable: false,
							width:widthColumn+"% !important"
						}
				 columNames.push(obj2);
			}
			else if (obj.layer.options.geometryType==t_polyline){
				obj2 = {
						title: "longitud (km)".toUpperCase(),
						field: "longitud (km)".toLowerCase(),
						sortable: false,
						width:widthColumn+"% !important",
						editable: {
							emptytext : '-'
						}
					}
					
				columNames.push(obj2);
				
			}
			else if (obj.layer.options.geometryType==t_polygon) {
				obj2 = {
						title: "area (ha)".toUpperCase(),
						field: "area (ha)".toLowerCase(),
						sortable: false,
						width:widthColumn+"% !important",
						editable: {
							emptytext : '-'
						}
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
				var propFormat, propPrivacitat; 
				if (results.layer.options!=undefined){
					var opts = $.parseJSON(results.layer.options);
					if (opts.propFormat!=undefined){
						propFormat= opts.propFormat;
					}
					if (opts.propPrivacitat!=undefined){
						propPrivacitat = opts.propPrivacitat;
					}
				}
				var resultatsMod = [];
				var resultI=0;
				var haveGeomOrigen=false;
				jQuery.each(resultats2, function(i, result){
					var coords = result.geometryBBOX.split("#");  
							$.each( result, function( key, value ) {
						var isVisible=true;
						if (!modeMapa){
							//Comprovar privacitat propietats
							if (propPrivacitat!=undefined && propPrivacitat[key]!=undefined){
								 if (propPrivacitat[key]==false) isVisible=false;
							}
						}
						if (key.toLowerCase()!="geomorigen" && isVisible){
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
						var isFeatProp = "latitud"== nameF || "longitud"== nameF || "etrs89_x"== nameF || "etrs89_y"== nameF || "longitud (km)"==nameF || "area (ha)"==nameF;
						if("accions" != nameF && "geometryid"!= nameF
								&& "geometrybbox"!= nameF && "geometrybid"!= nameF && !isFeatProp) {							
							
							if (!$.isEmptyObject(optionsF) && optionsF[name.field]!=undefined){
								selectsRow[name.field] = dataFormatter.createOptions(name.field, optionsF[name.field],isFeatProp, i);
							}
							else if (propFormat!=undefined && propFormat[name.field]!=undefined){
								selectsRow[name.field] = dataFormatter.createOptions(name.field, propFormat[name.field],isFeatProp, i);
							}
							else{
								selectsRow[name.field] = dataFormatter.createOptions(name.field,'t',isFeatProp, i);
							}
							//Comprovem privacitat
							
						}
						else if (isFeatProp){
							selectsRow[name.field] =  dataFormatter.createOptions(name.field, 't', isFeatProp, i);
						}
						if ("accions"===nameF){
							selectsRow["accions"]="";
						}
	
					});
					resultatsMod.unshift(selectsRow);
				}

				var showRefresh=false;
				if (mapConfig.tipusAplicacioId == TIPUS_APLIACIO_AOC) showRefresh=true;

				$('#modal_data_table_body #layer-data-table').bootstrapTable({
					search: true,
					striped: true,
					height: '570',
					idField: 'geometryid',
//					clickToSelect: true,
//					checkboxHeader: true,
//					showColumns: true,
//					 showHeader: true,
					rowStyle: rowStyle,
				    columns: columNames,
				    showExport: true,			
				    showRefresh: showRefresh,
				    exportTypes: ['json', 'csv', 'txt', 'excel'],
				    ignoreColumn: [columNames.length-4],
				    data: resultatsMod,
				    addColumn: true,
				    icons: {
				       refresh: 'glyphicon-refresh',
				       newColumn: 'glyphicon-plus'
				    },
				    width: widthColumn
				});	
				

				$('#dialog_add_column #addColumnBoto').on('click',function(event){
					event.preventDefault();
					event.stopImmediatePropagation();	
					valueNewCol="";
					var capaEd = $('#modal_data_table').data("capaEdicio");
					var dataNew={
						businessId: capaEd.layer.options.businessId,
						uid:Cookies.get('uid'),
						newColumn: 	$('#newColumnName').val(),
						valueNewColumn: valueNewCol
					}
					addNewProperties(dataNew).then(function(results){
						$('#dialog_add_column').modal('hide');
						$('#modal_data_table').modal('hide');
					});
				});
				
				$('#addColumn').on('click',function(){
					$('#newColumnName').val('');			
					$('#dialog_add_column').modal('show');
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
							//dataTableSelectChanged($('.dataTableSelect[data-column="' + name + '"]'));
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
				
				$('#modal_data_table').on('post-header.bs.table',function(){
					$.each(columNames, function(i, name) {
						var nameF = name.field.toLowerCase();
						var privacitat="open";
						var isFeatProp = "latitud"== nameF || "longitud"== nameF || "etrs89_x"== nameF || "etrs89_y"== nameF || "longitud (km)"==nameF || "area (ha)"==nameF;
						if (propPrivacitat!=undefined && propPrivacitat[name.field]!=undefined){
							 if (propPrivacitat[name.field]==false) privacitat="close";
						}
						else if (isFeatProp){
							privacitat="close";
						}
						nameF= nameF.replace(" ","_");
						nameF=nameF.replace("(","_");
						nameF=nameF.replace(")","_");
						$('#privacitat_'+nameF).attr('class','glyphicon glyphicon-eye-'+privacitat+' privacitatSpan');
					});
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

	var originalTableNode = document.getElementById('layer-data-table');
	var tableNode = originalTableNode.cloneNode(true);
	var columns = tableNode.querySelectorAll('.dataTable_column_' + columnIndex);
	var rowNum = columns.length;

	for(var i=0; i<rowNum; ++i)
	{

		var anchor = columns[i];
		var value = "" + $(anchor).data('startValue');

		var oldErrors = errors.num;
		var content = dataFormatter.formatValue(value, format, true, errors);
		var hasErrors = (errors.num != oldErrors);

		if(!hasErrors)
			anchor.textContent = content;
		else
			anchor.innerHTML = content;

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

	$('.dataTableSelect').on('change', function() {

		dataTableSelectChanged(this);

	});

}

function rowStyle(row, index) {
	
	var rowClass = '';
	numRows = numRows + 1;

	if (isCurrentGeometry(row.geometrybid)) {

    	geomRowIndex = index;
    	rowClass = 'success';

    }

    return rowClass;
	
}

function isCurrentGeometry(test) {

	return test == geomBusinessId;

}

function actionFormatter(value, row, index) {
	if(index===0){
		return "";
	}
	else{
	    return [
	        '<a class="zoomTo" href="javascript:void(0)" title="ZoomTo">',
	        '<i class="glyphicon glyphicon-zoom-in data-table-icon-zoom"></i>',            
	        '<a class="remove ml10" href="javascript:void(0)" title="Remove">',
	        '<i class="glyphicon glyphicon-trash data-table-icon-remove"></i>',
	        '</a>'
	    ].join('');
	}
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



function addHtmlModalAddColumn(){	
	$.get("templates/modalAddNewColumn.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data);       		
	});
}

