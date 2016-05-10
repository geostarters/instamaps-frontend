//var per controlar si hi ha hagut edicio dels elements de la capa, i si cal fer refresh
var editat = false;
var geomBusinessId = '-1';
var geomRowIndex = 0;
var numRows = 0;


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
		
//		console.debug(controlCapes);
		
		//si hem editat dades recarreguem la capa per visualitzar els canvis
		if(editat){
//			console.debug("Tanquem modal data table");
			  
	    	//Actualitzem visualitzacions de la capa on estava la geometria modificada
			var capaEdicio = $('#modal_data_table').data("capaEdicio");//controlCapes._layers[capaEdicioLeafletId];
//			console.debug("capaEdicio:");
//			console.debug(capaEdicio);
			var layerServidor = $('#modal_data_table').data("layerServidor");
			
			layerServidor.capesOrdre = capaEdicio.layer.options.zIndex.toString();
			
//			console.debug("layerServidor:");
//			console.debug(layerServidor);	
			
			//Eliminem la capa de controlCapes i mapa
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
		editat = false;
		geomBusinessId = '-1';
		geomRowIndex = 0;
		numRows = 0;
		$('#modal_data_table').off('post-body.bs.table');
		$('#modal_data_table_body #layer-data-table').bootstrapTable('destroy');
	});	
	
}

function fillModalDataTable(obj, geomBid){
	
	var columNames = [];
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
	$('#modal_data_table_title').html(obj.name.toUpperCase());	
	
	var options = obj.layer.options;
	if (obj.layer.options!=undefined && obj.layer.options.estil!=undefined){
		//Primer trobem column names
		jQuery.each(obj.layer.options.estil, function(indexEstil, estil){
			
			jQuery.each(estil.geometria.features, function(indexFeature, feature){
				
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
				
				console.debug(modeMapa);
				if(modeMapa){
					var isADrawMarker=false;
					//properties headers
					//console.debug(feature);
					
					if (options.propName!=undefined && options.propName.toString().indexOf("nom,text")==-1) {
						for(var x in options.propName){							
							var obj = {
								title: options.propName[x].toUpperCase(),
								field: options.propName[x].toLowerCase(),
								sortable: true,
								editable: {
									emptytext : '-'
								}
							}
							if (options.propName[x]=='text' || options.propName[x]=='TEXT') isADrawMarker=true;
							else isADrawMarker=false;
							columNames.push(obj);
						}		
					}
					else {
						for(var x in feature.properties){
							var obj = {
								title: x.toUpperCase(),
								field: x.toLowerCase(),
								sortable: true,
								editable: {
									emptytext : '-'
								}
							}
							if (x=='text' || x=='TEXT') isADrawMarker=true;
							else isADrawMarker=false;
							columNames.push(obj);
						}
					}
					if (isADrawMarker && feature.geometry.type=="Point"){ //Nomes pintem longitud/latitud quan és un punt
						var obj = {
								title: "latitud".toUpperCase(),
								field: "latitud".toLowerCase(),
								sortable: true
							}
						columNames.push(obj);
						 obj = {
									title: "longitud".toUpperCase(),
									field: "longitud".toLowerCase(),
									sortable: true
								}
						 columNames.push(obj);
					}
					
					//Actions
					var objActions = {
							title: window.lang.convert("ACCIONS"),
							field: 'Accions',
							formatter: 'actionFormatter',
							events: 'actionEvents'
					}	
					columNames.push(objActions);
					
				}else{
					//Taula no editable pel visor
					//properties headers
					var isADrawMarker=false;
					if (options.propName!=undefined && options.propName.toString().indexOf("nom,text")==-1) {
						for(var x in options.propName){							
							var obj = {
								title: options.propName[x].toUpperCase(),
								field: options.propName[x].toLowerCase(),
								sortable: true
							}
							if (options.propName[x]=='text' || options.propName[x]=='TEXT') isADrawMarker=true;
							else isADrawMarker=false;
							columNames.push(obj);
						}		
					}
					else {
						for(var x in feature.properties){
							var obj = {
								title: x.toUpperCase(),
								field: x.toLowerCase(),
								sortable: true								
							}
							if (x=='text' || x=='TEXT') isADrawMarker=true;
							else isADrawMarker=false;
							columNames.push(obj);
						}
					}	
					if (isADrawMarker){
						var obj = {
								title: "latitud".toUpperCase(),
								field: "latitud".toLowerCase(),
								sortable: true
							}
						columNames.push(obj);
						 obj = {
									title: "longitud".toUpperCase(),
									field: "longitud".toLowerCase(),
									sortable: true
								}
						 columNames.push(obj);
					}
					
					//Actions
					var objActions = {
							title: window.lang.convert("ACCIONS"),
							field: 'Accions',
							formatter: 'actionFormatterVisor',
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
			uid:$.cookie('uid')
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
				var resultatsMod = [];
				var resultI=0;
				jQuery.each(resultats2, function(i, result){
					var coords = result.geometryBBOX.split("#");  
					var lon = parseFloat(coords[2]);
					var lat = parseFloat(coords[1]);
					if (result.longitud==undefined)  result.longitud=lon.toFixed(5);
					if (result.latitud==undefined)  result.latitud=lat.toFixed(5);
					resultatsMod[resultI]=result;
					resultI++;
					//console.debug(result);
					
				});
				
				
				
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
				    exportTypes: ['json', 'csv', 'txt', 'excel'],
				    ignoreColumn: [columNames.length-4],
				    data: resultatsMod
				});	
				

				$('#modal_data_table').on('editable-save.bs.table', function(event, name, row, 	oldValue, param) {
					event.preventDefault();
					event.stopImmediatePropagation();					
					
					if(isValidValue(name)){
						
						var dataUpdate ={
								uid:$.cookie('uid'),
								geometryid: row["geometryid"],
								key:  name,
								newValue: row[name]
							};
//						console.debug(dataUpdate);
						updateGeometriaProperties(dataUpdate).then(function(results){
							if (results.status == "OK"){
//								console.debug(results);
								editat = true;
							}else{
								console.debug('error updateGeometriaProperties');
							}
						},function(results){
							console.debug('error updateGeometriaProperties');
						});							
					}
				});	
				
				
				
			}else{
				console.debug('error getGeometriesPropertiesLayer');
			}
		},function(results){
			console.debug('error getGeometriesPropertiesLayer');
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
			uid:$.cookie('uid'),
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
	'							<div id="layer-data-table"></div>'+
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

