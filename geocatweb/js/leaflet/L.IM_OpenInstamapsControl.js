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
		html: '&nbsp;<span class="glyphicon glyphicon-fullscreen grisfort bt-expand"></span>'
	},
	
	onAdd: function(map){
		var options = this.options,
			container = L.DomUtil.create('div', options.className);
		
		container.id = options.id;
		
		if (options.businessid){
			options.url += '&businessid='+options.businessid;
		}
		if(options.urlwms){
			options.url += '&urlwms='+options.urlwms+'&layername='+options.layername;
		}
		
		this._button = this._createButton(options.html, options.title, '', options.url, container, options.fn);
		
		return container;
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