
;(function(global, $){
	var InstamapsDadesExternes = function(options){
		return new InstamapsDadesExternes.init(options);
	};

	var _options = {
		proxyUrl: ""
	};

	InstamapsDadesExternes.prototype = {
		initUi: function(){
			var self = this;
			self._div = self.container;
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
				});


				$( ".input_dadesExternes_url" ).keypress(function( event ) {
					  if ( event.which == 13 ) {
					     event.preventDefault();
					     self.send($(this).val());
					  }

					});


				$(".bt_dadesExternes_url").on('click', function(e) {

					var input = $(e.target).closest(self._div).find('.input_dadesExternes_url');
				    var url = $.trim(input.val());

				     self.send(url);

				});

			});
			return self;
		},
		send:function(url){
			var self = this;
			if (url === "") {
				
				
				alert(window.lang.translate("Has d'introduïr una URL del servidor"));
			} else if (!isValidURL(url)) {
				//alert(window.lang.translate("La URL introduïda no sembla correcte"));
				self.clear();
				self.show();
				$('.div_dadesExternes_menu').html(
						'<div id="txt_URLfile_error" class="alert alert-danger">'+
							'<span class="glyphicon glyphicon-warning-sign"> </span> '+
								 window.lang.translate("Introdueix una URL vàlida")+
						'</div>'
				);

			} else {
				self.clear();
				self.addFormDadesExternes(url);
			}

			return self;
		},
		clear: function(){

			var self = this;
			$('.div_dadesExternes_menu').hide();
			$('.div_dadesExternes_menu').html('');

			return self;
		},

		show: function(){
			var self = this;
			$(".div_dadesExternes_menu").show();
			return self;
		},

		activarEventAfegirCapa:function(type,urlFile){
			var self = this;
			var nom_capa = window.lang.translate("Capa de fitxer");
			if(type!=undefined && type!="-1") nom_capa+=type;
			$(".input-url-file-name_de").val(nom_capa);

			$(".bt_URLfitxer_go_de").on('click', function(e) {
				e.stopImmediatePropagation();
				$(".div_url_file_message_de").empty();
				$(".div_url_file_message_de").hide();


				var type = $(".select-url-file-format_de").val();
				var epsg = $(".select-url-file-epsg_de").val();
				var opcio = jQuery('.nav-pills-urlfile .active').attr('id');
				var coordX = $(".input-coord-x_de").val();
				var coordY = $(".input-coord-y_de").val();


				if(type!=undefined && type.indexOf("-1")!= -1 || epsg!=undefined && epsg.indexOf("-1")!= -1 && opcio!=undefined && opcio!="codis" && opcio!="adreca"){
					if(type.indexOf("-1")!= -1) $(".select-url-file-format_de").addClass("class_error");
					if(epsg.indexOf("-1")!= -1) $(".select-url-file-epsg_de").addClass("class_error");

				}else if( type!=undefined && (type==".xls" || type==".xlsx" || type==".csv" || type==".txt")
							&&  opcio == "coordenades" && (!isValidValue(coordX) || !isValidValue(coordY) ) ){

					if(!isValidValue(coordX)) $(".input-coord-x_de").addClass("class_error");
					if(!isValidValue(coordY)) $(".input-coord-y_de").addClass("class_error");

				}else if( type!=undefined && (type==".xls" || type==".xlsx" || type==".csv" || type==".txt")
							&&  opcio == "codis" && (!isValidValue($(".input-camp-codi-urlfile_de").val())) ){

					$(".input-camp-codi-urlfile_de").addClass("class_error");

				}else{
					if(!busy){
						busy = true;
						var dinamic;
						if ($('#dinamic_chck').bootstrapSwitch('state')){
			        		dinamic=false;
			        	}
			        	else{
			        		dinamic=true;
			        	}
						createURLfileLayer(urlFile, type, epsg, dinamic,$(".input-url-file-name_de").val(),
								   $(".input-coord-x_de").val(),$(".input-coord-y_de").val(),
								   jQuery('.nav-pills-urlfile .active').attr('id'),//per coordenades o codis o adreces
								   jQuery('.cmd_codiType_Capa_de').val(), jQuery('.cmd_codiType_de').val(), $(".input-camp-codi-urlfile_de").val());

					}else{
						self.clear();
						$('#dialog_dades_ex').modal('hide');
						$('#dialog_carrega_dades').modal('hide');
						$('#dialog_info_upload_txt').html(window.lang.translate("S'està processant un arxiu. Si us plau, espereu que aquest acabi."));
						$('#dialog_info_upload').modal('show');

					}
				}
			});

			return self;


		},


		addFormDadesExternes:function(urlFile){


			var self = this;
			self.show();


			if(urlFile.indexOf(paramUrl.presidentJSON)!= -1){
				getServeiJSONP(urlFile);
			}else if(urlFile.indexOf("socrata")!= -1 && urlFile.indexOf("method=export&format=GeoJSON")!= -1){

				$.get("templates/dadesExternesSocrataTemplate.html",function(data){
					$(".div_dadesExternes_menu").html(data);
					$(".div_url_file_message_de").hide();
					self.activarEventAfegirCapa("-1",urlFile); //TODO verificar
				});

			}else{

				$.get("templates/dadesExternesTemplate.html",function(data){

					try{
					$(".div_dadesExternes_menu").html(data);
					$('.make-switch').bootstrapSwitch();
					$('#dinamic_chk').bootstrapSwitch('state', true, true);
					$('#label-estatic').attr("style","display:none;");
					$('input[name="dinamic-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
	            		if(state.value == true) {
	            			$('#label-dinamic').attr("style","display:none;");
	            			$('#label-estatic').attr("style","display:inline;");
	            		}
	            		else {
	            			$('#label-dinamic').attr("style","display:inline;");
	            			$('#label-estatic').attr("style","display:none;");
	            		}
					});
					$(".div_url_file_message_de").hide();
					$(".input-excel-url-file_de").hide();
					var type = "-1";
					if(urlFile.indexOf(t_file_kml)!=-1) { type = t_file_kml;}
					else if(urlFile.indexOf(t_file_gpx)!=-1) { type = t_file_gpx;}
					else if(urlFile.indexOf(t_file_shp)!=-1) {type = t_file_shp;}
					else if(urlFile.indexOf(t_file_dxf)!=-1) {type = t_file_dxf;}
					else if(urlFile.indexOf(t_file_xlsx)!=-1) { type = t_file_xlsx;}
					else if(urlFile.indexOf(t_file_xls)!=-1) { type = t_file_xls;}
					else if(urlFile.indexOf(t_file_topojson)!=-1) { type = t_file_geojson;}
					else if(urlFile.indexOf(t_file_geojson)!=-1) { type = t_file_geojson;}
					else if(urlFile.indexOf(t_file_json)!=-1) { type = t_file_geojson;}
					else if(urlFile.indexOf(t_file_csv)!=-1) { type = t_file_csv;}
					else if(urlFile.indexOf(t_file_txt)!=-1) { type = t_file_txt;}
					else if(urlFile.indexOf(t_file_dgn)!=-1) { type = t_file_dgn;}
					else if(urlFile.indexOf(t_file_gml)!=-1) { type = t_file_gml;}
					else if(urlFile.indexOf(t_file_json)!=-1) {type = t_file_json;}


					$('.select-url-file-format_de option[value="'+type+'"]').prop("selected", "selected");

					if (type==".kml" ||type==".geojson" ||type==".gpx" || type==".gml"){
						$('.select-url-file-epsg_de option[value="EPSG:4326"]').prop("selected", "selected");
						$(".select-url-file-epsg_de").attr('disabled',true);
					}else if(type==".xls" || type==".xlsx" || type==".csv" || type==".txt"){
						$(".input-excel-url-file_de").show();
						$('.input-excel-url-file_de .nav-pills-urlfile li#codis').removeClass("disabled");
						$('.input-excel-url-file_de .nav-pills-urlfile li a[href="#opt_urlfile_codi"]').attr("data-toggle","tab");
					}else if(type==".json"){
						jQuery(".input-excel-url-file_de").show();
						$('.input-excel-url-file_de .nav-pills-urlfile li#codis').removeClass("disabled");
						$('.input-excel-url-file_de .nav-pills-urlfile li a[href="#opt_urlfile_codi"]').attr("data-toggle","tab");
					}else{
						$('.select-url-file-epsg_de option[value="-1"]').prop("selected", "selected");
						$(".select-url-file-epsg_de").attr('disabled',false);
					}

					self.activarEventAfegirCapa(type,urlFile);



					$('.cmd_codiType_Capa_de').on('change',function(e) {
						var html = "";
						if ($(this).val() == "municipis") {
							html = "<option value='ine'>INE (5 digits)</option><option value='idescat'>IDESCAT (6 digits)</option><option value='municat'>MUNICAT (10 digits)</option><option value='cadastre'>CADASTRE (5 digits)</option>";
						} else {
							html = "<option value='ine'>NUM_COMARCA (2 digits)</option><option value='municat'>MUNICAT (10 digits)</option>";
						}
						$('.cmd_codiType_de').html(html);
					});

					$('.nav-pills-urlfile #codis').on('click', function(){
						$(".select-url-file-epsg_de").attr('disabled',true);
					});

					$('.nav-pills-urlfile #coordenades').on('click', function(){
						$(".select-url-file-epsg_de").attr('disabled',false);
					});

					$('.nav-pills-urlfile #adreca').on('click', function(){
						$(".select-url-file-epsg_de").attr('disabled',true);
					});

					$(".input-coord-x_de").focus(function() {
						$(this).removeClass("class_error");
					});

					$(".input-coord-y_de").focus(function() {
						$(this).removeClass("class_error");
					});

					$(".input-camp-codi-urlfile_de").focus(function() {
						$(this).removeClass("class_error");
					});

					$(".select-url-file-epsg_de").change(function(){
						$(this).removeClass("class_error");
						$(".div_url_file_message_de").empty();
						$(".div_url_file_message_de").hide();
					});

					$('.select-url-file-format_de').change(function() {
						$(this).removeClass("class_error");
						$(".div_url_file_message_de").empty();
						$(".div_url_file_message_de").hide();
						$(".input-excel-url-file_de").hide();

						var ext = $(this).val();
						if ((ext==".kml")||(ext==".gpx") ||(ext==".gml")){
							$('.select-url-file-epsg_de option[value="EPSG:4326"]').prop("selected", "selected");
							$(".select-url-file-epsg_de").attr('disabled',true);
//							$(".input-excel-url-file").hide();
						}else if((ext==".xls")||(ext==".xlsx") || (ext==".csv") || (ext==".txt") ){
							$(".input-excel-url-file_de").show();
							$('.input-excel-url-file_de .nav-pills-urlfile li#codis').show();
							$('.input-excel-url-file_de .nav-pills-urlfile li#adreca').show();
							$('.input-excel-url-file_de .nav-pills-urlfile li#codis').removeClass("disabled");
							$('.input-excel-url-file_de .nav-pills-urlfile li a[href="#opt_urlfile_codi"]').attr("data-toggle","tab");
						}else if(ext==".json"){
							$(".input-excel-url-file_de").show();
							$('a[href^="#opt_urlfile_coord').click();
							$('.input-excel-url-file_de .nav-pills-urlfile li#codis').hide();
							$('.input-excel-url-file_de .nav-pills-urlfile li#adreca').hide();
						}else{
							$(".select-url-file-epsg_de").attr('disabled',false);
//							$(".input-excel-url-file_de").hide();
						}

					});// fi templates

					}catch(Err){
							$.publish('analyticsEvent',{event:['error', 'Error addFormDadesExternes',JSON.stringify(Err)]});
						console.debug(Err);
					}


				});// fi templates



			}//fi else resta


			return self;

	}



	};	//fi prototype

	InstamapsDadesExternes.init = function(options){
		var self = this;
		self = $.extend(self, _options, options);
		self.initUi();
	};

	InstamapsDadesExternes.init.prototype = InstamapsDadesExternes.prototype;

	global.InstamapsDadesExternes = InstamapsDadesExternes;

}(window, jQuery));
