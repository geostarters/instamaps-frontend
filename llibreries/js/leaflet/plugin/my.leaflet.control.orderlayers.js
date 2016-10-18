/*
 * L.Control.OrderLayers is a control to allow users to switch between different layers on the map.
 */

L.Control.OrderLayers = L.Control.Layers.extend({
	options: {
		title: 'Title',
		autoZIndex: false
	},
	
	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;
		this._groupList = [];
		this._domGroups = [];
		
		
		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},	

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this)
			.on('changeorder', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange)
		    .off('layerremove', this._onLayerChange)
			.off('changeorder', this._onLayerChange);
	},

	addOverlay: function (layer, name, overlay, groupLeafletId) {
		this._addLayer(layer, name, overlay, groupLeafletId);
		this._update();
		return this;
	},
	
	removeLayer: function (obj) {
		var id = L.stamp(obj.layer);
		if(!obj.sublayer){
			delete this._layers[id];
		}else{
//			console.debug("this delete:");
//			console.debug(this._layers);
			delete this._layers[obj.layerIdParent]._layers[id];
		}

		this._update();
		return this;
	},	

	_initLayout: function () {
		var modeMapa = ($(location).attr('href').indexOf('/mapa.html')!=-1);
		var className = 'leaflet-control-layers';
		var container = this._container = L.DomUtil.create('div', className);
		
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('div', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		if(this.options.title) {
			var title = L.DomUtil.create('h3', className + '-title editable');
			title.innerHTML = this.options.title;
			title.id='nomAplicacio';
			form.appendChild(title);
		}

		var strLayersList = 'layers-list';
//		if(modeMapa){
//			strLayersList ='layers-list-editable';
//		}
		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays '+strLayersList, form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay, groupLeafletId) {
		var id = L.stamp(layer);
		if(groupLeafletId){
			this._layers[groupLeafletId]._layers[id] = {
					layer: layer,
					name: name,
					overlay: overlay,
					sublayer: true,
					layerIdParent: groupLeafletId
				};			
		}else{
			this._layers[id] = {
					layer: layer,
					name: name,
					overlay: overlay,
					sublayer: false,
					_layers: {}
				};			
		}
		
		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},	
	
	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;
		
		var overlaysLayers = [];
		for (i in this._layers) {
			obj = this._layers[i];
			if(!obj.overlay) {
				this._addItem(obj);
			} else if(obj.layer.options.zIndex) {
				
				overlaysLayers[obj.layer.options.zIndex] = obj;
			}
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}
		
		for(i = 0; i < overlaysLayers.length; i++) {
			if(overlaysLayers[i]) {
				this._addItem(overlaysLayers[i]);
			}
		}
		
		L.DomUtil.create('div', 'clearfix', this._baseLayersList);
		L.DomUtil.create('div', 'clearfix', this._overlaysList);
		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_addItem: function (obj) {
		var row = L.DomUtil.create('div', 'leaflet-row');
		
		var label = L.DomUtil.create('label', ''),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = L.DomUtil.create('input');
			input.id='input-'+obj.layer.options.businessId;
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.className = 'editable';
		name.id=input.layerId;
		name.innerHTML = ' ' + obj.name;
		
		var col = L.DomUtil.create('div', 'leaflet-input');
		col.appendChild(input);
		row.appendChild(col);
		
		col = L.DomUtil.create('div', 'leaflet-name');
		col.appendChild(label);
		row.appendChild(col);
		label.appendChild(name);
		
		//Comptador d'elements de la capa si es tematic, dades obertes, dades externes, nou model
//		if(obj.layer.options.tipus == t_tematic || obj.layer.options.tipus == t_dades_obertes || obj.layer.options.tipus == t_json || obj.layer.options.tipus == t_url_file){
		if(obj.layer.options.tipus == t_visualitzacio || obj.layer.options.tipus == t_tematic || obj.layer.options.tipus == t_dades_obertes || obj.layer.options.tipus == t_json || obj.layer.options.tipus == t_url_file){
			var count = document.createElement('span');
			count.className = 'layer-count';
			count.id='count-'+obj.layer.options.businessId;
			count.innerHTML = ' (' + obj.layer.getLayers().length + ')';		
			label.appendChild(count);
		}
		
		var container;
		var modeMapa = ($(location).attr('href').indexOf('/mapa.html')!=-1);
		if(obj.overlay) {
			
			if(modeMapa){
				col = L.DomUtil.create('div', 'leaflet-conf glyphicon glyphicon-cog opcio-conf');
				L.DomEvent.on(col, 'click', this._showOptions, this);
				col.layerId = input.layerId;
				row.appendChild(col);
				
//				var row_conf = L.DomUtil.create('div', 'leaflet-row');
				
//				var row2 = L.DomUtil.create('div', 'options-conf');
//				row2.id='conf-'+obj.layer.options.businessId;
////				row_conf.appendChild(row2);
//				col.appendChild(row2);
				
				//Data Table: Si es capa origen i prove de fitxer (te source)
				if(obj.layer.options.source){
					col = L.DomUtil.create('div', 'data-table-'+obj.layer.options.businessId+' leaflet-data-table glyphicon glyphicon-list-alt');
					col.layerId = input.layerId;
					L.DomEvent.on(col, 'click', this._onOpenDataTable, this);
					row.appendChild(col);					
				}		
				
				//Tipus WMS no admet decarrega
				if(obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) == -1 && obj.layer.options.tipus.indexOf(t_geojsonvt) == -1){
				
					col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-download glyphicon glyphicon-save subopcio-conf');
					col.layerId = input.layerId;
					L.DomEvent.on(col, 'click', this._onDownloadClick, this);
					row.appendChild(col);					
				}
				
				if(obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) != -1){
					
					col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-trans glyphicon glyphicon-adjust subopcio-conf');
					col.layerId = input.layerId;
					L.DomEvent.on(col, 'click', this._onTransparenciaClick, this);
					row.appendChild(col);	
					
					$(col).tooltip({
						placement : 'bottom',
						container : 'body',
						title : window.lang.translate("Transparència")
					});
					
				}
				
				
				
				
				col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-remove glyphicon glyphicon-remove subopcio-conf');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onRemoveClick, this);
				row.appendChild(col);	
				
				col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-down glyphicon glyphicon-chevron-down subopcio-conf');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onDownClick, this);
				row.appendChild(col);	
				
				col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-up glyphicon glyphicon-chevron-up subopcio-conf');
				L.DomEvent.on(col, 'click', this._onUpClick, this);
				col.layerId = input.layerId;
				row.appendChild(col);				
				
				
				
				
				
				
				
			}else{
				
				//Visualitzem taula de dades pero sense mode edicio
				//Data Table: Si es capa origen i prove de fitxer (te source)
				if(obj.layer.options.source){
					col = L.DomUtil.create('div', 'data-table-'+obj.layer.options.businessId+' leaflet-data-table glyphicon glyphicon-list-alt');
					col.layerId = input.layerId;
					L.DomEvent.on(col, 'click', this._onOpenDataTable, this);
					row.appendChild(col);					
				}				
				
				
				//Tipus WMS no admet decarrega i mirem configuracio descarregable de les capes
				if(obj.layer.options.tipus.indexOf(t_geojsonvt) == -1 && obj.layer.options.tipus.indexOf(t_wms) == -1 && 
						!jQuery.isEmptyObject(downloadableData) && downloadableData[obj.layer.options.businessId] && downloadableData[obj.layer.options.businessId]!=undefined &&
						downloadableData[obj.layer.options.businessId][0].chck){
					col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-download-visor glyphicon glyphicon-save');
					L.DomEvent.on(col, 'click', this._onDownloadClick, this);
					col.layerId = input.layerId;
					row.appendChild(col);	
					
					$(col).tooltip({
						placement : 'left',
						container : 'body',
						title : window.lang.translate("Descàrrega")
					});
				}
				
				
				
				
				
				if(obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) != -1){
				
					col = L.DomUtil.create('div', 'conf-'+obj.layer.options.businessId+' leaflet-trans-visor glyphicon glyphicon-adjust');
					col.layerId = input.layerId;
					L.DomEvent.on(col, 'click', this._onTransparenciaClick, this);
					row.appendChild(col);	
					
					$(col).tooltip({
						placement : 'bottom',
						container : 'body',
						title : window.lang.translate("Transparència")
					});
					
				}
				
				
				
				
				
				
				
				
				
				
				
				
			}
			container = this._overlaysList;
			
		} else {
			container = this._baseLayersList;
		}
		container.appendChild(row);
//		if(modeMapa) {
//			//container.appendChild(row_conf);
//			row.appendChild(row2);
//		}
		
		var sublayers = obj._layers;
		for (j in sublayers) { 
			var row_sublayer = this._createSubItem(sublayers[j],input.layerId, modeMapa);
			row.appendChild(row_sublayer);
			
		}		
		
		//Afegim tooltips
		$(".data-table-"+obj.layer.options.businessId+".leaflet-data-table").tooltip({
			placement : 'bottom',
			container : 'body',
			title : window.lang.translate("dades")
		});
		
		$(".opcio-conf").tooltip({
			placement : 'bottom',
			container : 'body',
			title : window.lang.translate("opcions")
		});		
		
		if(modeMapa) updateEditableElements();
		map.fireEvent('addItemFinish'); 
		return label;
	},
	
	_createSubItem: function(sublayer,layerIdParent, modeMapa){
		
		var row_sublayer = L.DomUtil.create('div', 'leaflet-row leaflet-subrow');
		
		var label_sublayer = L.DomUtil.create('label', ''),
		    input_sublayer,
		    checked = this._map.hasLayer(sublayer.layer);

		input_sublayer = L.DomUtil.create('input');
		input_sublayer.id='input-'+sublayer.layer.options.businessId;
		input_sublayer.type = 'checkbox';
		input_sublayer.className = 'leaflet-control-layers-selector';
		input_sublayer.defaultChecked = checked;

		input_sublayer.layerId = L.stamp(sublayer.layer);
		input_sublayer.layerIdParent = layerIdParent; //input.layerId;
		
		L.DomEvent.on(input_sublayer, 'click', this._onInputClick, this);

		var name_sublayer = document.createElement('span');
		name_sublayer.className = 'editable';
		name_sublayer.idParent=layerIdParent;
		name_sublayer.id=L.stamp(sublayer.layer);
		name_sublayer.innerHTML = ' ' + sublayer.name;
		
		var col_sublayer = L.DomUtil.create('div', 'leaflet-input');
		col_sublayer.appendChild(input_sublayer);
		row_sublayer.appendChild(col_sublayer);
		col_sublayer = L.DomUtil.create('div', 'leaflet-name');
		col_sublayer.appendChild(label_sublayer);
		row_sublayer.appendChild(col_sublayer);
		label_sublayer.appendChild(name_sublayer);
		
		if(modeMapa){
			col_sublayer = L.DomUtil.create('div', 'leaflet-remove glyphicon glyphicon-remove opcio-conf');
			L.DomEvent.on(col_sublayer, 'click', this._onRemoveClick, this);
			col_sublayer.layerId = input_sublayer.layerId;
			col_sublayer.layerIdParent = layerIdParent;
			row_sublayer.appendChild(col_sublayer);				
		}
		return row_sublayer;
		
	},
	
	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;
		var checkHeat = false;
		var id, parentId;
		
		var currentbid = arguments[0].currentTarget.id.replace("input-", "");
		
		//tractament en cas heatmap
		if(arguments[0].currentTarget.layerIdParent){
			id = arguments[0].currentTarget.layerId;
			parentId = arguments[0].currentTarget.layerIdParent;
			checkHeat = isHeat(controlCapes._layers[parentId]._layers[id]) && arguments[0].currentTarget.value == "on";
		}
		
		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			
			if(!input.layerIdParent){
				obj = this._layers[input.layerId];				
			}else{
				obj = this._layers[input.layerIdParent]._layers[input.layerId];
			}
			
			//Si la capa clickada �s heatmap i s'ha d'activar, i la que estem tractant tb, no s'ha de mostrar
			if(isHeat(obj) && checkHeat && obj.layer._leaflet_id != id ){
				input.checked = false;
			}

			//Afegir
			if (input.checked && !this._map.hasLayer(obj.layer)) {

				this._map.addLayer(obj.layer);	
				
				if (obj.layer.options.tipus.indexOf(t_vis_wms)!= -1){
					
					var optionsUtfGrid = {
				            layers : obj.layer.options.businessId,
				            crs : L.CRS.EPSG4326,
				            srs: "EPSG:4326",
				            transparent : true,
				            format : 'utfgrid',
				            nom : obj.layer.options.nom + " utfgrid",
					    	tipus: obj.layer.options.tipus,
					    	businessId: obj.layer.options.businessId         
					}
					var utfGrid = createUtfGridLayer(obj.layer._url,optionsUtfGrid);
					this._map.addLayer(utfGrid);
					obj.layer.options.utfGridLeafletId = utfGrid._leaflet_id;
					
				}
				//Si hem activat capa de tipus tematic categories, mostrem la seva llegenda
				
				
				if(currentbid == obj.layer.options.businessId && obj.layer.options.tipusRang 
						&& obj.layer.options.tipusRang==tem_clasic){
					thisLoadMapLegendEdicio(obj.layer);
				}
				
			} else if (!input.checked && this._map.hasLayer(obj.layer)) {

				//Si es vis_wms, hem d'eliminar tb la capa utfgrid
				if(obj.layer.options.tipus.indexOf(t_vis_wms)!= -1){
					var utfGridLayer = this._map._layers[obj.layer.options.utfGridLeafletId];
					this._map.removeLayer(utfGridLayer);
				}
				this._map.removeLayer(obj.layer);
				
				//Si hem desactivat capa de tipus tematic categories, mostrem la seva llegenda
				if(currentbid == obj.layer.options.businessId && obj.layer.options.tipusRang 
						&& obj.layer.options.tipusRang==tem_clasic){
					thisEmptyMapLegendEdicio(obj.layer);
				}
			}
			
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},	
	
	_showOptions: function(e){
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		//console.debug('openConfig:'+obj.layer.options.businessId);
		showConfOptions(obj.layer.options.businessId);
		//jQuery(".conf-"+obj.layer.options.businessId+"").show();
	},
	_onUpClick: function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
		
		var replaceLayer = null;
		for(var i=0; i < inputs.length; i++) {
			if(!inputs[i].layerIdParent){
				var auxLayer = this._layers[inputs[i].layerId];
				if(auxLayer.overlay && ((obj.layer.options.zIndex - 1) === auxLayer.layer.options.zIndex)) {
					replaceLayer = auxLayer;
					break;
				}				
			}
		}
		
		var newZIndex = obj.layer.options.zIndex - 1;
		if(replaceLayer) {
			
			if(typeof url('?businessid') == "string"){
				var data = {
						uid: Cookies.get('uid'),
						businessId: url('?businessid'),
						servidorWMSbusinessId: obj.layer.options.businessId +','+replaceLayer.layer.options.businessId,
			            order: newZIndex+','+ (newZIndex+1)
					};			
				
				updateServersOrderToMap(data).then(function(results){
					if(results.status!='OK')
						return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
				},function(results){
					return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
				});				
			}
			
			obj.layer.options.zIndex = newZIndex;
			replaceLayer.layer.options.zIndex = newZIndex+1;
			
			this._map.fire('changeorder', obj, this);
		}
	},
	
	_onDownClick: function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
		
		var replaceLayer = null;
		for(var i=0; i < inputs.length; i++) {
			if(!inputs[i].layerIdParent){
				var auxLayer = this._layers[inputs[i].layerId];
				if(auxLayer.overlay && ((obj.layer.options.zIndex + 1) === auxLayer.layer.options.zIndex)) {
					replaceLayer = auxLayer;
					break;
				}				
			}
		}
		
		var newZIndex = obj.layer.options.zIndex + 1;
		if(replaceLayer) {
			
			if(typeof url('?businessid') == "string"){
				var data = {
						uid: Cookies.get('uid'),
						businessId: url('?businessid'),
						servidorWMSbusinessId: obj.layer.options.businessId +','+replaceLayer.layer.options.businessId,
			            order: newZIndex+','+ (newZIndex-1)
					};			
				
				updateServersOrderToMap(data).then(function(results){
					if(results.status!='OK')
						return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
				},function(results){
					return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
				});				
			}
			
			obj.layer.options.zIndex = newZIndex;
			replaceLayer.layer.options.zIndex = newZIndex-1;
			
			this._map.fire('changeorder', obj, this);
		}
	},
	_onRemoveClick: function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var layerIdParent = e.currentTarget.layerIdParent;
		var lbusinessId = [];
		if(!layerIdParent){
			var obj = this._layers[layerId];
			lbusinessId.push(obj.layer.options.businessId);
			for(i in obj._layers){
				lbusinessId.push(obj._layers[i].layer.options.businessId);
			}
		}else{
			var objParent = this._layers[layerIdParent];
			var obj = objParent._layers[layerId];
			lbusinessId.push(obj.layer.options.businessId);
		}
		
		
		if(!obj.overlay) {
			return;
		}
		
		if(typeof url('?businessid') == "string"){
			var data = {
					businessId: url('?businessid'),
					uid: Cookies.get('uid'),
					servidorWMSbusinessId: lbusinessId.toString()
				};			
			
			$('#dialog_delete_capa').modal('show');
			$('#dialog_delete_capa #nom_capa_delete').text(obj.layer.options.nom);
			$('#dialog_delete_capa .btn-danger').data("data", data);
			$('#dialog_delete_capa .btn-danger').data("obj", obj);	
			
//			removeServerToMap(data).then(function(results){
//				if(results.status==='OK'){
//					myRemoveLayer(obj);
//					deleteServerRemoved(data).then(function(results){
//						//se borran del listado de servidores
//					});
//				}else{
//					return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
//				}				
//			},function(results){
//				return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
//			});				
		}		
		
	},
	_onEditNameClick: function(e) {
		
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
	},
	
	_onOpenDataTable: function(e) {
		

		$('.tooltip').hide();
		
		$('#modal_data_table').modal('show');
		
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		download_layer = obj;		
//		console.debug(obj);
		
		fillModalDataTable(obj);
	},	
	
	
	_onTransparenciaClick:function(e){
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];		
		var op =obj.layer.options.opacity;
		if(!op){op=1;}else{			
			if(op==0){op=1}else{			
				op=(parseFloat(op)-0.25)				
			}				
		}		
		obj.layer.setOpacity(op);
		
		if( getModeMapa()){
				var data = {
					 	businessId: obj.layer.options.businessId, //url('?businessid') 
					 	uid: Cookies.get('uid'),
					 	serverName: obj.layer.options.nom +"##"+op
					 }
				
				updateServidorWMSName(data).then(function(results){
					if(results.status==='OK'){
						//console.debug(results);
					}
				});	
				
		}
		
	},
	
	_onDownloadClick: function(e) {
		
//		console.debug("_onDownloadClick");
		
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		download_layer = obj;
		
		if(obj.layer.options.tipusRang && (obj.layer.options.tipusRang == tem_cluster || obj.layer.options.tipusRang == tem_heatmap )){
			$('#modal-body-download-not-available').show();
			$('#modal-body-download-error').hide();
			$('#modal-body-download').hide();
			$('#modal_download_layer .modal-footer').show();
			$('#bt_download_tancar').show();
			$('#bt_download_accept').hide();			
			$('#modal_download_layer').modal('show');
		}else{
			$('#modal-body-download-not-available').hide();
			$('#modal-body-download-error').hide();
			$('#modal-body-download').show();
			$('#modal_download_layer .modal-footer').show();
			$('#bt_download_tancar').hide();
			$('#bt_download_accept').show();			
			$('#modal_download_layer').modal('show');
		}
	},
	hide: function() {
		this._container.style.display = 'none';
	},
	
	show: function() {
		this._container.style.display = '';
	}
});

L.control.orderlayers = function (baseLayers, overlays, options) {
	return new L.Control.OrderLayers(baseLayers, overlays, options);
};

function isHeat(obj){
	return (obj.layer.options.tipusRang && obj.layer.options.tipusRang.indexOf('heatmap')!=-1);
}

function showConfOptions(businessId){
	jQuery(".conf-"+businessId+"").toggle("fast");
	addTooltipsConfOptions(businessId);
}

function updateCheckStyle(){
	$('.leaflet-input input').iCheck({
	    checkboxClass: 'icheckbox_flat-blue',
	    radioClass: 'iradio_flat-blue'
	});		
}

function thisFillModalDataTable(obj){
	fillModalDataTable(obj);
}

function thisLoadMapLegendEdicio(obj){
	loadMapLegendEdicio(obj);
}


function thisEmptyMapLegendEdicio(obj){
	emptyMapLegendEdicio(obj);
}
