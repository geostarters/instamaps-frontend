/**
 * L.Control.SearchControl control que permite hacer busquedas con caja única 
 */
L.Control.SearchControl = L.Control.extend({
	options: {
		position: 'topleft',
		id: 'dv_bt_Find',
		className: 'leaflet-bar btn btn-default btn-sm grisfort',
		title: 'Cercar',
		langTitle: 'Cercar',
		html: '<span id="span_bt_Find" class="fa fa-search"></span>',
		idInputText: 'ctr_cerca',
		inputplaceholderText: 'Cercar llocs al món o coordenades  ...',
		tooltip: 'right',
		resultsContainer : ''
	},
	
	initialize: function(options){
		L.setOptions(this, options);
		
		var self = this,
		options = this.options,
		inputText = L.DomUtil.create('div', options.idInputText);
		
		inputText.id = options.idInputText;
		jQuery('#searchBar').addClass("input-group").append(inputText);
	},
	
	onAdd: function(map){
		var self = this,
		options = self.options,
		stop = L.DomEvent.stopPropagation,
		container = L.DomUtil.create('div', options.className);
		
		//agregar el boton
		container.id = options.id;
		container.innerHTML = options.html;
		container.title = options.title;
		
		container.dataset.toggle = 'tooltip';
		container.dataset.placement = options.tooltip;
		container.dataset.langTitle = options.langTitle;
		
		self._div = container;
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', L.DomEvent.preventDefault)
			.on(container, 'click', self._toggle, self);
		
		//agregar el control
		//TODO extender el control de origen en lugar de modificarlo
		self.control = new L.Control.Search({url: options.searchUrl,
			position:'topcenter',
			filterJSON: self._filterJSON,
			animateLocation: false,
			markerLocation: false,
			zoom: 12,
			minLength: 3,
			autoType: false,
			text:options.inputplaceholderText,
			idInputText : '#'+options.idInputText,
			zoom : 14,
			textSize : 22,
			autoCollapseTime: 3200,
			resultsContainer: options.resultsContainer,
			disableAutoCollapse: options.disableAutoCollapse
		}).addTo(map);
		
		return container;
	},
	
	_filterJSON: function(rawjson){
		var self = this,
		jsonData = JSON.parse(rawjson.resposta),
		json = {},
		key, 
		loc, 
		disp = [];
		
		if (jsonData.resultats.length>1){
			for (var i = 0; i < jsonData.resultats.length; i++) {
			    var resultat = jsonData.resultats[i];
			    var coordsSplit = resultat.coordenades.split(",");
			    json[ resultat.nom ] = L.latLng(coordsSplit[0], coordsSplit[1]);
			}
		}
		else {
			if (jsonData.resultats.length>0){
				var coords= jsonData.resultats[0].coordenades;
				var nom = jsonData.resultats[0].nom;
				var coordsSplit = [];
				if (coords) {
					coordsSplit = coords.split(",");
					loc = L.latLng(coordsSplit[0], coordsSplit[1] );
					console.debug(self);
					self.showLocation(loc,coords,nom); 
				}
			}
			else{
				
			self.showAlert(window.lang.translate("No trobat"));
			}
		}
		return json;
	},
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
	},
	
	hide: function() {
		L.DomUtil.removeClass(this._div, 'greenfort');
		L.DomUtil.addClass(this._div, 'grisfort');
		$('#searchBar').hide();
	},
	
	show: function(e){
		L.DomUtil.removeClass(this._div, 'grisfort');
		L.DomUtil.addClass(this._div, 'greenfort');
		var offset = $(this._div).offset();
		$('#searchBar').css('top', (offset.top - 15) +'px');
		$('#searchBar').css('left', (offset.left + 35) +'px');
		$('#searchBar').show();
	}, 
	
	_toggle: function(e){
		var collapsed = L.DomUtil.hasClass(this._div, 'grisfort');
		this[collapsed ? 'show' : 'hide']();
		$.publish('analyticsEvent',{event:['visor','button#cercaTopo','label cercaTopo', 6]});
	},

	moveToSidebar: function(sidebarId)
	{

		var self = this;
		var buttonHTML = '<li><a href="#searchPanel" id="searchTab" role="tab">' +
			self.options.html + '</a></li>';

		var bodyHTML = '<div id="searchPanel" class="sidebar-pane sidebar-outer-pane">' +
			'<h1 class="sidebar-header" lang="ca">' +
				self.options.title + 
				'<span class="sidebar-close" id="infoClose"><i class="fa fa-caret-left"></i></span>' +
			'</h1><div class="scrollable-pane"><div id="search-content"></div></div></div>';
		
		$(sidebarId + ' .leftTopBar').append(buttonHTML);
		$(sidebarId + ' .sidebar-content').append(bodyHTML);
		$('#searchBar').appendTo('#search-content');
		$('<div id="search-results-panel"></div').appendTo('#search-content');
		$('#' + self.options.resultsContainer).appendTo('#search-results-panel');
		$('#searchBar').css('width', 'calc(100% - 35px)');
		$('#searchBar').css('position', 'relative');
		$('#searchBar').css('top', '0px');
		$('#searchBar').css('height', '50px');
		$('#searchBar .leaflet-center').css('width', '100%');
		$('#searchBar .leaflet-control-search').css('width', '100%');
		$('#search-input').css('width', '100%');
		$('#searchBar').show();
		$('#' + self.options.id).remove();

	}
});

L.control.searchControl = function(options){
	return new L.Control.SearchControl(options);
};