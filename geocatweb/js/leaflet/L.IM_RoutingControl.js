/**
 * L.Control.RoutingControl control de routing basado en el leaflet-routing-machine
 */

L.Control.RoutingControl = L.Control.extend({
	includes: L.Mixin.Events,
	
	options: {
		position: 'topleft',
		lang: 'ca',
		id: 'dv_bt_Routing',
		className: 'leaflet-bar btn btn-default btn-sm grisfort',
		title: 'Routing',
		langTitle: 'Routing',
		html: '<span id="span_bt_Routing" class="t" style="font-size:16px; margin-top:-2px;">'+
		'<i class="t-square-rounded" style="-webkit-transform:scale(1.25) scale(0.65) rotate(45deg);-moz-transform:scale(1.25) scale(0.65) rotate(45deg);transform:scale(1.25) scale(0.65) rotate(45deg)"></i>'+
		'<i class="t-turn-90-l t-c-white" style="-webkit-transform:scale(-1.3, 1.3);-moz-transform:scale(-1.3, 1.3);transform:scale(-1.3, 1.3)"></i>'+
		'</span>',
		tooltip: 'right',
		marker_style_origen: {
			icon : '',
			markerColor : 'green',
			divColor:'transparent',
			iconAnchor : new L.Point(14, 42),
			iconSize : new L.Point(28, 42),
			iconColor : '#000000',
			prefix : 'fa',
			isCanvas:false,
			radius:6,
			opacity:1,
			weight : 2,
			fillOpacity : 0.9,
			color : "#ffffff",
			fillColor :"transparent"
		},
		marker_style_desti: {
			icon : '',
			markerColor : 'red',
			divColor:'transparent',
			iconAnchor : new L.Point(14, 42),
			iconSize : new L.Point(28, 42),
			iconColor : '#000000',
			prefix : 'fa',
			isCanvas:false,
			radius:6,
			opacity:1,
			weight : 2,
			fillOpacity : 0.9,
			color : "#ffffff",
			fillColor :"transparent"
		},
		marker_style_intermig: {
			icon : '',
			markerColor : 'orange',
			divColor:'transparent',
			iconAnchor : new L.Point(14, 42),
			iconSize : new L.Point(28, 42),
			iconColor : '#000000',
			prefix : 'fa',
			isCanvas:false,
			radius:6,
			opacity:1,
			weight : 2,
			fillOpacity : 0.9,
			color : "#ffffff",
			fillColor :"transparent"
		},
		originTexts: {
			title: "Càlcul de rutes",
			btnStart: "Defineix com a origen",
			btnEnd: "Defineix com a destí",
			btnReverse: "Ruta inversa",
			btnAdd: "Afegir punts",
			start: "Inici",
			end: "Destí"
		},
		texts: {
			title: "Càlcul de rutes",
			btnStart: "Defineix com a origen",
			btnEnd: "Defineix com a destí",
			btnReverse: "Ruta inversa",
			btnAdd: "Afegir punts",
			start: "Inici",
			end: "Destí"
		}
	},
	
	//TODO ver el tema del lang para poder cambiar el idioma del control
	
	initialize: function(options) {
		L.setOptions(this, options);
		
		var self = this,
			options = this.options,
			lang = options.lang,
			puntIntermig = L.AwesomeMarkers.icon(options.marker_style_intermig),
			puntDesti = L.AwesomeMarkers.icon(options.marker_style_desti),
			puntOrigen = L.AwesomeMarkers.icon(options.marker_style_origen);
		
		this._reversablePlan = L.Routing.Plan.extend({
		    createGeocoders: function() {
		        var container = L.Routing.Plan.prototype.createGeocoders.call(this),
		        title = (window.lang) ? window.lang.translate(options.originTexts.btnReverse) : options.texts.btnReverse,
		        reverseButton = self._createButton('<span class="glyphicon glyphicon-sort" style="font-size:14px;"></span>', container, title, lang);
		        L.DomEvent.on(reverseButton, 'click', function() {
		            var waypoints = this.getWaypoints();
		            this.setWaypoints(waypoints.reverse());
		        }, this);
		        return container;
		    }
		});
		
		var createMarker = function(i, wp) {
        	var numWp = this._route.getWaypoints().length;
        	if(i == 0){
        		return L.marker(wp.latLng, {
    				draggable: true,
    				icon: puntOrigen
    			});
        	}
        	else if (i === (numWp - 1)){
        		return L.marker(wp.latLng, {
    				draggable: true,
    				icon: puntDesti
    			});
        	}
        	else {
        		return L.marker(wp.latLng, {
    				draggable: true,
    				icon: puntIntermig
    			});
        	}
        };
		
		this._plan = new this._reversablePlan([], {
	        geocoder: L.Control.Geocoder.icgc(),
	        routeWhileDragging: true,
	        language: lang,
	        createMarker: createMarker.bind(self)
	    });
		
		//console.debug(lang);
		
		this._route = L.Routing.control({
			router: L.Routing.mapzen('mapzen-aMHsmLA', {
				language: lang,
				    costing:'auto',
				    directions_options: {
				        language: lang
				      }
				    }),
			 formatter: new L.Routing.mapzenFormatter(),
	         routeWhileDragging: true,
	         plan: this._plan,
	         position: 'topleft',
	         language: lang,
		     showAlternatives: true,
		     lineOptions: {
	            styles: [
	              {color: '#00B3FD', opacity: 1, weight: 4},
	            ]
	           },
	         altLineOptions:{
	        	styles: [
	     	      {color: 'black', opacity: 1, weight: 2},
	     	    ]
	         }
		});
		
	},
	
	onAdd: function(map){
		var self = this,
			options = self.options,
			stop = L.DomEvent.stopPropagation,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		container.innerHTML = options.html;
		container.title = options.title;
		
		container.dataset.toggle = 'tooltip';
		container.dataset.placement = options.tooltip;
		container.dataset.langTitle = options.langTitle;
		
		self._div = container;
		self._map = map;
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', L.DomEvent.preventDefault)
			.on(container, 'click', self._toggle, self);
		
		return container;
	},
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
	},
	
	show: function() {
		L.DomUtil.removeClass(this._div, 'grisfort');
		L.DomUtil.addClass(this._div, 'greenfort');
		var _map = this._map,
			options = this.options,
			_texts = options.texts,
			_route = this._route;
		
		_map.fire('showRouting'); //to track ga events
		
		_map.on('click', this._routingPopup, this);
		_route.addTo(_map);
		
		if(window.lang){
			_texts.title = window.lang.translate(options.originTexts.title);
			_texts.btnReverse = window.lang.translate(options.originTexts.btnReverse);
			_texts.btnAdd = window.lang.translate(options.originTexts.btnAdd);
			_texts.start = window.lang.translate(options.originTexts.start);
			_texts.end = window.lang.translate(options.originTexts.end);
		}
		
		$('.leaflet-routing-geocoders').before( '<div class="div-routing-title"><span lang="ca" class="routing-title">'+_texts.title+'</span>&nbsp;<a href="http://www.liedman.net/leaflet-routing-machine/" target="_blank" class="div-routing-title" style="display:inline;"><span class="glyphicon glyphicon-info-sign white" style="font-size:14px;"></a></div>' );
		$('.leaflet-routing-add-waypoint').attr('title',_texts.btnAdd);
		$('.leaflet-routing-add-waypoint').attr('lang',options.lang);
		$('.leaflet-routing-geocoder').first().find('input').attr('placeholder',_texts.start);
		$('.leaflet-routing-geocoder').last().find('input').attr('placeholder',_texts.end);
		
		var offset = $(this._div).offset();
		
		jQuery('.leaflet-routing-container').css('top', (offset.top-60)+'px');
		jQuery('.leaflet-routing-container').css('left', (offset.left + 35)+'px');
		jQuery('.leaflet-routing-container').css('position','absolute');
		jQuery('.leaflet-routing-container').css('z-index','100');
		
	},

	hide: function() {
		var self = this,
		_map = self._map,
		_route = self._route;
		
		
		L.DomUtil.removeClass(self._div, 'greenfort');
		L.DomUtil.addClass(self._div, 'grisfort');
		console.debug("AQUI");
		try{
			_route.removeFrom.call(_route,_map);
		}catch(e){
			console.debug(e);
		}finally{
			_map.off('click',self._routingPopup, self);
		}
		
	},
	
	_toggle: function(e){
		var collapsed = L.DomUtil.hasClass(this._div, 'grisfort');
		this[collapsed ? 'show' : 'hide']();
	}, 
	
	_routingPopup: function(e) {
		console.debug("routing");
		var options = this.options,
		_texts = options.texts;
		
		if(window.lang){
			_texts.title = window.lang.translate(options.originTexts.title);
			_texts.btnStart = window.lang.translate(options.originTexts.btnStart);
			_texts.btnEnd = window.lang.translate(options.originTexts.btnEnd);
		}
		
		var container ='<div id="contentRoutingPopup" class="contentRoutingPopup">';
		container +='<h4 style="border-bottom:0px;" lang="ca">'+_texts.title+'</h4>';
		container +='<button class="btn startBtn" lang="ca" type="button" id="startBtn">'+_texts.btnStart+'</button>'+
		  	'<span class="awesome-marker-icon-green awesome-marker leaflet-zoom-hide leaflet-clickable leaflet-marker-draggable icona icona-origen" id="icona-origen"></span>'+
		   	'<button class="btn endBtn" lang="ca" type="button" id="destBtn">'+_texts.btnEnd+'</button>'+
		   	'<span class="awesome-marker-icon-red awesome-marker leaflet-zoom-hide leaflet-clickable leaflet-marker-draggable icona icona-desti" id="icona-desti"></span>';
		container += "</div>";
		
		var _map = this._map,
			_route = this._route;
		
		L.popup().setContent(container).setLatLng(e.latlng).openOn(_map);

		jQuery(".leaflet-popup-content").css('width','184px');
		jQuery(".leaflet-popup-content").css('margin','5px 15px');

	    jQuery('#startBtn').on('click', function() {
	    	_route.spliceWaypoints(0, 1, e.latlng);
	    	_map.closePopup();
	    });

	    jQuery('#destBtn').on('click', function() {
	    	_route.spliceWaypoints(_route.getWaypoints().length - 1, 1, e.latlng);
	        _map.closePopup();
	    });

	    jQuery('#icona-origen').on('click', function() {
	    	_route.spliceWaypoints(0, 1, e.latlng);
	    	_map.closePopup();
	    });

	    jQuery('#icona-desti').on('click', function() {
	    	_route.spliceWaypoints(_route.getWaypoints().length - 1, 1, e.latlng);
	        _map.closePopup();
	    });

	}, 
	
	_createButton: function(label, container, title, lang) {
	    var btn = L.DomUtil.create('button', '', container);
	    btn.setAttribute('type', 'button');
	    btn.setAttribute('lang', lang);
	    btn.setAttribute('title', title);
	    btn.innerHTML = label;
	    return btn;
	},

	_createSpan: function(label, container) {
	    var span = L.DomUtil.create('span', '', container);
	    span.innerHTML = label;
	    return span;
	}
});

L.control.routingControl = function(options){
	return new L.Control.RoutingControl(options);
};