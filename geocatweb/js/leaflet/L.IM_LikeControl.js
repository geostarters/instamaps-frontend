/**
 * L.Control.Like control que permite sumar/restar uno a los like de los mapas
 */
L.Control.Like = L.Control.extend({
	options: {
		position: 'topleft',
		id: 'dv_bt_likeMap',
		className: 'leaflet-bar  btn btn-default btn-sm',
		title: 'Vista inicial',
		langTitle: 'Vista inicial',
		html: '<span id="span_bt_likeMap" class="fa fa-heart-o grisfort"></span>',
		tooltip: 'right'
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
		
		map.on('loadconfig', self._updateMapConfig, self);
		map.on('visorconfig', self._updateMapConfig, self);
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', self._like, self);
		return container;
	},
	
	onRemove: function (map) {
		var self = this;
		map.off('loadconfig', self._updateMapConfig, self);
		map.off('visorconfig', self._updateMapConfig, self);
	},
	
	_like: function(e){
		var self = this;
		console.debug(self.options.mapConfig);
		_mapConfig = self.options.mapConfig;
		
		var data = {
			businessId: _mapConfig.businessId
		};
		
		if(self._isLiked()){
			data.rank = -1;
			self._unLiked();
		}else{
			data.rank = 1;
			self._liked();
		}
		
		self._updateRankAplicacio(data).then(function(results){
			if (results.status=="OK"){
				var btnSpan = $(self._div).find('span');
				btnSpan.tooltip({
					placement: 'right',
			        title: results.results,
			        
			    }).tooltip('show');
				setTimeout(function(){
					btnSpan.tooltip('destroy');
			    }, 800);
			}
		});
	},
	
	_updateRankAplicacio: function(params){
		return $.ajax({
			url: paramUrl.updateRankAplicacio, //geocat.config-1.0.0
	  		data: params,
	  		method: 'post',
	  		dataType: 'jsonp'
		}).promise();
	},
	
	_isLiked: function(){
		var self = this,
		liked = false;
		
		var btnSpan = $(self._div).find('span');
		
		if($(btnSpan).hasClass('fa-heart-o')){
			liked = false;
		}else if($(btnSpan).hasClass('fa-heart')){
			liked = true;
		} 
		return liked;
	},
	
	_liked: function(){
		var self = this;
		var btnSpan = $(self._div).find('span');
		$(btnSpan).removeClass('fa-heart-o').addClass('fa-heart');
	},
	
	_unLiked: function(){
		var self = this;
		var btnSpan = $(self._div).find('span');
		$(btnSpan).removeClass('fa-heart').addClass('fa-heart-o');
	},
	
	hideBtn: function(){
		var self = this;
		$(self._div).hide();
	},
	
	showBtn: function(){
		var self = this;
		$(self._div).show();
	},
	
	_updateMapConfig: function(config){
		this.options.mapConfig = config;
	}
});

L.control.like = function(options){
	return new L.Control.Like(options);
};