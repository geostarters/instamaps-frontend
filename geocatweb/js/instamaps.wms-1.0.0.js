/**
 * 
 */
;(function(global, $){
	var InstamapsWms = function(options){
		return new InstamapsWms.init(options);
	};
	
	var _options = {
		proxyUrl: "http://www.instamaps.cat/share/jsp/ows2json.jsp?"	
	};
	
	InstamapsWms.prototype = {
		initUi: function(){
			var self = this;
			self._div = self.container;
			self.loadTemplate();
			return self;
		},
		
		loadTemplate: function(){
			var self = this;
			$.get("templates/wmsTemplate.html",function(data){
				self._div.html(data);
				self._uiloaded = true;
				$("#div_layersWMS").hide();
				
				$("#txt_URLWMS").focus(function() {
					self.clear();
				});
				
				$("#bt_connWMS").on('click', function(e) {
					var url = $.trim(jQuery('#txt_URLWMS').val());
					if (url === "") {
						alert(window.lang.convert("Has d'introduïr una URL del servidor"));
					} else if (!isValidURL(url)) {
						alert(window.lang.convert("La URL introduïda no sembla correcte"));
					} else {
						self.getCapabilities({url:url});
					}
				});
				
			});
			return self;
		}, 
		
		clear: function(){
			var self = this;
			$('#div_layersWMS').html('');
			$("#div_layersWMS").hide();
			$('#div_emptyWMS').empty();
			return self;
		},
		
		show: function(){
			var self = this;
			$("#div_layersWMS").show();
			return self;
		},
		
		getLayers: function(options){
			var self = this;
			$("#txt_URLWMS").val(options.url);
			self.url = options.url;
			self.name = options.name;
			self.getCapabilities();
			return self;
		}, 
		
		getWMSLayers: function(data){
			var self = this;
			return jQuery.ajax({
				url: self.proxyUrl,
				data: data,
				async: false,
				method: 'post',
				dataType: 'jsonp'
			}).promise();
		},
		
		getCapabilities: function(options){
			var self = this,
				ActiuWMS = {};
			
			self = $.extend(self, options);
			
			var data = {url: self.url};
			
			self.getWMSLayers(data).then(function(results) {
				var bbox, servidor, WMS_BBOX,
				souce_capabilities_template = $("#capabilities-template").html(),
				capabilities_template = Handlebars.compile(souce_capabilities_template);
				
				Handlebars.registerPartial( "list-template", $( "#list-template" ).html() );
				Handlebars.registerHelper('layer', function(context, options) {
				  var ret = "";
				  if (!Handlebars.Utils.isArray(context)){
					  context = [context];
				  }
				  for(var i=0, j=context.length; i<j; i++) {
					  if (!Handlebars.Utils.isArray(context[i])){
						  ret = ret + options.fn(context[i]);
					  }else{
						  for(var k=0, l=context.length; k<l; k++) {
							  ret = ret + options.fn(context[i][k]);
						  }
					  }
				  }
				  return ret;
				});
				
				self.clear().show();

				if (servidor === null) {
					servidor = results.Service.Title;
				}
				try{
					if(results.Capability.Layer.Layer.LatLonBoundingBox){
						bbox = results.Capability.Layer.Layer.LatLonBoundingBox;
						WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
					}else if(results.Capability.Layer.LatLonBoundingBox){
						bbox = results.Capability.Layer.LatLonBoundingBox;
						WMS_BBOX=[[bbox["@miny"], bbox["@minx"]],[bbox["@maxy"], bbox["@maxx"]]];
					}else{
						WMS_BBOX=null;
					}	
				} catch (err) {
					WMS_BBOX=null;
				}
				
				try {
					var matriuEPSG = results.Capability.Layer.CRS,
					epsg = [],
					html = capabilities_template({Layer: [results.Capability.Layer]});
					
					ActiuWMS.servidor = servidor || self.name || results.Capability.Layer.Title;
					ActiuWMS.url = self.url;
					
					if (!matriuEPSG) {
						matriuEPSG = results.Capability.Layer.SRS;
						if (!matriuEPSG) {
							matriuEPSG = results.Capability.Layer[0].CRS;
							
							if (!matriuEPSG) {
								matriuEPSG = results.Capability.Layer[0].SRS;
							}
						}
					}
					if ($.isArray(matriuEPSG)){
						$.each(matriuEPSG, function(index, value) {
							epsg.push(value);
						});
					}else{
						epsg.push(matriuEPSG);
					}
			
					if ($.inArray('EPSG:3857', epsg) != -1) {
						ActiuWMS.epsg = L.CRS.EPSG3857;
						ActiuWMS.epsgtxt = 'EPSG:3857';
					} else if ($.inArray('EPSG:900913', epsg) != -1) {
						ActiuWMS.epsg = L.CRS.EPSG3857;
						ActiuWMS.epsgtxt = 'EPSG:3857';
					} else if ($.inArray('EPSG:4326', epsg) != -1) {
						ActiuWMS.epsg = L.CRS.EPSG4326;
						ActiuWMS.epsgtxt = '4326';
					} else if ($.inArray('CRS:84', epsg) != -1) {
						ActiuWMS.epsg = L.CRS.EPSG4326;
						ActiuWMS.epsgtxt = '4326';
					} else if ($.inArray('EPSG:4258', epsg) != -1) {
						ActiuWMS.epsg = L.CRS.EPSG4326;
						ActiuWMS.epsgtxt = '4326';	
					} else {
						alert(window.lang.convert("No s'ha pogut visualitzar aquest servei: Instamaps només carrega serveis WMS globals en EPSG:3857 i EPSG:4326"));
						return;
					}
					
					self.ActiuWMS = ActiuWMS;
					
					$('#div_layersWMS').empty().append(html);
					self.addTreeEvents();
					$('#div_emptyWMS').empty();
					$('#div_emptyWMS').html(
						'<div style="float:right"><button lang="ca" id="bt_addWMS" class="btn btn-success" >' +
						window.lang.convert("Afegir capes") + '</button></div>');
					
					$("#bt_addWMS").on('click', function(e) {
					    self.addExternalWMS(false);
					});
					
				} catch (err) {
					$('#div_layersWMS').html('<hr lang="ca">'+window.lang.convert("Error en interpretar capabilities")+': ' + err + '</hr>');
				}
			});
			
			return self;
		},
		
		addExternalWMS: function(){
			var self = this,
			_dateFormat = false;
			
			var cc = $('#div_layersWMS input:checked').map(function(){
				if($('#geoservicetime_'+this.value).length > 0){
					_dateFormat = true;
				}
				return this.value;
			});
			cc = jQuery.makeArray(cc);
			cc = cc.join(',');
			
			self.ActiuWMS.wmstime = _dateFormat;
			
			if(cc.length === 0){
				alert(window.lang.convert("Has de seleccionar almenys una capa"));
			}else{
				self.ActiuWMS.layers = cc;
				if(self.callback){
					self.callback(self.ActiuWMS);
				}
			}
			
			return self;
		},
		
		addTreeEvents: function(){
			var self = this;
			
			$('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
		    $('.tree li.parent_li > span').on('click', function (e) {
		        var children = $(this).parent('li.parent_li').find(' > ul > li');
		        if (children.is(":visible")) {
		            children.hide('fast');
		            $(this).attr('title', 'Expand this branch').find(' > i').addClass('glyphicon-folder-close').removeClass('glyphicon-folder-open');
		        } else {
		            children.show('fast');
		            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('glyphicon-folder-open').removeClass('glyphicon-folder-close');
		        }
		        e.stopPropagation();
		    });
		    
		    $('.tree li > span.leaf').on('click', function (e) {
		    	$(this).children('.ckbox_layer').click();
		    });
		    
		    $('.ckbox_layer').on('click', function (e) {
		    	e.stopPropagation();
		    });
		    
		    $('.btn-all').on('click',function(){
		    	$(this).parent('li.parent_li').find('input:checkbox').prop('checked', true);
			});
			
			$('.btn-none').on('click',function(){
				$(this).parent('li.parent_li').find('input:checkbox').prop('checked', false);
			});
			
			return self;
		}
		
	};
	
	InstamapsWms.init = function(options){
		var self = this;
		self = $.extend(self, _options, options);
		self.initUi();
	};
	
	InstamapsWms.init.prototype = InstamapsWms.prototype;
	
	global.InstamapsWms = InstamapsWms;
	
}(window, jQuery));