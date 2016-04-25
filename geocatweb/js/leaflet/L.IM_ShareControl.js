/**
 * 
 */
L.Control.Share = L.Control.extend({
	options: {
		position: 'topleft',
		id: 'dv_bt_Share',
		className: 'leaflet-bar btn btn-default btn-sm grisfort',
		title: 'Compartir',
		langTitle: 'Compartir',
		html: '<span id="span_bt_Share" class="fa fa-share-alt"></span>',
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
	
	hide: function() {
		L.DomUtil.removeClass(this._div, 'greenfort');
		L.DomUtil.addClass(this._div, 'grisfort');
		$('#socialShare_visor').hide();
	},
	
	show: function(e){
		L.DomUtil.removeClass(this._div, 'grisfort');
		L.DomUtil.addClass(this._div, 'greenfort');
		var offset = $(this._div).offset();
		$('#socialShare_visor').css('top', (offset.top - 15) +'px');
		$('#socialShare_visor').css('left', (offset.left + 35) +'px');
		$('#socialShare_visor').show();
	}, 
	
	_toggle: function(e){
		var collapsed = L.DomUtil.hasClass(this._div, 'grisfort');
		this[collapsed ? 'show' : 'hide']();
	},
	
});

L.control.share = function(options){
	return new L.Control.Share(options);
};