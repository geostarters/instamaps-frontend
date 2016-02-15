/**
 * 
 */
;(function(global, $){
	
	var Instamaps = function(options){
		return new Instamaps.init(options);
	}
	
	var perfils = ["instamaps","geolocal"];
	
	var footers = {
		instamaps: "Instamaps Beta",
		geolocal: "Instamaps.Geolocal"
	};
	
	var galeriaLink = {
		instamaps: "/geocatweb/galeria.html",
		geolocal: "/geocatweb/galeria_geolocal.html"
	};
	
	var sessionLink = {
		instamaps: "/geocatweb/sessio.html",
		geolocal: "/geocatweb/sessio_geolocal.html"	
	};
	
	var brand = {
		instamaps: "Instamaps",
		geolocal: "Instamaps.GeoLocal"
	};
	
	var brandLink = {
		instamaps: "/index.html",
		geolocal: "/geolocal.html"
	};
	
	var instamapsOptions = {
		perfil: perfils[0]	
	};
	
	Instamaps.prototype = {
		
		setPerfil: function(perfil){
			var self = this;
			if(perfils.indexOf(perfil) === -1){
				throw "Perfil no soportado";
			}else{
				self.options.perfil = perfil;
			}
			
			return self;
		}, 
		
		changeSession: function(selector){
			var self = this;
			if(!$){
				throw "jQuery not loaded";
			}
			if(!selector){
				throw "Missing jQuery selector";
			}
			var msg = sessionLink[self.perfil];
			$(selector).attr("href",msg);
			return self;
		},
		
		changeBrand: function(selector){
			var self = this;
			if(!$){
				throw "jQuery not loaded";
			}
			if(!selector){
				throw "Missing jQuery selector";
			}
			var msg = brand[self.perfil];
			$(selector).html(msg);
			return self;
		},
		
		changeBrandLink: function(selector){
			var self = this;
			if(!$){
				throw "jQuery not loaded";
			}
			if(!selector){
				throw "Missing jQuery selector";
			}
			var msg = brandLink[self.perfil];
			$(selector).attr("href",msg);
			return self;
		},
		
		changeGaleria: function(selector){
			var self = this;
			if(!$){
				throw "jQuery not loaded";
			}
			if(!selector){
				throw "Missing jQuery selector";
			}
			var msg = galeriaLink[self.perfil];
			$(selector).attr("href",msg);
			return self;
		},
		
		changeFooter: function(selector){
			var self = this;
			if(!$){
				throw "jQuery not loaded";
			}
			if(!selector){
				throw "Missing jQuery selector";
			}
			var msg = footers[self.perfil];
			$(selector).html(msg);
			return self;
		} 
	
	};
	
	Instamaps.init = function(options){
		var self = this;
		$.extend(self, instamapsOptions, options);
		switch(self.tipusEntitat){
			case 1:
				self.perfil = "instamaps";
				break;
			case 2: 
				self.perfil = "geolocal";
				break;
			default:
				self.perfil = "instamaps";
		}
	}
	
	Instamaps.init.prototype = Instamaps.prototype;
	
	global.Instamaps = Instamaps; 
	
}(window, jQuery));