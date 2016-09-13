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
			self._botons = self.botons;
			self.loadTemplate();
			return self;
		},
		
		loadTemplate: function(){
			var self = this;
			$.get("templates/wmsTemplate.html",function(data){
				self._div.html(data);
				self._uiloaded = true;
				$(".layers-wms").hide();
				
				$(".url-wms").focus(function() {
					self.clear();
					//jQuery('#txt_URLWMS').val('');
				});
					
				$(".btn-conn-wms").on('click', function(e) {
					
					var input = $(e.target).closest('.txt_ext').find('.url-wms');
					
				  var url = $.trim(input.val());
					
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
			$('.layers-wms').html('');
			$(".layers-wms").hide();
			self._botons.empty();
			return self;
		},
		
		show: function(){
			var self = this;
			$(".layers-wms").show();
			return self;
		},
		
		getLayers: function(options){
			var self = this;
			$(".url-wms").val(options.url);
			self.url = options.url;
			self.name = options.name;			
			options.capa ? self.capa=options.capa : self.capa=null;			
			self.getCapabilities();
			return self;
		}, 
		
		getWMSLayers: function(data){
			var self = this;
			return jQuery.ajax({
				url: self.proxyUrl,
				data: data,
				async: true,
				method: 'post',
				dataType: 'jsonp',
				timeout: 5000
			}).promise();
		},
		
		getCapabilities: function(options){
			var self = this,
				ActiuWMS = {};
			
			self = $.extend(self, options);
			var data = {url: self.url, capa:self.capa};
			
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
				Handlebars.registerHelper("debug", function(optionalValue) {
				  console.log("Current Context");
				  console.log("====================");
				  console.log(this);
				 
				  if (optionalValue) {
				    console.log("Value");
				    console.log("====================");
				    console.log(optionalValue);
				  }
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
					html = "";
					
					if($.isArray(results.Capability.Layer)){
						html = capabilities_template({Layer: results.Capability.Layer});
					}else{
						html = capabilities_template({Layer: [results.Capability.Layer]});
					}
					
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
					
					$('.layers-wms').empty().append(html);
					self.addTreeEvents();
					self._botons.empty();
					self._botons.html(
						'<div style="float:right"><button lang="ca" class="btn btn-success btn-add-wms" >' +
						window.lang.convert("Afegir capes") + '</button></div>');
					
					//if(self.capa){
					if(self.hasOwnProperty('capa')){
						var ls;
						var hits=0;
						//para las capas con nombres de números y que solo son dos capas
						//en el excel puede variar el formato y poner 5.5 en lugar de 5.1
						self.capa = self.capa.replace(/(\d)\.(\d)/,"$1,$2");
						if(self.capa.indexOf(",")!=-1){								//hi ha més una capa
							ls=self.capa.split(",");
							for(i=0; i < ls.length;i++){
								hits=hits + self._ckechLayerWMS(ls[i]);
							}							
						}else{
							ls=self.capa;
							hits=hits + self._ckechLayerWMS(ls);
						}	
						if(hits > 0){
							self.addExternalWMS(false);						
						}else{
							jQuery("#div_controlWMS_OFICIALS").show();
							jQuery("#div_emptyWMS_OFICIALS").show();								
						}						
					}else{
						jQuery("#div_controlWMS_OFICIALS").show();
						jQuery("#div_emptyWMS_OFICIALS").show();
					}
					//ckbox_layer					
					$(".btn-add-wms").on('click', function(e) {
					    self.addExternalWMS(false);
					});
					
				} catch (err) {
					console.debug(err);
					$('.layers-wms').html('<hr lang="ca">'+window.lang.convert("Error en interpretar capabilities")+': ' + err + '</hr>');
				}
			},function(data,status,error){
				status.indexOf('parser')!=-1?alert(window.lang.convert("Error en interpretar capabilities")):alert(window.lang.convert("Error: No s'ha pogut executar l'operació"));
				
				});
			
			return self;
		},
		
		_ckechLayerWMS: function(layerName){
			var self = this;
			var hit=0;
			jQuery(".ckbox_layer").each(function() {		
				if(this.value==layerName){				
				jQuery(this).prop('checked',true);
				hit=hit +1;				
				}				
			});			
			return hit;			
		},	
		
		_getChekedLayers:function(){
			var ch=0;
			$(".ckbox_layer").each(function() {
				if(jQuery(this).prop('checked')){
					ch=ch + 1;
				}
				return ch;					
			});	
		},	
		
		addExternalWMS: function(){
			var self = this,
			_dateFormat = false;
						
			var cc = $('.layers-wms input:checked').map(function(){
				var name = this.value.replace(/:/g,"\\\:");
				if($('#geoservicetime_'+name).length > 0){
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
