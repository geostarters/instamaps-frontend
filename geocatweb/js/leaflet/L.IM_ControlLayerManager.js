L.Control.OrderLayers = L.Control.Layers.extend({
	options : {
		collapsed : true,
		position : 'topright',
		title : 'Title',
		autoZIndex : true,
		autoUpdate: true
	},

	initialize : function(baseLayers, groupedOverlays, options) {
		var i, j;
		
		L.Util.setOptions(this, options);
		
		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;
		this._groupList = [];
		this._domGroups = [];
		this._socInstamapsVell="_socVisorVellInstamaps_";
		this._mapConfig = options.mapConfig;
		
		for (i in baseLayers) {
			for ( var j in baseLayers[i].layers) {
				this._addLayer(baseLayers[i].layers[j], j,
					baseLayers[i], false);
			}
		}

		for (i in groupedOverlays) {
			for ( var j in groupedOverlays[i].layers) {
				this._addLayer(groupedOverlays[i].layers[j], j, true,
					null, groupedOverlays[i]);
			}
		}
	},

	onAdd : function(map) {
		this._initLayout();
		this._update();
		map.on('layeradd', this._onLayerChange, this).on('layerremove', this._onLayerChange, this);
		return this._container;
	},

	onRemove : function(map) {
		map.off('layeradd', this._onLayerChange).off('layerremove', this._onLayerChange);
	},

	addBaseLayer : function(layer, name, group) {
		this._addLayer(layer, name, group, false);
		this._update();
		return this;
	},

	addOverlay : function(layer, name, overlay, groupLeafletId) {
		this._addLayer(layer, name, overlay, groupLeafletId);
		this._update();
		return this;
	},
	
	removeLayer : function(obj) {
		var id = L.stamp(obj.layer);
		if (!obj.sublayer) {
			delete this._layers[id];
		} else {
			delete this._layers[obj.layerIdParent]._layers[id];
		}

		var _thereIs = false;
		for (layer in this._layers) {
			if (this._layers[layer].layer.options.tipus && this._layers[layer].layer.options.tipus.indexOf(t_wms) != -1) {
				if (this._layers[layer].layer.options.wmstime == true) {
					_thereIs = true;
				}
			}
		}

		showTimeControl(_thereIs);

		this._update();
		if(estatMapa3D){mapaVista3D.actualitzaVistaOverlays(obj.layer.options,"remove",true);}
		return this;
	},

	getCountLayers:function(){
		var i=0;
		for (layer in this._layers) {
			i=i+1;
			for (sublayer in this._layers[layer]._layers) {
				i=i+1;
			}
		}
		return i;
	},
	
	getLayersFromGroupId : function(groupId, groupName) {
		var resp_Layer = [];
		for (layer in this._layers) {
			if (this._layers[layer].layer.options.group.groupName == groupName
				&& this._layers[layer].layer.options.group.id == groupId) {
				resp_Layer.push(this._layers[layer]);
			}
		}
		return resp_Layer;
	},

	updateTreeGroupLayers : function(groupId, groupName, businessId, z_order, expanded) {
		var dfd = $.Deferred();
		try{
			this._groupList[groupId].groupName = groupName;
			this._groupList[groupId].name = groupName;
			this._groupList[groupId].id = groupId;
			this._groupList[groupId].expanded = expanded;
	
			for (layer in this._layers) {
				if (this._layers[layer].layer.options.group
					&& this._layers[layer].layer.options.businessId == businessId) {
					this._layers[layer].layer.options.group.name = groupName;
					this._layers[layer].layer.options.group.groupName = groupName;
					this._layers[layer].layer.options.group.id = groupId;
					this._layers[layer].layer.options.group.z_order = z_order;
					this._layers[layer].layer.options.group.expanded = expanded;
					this._layers[layer].layer.options.zIndex = z_order;
					this._layers[layer].layer.setZIndex(parseInt(z_order)+1);
					map.eachLayer(function(layer) {
						if (layer.options
							&& layer.options.businessId == businessId) {
							try {
								layer.bringToFront();
							} catch (Err) {
							}
						}
					});
					dfd.resolve(this._layers[layer].layer);
				}
			}
		}catch(Err){
			dfd.reject(Err);
			console.debug(Err);
		}
		return dfd.promise();
	},

	updateGroupName : function(oldName, newName, groupId) {
		var resp_Layer = [];
		for (group in this._groupList) {
			if (this._groupList[group].groupName == oldName
				&& this._groupList[group].id == groupId) {
				this._groupList[group].groupName = newName;
				this._groupList[group].name = newName;

				for (layer in this._layers) {
					if (this._layers[layer].layer.options.group
						&& this._layers[layer].layer.options.group.name == oldName
						&& this._layers[layer].layer.options.group.id == groupId) {
						this._layers[layer].layer.options.group.name = newName;
						this._layers[layer].layer.options.group.groupName = newName;
						resp_Layer.push(this._layers[layer].layer);
					}
				}
			}
		}
		this._update();
		return resp_Layer;
	},

	removeGroup : function(groupName, groupId) {
		if (groupName) {
			for (group in this._groupList) {
				if (this._groupList[group].groupName == groupName
						&& this._groupList[group].id == groupId) {
					for (layer in this._layers) {
						if (this._layers[layer].layer.options.group
							&& this._layers[layer].layer.options.group.groupName == groupName
							&& this._layers[layer].layer.options.group.id == groupId) {
							delete this._layers[layer];
						}
					}
					delete this._groupList[group];
					this._update();
					break;
				}
			}
		}
	},

	_initLayout : function() {
		var modeMapa = ($(location).attr('href').indexOf('/mapa.html') != -1);
		var className = 'leaflet-control-layers', 
		container = this._container = L.DomUtil.create('div', className);

		// Makes this work on IE10 Touch devices by stopping it from
		// firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}
		var section = document.createElement('section');
		section.className = 'ac-container ' + className + '-list';
		
		var spiner = this._spiner = L.DomUtil.create('div', className + '-spiner');
		
		spiner.innerHTML = "<i class='fa fa-refresh fa-spin fa-fw margin-bottom'></i>"+
		"<span lang='ca'>Carregant, esperi si us plau...</span>";
		
		section.appendChild(spiner);
		
		var form = this._form = L.DomUtil.create('div', className + '-list');

		if (this.options.title) {
			var title = L.DomUtil.create('h3', className + '-title editable');
			title.innerHTML = this.options.title;
			title.id = 'nomAplicacio';
			form.appendChild(title);
		}

		section.appendChild(form);

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent.on(container, 'mouseover', this._expand,
					this).on(container, 'mouseout', this._collapse,
					this);
			}
			var link = this._layersLink = L.DomUtil.create('a',
				className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent.on(link, 'click', L.DomEvent.stop).on(link,
					'click', this._expand, this);
			} else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility

		} else {
			this._expand();
		}

		var strLayersList = 'layers-list';
		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);

		this._overlaysList = L.DomUtil.create('ol', className + '-overlays', form);

		if (getModeMapa()) {
			this._addButton = L.DomUtil.create('div', 'addVerd', form);
			L.DomEvent.on(this._addButton, 'click',
				this._addGroupFromScratch, this);

			$(this._addButton).tooltip({
				placement : 'left',
				container : 'body',
				title : window.lang.translate("Nou grup")
			});
		}

		container.appendChild(section);

		// process options of ac-container css class - to
		// options.container_width and options.container_maxHeight
		for (var c = 0; c < (containers = container
		  .getElementsByClassName('ac-container')).length; c++) {
			if (this.options.container_width) {
				containers[c].style.width = this.options.container_width;
			}

			// set the max-height of control to y value of map object
			this._default_maxHeight = this.options.container_maxHeight ? this.options.container_maxHeight
				: (this._map._size.y - 70);
		}
		window.onresize = this._on_resize_window.bind(this);
	},

	_on_resize_window : function() {

	},

	// remove the px from a css value and convert to a int
	_removePxToInt : function(value) {
		if (typeof (value) == "number") {
			return value;
		} else {
			return parseInt(value.replace("px", ""));
		}
	},

	_socVisorInstamaps:function(){
		var self = this;
		var hoSoc=false;
		if (self._mapConfig===undefined) self._mapConfig=mapConfig;
		if(self._mapConfig.tipusAplicacioId==1 && !getModeMapa()){
			hoSoc=true;
		}
		return hoSoc;
	},
	
	_createGroupFromScratch : function(position) {
		var pos = this._groupList.length;
		var posTXT;
		var genericName=window.lang.translate('Capes');
		var genericPos="";

		pos==0?genericPos="":genericPos=pos;

		this._socVisorInstamaps()?genericName=this._socInstamapsVell:genericName=genericName;

		if (position == 1 && pos > 0) { // estic afegint una
			// capa però ja existeix
			// un grup
			return this.getActiveGroup();
		} else {
			var group = {
				"groupName" : genericName+" "+ genericPos,
				"name" : genericName+" "+ genericPos,
				"id" : pos,
				"expanded" : true
			};
			this._groupList.push(group);
			return group;
		}
	},

	getActiveGroup : function() {
		var groupLast = this._groupList[this._groupList.length - 1];
		var notExpanded = false;
		if (groupLast.expanded==true || groupLast.expanded=="true") {
			return groupLast;
		} else {
			for (j=0; j < this._groupList.length;j++ ){
				var _gr=this._groupList[j];
				if (_gr.expanded==true || _gr.expanded=="true") {
					notExpanded = true;
					return _gr;
				}
			}
		}
		if (!notExpanded) {
			return groupLast;
		}
	},

	getGroupWhereIBelong : function() {
		var pos = this._groupList.length;
		if (pos > 0) { // estic afegint una capa però ja existeix un
			// grup
			return this._groupList[this._groupList.length - 1];
		} else {
			return null;
		}
	},

	_addGroupFromScratch : function() {
		var container = this._overlaysList;
		var obj = {};
		var group = this._createGroupFromScratch(0);

		obj.group = group;
		this._addGroup(container, obj, null);
		if (getModeMapa()) {
			updateEditableElements();
			refreshSortablesElements();
		}
	},

	_addGroupFromObject : function(group) {
		if (group) {
			var container = this._overlaysList;
			var obj = {};
			obj.group = group;
			var trobat = false;
			for (g in this._groupList) {
				if (this._groupList[g].id == group.id) {
					trobat = true;
					break;
				}
			}
			if (!trobat) {
				this._groupList.push(obj.group);
			}
			this._addGroup(container, obj, null);
		}
	},

	_addGroup : function(container, _obj, _menu_item_checkbox) {
		var _id;
		var obj;
		if (_obj.group) {
			_id = _obj.group.id;
			obj = _obj;
		} else if (_obj.layer) {
			obj = _obj.layer.options;
			try{
			_id = _obj.layer.options.group.id;
			}catch(Err){

			_id= this._domGroups.length -1;
			}
		} else {
			_id = null;
		}
		if (_id >= 0) {
			var groupContainer = this._domGroups[_id];
			if (!groupContainer) {
				groupContainer = document.createElement('div');
				groupContainer.id = 'leaflet-control-accordion-layers-'+ _id;
				groupContainer.className = 'leaflet-control-accordion-layers';
				// verify if group is expanded
				var s_expanded = obj.group.expanded ? ' checked = "true" ': '';
				// verify if type is exclusive
				var s_type_exclusive = this.options.exclusive ? ' type="radio" '
					: ' type="checkbox" ';
				inputElement = '<input id="ac' + _id
					+ '" name="accordion-' + _id
					+ '" class="menu expanded_input" ' + s_expanded
					+ s_type_exclusive + '/>';
				inputLabel = document.createElement('label');
				var _for = document.createAttribute('for');
				_for.value = "ac" + _id;
				inputLabel.setAttributeNode(_for);

				var spanGroup = document.createElement('span');
				spanGroup.innerHTML = obj.group.name;
				var classExpanded = 'glyphicon glyphicon-triangle-bottom label_gl';
				if (!obj.group.expanded) {
					classExpanded = 'glyphicon glyphicon-triangle-right label_gl';
				}
				inputLabel.id = 'lbl_ac_' + _id;

				if(obj.group.name.indexOf(this._socInstamapsVell)==-1){
					inputLabel.className = 'label_ac';
				}else{
					inputLabel.className = 'label_ac_novisible';
				}

				var _i = document.createElement('i');
				_i.id = '_i_' + _id;
				_i.className = classExpanded
				inputLabel.appendChild(_i);
					L.DomEvent.on(inputLabel, 'click', this._onExpandGroup,this);
				spanGroup.className = 'span_ac editable';
				spanGroup.id = 'ac' + _id;
				spanGroup.groupId = _id;
				spanGroup.groupName = obj.group.name;
				inputLabel.appendChild(spanGroup);

				if (getModeMapa()) {
					var col = L.DomUtil.create('span', 
						'tema_verd glyphicon glyphicon-remove group-conf');
					col.id = 'mv-' + _id;
					col.groupId = _id;
					col.groupName = obj.group.name;
					L.DomEvent.on(col, 'click', this._onRemoveGroup,this);
					inputLabel.appendChild(col);

					$(col).tooltip({
						placement : 'left',
						container : 'body',
						title : window.lang.translate("Esborrar grup")
					});

					var col = L.DomUtil.create('span',
						'tema_verd_move glyphicon glyphicon-move group-conf');
					col.id = 'rv-' + _id;
					col.groupName = obj.group.name;
					col.groupId = _id;
					inputLabel.appendChild(col);
					$(col).tooltip({
						placement : 'left',
						container : 'body',
						title : window.lang.translate("Moure grup")
					});
				}

				article = document.createElement('ol');
				article.className = 'ac-large';
				if (_menu_item_checkbox) {
					article.appendChild(_menu_item_checkbox);
				}

				// process options of ac-large css class - to
				// options.group_maxHeight property
				if (this.options.group_maxHeight) {
					article.style.maxHeight = this.options.group_maxHeight;
				}

				groupContainer.innerHTML = inputElement;
				groupContainer.appendChild(inputLabel);
				groupContainer.appendChild(article);

				var supraLI = document.createElement('li');
				supraLI.appendChild(groupContainer);

				container.appendChild(supraLI);

				this._domGroups[_id] = groupContainer;
			} else {
				if (_menu_item_checkbox) {
					groupContainer.lastElementChild.appendChild(_menu_item_checkbox);
				}
			}
		}
	},

	_addLayer : function(layer, name, overlay, groupLeafletId) {
		var id = L.Util.stamp(layer);
		if (groupLeafletId) {
			this._layers[groupLeafletId]._layers[id] = {
				layer : layer,
				name : name,
				overlay : overlay,
				sublayer : true,
				layerIdParent : groupLeafletId
			};
		} else {
			this._layers[id] = {
				layer : layer,
				name : name,
				overlay : overlay,
				sublayer : false,
				_layers : {}
			};
		}
		var group = layer.options.group;
		var _heCreat = false;
		var _heCreatFromScratch=false;
		if (!group) {
			group = this._createGroupFromScratch(1);
			_heCreat = true;
			_heCreatFromScratch=true;
		}
		var groupId;
		if (group) {
			//var groupId = this._groupList.indexOf(group);
			if (undefined !=group.id) {
				groupId = group.id;
				var trobat = false;
				for (g in this._groupList) {
					if (this._groupList[g].id == group.id) {
						trobat = true;
						break;
					}
				}
				if (!trobat) {
					this._groupList.push(group);
				}

			}
			// if not find the group search for the name
			/*if (groupId === -1) {
				for (g in this._groupList) {
					if (this._groupList[g].groupName == group.groupName) {
						groupId = g;
						break;
					}
				}
			}*/

			if (groupId === -1) {
				groupId = this._groupList.push(group) - 1;
			}

			
			if (this._layers[id]) {
				this._layers[id].layer.options.group = {
					name : group.groupName,
					groupName : group.groupName,
					id : groupId,
					z_order : this._layers[id].layer.options.zIndex,
					expanded : group.expanded
				};

				if (_heCreat) {
					if (getModeMapa()) {
						if(_heCreatFromScratch){
							var data = {
								mapBusinessId: url('?businessid'),
								businessId : this._layers[id].layer.options.businessId, // url('?businessid')
								uid : Cookies.get('uid'),
								options : JSON.stringify(this._layers[id].layer.options.group)
							};
							// Ara desactivat
							updateGroupsLayerGroup(data, null);
						}
					}
				}
			}
		}
		if (this.options.autoZIndex && layer.setZIndex && !layer.options.hasOwnProperty("zIndex")) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
		else if(layer.options.hasOwnProperty("zIndex"))
		{

			this._lastZIndex = (layer.zIndex > this._lastZIndex) ? layer.zIndex : this._lastZIndex;

		}
	},

	_update : function(makeUpdate) {
		var self = this;
		var redraw = makeUpdate || self.options.autoUpdate;
		if(redraw){
			if (!self._container) {
				return;
			}

			self._domGroupsTMP = self._groupList;
			self._groupList = [];
			self._baseLayersList.innerHTML = '';
			self._overlaysList.innerHTML = '';
			self._domGroups.length = 0;

			self._domGroupsTMP = sortByKey(self._domGroupsTMP, "id");
			self._groupList = sortByKey(self._groupList, "id");			
			
			self._domGroupsTMP.forEach(function(item, index, array) {
				self._addGroupFromObject(item);
			});

			var baseLayersPresent = false, overlaysPresent = false, i, obj;
			var layerArray=[];
			for (i in self._layers) {
				layerArray.push(self._layers[i]);
			}
			layerArray = sortByKeyPath(layerArray, "zIndex");
			
			for (i in layerArray) {
				obj = layerArray[i];
				self._addItem(obj);
				overlaysPresent = overlaysPresent || obj.overlay;
				baseLayersPresent = baseLayersPresent || !obj.overlay;
			}
			
			self._hideSpiner();
			
			map.fire('onRedrawLegend', self._mapConfig);
			$.publish('onRedrawLegend', self._mapConfig);
		}
	},
	
	forceUpdate: function(autoUpdate){
		if(autoUpdate){
			this.options.autoUpdate = true;
		}
		this._update(true);
	},

	_diferences : function(a1, a2) {
		var a = [], diff = [];
		for (var i = 0; i < a1.length; i++)
			a[a1[i]] = true;
		for (var i = 0; i < a2.length; i++)
			if (a[a2[i]])
				delete a[a2[i]];
			else
				a[a2[i]] = true;
		for ( var k in a)
			diff.push(parseInt(k));
		return diff;
	},

	_onLayerChange : function(e) {
		var obj = this._layers[L.Util.stamp(e.layer)];
		if (!obj) {
			return;
		}
		if (!this._handlingClick) {
			this._update();
		}
		//parece que esta parte de código no se usa.
		var type = obj.overlay ? (e.type === 'layeradd' ? 'overlayadd'
			: 'overlayremove')
			: (e.type === 'layeradd' ? 'baselayerchange' : null);
		if (type) {
			this._map.fire(type, obj);					
		}
	},

	_createRadioElement : function(name, checked) {
		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="'
			+ name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';
		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;
		return radioFragment.firstChild;
	},

	_addItem : function(obj) {
		var _menu_item_checkbox = document.createElement('li'), 
		input, checked = this._map.hasLayer(obj.layer), 
		container;	
		
		var _leaflet_input = document.createElement('div');
		if (obj.overlay) {
			_menu_item_checkbox.className = "leaflet-row";
			_menu_item_checkbox.id = 'LI-'+ obj.layer.options.businessId;

			input = document.createElement('input');
			input.id = 'input-' + obj.layer.options.businessId;
			input.type = 'checkbox';
			input.className = 'checkbox_styled hide leaflet-control-layers-selector';
			
			if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) != -1) {
				if (obj.layer.options.wmstime == true) {
					input.className = 'checkbox_time hide leaflet-control-layers-selector';
				}
			}
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		_leaflet_input.className = "leaflet-input";
		input.layerId = L.Util.stamp(obj.layer);
		L.DomEvent.on(input, 'click', this._onInputClick, this);
		var label_for = document.createElement('label');
		var _for = document.createAttribute('for');
		_for.value = 'input-' + obj.layer.options.businessId;
		label_for.setAttributeNode(_for);
		_leaflet_input.appendChild(input);
		_leaflet_input.appendChild(label_for);

		var _leaflet_name = document.createElement('div');
		_leaflet_name.className = 'leaflet-name';
		var _label_buit = document.createElement('label');
		var nomCapa = document.createElement('span');

		
		var layerName=obj.name;			
    	(layerName.length > 71)?layerName=layerName.substring(0,71)+"...":layerName;		
 
		nomCapa.innerHTML = ' ' + layerName;
		//nomCapa.innerHTML = ' ' + obj.name;
		nomCapa.className = 'editable';
		nomCapa.id = input.layerId;

		if(obj.layer.error){
			_label_buit.className = 'error';
		}
		
		_label_buit.appendChild(nomCapa);

		if (obj.layer.options.tipus == t_visualitzacio
				|| obj.layer.options.tipus == t_tematic
				|| obj.layer.options.tipus == t_dades_obertes
				|| obj.layer.options.tipus == t_json
				|| obj.layer.options.tipus == t_url_file) {
			var count = document.createElement('span');
			count.className = 'layer-count';
			count.id = 'count-' + obj.layer.options.businessId;
			count.innerHTML = ' (' + obj.layer.getLayers().length + ')';
			_label_buit.appendChild(count);
		}

		_leaflet_name.appendChild(_label_buit);
		_menu_item_checkbox.appendChild(_leaflet_input);
		_menu_item_checkbox.appendChild(_leaflet_name);

		var container;
		var modeMapa = ($(location).attr('href').indexOf('/mapa.html') != -1);

		var col;

		if (obj.overlay) {
			// Icona conf Sempre
			col = L.DomUtil.create('div', 'leaflet-conf glyphicon glyphicon-cog opcio-conf');
			L.DomEvent.on(col, 'click', this._showOptions, this);
			col.layerId = input.layerId;
			_menu_item_checkbox.appendChild(col);

			// Icona remove només Edicio
			if (getModeMapa()) {
				col = L.DomUtil.create('div',
					'conf-'+ obj.layer.options.businessId+ ' leaflet-remove glyphicon glyphicon-remove subopcio-conf');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onRemoveClick, this);
				_menu_item_checkbox.appendChild(col);
			}
			// Icona Taula de Dades Sempre
			if ((obj.layer.options.source || obj.layer.options.geometryType=="marker" ||  obj.layer.options.geometryType=="polyline" 
				||  obj.layer.options.geometryType=="polygon") && !obj.layer.options.dinamic ) {
				col = L.DomUtil.create('div',
					'data-table-'+ obj.layer.options.businessId+ ' leaflet-data-table glyphicon glyphicon-list-alt');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onOpenDataTable, this);
				_menu_item_checkbox.appendChild(col);
			}
			// Icona Descàrrega sempre
			//Issue #467: S'ha de respectar el que es selecciona al publicar sobre si una capa és descarregable o no.
			if (getModeMapa()) {
				if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) == -1
					&& obj.layer.options.tipus.indexOf(t_geojsonvt) == -1) {
					col = L.DomUtil.create('div',
						'conf-'+ obj.layer.options.businessId+ ' leaflet-download glyphicon glyphicon-save subopcio-conf');
							col.layerId = input.layerId;
							L.DomEvent.on(col, 'click', this._onDownloadClick, this);
							_menu_item_checkbox.appendChild(col);
				}
			}else{
				if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) == -1
					&& obj.layer.options.tipus.indexOf(t_geojsonvt) == -1) {
					if(downloadableData[obj.layer.options.businessId]){
	    				if(downloadableData[obj.layer.options.businessId][0].chck) {
							col = L.DomUtil
									.create(
											'div',
											'conf-'
													+ obj.layer.options.businessId
													+ ' leaflet-download glyphicon glyphicon-save subopcio-conf');
							col.layerId = input.layerId;
							L.DomEvent
									.on(col, 'click', this._onDownloadClick, this);
							_menu_item_checkbox.appendChild(col);
	    				}
					}
				}

			}
			// Icona Transparència
			if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) != -1) {
				col = L.DomUtil.create('div',
					'conf-'+ obj.layer.options.businessId+ ' leaflet-trans glyphicon glyphicon-adjust subopcio-conf');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onTransparenciaClick,this);
				_menu_item_checkbox.appendChild(col);
				$(col).tooltip({
					placement : 'bottom',
					container : 'body',
					title : window.lang.translate("Transparència")
				});
			}

			// Icona Moure només Edicio
			if (getModeMapa()) {
				col = L.DomUtil.create('div',
					'conf-'+ obj.layer.options.businessId+ ' leaflet-move glyphicon glyphicon-move subopcio-conf');
				col.layerId = input.layerId;
				_menu_item_checkbox.appendChild(col);
				$(col).tooltip({
					placement : 'bottom',
					container : 'body',
					title : window.lang.translate("Moure")
				});
			}

			col = L.DomUtil.create('div',
				'conf-'+ obj.layer.options.businessId+ ' leaflet-zoom glyphicon glyphicon-search subopcio-conf');
				col.layerId = input.layerId;
				L.DomEvent.on(col, 'click', this._onZoomClick,this);
				_menu_item_checkbox.appendChild(col);

				$(col).tooltip({
					placement : 'bottom',
					container : 'body',
					title : window.lang.translate("Zoom a la capa")
				});
			
			if (getModeMapa()) {
				if ((obj.layer.options.tipus == t_visualitzacio
						|| obj.layer.options.tipus == t_url_file
						|| obj.layer.options.tipus == t_json) ) {
					col = L.DomUtil
							.create(
									'div',
									'conf-'
											+ obj.layer.options.businessId
											+ ' leaflet-zoom glyphicon glyphicon-font subopcio-conf');
					col.layerId = input.layerId;
					// L.DomEvent.on(col, 'click', this._onDownClick, this);
					L.DomEvent.on(col, 'click', this._onEtiquetaClick,
							this);
					_menu_item_checkbox.appendChild(col);

					$(col).tooltip({
						placement : 'bottom',
						container : 'body',
						title : window.lang.translate("Etiquetes de la capa")
					});
				}
			}
			
			container = this._overlaysList;
		} else {
			container = this._baseLayersList;
		}

		var sublayers = obj._layers;
		for (j in sublayers) {
			var row_sublayer = this._createSubItem(sublayers[j], input.layerId, modeMapa);
			_menu_item_checkbox.appendChild(row_sublayer);
		}

		this._addGroup(container, obj, _menu_item_checkbox);

		// Afegim tooltips
		$(".data-table-" + obj.layer.options.businessId
			+ ".leaflet-data-table").tooltip({
			placement : 'bottom',
			container : 'body',
			title : window.lang.translate("dades")
		});

		$(".opcio-conf").tooltip({
			placement : 'bottom',
			container : 'body',
			title : window.lang.translate("opcions")
		});

		if (getModeMapa()){
			try{
				updateEditableElements();
				refreshSortablesElements();
				map.fireEvent('addItemFinish');
				
				
				if(estatMapa3D){mapaVista3D.actualitzaVistaOverlays(obj.layer.options,"add",true);}	
				
				//generallegendaMapaEdicio();
				
			}catch(Err){
				updateEditableElements();
			}
		}
		return _menu_item_checkbox;
	},
	
	_createSubItem : function(sublayer, layerIdParent, modeMapa) {
		var row_sublayer = L.DomUtil.create('div',
				'leaflet-row leaflet-subrow');

		var label_sublayer, 
			input_sublayer, checked = this._map.hasLayer(sublayer.layer);

		if(sublayer.layer.error){
			label_sublayer = L.DomUtil.create('label', 'error');
		}else{
			label_sublayer = L.DomUtil.create('label', '');
		}
		label_sublayer.id =  'lblsub-'+ sublayer.layer.options.businessId;		
				
		input_sublayer = L.DomUtil.create('input');
		input_sublayer.id = 'input-'
				+ sublayer.layer.options.businessId;
		input_sublayer.type = 'checkbox';
		input_sublayer.className = 'checkbox_eye hide leaflet-control-layers-selector';
		input_sublayer.defaultChecked = checked;

		input_sublayer.layerId = L.stamp(sublayer.layer);
		input_sublayer.layerIdParent = layerIdParent; // input.layerId;

		L.DomEvent.on(input_sublayer, 'click', this._onInputClick, this);

		var name_sublayer = document.createElement('span');
		name_sublayer.className = 'editable';
		name_sublayer.idParent = layerIdParent;
		name_sublayer.id = L.stamp(sublayer.layer);
		var layerName=sublayer.name;			
    	(layerName.length > 71)?layerName=layerName.substring(0,71)+"...":layerName;			
 
		name_sublayer.innerHTML = ' ' + layerName;

		var col_sublayer = L.DomUtil.create('div', 'leaflet-input');
		var label_for = document.createElement('label');
		var _for = document.createAttribute('for');
		_for.value = 'input-' + sublayer.layer.options.businessId;
		label_for.setAttributeNode(_for);
		col_sublayer.appendChild(input_sublayer);
		col_sublayer.appendChild(label_for);

		row_sublayer.appendChild(col_sublayer);
		col_sublayer = L.DomUtil.create('div', 'leaflet-name');
		col_sublayer.appendChild(label_sublayer);
		row_sublayer.appendChild(col_sublayer);
		label_sublayer.appendChild(name_sublayer);

		if (modeMapa) {
			col_sublayer = L.DomUtil.create('span','leaflet-remove glyphicon glyphicon-remove opcio-conf');
			L.DomEvent.on(col_sublayer, 'click', this._onRemoveClick, this);
			col_sublayer.layerId = input_sublayer.layerId;
			col_sublayer.layerIdParent = layerIdParent;
			row_sublayer.appendChild(col_sublayer);
				
			if(estatMapa3D){mapaVista3D.actualitzaVistaOverlays(sublayer.layer.options,"add",true);}	
		}
		return row_sublayer;
	},

	getCountActiveLayers:function(){
		var i, input, obj, 
		inputs = this._form.getElementsByTagName('input'), 
		inputsLen = inputs.length;
		var j=0;
		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (!input.layerId) {
				continue;
			} else{
				
				if (input.checked){
					j=j+1;
					obj=input.id.replace("input-", "");
				}	
					
			}
		
		}
		return {total:j, lastActive:obj};
	},	
	
	_onInputClick : function(event) {
		var i, input, obj, 
		inputs = this._form.getElementsByTagName('input'), 
		inputsLen = inputs.length;

		this._handlingClick = true;
		var checkHeat = false;
		var id, parentId;

		var currentbid = arguments[0].currentTarget.id.replace("input-", "");
		
		// tractament en cas heatmap
		if (arguments[0].currentTarget.layerIdParent) {
			id = arguments[0].currentTarget.layerId;
			parentId = arguments[0].currentTarget.layerIdParent;
			checkHeat = isHeat(controlCapes._layers[parentId]._layers[id])
					&& arguments[0].currentTarget.value == "on";
		}

		var _timeLayers = [];
		var isLegendLoad=false;
		
		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (!input.layerId) {
				continue;
			} else if (!input.layerIdParent) {
				obj = this._layers[input.layerId];
			} else {
				obj = this._layers[input.layerIdParent]._layers[input.layerId];
			}

			// Si la capa clickada es  heatmap i s'ha d'activar, i la que
			// estem tractant tb, no s'ha de mostrar
			if (isHeat(obj) && checkHeat && obj.layer._leaflet_id != id) {
				input.checked = false;
			}
			// valida tipus CapaTime
			if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_wms) != -1) {
				if (obj.layer.options.wmstime == true) {
					_timeLayers.push(input);
				}
			}

			if(currentbid === obj.layer.options.businessId){
				
					//$.publish('activaLegendTab',{id: currentbid, activo: input.checked});
					this._map.fire('activaLegendTab',{id: currentbid, activo: input.checked});
				
				
				}
			
			
			// Afegir
			var canSpiderify = (obj.layer.options.tipusRang == tem_clasic || 
				obj.layer.options.tipusRang == tem_simple || 
				obj.layer.options.tipusRang == tem_origen);
			if (input.checked && !this._map.hasLayer(obj.layer)) {
				
				
				this._map.addLayer(obj.layer);

				if(this._map.hasOwnProperty("oms") && obj.layer._layers ){
					
				
					//Add the markers to Spiderify
					var keys = Object.keys(obj.layer._layers);
					var num = this._map.oms.markers.length;
					for(var j=0; j<keys.length; ++j)
					{

						var aux = obj.layer._layers[keys[j]];
						if(canSpiderify)
							this._map.oms.addMarker(aux);

					}

					if(num != this._map.oms.markers.length)
						this._map.oms.unspiderfy();

				}

				//Mostrem els labels
				if (obj.layer.options.opcionsVisEtiqueta!=undefined && (obj.layer.options.opcionsVisEtiqueta=="nomesetiqueta" ||
					obj.layer.options.opcionsVisEtiqueta=="etiquetageom")){
					jQuery.each(obj.layer._layers, function(i, lay){	
						var zoomInicial = "2";
				 		if (obj.layer.options.zoomInicial) zoomInicial=obj.layer.options.zoomInicial;
				 		var zoomFinal = "19";
				 		if (obj.layer.options.zoomFinal) zoomFinal = obj.layer.options.zoomFinal;
				 		
				 		if ( map.getZoom()>=zoomInicial &&  map.getZoom() <= zoomFinal) {//mostrem labels
							jQuery.each(obj.layer._layers, function(i, lay){
								if (lay.label!=undefined) {
									if(lay.label){
										lay.label.setOpacity(1);
									}
									if(lay._showLabel){
				                        lay._showLabel({latlng: lay.label._latlng});
									}
								}
							});											
				 		 }
				 		 else {//amaguem labels
							jQuery.each(obj.layer._layers, function(i, lay){
								if(lay.label){
									lay.label.setOpacity(0);
								}
							});										
						 }						
					});
				}
				
				if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_vis_wms) != -1) {
					var optionsUtfGrid = {
						layers : obj.layer.options.businessId,
						crs : L.CRS.EPSG4326,
						srs : "EPSG:4326",
						transparent : true,
						format : 'utfgrid',
						nom : obj.layer.options.nom + " utfgrid",
						tipus : obj.layer.options.tipus,
						businessId : obj.layer.options.businessId
					};
					var utfGrid = createUtfGridLayer(obj.layer._url, optionsUtfGrid);
					this._map.addLayer(utfGrid);
					obj.layer.options.utfGridLeafletId = utfGrid._leaflet_id;
				}
				// Si hem activat capa de tipus tematic categories,
				// mostrem la seva llegenda
				if (currentbid == obj.layer.options.businessId
						&& obj.layer.options.tipusRang
						&& (obj.layer.options.tipusRang == tem_clasic || obj.layer.options.tipusRang == tem_size)) {
					//thisLoadMapLegendEdicio(obj.layer);
					isLegendLoad=true;
				}
				else if (obj.layer.options.tipus=="wms"){//per WMS tb s'ha d'omplir
					//thisLoadMapLegendEdicio(obj.layer);
					isLegendLoad=true;
				}					
				else if (!isLegendLoad){
					//thisEmptyMapLegendEdicio(obj.layer,true);
				}
				
				
				
				
				if (obj.layer.options.dinamic && (obj.layer.options.tem == tem_clasic || obj.layer.options.tem == tem_size)) {
					//thisLoadMapLegendEdicioDinamic(obj.layer);
					isLegendLoad=true;
				}
				else if(!isLegendLoad){

				//thisEmptyMapLegendEdicio(obj.layer,true);
				}
				//mirem vista 3D
				if(estatMapa3D){mapaVista3D.actualitzaVistaOverlays(obj.layer.options,'display',true);}
			
			
				
			
			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				//Amaguem els labels
				if (obj.layer.options.opcionsVisEtiqueta!=undefined && (obj.layer.options.opcionsVisEtiqueta=="nomesetiqueta" ||
					obj.layer.options.opcionsVisEtiqueta=="etiquetageom")){
					jQuery.each(obj.layer._layers, function(i, lay){
						if(lay.label){
							lay.label.setOpacity(0);
						}
					});	
				}
				// Si es vis_wms, hem d'eliminar tb la capa utfgrid
				if (obj.layer.options.tipus && obj.layer.options.tipus.indexOf(t_vis_wms) != -1) {
					var utfGridLayer = this._map._layers[obj.layer.options.utfGridLeafletId];
					this._map.removeLayer(utfGridLayer);
				}

				this._map.removeLayer(obj.layer);

				if(this._map.hasOwnProperty("oms") && obj.layer._layers ){
				
					//Remove the markers from Spiderify
					var keys = Object.keys(obj.layer._layers);
					var num = this._map.oms.markers.length;
					for(var j=0; j<keys.length; ++j)
					{

						var aux = obj.layer._layers[keys[j]];
						if(canSpiderify)
							this._map.oms.removeMarker(aux);

					}

					if(num != this._map.oms.markers.length)
						this._map.oms.unspiderfy();

				}

				// Si hem desactivat capa de tipus tematic categories,
				// mostrem la seva llegenda
				if (currentbid == obj.layer.options.businessId
						&& obj.layer.options.tipusRang
						&& (obj.layer.options.tipusRang == tem_clasic|| obj.layer.options.tipusRang == tem_size)) {
					thisEmptyMapLegendEdicio(obj.layer);
				}
				
				if (currentbid == obj.layer.options.businessId && obj.layer.options.dinamic && 
						(obj.layer.options.tem == tem_clasic || obj.layer.options.tem == tem_size)) {
					thisEmptyMapLegendEdicio(obj.layer);
				}
				if (obj.layer.options.tipus=="wms"){
					thisEmptyMapLegendEdicio(obj.layer);
				}
						
				if(estatMapa3D){mapaVista3D.actualitzaVistaOverlays(obj.layer.options,'display',false);}
			}
		}
		this._validateWmsTime(_timeLayers);
		this._handlingClick = false;
		this._refocusOnMap();
	},

	_validateWmsTime : function(_timeLayers) {
		var _thereIs = false;
		for (j = 0; j < _timeLayers.length; j++) {
			if (_timeLayers[j].checked) {
				_thereIs = true;
			}
		}
		showTimeControl(_thereIs);
	},

	_onUpClick : function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];

		if (!obj.overlay) {
			return;
		}

		var replaceLayer = null;
		for (var i = 0; i < inputs.length; i++) {
			if (!inputs[i].layerIdParent) {
				var auxLayer = this._layers[inputs[i].layerId];
				if (auxLayer.overlay
						&& ((obj.layer.options.zIndex - 1) === auxLayer.layer.options.zIndex)) {
					replaceLayer = auxLayer;
					break;
				}
			}
		}

		var newZIndex = obj.layer.options.zIndex - 1;
		if (replaceLayer) {

			if (typeof url('?businessid') == "string") {
				var data = {
					uid : Cookies.get('uid'),
					businessId : url('?businessid'),
					servidorWMSbusinessId : obj.layer.options.businessId
							+ ','
							+ replaceLayer.layer.options.businessId,
					order : newZIndex + ',' + (newZIndex + 1)
				};

				updateServersOrderToMap(data).then(function(results) {
					if (results.status != 'OK')
						return;// SI no ha anat be el canvi a BD. que
					// no es faci tampoc a client, i es
					// mostri un error
				}, function(results) {
					return;// SI no ha anat be el canvi a BD. que no es
					// faci tampoc a client, i es mostri un
					// error
				});
			}

			obj.layer.options.zIndex = newZIndex;
			replaceLayer.layer.options.zIndex = newZIndex + 1;

			this._map.fire('changeorder', obj, this);
		}
	},

	_onDownClick : function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];

		if (!obj.overlay) {
			return;
		}

		var replaceLayer = null;
		for (var i = 0; i < inputs.length; i++) {
			if (!inputs[i].layerIdParent) {
				var auxLayer = this._layers[inputs[i].layerId];
				if (auxLayer.overlay
						&& ((obj.layer.options.zIndex + 1) === auxLayer.layer.options.zIndex)) {
					replaceLayer = auxLayer;
					break;
				}
			}
		}

		var newZIndex = obj.layer.options.zIndex + 1;
		if (replaceLayer) {
			if (typeof url('?businessid') == "string") {
				var data = {
					uid : Cookies.get('uid'),
					businessId : url('?businessid'),
					servidorWMSbusinessId : obj.layer.options.businessId
							+ ','
							+ replaceLayer.layer.options.businessId,
					order : newZIndex + ',' + (newZIndex - 1)
				};

				updateServersOrderToMap(data).then(function(results) {
					if (results.status != 'OK')
						return;// SI no ha anat be el canvi a BD. que
					// no es faci tampoc a client, i es
					// mostri un error
				}, function(results) {
					return;// SI no ha anat be el canvi a BD. que no es
					// faci tampoc a client, i es mostri un
					// error
				});
			}

			obj.layer.options.zIndex = newZIndex;
			replaceLayer.layer.options.zIndex = newZIndex - 1;

			this._map.fire('changeorder', obj, this);
		}
	},

	_onExpandGroup : function(e) {
		var cl=e.explicitOriginalTarget;
		if(!cl){
			cl=e.srcElement;
		}
		var cls=jQuery(cl).attr('class');
		if(getModeMapa()){
			if(cls && cls.indexOf('label')!=-1){
				var _id = e.currentTarget.id;
				_id = _id.replace('lbl_ac_', '_i_');
				if ($('#' + _id).hasClass('glyphicon-triangle-bottom')) {
					$('#' + _id).removeClass('glyphicon-triangle-bottom');
					$('#' + _id).addClass('glyphicon-triangle-right');

				} else if ($('#' + _id).hasClass('glyphicon-triangle-right')) {
					$('#' + _id).removeClass('glyphicon-triangle-right');
					$('#' + _id).addClass('glyphicon-triangle-bottom');

				}
			}
		}else{
			var _id = e.currentTarget.id;
			_id = _id.replace('lbl_ac_', '_i_');
			if ($('#' + _id).hasClass('glyphicon-triangle-bottom')) {
				$('#' + _id).removeClass('glyphicon-triangle-bottom');
				$('#' + _id).addClass('glyphicon-triangle-right');
	
			} else if ($('#' + _id).hasClass('glyphicon-triangle-right')) {
				$('#' + _id).removeClass('glyphicon-triangle-right');
				$('#' + _id).addClass('glyphicon-triangle-bottom');
	
			}
		}
		if (getModeMapa()) {
			reOrderGroupsAndLayers(false);
		}
	},

	_onRemoveGroup : function(e) {
		$('.tooltip').hide();
		e.stopImmediatePropagation();

		$('#dialog_delete_group').modal('show');
		$('#dialog_delete_group #nom_group_delete').text(e.currentTarget.groupName);
		$('#dialog_delete_group .btn-danger').data("group",e.currentTarget);
	},

	_onRemoveClick : function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var layerIdParent = e.currentTarget.layerIdParent;
		var lbusinessId = [];
		if (!layerIdParent) {
			var obj = this._layers[layerId];
			lbusinessId.push(obj.layer.options.businessId);
			for (i in obj._layers) {
				lbusinessId.push(obj._layers[i].layer.options.businessId);
			}
		} else {
			var objParent = this._layers[layerIdParent];
			var obj = objParent._layers[layerId];
			lbusinessId.push(obj.layer.options.businessId);
		}

		if (!obj.overlay) {
			return;
		}

		if (typeof url('?businessid') == "string") {
			var data = {
				businessId : url('?businessid'),
				uid : Cookies.get('uid'),
				servidorWMSbusinessId : lbusinessId.toString()
			};
			$('#dialog_delete_capa').modal('show');
			$('#dialog_delete_capa #nom_capa_delete').text(obj.layer.options.nom);
			$('#dialog_delete_capa .btn-danger').data("data", data);
			$('#dialog_delete_capa .btn-danger').data("obj", obj);
		}
	},

	_onDeleteClick : function(obj) {
		var node = obj.target.parentElement.childNodes[0];
		n_obj = this._layers[node.layerId];

		// verify if obj is a basemap and checked to not remove
		if (!n_obj.overlay && node.checked) {
			return false;
		}

		if (this._map.hasLayer(n_obj.layer)) {
			this._map.removeLayer(n_obj.layer);
		}
		this.removeLayer(n_obj.layer);
		obj.target.parentNode.remove();

		return false;
	},
	
	_onEditNameClick : function(e) {
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		if (!obj.overlay) {
			return;
		}
	},
	
	_onOpenDataTable : function(e) {
		$('.tooltip').hide();

		$('#modal_data_table').modal('show');
		console.debug($('#modal_data_table'));
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		download_layer = obj;
		fillModalDataTable(obj);
	},

	_onTransparenciaClick : function(e) {
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		var op = obj.layer.options.opacity;

		op ? op = obj.layer.options.opacity
				: op = obj.layer.options.fillOpacity;

		if (!op) {
			op = 1;
			obj.layer.options.fillOpacity = 1;
		} else {
			if (op == 0) {
				op = 1
			} else {
				op = (parseFloat(op) - 0.25)
			}
		}

		try {
			obj.layer.setOpacity(op);
			if(estatMapa3D){mapaVista3D.canviaOpacity(obj.layer.options.businessId,op);}
		} catch (err) {
			obj.layer.options.fillOpacity = op;
			obj.layer.options.opacity = op;
		}

		if (getModeMapa()) {
			var data = {
				businessId : obj.layer.options.businessId, // url('?businessid')
				uid : Cookies.get('uid'),
				opacity : op
			};
			updateServidorWMSOpacity(data).then(function(results) {
				if (results.status === 'OK') {
					// console.debug(results);
				}
			});
		}
	},

	_onDownloadClick : function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		download_layer = obj;

		if (obj.layer.options.tipusRang
				&& (obj.layer.options.tipusRang == tem_cluster || obj.layer.options.tipusRang == tem_heatmap)) {
			$('#modal-body-download-not-available').show();
			$('#modal-body-download-error').hide();
			$('#modal-body-download').hide();
			$('#modal_download_layer .modal-footer').show();
			$('#bt_download_tancar').show();
			$('#bt_download_accept').hide();
			$('#modal_download_layer').modal('show');
		} else {
			$('#modal-body-download-not-available').hide();
			$('#modal-body-download-error').hide();
			$('#modal-body-download').show();
			$('#modal_download_layer .modal-footer').show();
			$('#bt_download_tancar').hide();
			$('#bt_download_accept').show();
			$('#modal_download_layer').modal('show');
		}
	},
	
	_onZoomClick: function(e){
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var obj = this._layers[layerId];
		if (obj.layer._wmsVersion==undefined){
			var bounds = obj.layer.getBounds();
			!estatMapa3D?map.fitBounds(bounds):mapaVista3D._goToBounds(bounds);
		}
		else{
			var instamapsWms = InstamapsWms({
				loadTemplateParam :false});
			var dataWMS = {url: obj.layer._url};
			instamapsWms.getWMSLayers(dataWMS).then(function(results) {
				try{
					if(results.Capability.Layer.Layer.LatLonBoundingBox){
						var bbox = results.Capability.Layer.Layer.LatLonBoundingBox;
						WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
					}else if(results.Capability.Layer.LatLonBoundingBox){
						
						var bbox = results.Capability.Layer.LatLonBoundingBox;
						WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
					}else{
						WMS_BBOX=null;
					}	
				} catch (err) {
					WMS_BBOX=null;
				}
				if (WMS_BBOX !=null) map.fitBounds(WMS_BBOX);
			});
		}
	},
	
	_hideSpiner: function(){
		$(this._spiner).hide();
	},
	
	_showSpiner: function(){
		$(this._spiner).show();
	},
	
	_onEtiquetaClick : function(e) {
		$('.tooltip').hide();
		var layerId = e.currentTarget.layerId;
		var layerIdParent = e.currentTarget.layerIdParent;
		var lbusinessId = [];
		if (!layerIdParent) {
			var obj = this._layers[layerId];
			lbusinessId.push(obj.layer.options.businessId);
			for (i in obj._layers) {
				lbusinessId
						.push(obj._layers[i].layer.options.businessId);
			}
		} else {
			var objParent = this._layers[layerIdParent];
			var obj = objParent._layers[layerId];
			lbusinessId.push(obj.layer.options.businessId);
		}

		if (!obj.overlay) {
			return;
		}

		if (typeof url('?businessid') == "string") {
			var data = obj.layer.options;
			if (data!=undefined){
				var dataNames = [];
				var fields = {};
				fields[window.lang.translate('Escull el camp')] = '---';
								
				if (data.propName!=undefined && data.propName!='null' && data.propName!='') {
					var propName = data.propName;
					if(typeof (propName)=="string"){	
						try {
							dataNames = JSON.parse(propName);
						}
						catch (err) {
							dataNames = propName;		
						}
					}else{			
						dataNames = propName;	
					}					
					if (typeof (dataNames)=="string"){
						 var dataNamesSplit=dataNames.split(",");
						 jQuery.each(dataNamesSplit, function( index, value ) {
								if (value!='') 	fields[value] = value;
						});
					}
					else{
						jQuery.each(dataNames, function( index, value ) {
							if (value!='') 	fields[value] = value;
						});
					}
				}
				else{
					fields['nom']='nom';
					fields['text']='text';
				}
				//creamos el select con los campos
				var source1 = jQuery("#etiquetes-layers-fields").html();
				var template1 = Handlebars.compile(source1);
				var html1 = template1({fields:fields});
				jQuery('#dataFieldEtiqueta').html(html1);
				$('#dialog_etiquetes_capa').modal('show');
				//console.debug(obj.layer.options);
				$('#dialog_etiquetes_capa #nom_capa_etiqueta').text(obj.layer.options.nom);
				//console.debug(obj.layer);
				$('#dialog_etiquetes_capa #businessIdCapaEtiqueta').val(obj.layer.options.businessId);
				$('#dialog_etiquetes_capa #leafletIdCapaEtiqueta').val(obj.layer._leaflet_id);
				$('#dialog_etiquetes_capa #leafletIdCapaEtiquetaControl').val(layerId);
				//Si tenim al camp options informació de les etiquetes ho marquem en el formulari
				if (obj.layer.options.campEtiqueta!=undefined)	$('#dataFieldEtiqueta option[value='+obj.layer.options.campEtiqueta+']').attr('selected','selected');
				else $('#dataFieldEtiqueta option[value=---]').attr('selected','selected');
				if (obj.layer.options.fontFamily!=undefined)	$('#font-family option[value='+obj.layer.options.fontFamily+']').attr('selected','selected');
				else $('#font-family option[value='+obj.layer.options.fontFamily+']').attr('selected','selected');
				if (obj.layer.options.fontSize!=undefined)	$('#font-size option[value='+obj.layer.options.fontSize+']').attr('selected','selected');
				else $('#font-size option[value=Arial]').attr('selected','selected');
				if (obj.layer.options.fontStyle!=undefined)	$('#font-style option[value='+obj.layer.options.fontStyle+']').attr('selected','selected');
				else $('#font-style option[value=10px]').attr('selected','selected');
				if (obj.layer.options.fontColor!=undefined)	$('#dv_color_etiqueta').css('background-color',obj.layer.options.fontColor);
				else 	$('#dv_color_etiqueta').css('background-color','#000000');
				if (obj.layer.options.caixaColor!=undefined)	$('#dv_color_caixa_etiqueta').css('background-color',obj.layer.options.caixaColor);
				else 	$('#dv_color_caixa_etiqueta').css('background-color','#000000');
				if (obj.layer.options.opcionsVisEtiqueta!=undefined) $('input:radio[name=etiqueta][value='+obj.layer.options.opcionsVisEtiqueta+']').attr('checked', true);
				else $('input:radio[name=etiqueta][value=etiquetageom]').attr('checked', true);
				var zoomInicial = "2";
		 		if (obj.layer.options.zoomInicial) zoomInicial=obj.layer.options.zoomInicial;
		 		var zoomFinal = "19";
		 		if (obj.layer.options.zoomFinal) zoomFinal = obj.layer.options.zoomFinal;
		 		//Omplim els camps amb el que hi ha guardat a la BBDD
		 		 var tooltip = function(sliderObj, ui){
		 			 	
		                val1            = '<div id="slider_tooltip" style="font-size:10px;">'+ zoomInicial +'</div>';
		                val2            = '<div id="slider_tooltip" style="font-size:10px;">'+ zoomFinal +'</div>';
		                if (ui.values[0]==zoomInicial)  sliderObj.children('.ui-slider-handle').first().html(val1);
		                else  sliderObj.children('.ui-slider-handle').first().html('');
		                if (ui.values[1]==zoomFinal)   sliderObj.children('.ui-slider-handle').last().html(val2);
		                else  sliderObj.children('.ui-slider-handle').last().html('');
		            };
				$( "#slider" ).slider({
					range:true,
			        min: 2,
			        max: 19,			 
			        values: [parseInt(zoomInicial),parseInt(zoomFinal)],
			        change:function(event,ui){
		            	//tooltip($(this),ui);  
		            },
			        start: function( event, ui ) {
			        	$('#slider .ui-slider-handle').first().tooltip('destroy');			        
			        	$('#slider .ui-slider-handle').last().tooltip('destroy');
			        	
			        },
			        stop: function( event, ui ) {
			        	$('#slider .ui-slider-handle').first().html('');
			        	$('#slider .ui-slider-handle').last().html('');	
			            //alert(  ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			             $('#slider .ui-slider-handle').first().tooltip({title: ui.values[0], trigger: 'manual', placement: 'bottom'}).tooltip("show");
			            $('#slider .ui-slider-handle').last().tooltip({title: ui.values[1], trigger: 'manual', placement: 'bottom'}).tooltip("show");
			         }    
			       }
				);
				
				
				$('#dialog_etiquetes_capa .btn-success').on('click', function (e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					if (jQuery('#dataFieldEtiqueta').val()!=undefined && jQuery('#dataFieldEtiqueta').val()=="---"){
						alert("Cal escollir un camp per etiquetar");
					}
					else {
						var capaLeafletId = $('#dialog_etiquetes_capa #leafletIdCapaEtiqueta').val();
						var capaLeafletIdControl = $('#dialog_etiquetes_capa #leafletIdCapaEtiquetaControl').val();
						var color = rgb2hex($('#dv_color_etiqueta').css('background-color'));
						var caixaColor  = rgb2hex($('#dv_color_caixa_etiqueta').css('background-color'));
						var sliderVals =$("#slider").slider("values");
						var options = {
								campEtiqueta:jQuery('#dataFieldEtiqueta').val(),
								fontFamily:jQuery('#font-family').val(),
								fontSize:jQuery('#font-size').val(),
								fontStyle:jQuery('#font-style').val(),
								fontColor:color,
								opcionsVis:$("input[name=etiqueta]:checked").val(),
								caixaColor: caixaColor,
								contorn:$("input[name=contorn]:checked").val(),
								caixa:$("input[name=caixeti]:checked").val(),
								zoomInicial:sliderVals[0],
								zoomFinal:sliderVals[1]
						}
						var layerMap=map._layers[capaLeafletId];
						var optionsMap;
						if (layerMap==undefined) {
							layerMap = controlCapes._layers[capaLeafletId];
							optionsMap=layerMap.layer.options;
						}
						else optionsMap=layerMap.options;
						
						var data={
								businessId: $('#dialog_etiquetes_capa #businessIdCapaEtiqueta').val(),
								uid: Cookies.get('uid'),
								options:  JSON.stringify(options),
								nom:optionsMap.nom,
								tipus:optionsMap.tipusRang,
								geometryType:optionsMap.geometryType
						};
						updateVisualitzacioLayer(data).then(function(results){
							if (results.status=="OK"){
								$('#dialog_etiquetes_capa').modal('hide');
								reloadVisualitzacioLayer(layerMap, results.visualitzacio, results.layer, map).then(function(results) {
									//refresh zoom etiquetes
									refrescarZoomEtiquetes(results);
								});
							}
							else if (results.status="ERROR"){
								updateServidorWMSOptions(data).then(function(results){
									map.removeLayer(layerMap);
									var id = L.stamp(obj.layer);
									
									if (!obj.sublayer) {
										delete controlCapes._layers[id];
									} else {
										delete controlCapes._layers[obj.layerIdParent]._layers[id];
									}								
									loadURLfileLayer(results.results).then(function(results) {
										//refresh zoom etiquetes									
										refrescarZoomEtiquetes(results);
									});									
									$('#dialog_etiquetes_capa').modal('hide');
								});
							}
						});
					}
				});
				
			}
		}
	},
	
	_onRefreshClick : function(e) {
		$('.tooltip').hide();
		console.debug(e.currentTarget);
		var layerId = e.currentTarget.layerId;
		var layerIdParent = e.currentTarget.layerIdParent;
		console.debug(this._layers);
		var obj = this._layers[layerIdParent]._layers[layerId];
		//Refrescar els temàtics: eliminem sublayer del mapa, i recarreguem
		map.removeLayer(obj.layer);
		loadVisualitzacioLayer(obj.layer);
	},

	_showOptions : function(e) {
		var layerId = e.currentTarget.layerId;
		var inputs = this._form.getElementsByTagName('input');
		var obj = this._layers[layerId];
		showConfOptions(obj.layer.options.businessId);
	},

	_expand : function() {
		L.DomUtil.addClass(this._container,
				'leaflet-control-layers-expanded');
	},

	_collapse : function() {
		this._container.className = this._container.className.replace(
				' leaflet-control-layers-expanded', '');
	}
});
						
L.control.orderlayers = function(baseLayers, overlays, options) {
	return new L.Control.OrderLayers(baseLayers, overlays, options);
};

function isHeat(obj) {
	return (obj.layer.options.tipusRang && obj.layer.options.tipusRang
			.indexOf('heatmap') != -1);
}

function showConfOptions(businessId) {
	jQuery(".conf-" + businessId + "").toggle("fast");
	addTooltipsConfOptions(businessId);
}

function updateCheckStyle() {
	$('.leaflet-input input').iCheck({
		checkboxClass : 'icheckbox_flat-blue',
		radioClass : 'iradio_flat-blue'
	});
}

function thisFillModalDataTable(obj) {
	fillModalDataTable(obj);
}

function thisLoadMapLegendEdicio(obj) {
	if (getModeMapa()){
		loadMapLegendEdicio(obj);
	}
}

function thisLoadMapLegendEdicioDinamic(obj) {
	if (getModeMapa()){
		loadMapLegendEdicioDinamics(obj);
	}
}

function thisEmptyMapLegendEdicio(obj,isOrigen) {
	if (getModeMapa()){
		emptyMapLegendEdicio(obj,isOrigen);
	}
}
