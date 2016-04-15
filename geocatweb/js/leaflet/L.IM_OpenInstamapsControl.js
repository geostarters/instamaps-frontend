/**
 * L.Control.OpenInstamaps permite abrir un visor embed en un iframe en un visor de Instamaps en una nueva ventana.
 */

L.Control.OpenInstamaps = L.Control.extend({
	options: {
		position: 'topleft',
		url: 'http://instamaps.cat/geocatweb/visor.html?',
		id: 'div-linkViewMap',
		className: 'control-linkViewMap',
		title: 'Veure a InstaMaps',
		langTitle: 'Veure a InstaMaps',
		html: '&nbsp;<span class="glyphicon glyphicon-fullscreen grisfort bt-expand"></span>',
		tooltip: 'right'
	},
	
	onAdd: function(map){
		var self = this,
			options = self.options,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		
		container.dataset.toggle = 'tooltip';
		container.dataset.placement = options.tooltip;
		container.dataset.langTitle = options.langTitle;
		
		self._div = container;
		
		if (options.businessid){
			options.url += '&businessid='+options.businessid;
		}
		if(options.urlwms){
			options.url += '&urlwms='+options.urlwms+'&layername='+options.layername;
		}
		
		self._button = self._createButton(options.html, options.title, '', options.url, container, options.fn);
		
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
	
	_createButton: function (html, title, className, url, container, fn) {
		var link = L.DomUtil.create('a', className, container),
			stop = L.DomEvent.stopPropagation;
		link.innerHTML = html;
		link.setAttribute("target", "_blank");
		link.href = url;
		link.title = title;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', fn, this);
		
		return link;
	}
});

L.control.openInstamaps = function(options){
	return new L.Control.OpenInstamaps(options);
};