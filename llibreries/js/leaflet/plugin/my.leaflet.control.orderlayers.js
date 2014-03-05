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
			delete this._layers[obj.layerIdParent]._layers[id];
		}

		this._update();
		return this;
	},	

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);
		
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

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

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

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
//				//Afegim sublayers
//				var sublayers = overlaysLayers[i]._layers;
//				for (j in sublayers) { 
//					this._addSubItem(sublayers[j]);
//				}
			}
		}
		
		L.DomUtil.create('div', 'clearfix', this._baseLayersList);
		L.DomUtil.create('div', 'clearfix', this._overlaysList);
		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

//	_addSubItem: function (obj) {
//		console.debug("AddSubitem");
//		
//		var row = L.DomUtil.create('div', 'leaflet-row');
//		
//		var label = L.DomUtil.create('label', ''),
//		    input,
//		    checked = this._map.hasLayer(obj.layer);
//
//		input = L.DomUtil.create('input');
//		input.id='input-'+obj.layer.options.businessId;
//		input.type = 'checkbox';
//		input.className = 'leaflet-control-layers-selector';
//		input.defaultChecked = checked;
//		
//		input.layerId = L.stamp(obj.layer);
//
//		L.DomEvent.on(input, 'click', this._onInputClick, this);
//
//		var name = document.createElement('span');
//		name.className = 'editable';
//		name.id=input.layerId;
//		name.innerHTML = ' ' + obj.name;
//		
//		var col = L.DomUtil.create('div', 'leaflet-input');
//		col.appendChild(input);
//		row.appendChild(col);
//		col = L.DomUtil.create('div', 'leaflet-name');
//		col.appendChild(label);
//		row.appendChild(col);
//		label.appendChild(name);		
//	},
	
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
		
		var container;
		var modeMapa = $(location).attr('href').contains('mapa');
		if(obj.overlay) {
			
			if(modeMapa){
				col = L.DomUtil.create('div', 'leaflet-conf glyphicon glyphicon-cog');
				L.DomEvent.on(col, 'click', this._showOptions, this);
				col.layerId = input.layerId;
				row.appendChild(col);
				
				var row_conf = L.DomUtil.create('div', 'leaflet-row');
				
				var row2 = L.DomUtil.create('div', 'options-conf');
				row2.id='conf-'+obj.layer.options.businessId;
				row_conf.appendChild(row2);
				
				col = L.DomUtil.create('div', 'leaflet-up glyphicon glyphicon-chevron-up');
				L.DomEvent.on(col, 'click', this._onUpClick, this);
				col.layerId = input.layerId;
				row2.appendChild(col);
				
				col = L.DomUtil.create('div', 'leaflet-down glyphicon glyphicon-chevron-down');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onDownClick, this);
				row2.appendChild(col);
				
				col = L.DomUtil.create('div', 'leaflet-remove glyphicon glyphicon-remove');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onRemoveClick, this);
				row2.appendChild(col);
				
				col = L.DomUtil.create('div', 'leaflet-download glyphicon glyphicon-download');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onDownloadClick, this);
				row2.appendChild(col);
				
			}else{
				
				col = L.DomUtil.create('div', 'leaflet-download glyphicon glyphicon-download');
				L.DomEvent.on(col, 'click', this._onDownloadClick, this);
				col.layerId = input.layerId;
				row.appendChild(col);				
			}
			container = this._overlaysList;
			
		} else {
			container = this._baseLayersList;
		}
		container.appendChild(row);
		if(modeMapa) container.appendChild(row_conf);
		
		var sublayers = obj._layers;
		for (j in sublayers) { 
//			this._addSubItem(sublayers[j]);
			modeSublayer = true;
			var sublayer = sublayers[j];
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
			input_sublayer.layerIdParent = input.layerId;
			
			L.DomEvent.on(input_sublayer, 'click', this._onInputClick, this);

			var name_sublayer = document.createElement('span');
			name_sublayer.className = 'editable';
			name_sublayer.id=input.layerId;
			name_sublayer.innerHTML = ' ' + sublayer.name;
			
			var col_sublayer = L.DomUtil.create('div', 'leaflet-input');
			col_sublayer.appendChild(input_sublayer);
			row_sublayer.appendChild(col_sublayer);
			col_sublayer = L.DomUtil.create('div', 'leaflet-name');
			col_sublayer.appendChild(label_sublayer);
			row_sublayer.appendChild(col_sublayer);
			label_sublayer.appendChild(name_sublayer);
			
			col_sublayer = L.DomUtil.create('div', 'leaflet-remove glyphicon glyphicon-remove');
			L.DomEvent.on(col_sublayer, 'click', this._onRemoveClick, this);
			col_sublayer.layerId = input_sublayer.layerId;
			col_sublayer.layerIdParent = input.layerId;
			row_sublayer.appendChild(col_sublayer);			
			
			row.appendChild(row_sublayer);
		}		
		
		updateEditableElements();
		return label;
	},
	
	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			
			if(!input.layerIdParent){
				obj = this._layers[input.layerId];				
			}else{
				obj = this._layers[input.layerIdParent]._layers[input.layerId];
			}

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
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
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
		
		var replaceLayer = null;
		for(var i=0; i < inputs.length; i++) {
			var auxLayer = this._layers[inputs[i].layerId];
			if(auxLayer.overlay && ((obj.layer.options.zIndex - 1) === auxLayer.layer.options.zIndex)) {
				replaceLayer = auxLayer;
				break;
			}
		}
		
		var newZIndex = obj.layer.options.zIndex - 1;
		if(replaceLayer) {
			
			if(typeof url('?businessid') == "string"){
				var data = {
						uid: $.cookie('uid'),
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
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
		
		var replaceLayer = null;
		for(var i=0; i < inputs.length; i++) {
			var auxLayer = this._layers[inputs[i].layerId];
			if(auxLayer.overlay && ((obj.layer.options.zIndex + 1) === auxLayer.layer.options.zIndex)) {
				replaceLayer = auxLayer;
				break;
			}
		}
		
		var newZIndex = obj.layer.options.zIndex + 1;
		if(replaceLayer) {
			
			if(typeof url('?businessid') == "string"){
				var data = {
						uid: $.cookie('uid'),
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
		
		var layerId = e.currentTarget.layerId;
		var layerIdParent = e.currentTarget.layerIdParent;
		
		if(!layerIdParent){
			var obj = this._layers[layerId];
		}else{
			var objParent = this._layers[layerIdParent];
			var obj = objParent._layers[layerId];
		}
		
		
		if(!obj.overlay) {
			return;
		}
		
		if(typeof url('?businessid') == "string"){
			var data = {
					businessId: url('?businessid'),
					uid: $.cookie('uid'),
					servidorWMSbusinessId: obj.layer.options.businessId
				};			
			
			removeServerToMap(data).then(function(results){
				if(results.status==='OK'){
					myRemoveLayer(obj);
				}else{
					return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
				}				
			},function(results){
				return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
			});				
		}		
		
	},
	_onEditNameClick: function(e) {
		
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		
		if(!obj.overlay) {
			return;
		}
	},
	_onDownloadClick: function(e) {
		
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

