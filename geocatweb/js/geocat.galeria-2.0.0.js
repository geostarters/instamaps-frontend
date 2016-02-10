/**
 * require Jquery
 * require Handelbars
 */
;(function(global, $){
	
	var Galeria = function(options){
		return new Galeria.init(options);
	}
	
	//TODO definir los templates dentro del modulo
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	var sourcePublic = $("#galeriaPublic-template").html();
	var templatePublic = Handlebars.compile(sourcePublic);

	var sourceAdmin = $("#galeriaAdmin-template").html();
	var templateAdmin = Handlebars.compile(sourceAdmin);
	
	var sourceAplicacions = $("#aplicacions-template").html();
	var templateAplicacions = Handlebars.compile(sourceAplicacions);
	
	var sourceConfigurades = $("#configurades-template").html();
	var templateConfigurades = Handlebars.compile(sourceConfigurades);
	
	Handlebars.registerHelper('if_eq', function(a, b, opts) {
	    if(a == b) // Or === depending on your needs
	        return opts.fn(this);
	    else
	        return opts.inverse(this);
	});
	
	var galeriaOptions = { //default instamaps
		tipusApp: 1,
		isGeolocal: false
	};
	
	Galeria.prototype = {
		
		getNumMaps: function(){
			var self = this;
			var data = {
				tipusApp: self.options.tipusApp	
			}
			return $.ajax({
				url: paramUrl.getNumGaleria,
				dataType: 'jsonp',
				data: data
			}).promise();	
		}, 
		
		
	};
	
	Galeria.init = function(options){
		var self = this;
		
		self.options = $.extend({}, galeriaOptions, options);
		
		console.debug(self.options);
	}
	
	Galeria.init.prototype = Galeria.prototype;
	
	global.Galeria = Galeria; 
	
}(window, jQuery));

