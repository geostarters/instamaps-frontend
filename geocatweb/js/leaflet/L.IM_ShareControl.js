/**
 * 
 */
L.Control.Share = L.Control.extend({
	options: {
		position: 'topleft',
		id: 'dv_bt_Share',
		className: 'leaflet-bar btn btn-default btn-sm grisfort',
		title: 'Compartir',
		html: '<span id="span_bt_Share" class="fa fa-share-alt"></span>'
	},
	
	onAdd: function(map){
		var options = this.options,
		stop = L.DomEvent.stopPropagation,
		container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		container.innerHTML = options.html;
		container.title = options.title;
		
		this._div = container;
		
		L.DomEvent
			.on(container, 'click', stop)
			.on(container, 'mousedown', stop)
			.on(container, 'dblclick', stop)
			.on(container, 'click', L.DomEvent.preventDefault)
			.on(container, 'click', this._toggle, this);
			
		return container;
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