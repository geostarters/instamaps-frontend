/*
var InstamapsDadesExternes = InstamapsDadesExternes({container:$('#container_dades_externes'),
 botons: $('#div_emptyWMS'),
 proxyUrl: paramUrl.ows2json, 
 callback: addWmsToMap});

*/
;(function(global, $){
	var InstamapsDadesExternes = function(options){
		return new InstamapsDadesExternes.init(options);
	};
	
	var _options = {
		proxyUrl: "http://www.instamaps.cat/share/jsp/ows2json.jsp?"	
	};
	
	InstamapsDadesExternes.prototype = {
		initUi: function(){
			var self = this;
			self._div = self.container;
			//self._botons = self.botons;
			if (self.loadTemplateParam==undefined) self.loadTemplate();
			return self;
		},
		
		loadTemplate: function(){
			var self = this;
			$.get("templates/dadesExternesBotoTemplate.html",function(data){
				self._div.html(data);
				self._uiloaded = true;
				$(".div_dadesExternes_menu").hide();
				
				$(".input_dadesExternes_url").focus(function() {
					//self.clear();
					//jQuery('#txt_URLWMS').val('');
				});
					
				$(".bt_dadesExternes_url").on('click', function(e) {
					
					var input = $(e.target).closest(self._div).find('.input_dadesExternes_url');					
				    var url = $.trim(input.val());
					console.info(url);
					if (url === "") {
						alert(window.lang.translate("Has d'introduïr una URL del servidor"));
					} else if (!isValidURL(url)) {
						alert(window.lang.translate("La URL introduïda no sembla correcte"));
					} else {
						self.clear();
						alert("OK");
						//self.getCapabilities({url:url});
					}
				});
				
			});
			return self;
		}, 
		
		clear: function(){
			var self = this;
			$('.div_dadesExternes_menu').html('');
			
			return self;
		},
		
		show: function(){
			var self = this;
			$(".layers-wms").show();
			return self;
		},
		
		
	
		
	
		
	};
	
	InstamapsDadesExternes.init = function(options){
		var self = this;
		self = $.extend(self, _options, options);
		self.initUi();
	};
	
	InstamapsDadesExternes.init.prototype = InstamapsDadesExternes.prototype;
	
	global.InstamapsDadesExternes = InstamapsDadesExternes;
	
}(window, jQuery));