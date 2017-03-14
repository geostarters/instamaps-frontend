/**
 * L.Control.Logos control para crear logos.
 */
L.Control.Logos = L.Control.extend({
	options: {
		position: 'bottomleft',
		id: 'dv_logos',
		className: 'logos_footer',
		childClassName: 'logo_footer'
	},
	
	onAdd: function(map){
		var self = this,
		options = self.options,
		container = L.DomUtil.create('div', options.className);
		
		if (L.DomEvent) {
			L.DomEvent.disableClickPropagation(container);
		}
		
		container.id = options.id;
		
		self._div = container;
		
		self.addLogo({
			className: 'logo_icgc',
			id: 'logo_icgc',
			title: 'Institut Cartogràfic i Geològic de Catalunya',
			url: 'http://www.icgc.cat',
			html: '<img height="45" src="/llibreries/img/icgc.png">'
		});
		
		return container;
	},
	
	addLogo: function(options){
		var self = this,
		container = self._div,
		className = self.options.childClassName;
		
		if(options.className){
			className += " " + options.className;
		}
		
		var link = L.DomUtil.create('a', className, container);
		link.id = options.id;
		link.innerHTML = options.html;
		link.href = options.url;
		link.title = options.title;
		link.target = "_blank";
				
		return link;
	},
	
	addLogoHtml: function(html){
		var self = this,
		container = self._div;
		container.insertAdjacentHTML('beforeend', html);
	},
	
	removeLogo: function(options){
		var self = this,
		container = self._div;
		if(options.id){
			var logo = L.DomUtil.get(options.id);
			container.removeChild(logo);
		}
		if(options.className){
			var elements = container.getElementsByClassName(options.className);
			for(var i = 0, length = elements.length; i < length; i++){
				container.removeChild(elements[i]);
			}
		}
	},

});

L.control.logos = function(options){
	return new L.Control.Logos(options);
};