/**
 * 
 */
;(function(global, $){
	
	var Instamaps = function(options){
		return new Instamaps.init(options);
	}
	
	var perfils = ["instamaps","geolocal"];
	
	var footers = {
		instamaps: "InstaMaps Beta",
		geolocal: "InstaMaps.Geolocal"
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
		instamaps: "InstaMaps",
		geolocal: "InstaMaps.GeoLocal"
	};
	
	var brandLink = {
		instamaps: "/index.html",
		geolocal: "/geolocal.html"
	};
	
	var contactEmail = {
		instamaps: "instamapes@icgc.cat",
		geolocal: "geolocal@icgc.cat"	
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
			if (self.perfil=='geolocal'){
				var msg = "http://www.instamaps.cat/"+paramUrl.galeriaPage.substring(1,paramUrl.galeriaPage.length)+"?user="+self.uid;
				$(selector).attr("href",msg);				
			}
			else {
				$(selector).attr("href",msg);
			}
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
		}, 
		
		changeContact: function(selector){
			var self = this;
			if(!$){
				throw "jQuery not loaded";
			}
			if(!selector){
				throw "Missing jQuery selector";
			}
			var msg = contactEmail[self.perfil];
			$(selector).attr("href","mailto:"+msg);
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