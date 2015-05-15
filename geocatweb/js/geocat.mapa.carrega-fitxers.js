
//var matriuActiva = [];
//var pending = false
var drgFromMapa = null;
var drgFromBoto = null;
var midaFitxer = 100000000;//en bytes
var ldpercent = 0;
var progressBarShow = true;

var envioArxiu={isDrag:false,
	tipusAcc:'gdal', //gdal,adreca,coordenades,codis
	colX:null,
	colY:null,
	srid:'EPSG:4326',
	bid:null,
	codi:null,
	codiType:null,
	geomType:null,
	type:null,
	camps:null,
	ext:null,
	uid : null,
	mapBusinessId : null,
	markerStyle: null,
	lineStyle: null,
	polygonStyle: null,
	midaFitxer: null
};

var drOpcionsMapa = {
	//url : paramUrl.uploadproxy+"?uid="+$.cookie('uid')+"&",	
	//url : paramUrl.upload_gdal,
	url : paramUrl.upload_gdal_2015,
	paramName : "file", 
	maxFilesize : 100, // MB
	method : 'post',
	// clickable:false,
	accept : function(file, done) {
//		console.debug("File:");
//		console.debug(file);
//		console.debug(file.fullPath);		
	}
};

function creaAreesDragDropFiles() {
	// dropzone
	var opcionsBoto = drOpcionsMapa;
	opcionsBoto.clickable=false;
	
	if (drgFromMapa == null) {

		drgFromMapa = new window.Dropzone("div#map", drOpcionsMapa);

	    
		drgFromMapa.on("addedfile", function(file) {
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades drag&drop', 'addedfile', 1]);
			//_kmq.push.push(['record', 'carregar dades previ', {'from':'mapa', 'tipus user':tipus_user, 'forma carrega':'drag&drop'}]);
			envioArxiu.isDrag=true;
			//console.debug(file);
			accionaCarrega(file,envioArxiu.isDrag);
			
		});	
		
		
		drgFromMapa.on("sending", function(file, xhr, formData) {
			formData.append("nomArxiu", file.name); 
			formData.append("tipusAcc", envioArxiu.tipusAcc); 
			formData.append("colX", envioArxiu.colX);	
			formData.append("colY", envioArxiu.colY);
			formData.append("srid", envioArxiu.srid);
			formData.append("bid", envioArxiu.bid);
			formData.append("codiCAMP", envioArxiu.codi);
			formData.append("codiType", envioArxiu.codiType);
			formData.append("geomType", envioArxiu.geomType);
			formData.append("type", envioArxiu.type);
			formData.append("camps", envioArxiu.camps);
			formData.append("ext", envioArxiu.ext);
			formData.append("uid", $.cookie('uid'));
			formData.append("mapBusinessId", url('?businessid'));
			formData.append("midaFitxer", envioArxiu.midaFitxer);
			var file = file.name.split(".");
			formData.append("serverName", file[0]);
			formData.append("markerStyle", envioArxiu.markerStyle);	
			formData.append("lineStyle", envioArxiu.lineStyle);	
			formData.append("polygonStyle", envioArxiu.polygonStyle);			
			formData.append("uploadFile", paramUrl.uploadFile);
															
		});
				
		drgFromMapa.on('success', function(file, resposta) {
			drgFromMapa.removeAllFiles(true);
			if(resposta){
				resposta=jQuery.trim(resposta);
				resposta=jQuery.parseJSON(resposta);
				if(resposta.status=="OK"){
					
					progressBarShow = true;
					$('#dialog_carrega_dades').modal('hide');
					addDropFileToMap(resposta);
					
				}else if(resposta.status=="MAX_GEOM"){
					//Carreguem geojsonVT
					console.debug('Fitxer MAX_GEOM:');
					//console.timeEnd('JSON.parse');
					console.debug(resposta);
					
					console.debug("ESTILS:");
					console.debug(envioArxiu.markerStyle);
					console.debug(envioArxiu.lineStyle);
					console.debug(envioArxiu.polygonStyle);
					

//					envioArxiu.markerStyle = JSON.stringify(getMarkerRangFromStyle(defaultPunt));
//					envioArxiu.lineStyle = JSON.stringify(getLineRangFromStyle(canvas_linia));
//					envioArxiu.polygonStyle = JSON.stringify(getPolygonRangFromStyle(canvas_pol));					
					
					//{"isCanvas":false,"color":"transparent","marker":"orange","simbolColor":"#000000","radius":6,"iconSize":"28#42","iconAnchor":"14#42","simbol":"","opacity":100,"label":false,"labelSize":10,"labelFont":"arial","labelColor":"#000000"}
					//{"isCanvas":false,"color":"#ffc500","marker":"punt_r","simbolColor":"#000000","radius":6,"iconSize":"34#34","iconAnchor":"17#17","simbol":"anchor font17","opacity":100,"label":false,"labelSize":10,"labelFont":"arial","labelColor":"#000000"}
					//{"isCanvas":true,"simbolSize":6,"color":"#ff0000","borderColor":"#ffffff","borderWidth":2,"opacity":90,"label":false,"labelSize":10,"labelFont":"arial","labelColor":"#000000"}
					
					var polStyle = jQuery.parseJSON(envioArxiu.polygonStyle);
					var linStyle = jQuery.parseJSON(envioArxiu.lineStyle);
					var poiStyle = jQuery.parseJSON(envioArxiu.markerStyle);
					if(!poiStyle.isCanvas) poiStyle = default_circulo_style;
					
					console.debug("alpha:");
					console.debug(polStyle.opacity/10);
					
					var options = {
							//pane: 'objectsPane',
							url : resposta.url,
							style: {
								point: {
									radius: poiStyle.simbolSize,//6,
									fillColor: poiStyle.color,//"#ff0000",
									strokeColor: poiStyle.borderColor,//"#ffffff",
									stroke: poiStyle.borderWidth//2
								},
								line: {
									strokeColor: linStyle.color,
									stroke: linStyle.lineWidth	
								},
								polygon: {
									fillColor: polStyle.color,
									strokeColor: polStyle.borderColor,
									stroke: polStyle.borderWidth, 
									alpha: polStyle.opacity/100//alpha?
								}
							}							
					};
					
					var canvasTiles = L.tileLayer.geoJSON(options);					
					
					//Creo la capa servidor
					if(typeof url('?businessid') == "string"){
						var data = {
							uid:$.cookie('uid'),
							mapBusinessId: url('?businessid'),
							serverName: file.name,//nomCapa,//+' '+ (parseInt(controlCapes._lastZIndex) + 1),
							serverType: t_geojsonvt,
							calentas: false,
				            activas: true,
				            visibilitats: true,
				            order: canvasTiles.options.zIndex,//controlCapes._lastZIndex+1,
				            epsg: '4326',
//				            imgFormat: 'image/png',
//				            infFormat: 'text/html',
				            tiles: true,	            
				            transparency: true,
				            opacity: 1,
				            visibilitat: 'O',
				            url: resposta.url,//urlFile,//Provar jQuery("#txt_URLJSON")
				            calentas: false,
				            activas: true,
				            visibilitats: true,
				            options: JSON.stringify(options)//'{"style":"'+options.style+'"}'
						};
						
						createServidorInMap(data).then(function(results){
								if (results.status == "OK"){
									
									_gaq.push(['_trackEvent', 'mapa', tipus_user+'geojsonvt', resposta.url, 1]);
									//_kmq.push.push(['record', 'dades externes', {'from':'mapa', 'tipus user':tipus_user, 'url':urlFile,'mode':'dinamiques'}]);
									
									canvasTiles.options.businessId = results.results.businessId;
									
									canvasTiles.options.nom = file.name;
									canvasTiles.options.tipus = t_geojsonvt;
									canvasTiles.options.url =  resposta.url;
									
									//Codi que serviria per la versio 0.8 de leaflet
									/*
									var geojsonPane = map.createPane('geojsonvtPane');
									geojsonPane.style.zIndex = 11;
									canvasTiles.options.pane = 'geojsonvtPane';
									canvasTiles.addTo(map);
									*/
									
//									canvasTiles.bringToFront();
//									console.debug("info map:");
//									console.debug(map._getMapPanePos());
//									console.debug(map.getPanes());
									
									map.addLayer(canvasTiles);
									//canvasTiles.bringToFront();
									
									
//									console.debug("Prova:");
//									var topPane = map._createPane('leaflet-top-pane', map.getPanes().mapPane);
									var topPane = map.getPanes().mapPane.getElementsByClassName("leaflet-top-pane");
//									if(!isValidValue(topPane)){
									if(topPane.length <= 0){
										topPane = L.DomUtil.create('div', 'leaflet-top-pane', map.getPanes().mapPane);
									}
									
//									console.debug("toppane:");
//									console.debug(topPane);									
//									console.debug($("div.leaflet-top-pane"));
									
									//var topPane = L.DomUtil.create('div', 'leaflet-top-pane', map.getPanes().mapPane);
									//var topLayer = L.mapbox.tileLayer('lxbarth.map-vtt23b1i').addTo(map);
//									topPane.appendChild(canvasTiles.getContainer());
									

									$("div.leaflet-top-pane").append(canvasTiles.getContainer());
									
//							map.getPanes().mapPane.getElementsByClassName("leaflet-top-pane");
									//topLayer.setZIndex(9);
//									console.debug("Fi Prova:");	
//									console.debug(map.getPanes());
									
									canvasTiles.setZIndex(4);
									
//									console.debug("mapa:");
//									console.debug(map);
									
//									console.debug("canvasTiles:");
//									console.debug(canvasTiles);									
									

									
									canvasTiles.options.zIndex = controlCapes._lastZIndex + 1;
									controlCapes.addOverlay(canvasTiles, file.name, true);
									controlCapes._lastZIndex++;
									
									$('#dialog_carrega_dades').modal('hide');	
									activaPanelCapes(true);
									
								}else{
									console.debug("1.Error a createServidorInMap:"+results.status);
									var txt_error = window.lang.convert("Error durant la càrrega de dades. Torni a intentar-ho");
									jQuery("#div_url_file_message").html(txt_error);							
								}
						},function(results){
							console.debug("2.Error a createServidorInMap:"+results.status);
							var txt_error = window.lang.convert("Error durant la càrrega de dades. Torni a intentar-ho");
							jQuery("#div_url_file_message").html(txt_error);					
						});
					}				
					
					
				}else{
					
					var txt_error = "ERROR";
					progressBarShow = false;
					jQuery('#progress_bar_carrega_dades').hide();
					
					if(!resposta.codi){
						txt_error = window.lang.convert("Error en la càrrega de l'arxiu: retorn buit");
					}else if(resposta.codi.indexOf("CONVERT ERROR")!= -1){
						var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
					}else if(resposta.codi.indexOf("501")!= -1){//+ de 5000 punts
						txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 5000 o menys i torni a intentar-ho");
					}else if(resposta.codi.indexOf("502")!= -1){//+ de 1000 features
						txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 1000 o menys i torni a intentar-ho");
					}else if(resposta.codi.indexOf("503")!= -1){//+ de 6000 geometries
						txt_error += ": "+window.lang.convert("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho");
					}else{
						txt_error = window.lang.convert("Error en la càrrega de l'arxiu");
					}
					
					_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', resposta.codi, 1]);
					//_kmq.push.push(['record', 'carregar dades error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':resposta.codi}]);
					jQuery("#div_carrega_dades_message").html("<span class='fa fa-warning sign'></span>"+txt_error);
					jQuery("#div_carrega_dades_message").show();	
					$('#dialog_error_carrega_dades').modal('show');
				}
			
			}else{
				progressBarShow = false;
				jQuery('#progress_bar_carrega_dades').hide();
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', resposta.codi, 1]);
				//_kmq.push.push(['record', 'carregar dades error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':resposta.codi}]);
				jQuery("#div_carrega_dades_message").html("<span class='fa fa-warning sign'></span>"+window.lang.convert("Error en la càrrega de l'arxiu"));
				jQuery("#div_carrega_dades_message").show();
				$('#dialog_error_carrega_dades').modal('show');
			}
		});
		
		drgFromMapa.on('error', function(file, errorMessage) {
			drgFromMapa.removeAllFiles(true);
			progressBarShow = false;
			jQuery('#progress_bar_carrega_dades').hide();
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', 'Sense codi error', 1]);
			//_kmq.push.push(['record', 'carregar dades error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':'Sense codi error'}]);
			jQuery("#div_carrega_dades_message").html("<span class='fa fa-warning sign'></span>"+window.lang.convert("Error en la càrrega de l'arxiu"));
			jQuery("#div_carrega_dades_message").show();
			$('#dialog_error_carrega_dades').modal('show');
		});
		
		drgFromMapa.on('uploadprogress', function(file, progress,bytesSent) {
			//jQuery('#prg_bar').css('width',progress+"%");
		});
		
		
	}
}



function uploadprogress(){
//	ldpercent=0;
	if(progressBarShow){
		jQuery('#progress_bar_carrega_dades').show();
		ldpercent += 10;    
		if(ldpercent>100){ ldpercent = 100;    }  
		jQuery('#prg_bar').css('width',ldpercent+"%");
		if(ldpercent<100){ setTimeout("uploadprogress()", 1000);}	
	}
}

function addFuncioCarregaFitxers(){
	
	addHtmlInterficieCarregarFitxers();
	addHtmlModalCarregarFitxers();
	addHtmlModalErrorCarregarFitxers();
	
	// zona 1
	jQuery('#div_carrega_dades').on("click", function(e) {
		
		obreModalCarregaDades(false);
		var opcionsBoto = drOpcionsMapa;
		opcionsBoto.clickable = true;

		
		if (drgFromBoto == null) {
			//drgFromBoto = new window.Dropzone("input#upload_file", opcionsBoto);
			drgFromBoto = new window.Dropzone("button#upload_file", opcionsBoto);

			drgFromBoto.on("addedfile", function(file) {
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades menu', 'addedfile', 1]);
				//_kmq.push.push(['record', 'carregar dades previ', {'from':'mapa', 'tipus user':tipus_user, 'forma carrega':'menu'}]);
				drgFromBoto.removeAllFiles(true);
				envioArxiu.isDrag=false;
				accionaCarrega(file, envioArxiu.isDrag);			
			});

			drgFromBoto.on("sending", function(file, xhr, formData) {
				//console.info("sending");
				formData.append("nomArxiu", file.name); 
				formData.append("tipusAcc", envioArxiu.tipusAcc); 
				formData.append("colX", envioArxiu.colX);	
				formData.append("colY", envioArxiu.colY);
				formData.append("srid", envioArxiu.srid);
				formData.append("bid", envioArxiu.bid);
				formData.append("codiCAMP", envioArxiu.codi);
				formData.append("codiType", envioArxiu.codiType);
				formData.append("geomType", envioArxiu.geomType);
				formData.append("type", envioArxiu.type);
				formData.append("camps", envioArxiu.camps);
				formData.append("ext", envioArxiu.ext);
				formData.append("markerStyle", envioArxiu.markerStyle);	
				formData.append("lineStyle", envioArxiu.lineStyle);	
				formData.append("polygonStyle", envioArxiu.polygonStyle);	
				formData.append("uid", $.cookie('uid'));
				formData.append("mapBusinessId", url('?businessid'));
				formData.append("midaFitxer", envioArxiu.midaFitxer);
				var file = file.name.split(".");
				formData.append("serverName", file[0]);
				formData.append("uploadFile", paramUrl.uploadFile);
														
			});
			
			drgFromBoto.on('success', function(file, resposta) {
				drgFromBoto.removeAllFiles(true);
				$('#dialog_carrega_dades').modal('hide');
				if(resposta){
					resposta=jQuery.trim(resposta);
					resposta=jQuery.parseJSON(resposta);
					if(resposta.status=="OK"){			
						addDropFileToMap(resposta);
					}else{
//						alert(window.lang.convert("Error en la càrrega de l'arxiu"));
						var txt_error = "ERROR";
						if(results.results.indexOf("RuntimeException")!= -1){
							var txt_error = window.lang.convert("Error a les dades del fitxer: Unifiqui els camps de dades i torni a intentar-ho.");
						}else if(resposta.codi.indexOf("CONVERT ERROR")!= -1){
							var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
						}else if(resposta.codi.indexOf("501")!= -1){//+ de 5000 punts
							txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 5000 o menys i torni a intentar-ho");
						}else if(resposta.codi.indexOf("502")!= -1){//+ de 1000 features
							txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 1000 o menys i torni a intentar-ho");
						}else if(resposta.codi.indexOf("503")!= -1){//+ de 6000 geometries
							txt_error += ": "+window.lang.convert("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho");
						}else{
							txt_error = window.lang.convert("Error en la càrrega de l'arxiu");
						}
						_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', resposta.codi, 1]);
						//_kmq.push.push(['record', 'carregar dades error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':resposta.codi}]);
						jQuery("#div_carrega_dades_message").html("<span class='fa fa-warning sign'></span>"+txt_error);
						jQuery("#div_carrega_dades_message").show();	
						$('#dialog_error_carrega_dades').modal('show');
					}
				}
				
			});
			
			drgFromBoto.on('error', function(file, errorMessage) {
				drgFromBoto.removeAllFiles(true);
				$('#dialog_carrega_dades').modal('hide');
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', 'Sense codi error', 1]);
				//_kmq.push.push(['record', 'carregar dades error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':'Sense codi error'}]);
				jQuery("#div_carrega_dades_message").html("<span class='fa fa-warning sign'></span>"+window.lang.convert("Error en la càrrega de l'arxiu"));
				jQuery("#div_carrega_dades_message").show();		
				$('#dialog_error_carrega_dades').modal('show');
//				alert(window.lang.convert("Error en la càrrega de l'arxiu"));	
			});
			
			drgFromBoto.on('uploadprogress', function(file, progress,bytesSent) {
				//console.info("progress");
				//jQuery('#prg_bar').css('width',progress+"%");

			});
		}

	});	
	
	//Botons per enviar arxius
	jQuery("#bt_esborra_ff").on('click', function() {
		if(envioArxiu.isDrag){
			drgFromMapa.removeAllFiles(true);	
		}else{
			drgFromBoto.removeAllFiles(true);
		}
		jQuery("#file_name").text("");
		jQuery('#dv_optCapa').hide();
		jQuery('#dv_optSRS').hide();
		jQuery("#bt_esborra_ff").hide();
		jQuery('#prg_bar').css('width',"0%");
	});	
	
	jQuery("#load_TXT_coord").on('click', function() {// fitxer TXT
		var isOK=false;
		var colX = jQuery("#cmd_upload_colX").val();
		var colY = jQuery("#cmd_upload_colY").val();
		var srid = jQuery("#select-upload-epsg").val();
		
		if (colX == "null" || colY == "null" ||srid == "null"  ) {
			isOK = false;
			alert(window.lang.convert("Cal indicar els camps de les coordenades i el sistema de referència"));
		}else{
			isOK = true;
			
			if(envioArxiu.ext=="csv"){
				envioArxiu.tipusAcc='gdal'; 
			}else if(envioArxiu.ext=="txt"){
					envioArxiu.tipusAcc='gdal'; 	
			}else{
				envioArxiu.tipusAcc='coordenades';	
			}
			
			 //gdal,adreca,coordenades,codis
			envioArxiu.colX=colX;
			envioArxiu.colY=colY;
			envioArxiu.srid=srid;	
			enviarArxiu();
		}	
	});	
	
	jQuery("#load_TXT_adre").on('click', function() {// fitxer TXT	
		var cc=$('input:radio[name="radio_adre"]:checked').val();
		//var isOK=false;
		var isOK=true; //mientras adaptamos el nuevo geocodificador
		envioArxiu.tipusAcc='adreca'; 
		if(cc == '0'){
		       if (jQuery('#cmd_upload_adre_0').val()!="null"){
		    	   isOK=true; 
		    	   envioArxiu.tipusAcc='adreca'; 
		    	   envioArxiu.camps=jQuery('#cmd_upload_adre_0').val();
		       }else{
		    	   isOK=false;
		    	   alert(window.lang.convert("Cal indicar el camp que conté l'adreça"));
		    	  
		       };	      
		    }else if(cc == '1'){	    	
		    	var nc=jQuery("#cmd_upload_adre_11").val();
		    	var mun=jQuery("#cmd_upload_adre_12").val();
		    	
		    	if((nc!='null') && (mun!='null') ){ 
		    		 isOK=true; 
		    		 envioArxiu.tipusAcc='adreca';
		    		 envioArxiu.camps=nc+","+mun;    		
		    	}else{
		    		 isOK=false;
			    	 alert(window.lang.convert("Cal indicar els camps que contenen l'adreça"));
		    	}
		    }else if(cc == '2'){	    	
		    	var nc=jQuery("#cmd_upload_adre_21").val();
		    	var numc=jQuery("#cmd_upload_adre_22").val();
		    	var mun=jQuery("#cmd_upload_adre_23").val();
		    	
		    	if((nc!='null') && (numc!='null') && (mun!='null') ){ 
		    		 isOK=true; 
		    		 envioArxiu.tipusAcc='adreca';
		    		 envioArxiu.camps=nc+","+numc+","+mun;    		
		    	}else{
		    		 isOK=false;
			    	 alert(window.lang.convert("Cal indicar els camps que contenen l'adreça"));
		    	}
		    }	
		if(isOK){enviarArxiu();}
	});

	jQuery("#load_TXT_codi").on('click', function() {// fitxer codi
				 var isOK = true;
				 if (jQuery('#cmd_upload_codi').val()!="null"){
					 isOK=true; 
				  	   envioArxiu.tipusAcc='codis'; 
				  	   envioArxiu.codi=jQuery('#cmd_upload_codi').val();
					   
					   //envioArxiu.codi="CODI INE";
				  	 envioArxiu.geomType=jQuery('#cmd_codiType_Capa').val();
					 envioArxiu.codiType=jQuery('#cmd_codiType').val();
						
				     }else{
				  	   isOK=false;
				  	   alert(window.lang.convert("Cal indicar el camp que conté el codi"));
				  	  
				     };
					
				     if(isOK){enviarArxiu();}
	});

	jQuery("#load_FF_SRS_coord").on('click', function() {
		 var isOK = true;	
		 if (jQuery('#select-upload-ff-epsg').val()!="null"){
	  	   isOK=true; 
	  	   envioArxiu.tipusAcc='gdal'; 
	  	   envioArxiu.srid=jQuery('#select-upload-ff-epsg').val();
	     }else{
	  	   isOK=false;
	  	   alert(window.lang.convert("Cal indicar el sistema de referència"));
	  	  
	     };
	     if(isOK){enviarArxiu();}
	});


	jQuery('#bt_upload_cancel').on("click", function(e) {
		$('#dialog_carrega_dades').modal('hide');
		if(envioArxiu.isDrag){
			drgFromMapa.uploadFile(drgFromMapa.files[0]);	
		}else{
			drgFromBoto.uploadFile(drgFromBoto.files[0]);;
		}
	});

	jQuery('#cmd_codiType_Capa').on('change',function(e) {
						var html = "";
						if (jQuery(this).val() == "municipis") {
							html = "<option value='ine'>INE (5 digits)</option><option value='idescat'>IDESCAT (6 digits)</option><option value='municat'>MUNICAT (10 digits)</option><option value='cadastre'>CADASTRE (5 digits)</option>";
						} else {
							html = "<option value='ine'>NUM_COMARCA (2 digits)</option><option value='municat'>MUNICAT (10 digits)</option>";
						}
						jQuery('#cmd_codiType').html(html);
					});

	$('input:radio[name="radio_adre"]').change(function(){
	    
		var cc=$(this).val(); 
		if(cc == '0'){
	       jQuery('#cmd_upload_adre_0').attr('disabled',false);
	       jQuery("[id*='cmd_upload_adre_1']").attr('disabled',true);
	       jQuery("[id*='cmd_upload_adre_2']").attr('disabled',true);
	    }else if(cc == '1'){
	    	jQuery("[id*='cmd_upload_adre_1']").attr('disabled',false);
	    	jQuery('#cmd_upload_adre_0').attr('disabled',true);
	    	jQuery("[id*='cmd_upload_adre_2']").attr('disabled',true);
	    }else if(cc == '2'){
	    	jQuery("[id*='cmd_upload_adre_2']").attr('disabled',false);
	    	jQuery('#cmd_upload_adre_0').attr('disabled',true);
	    	jQuery("[id*='cmd_upload_adre_1']").attr('disabled',true);
	    	
	    }	
	});	
	
}

function enviarArxiu(){
	ldpercent=0;
	uploadprogress();
	if(envioArxiu.isDrag){
		drgFromMapa.uploadFile(drgFromMapa.files[0]);	
	}else{
		drgFromBoto.uploadFile(drgFromBoto.files[0]);;
	}
}

function obreModalCarregaDades(isDrag) {

	$('#dialog_carrega_dades').modal('show');
	
	if(isDrag){
		$('#upload_file').attr('disabled',true);
	}else{
		$('#upload_file').attr('disabled',false);
	}
	
	jQuery('#dv_optCapa').hide();
	jQuery('#dv_optSRS').hide();
	$('#url').val(paramUrl.dragFile);
	jQuery('#prg_bar').css('width',"0%");
	jQuery("#bt_esborra_ff").hide();
	jQuery("#file_name").text("");
}

function accionaCarrega(file,isDrag) {
	//console.debug("accionaCarrega");
	var ff = miraFitxer(file);
	var obroModal = false;
	if (ff.isValid) {
		//Careguem estils seleccionats per enviar amb el fitxer
		loadDefaultStyles();
		
		if ( isDrag) {obreModalCarregaDades(true);}
		jQuery("#file_name").text(file.name);
		jQuery("#bt_esborra_ff").show();
		if ((ff.ext == "csv") || (ff.ext == "txt")) {
			obteCampsCSV(file);
			obroModal = true;
		} else if (ff.ext == "xlsx") {

			obteCampsXLSX(file);
			obroModal = true;
		} else if (ff.ext == "xls") {
			obteCampsXLS(file);
			obroModal = true;
		} else if ((ff.ext == "dgn") || (ff.ext == "dxf") || (ff.ext == "zip") || (ff.ext == "geojson") || (ff.ext == "json")) {
			jQuery('#dv_optCapa').hide();
			jQuery('#dv_optSRS').show();
			obroModal = true;
		}else{
			envioArxiu.tipusAcc='gdal'; 
			enviarArxiu();
			obroModal = false;
		}

	} else { // novalid

		alert(ff.msg);
		obroModal = false;
		
		if(isDrag){
			drgFromMapa.removeAllFiles(true);		
			}else{
			drgFromBoto.removeAllFiles(true);								
			}
	}
}


function analitzaMatriu(matriu) {
	var op = [];
	jQuery('#dv_optCapa').show();
	jQuery('#dv_optSRS').hide();

	
	$.each(matriu, function(index, value) {
		op.push("<option value=\"" + value + "\">" + value.toUpperCase()
				+ "</option>");
	});

	jQuery('#cmd_upload_colX').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_colY').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_0').html("<option value='null'>" + window.lang.convert('Selecciona un adreça sencera')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_11').html("<option value='null'>" + window.lang.convert('Selecciona nom carrer i número')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_12').html("<option value='null'>" + window.lang.convert('Selecciona municipi')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_21').html("<option value='null'>" + window.lang.convert('Selecciona nom carrer')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_22').html("<option value='null'>" + window.lang.convert('Selecciona número')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_adre_23').html("<option value='null'>" + window.lang.convert('Selecciona municipi')+ "</option>"+op.join(" "));
	
	jQuery('#cmd_upload_codi').html("<option value='null'>" + window.lang.convert('Selecciona un camp amb el codi')+ "</option>"+op.join(" "));

	var fieldType = "";
	for (var x = 0; x < matriu.length; x++) {

		if (matriu[x].toUpperCase() == "X" || matriu[x].toUpperCase() == "LON"
				|| matriu[x].toUpperCase() == "LONGITUD") {
			fieldType = "colX";
			$('#cmd_upload_colX option:contains("' + matriu[x] + '")').prop(
					'selected', true);
//			isCoordinates = true;

			$('#nav_pill a[href="#opt_coord"]').tab('show');

		} else if (matriu[x].toUpperCase() == "Y"
				|| matriu[x].toUpperCase() == "LAT"
				|| matriu[x].toUpperCase() == "LATITUD") {

			fieldType = "colY";
			$('#cmd_upload_colY option:contains("' + matriu[x] + '")').prop(
					'selected', true);
//			isCoordinates = true;
			$('#nav_pill a[href="#opt_coord"]').tab('show');

		} else if (matriu[x].toUpperCase() == "CARRER"
				|| matriu[x].toUpperCase() == "ADRECA") {
			fieldType = "adre";
			$('#cmd_upload_adre option:contains("' + matriu[x] + '")').prop(
					'selected', true);
//			isCoordinates = false;
			$('#nav_pill a[href="#opt_adreca"]').tab('show');
		} else if (matriu[x].toUpperCase() == "MUNICIPI"
				|| matriu[x].toUpperCase() == "MUNI"
				|| matriu[x].toUpperCase() == "POPBLA"
				|| matriu[x].toUpperCase() == "COMARC") {
			fieldType = "adre";
			$('#cmd_upload_mun option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			$('#nav_pill a[href="#opt_adreca"]').tab('show');
//			isCoordinates = false;
		} else if (matriu[x].toUpperCase() == "ID"
				|| matriu[x].toUpperCase() == "BID"
				|| matriu[x].toUpperCase() == "CODI") {
			fieldType = "bid";
		} else if (matriu[x].toUpperCase() == "CODI_INE"
				|| matriu[x].toUpperCase() == "CODI INE"
				|| matriu[x].toUpperCase() == "INE"
				|| matriu[x].toUpperCase() == "CODI_MUNICAT"
				|| matriu[x].toUpperCase() == "MUNICAT"
				|| matriu[x].toUpperCase() == "IDESCAT"
				|| matriu[x].toUpperCase() == "CADASTRE") {
			fieldType = "codi";
			$('#cmd_upload_codi option:contains("' + matriu[x] + '")').prop(
					'selected', true);
			$('#nav_pill a[href="#opt_codi"]').tab('show');
		}

	}

}



function obteCampsCSV(file) {
	var matriuActiva = [];
	var reader = new FileReader();
	reader.onload = function(e) {
		var csvval = e.target.result.split("\n");
		var separador = ";";
		if (csvval[0].indexOf(";") != -1) {
			separador = ";";
		} else if (csvval[0].indexOf(",") != -1) {
			separador = ",";
		} else if(csvval[0].indexOf(",") != -1) {
			separador = " ";
		}
		var csvvalue = csvval[0].split(separador);
		for ( var i = 0; i < csvvalue.length; i++) {
			matriuActiva.push(csvvalue[i].replace("\r", ""));
		}
		analitzaMatriu(matriuActiva);
	};
	reader.readAsText(file);

}

function xlsworker(data, cb) {
	var worker = new Worker('/llibreries/js/formats/xlsworker.js');
	worker.onmessage = function(e) {
		
		
		
		switch (e.data.t) {
		case 'ready':
			break;
		case 'e':
			//cb(e.data.d);
			console.error(e);
			break;
		case 'xls':
			cb(e.data.d);
			break;
		}
	};
	worker.postMessage(data);
}

function obteCampsXLS(f) {
	var reader = new FileReader();
	var name = f.name;
	reader.onload = function(e) {
		var data = e.target.result;
		var use_worker = true;//CAL?¿?¿?
		if (use_worker && typeof Worker !== 'undefined') {
			
			xlsworker(data, llegirTitolXLS);
		} else {

			var wb = XLS.read(data, {
				type : 'binary'
			});
						llegirTitolXLS(wb);
		}
	};
	reader.readAsBinaryString(f);

}

function llegirTitolXLS(workbook) {
	var matriuActiva = [];
	if(workbook){
			//workbook.SheetNames.forEach(function(sheetName) {
				var sheetName=workbook.SheetNames[0];
				matriuActiva = get_columns(workbook.Sheets[sheetName], 'XLS');
				analitzaMatriu(matriuActiva);
			//});
	}else{
		
		$('#dialog_carrega_dades').modal('hide');
		alert(window.lang.convert("Versió incorrecta. No es pot llegir aquest XLS."));
	}
	return matriuActiva;

}

function obteCampsXLSX(f) {
	var rABS = typeof FileReader !== 'undefined'
		&& typeof FileReader.prototype !== 'undefined'
		&& typeof FileReader.prototype.readAsBinaryString !== 'undefined';	
	var matriuActiva = [];
	var reader = new FileReader();
	var name = f.name;
	reader.onload = function(e) {
		var data = e.target.result;
		var wb, arr, xls;
		var readtype = {
			type : rABS ? 'binary' : 'base64'
		};
		if (!rABS) {
			arr = fixdata(data);
			data = btoa(arr);
		}
		xls = [ 0xd0, 0x3c ].indexOf(data.charCodeAt(0)) > -1;
		if (!xls && arr)
			xls = [ 0xd0, 0x3c ].indexOf(arr[0].charCodeAt(0)) > -1;
		if (rABS && !xls && data.charCodeAt(0) !== 0x50)
			alert("Error arxiu");
		function doit() {
			try {
				var useworker = typeof Worker !== 'undefined';
				if (useworker) {
					sheetjsw(data, llegirTitolXLSX, readtype, xls);
					return;
				}
				if (xls) {
					wb = XLS.read(data, readtype);
					llegirTitolXLSX(wb, 'XLS');
				} else {
					wb = XLSX.read(data, readtype);
					llegirTitolXLSX(wb, 'XLSX');
				}
			} catch (e) {
				alert(window.lang.convert("No es pot llegir l'arxiu"));
			}
		}

		if (e.target.result.length > 500000) {
			alert(window.lang.convert("Arxiu massa gran!!"));

		} else {
			doit();
		}
	};
	if (rABS)
		reader.readAsBinaryString(f);
	else
		reader.readAsArrayBuffer(f);
}

function llegirTitolXLSX(wb, type, sheetidx) {
	var matriuActiva = [];
//	last_wb = wb;
//	last_type = type;
	var sheet = wb.SheetNames[sheetidx || 0];
	if (type.toLowerCase() == 'xls' && wb.SSF)
		XLS.SSF.load_table(wb.SSF);
	matriuActiva = get_columns(wb.Sheets[sheet], type);
	analitzaMatriu(matriuActiva);
	return matriuActiva;
}

function get_columns(sheet, type) {
	var val, rowObject, range, columnHeaders, emptyRow, C;
	range = XLS.utils.decode_range(sheet["!ref"]);
	columnHeaders = [];
	for (C = range.s.c; C <= range.e.c; ++C) {
		val = sheet[XLS.utils.encode_cell({
			c : C,
			r : range.s.r
		})];
		if (!val)
			continue;
		columnHeaders[C] = type.toLowerCase() == 'xls' ? XLS.utils
				.format_cell(val) : val.v;
		// console.log(val, columnHeaders[C]);
	}
	return columnHeaders;
}

;
function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for (; l < data.byteLength / w; ++l)
		o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l
				* w + w)));
	o += String.fromCharCode.apply(null, new Uint8Array(data.slice(o.length)));
	return o;
}

function sheetjsw(data, cb, readtype, xls) {
	var pending = true;
	var worker = new Worker('/llibreries/js/formats/xlsxworker.js');
	worker.onmessage = function(e) {
		switch (e.data.t) {
		case 'ready':
			break;
		case 'e':
			pending = false;
			console.error(e.data.d);
			break;
		case 'xls':
		case 'xlsx':
			pending = false;
			cb(JSON.parse(e.data.d), e.data.t);
			break;
		}
	};
	worker.postMessage({
		d : data,
		b : readtype,
		t : xls ? 'xls' : 'xlsx'
	});
}

//var last_wb, last_type;

function miraFitxer(fitxer) {

	var obj = {}

	obj.ext = fitxer.name.split('.').pop().toLowerCase();

	var arr = [ 'shp', 'xls', 'xlsx', 'dgn', 'dxf', 'zip', 'geojson', 'kml',
			'kmz', 'gml', 'xml', 'gpx', 'txt', 'csv', 'json' ];
	
	if (jQuery.inArray(obj.ext, arr) != -1) { // hi hso
	
		if(obj.ext=="shp"){
			obj.isValid = false;
			obj.msg =  window.lang.convert("El fitxer SHP ha d'anar dins d'un ZIP juntament amb els fitxers SHX i DBF.");	
		
		}else{
		
				if (fitxer.size < midaFitxer) {			
					obj.isValid = true;		
				
				} else {
								
					obj.isValid = false;
					obj.msg =  window.lang.convert("La mida del fitxer és massa gran. Mida màxima 10MB");
					}
		}

	} else {
		obj.isValid = false;
		obj.msg = window.lang.convert("Tipus de fitxer no acceptat");
	}
	
	envioArxiu.ext=obj.ext;
	envioArxiu.midaFitxer=fitxer.size;
	console.debug("midaFItxer:");
	console.debug(midaFitxer);
	
	return obj;

}

function addDropFileToMap(results) {
	if (results.status == "OK") {
		
			//Si geometries tipus marker
			if(results.layerMarker){
				var defer = $.Deferred();
				map.spin(true);
				loadVisualitzacioLayer(results.layerMarker).then(function(results1){
					if(results1){
						map.spin(false);
						map.fitBounds(results1.getBounds());					
					}
				});
			}					
			//Si geometries tipus línies
			if(results.layerLine){
				var defer = $.Deferred();
				map.spin(true);
//				readVisualitzacio(defer, results.visualitzacioLine, results.layerLine).then(function(results1){
				loadVisualitzacioLayer(results.layerLine).then(function(results1){
					if(results1){
						map.spin(false);
						map.fitBounds(results1.getBounds());
					}
				});
			}
			//Si geometries tipus polygon
			if(results.layerPolygon){
				var defer = $.Deferred();
				map.spin(true);
//				readVisualitzacio(defer, results.visualitzacioPolygon, results.layerPolygon).then(function(results1){
				loadVisualitzacioLayer(results.layerPolygon).then(function(results1){
					if(results1){
						map.spin(false);
						map.fitBounds(results1.getBounds());
					}
				});
			}		
			// carregarCapa(businessId);
			refrescaPopOverMevasDades();
			//jQuery('#dialog_carrega_dadesfields').modal('hide');
			//map.spin(false);				
	}else{
		var txt_error = "ERROR";
		progressBarShow = false;
		jQuery('#progress_bar_carrega_dades').hide();
		
		if(results.results.indexOf("RuntimeException")!= -1){
			var txt_error = window.lang.convert("Error a les dades del fitxer: Unifiqui els camps de dades i torni a intentar-ho.");
		}else if(results.results.indexOf("CONVERT ERROR")!= -1){
			var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
		}else if(results.results.indexOf("501")!= -1){//+ de 5000 punts
			txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 5000 o menys i torni a intentar-ho.");
		}else if(results.results.indexOf("502")!= -1){//+ de 1000 features
			txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 1000 o menys i torni a intentar-ho.");
		}else if(results.results.indexOf("503")!= -1){//+ de 6000 geometries
			txt_error += ": "+window.lang.convert("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho.");
		}else{
			txt_error = window.lang.convert("Error en la càrrega de l'arxiu");
		}
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', results.results, 1]);
		//_kmq.push.push(['record', 'carregar dades error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':results.results}]);
		jQuery("#div_carrega_dades_message").html("<span class='fa fa-warning sign'></span>"+txt_error);
		jQuery("#div_carrega_dades_message").show();	
		$('#dialog_error_carrega_dades').modal('show');
	}
}

function loadDefaultStyles(){
	envioArxiu.markerStyle = JSON.stringify(getMarkerRangFromStyle(defaultPunt));
	envioArxiu.lineStyle = JSON.stringify(getLineRangFromStyle(canvas_linia));
	envioArxiu.polygonStyle = JSON.stringify(getPolygonRangFromStyle(canvas_pol));
}

function addHtmlModalCarregarFitxers(){
	
	jQuery('#mapa_modals').append(
		'	<!-- Modal Carrega dades -->'+
		'	<div class="modal fade" id="dialog_carrega_dades">'+
		'	<div class="modal-dialog">'+
		'		<div class="modal-content">'+
		'			<div class="modal-header">'+
		'				<button type="button" class="close" data-dismiss="modal"'+
		'					aria-hidden="true">&times;</button>'+
		'				<h4 class="modal-title" lang="ca">Carregar dades</h4>'+
		'			</div>'+
		'			<div class="modal-body">'+
		'				<div id="div_formats" class="alert alert-success">'+
		'					<span class="glyphicon glyphicon-upload"></span>'+ 
		'					<span lang="ca">Formats suportats</span>: <strong>KML, KMZ, GeoJSON, GML, SHP(ZIP),	GPX, TXT, CSV, XLS, XLSX. </strong>'+ 
		'						<a class="alert-link" lang="ca"	href="http://betaportal.icgc.cat/wordpress/carrega-de-dades-instamaps/" target="_blank">Més informació i exemples</a>'+
		'				</div>'+
		'				<!--'+ 
		'				<div class="input-group txt_ext">'+
		'					<input type="text" lang="ca" class="form-control" value="" placeholder="Entrar URL fitxer" style="height:33px" id="txt_URLfitxer">'+ 
		'					<span class="input-group-btn">'+
		'						<button type="button" id="bt_URLfitxer" class="btn btn-success" onClick="javascript:addURLfitxerLayer();">'+
		'							<span class="glyphicon glyphicon-play"></span>'+
		'						</button>'+
		'					</span>'+
		'				</div>'+
		'				-->'+
		'				<table id="tbl_loadCapa">'+
		'					<tr>'+
		'						<td><input type=\'hidden\' id=\'formFile\' value=\'false\'>'+
		'							<input type=\'hidden\' id=\'file_path\' value=\'\'>'+
		'							<button lang="ca" type="button" class="btn btn-success"  name=\'upload\' id=\'upload_file\'>Carrega arxiu</button>'+ 
		'							<!--<input type=\'button\' lang="ca" class="btn btn-success" name=\'upload\' id=\'upload_file\' value=\'Carrega arxiu\'></td> -->'+
		'						<td>'+
		'							<div id=\'file_name\' style="font-size: 100%"	class="label label-default"></div>'+
		'							<div id="file_load" class="search-load" style="display: none;"></div>'+
		'						</td>'+
		'						<td>'+
		'							<div style="display: none; cursor: pointer"	class="glyphicon glyphicon-trash" id="bt_esborra_ff"></div>'+
		'						</td>'+
		'					<tr>'+
		'				</table>'+
		'				<div id="dv_optSRS">'+
		'					<div class="panel panel-danger">'+
		'						<div lang="ca" class="panel-heading">Escull el sistema de referència d\'aquest arxiu</div>'+
		'						<div class="panel-body">'+
		'							<ul class="bs-dadesO_JSON">'+
		'								<li>'+
		'								<select id="select-upload-ff-epsg" style="width: 100%;">'+
		'									<option lang="ca" value="null">Selecciona un SR</option>'+
		'									<option value="EPSG:4326">EPSG:4326 GPS(WGS84 geogràfiques (lat, lon) - G.G)</option>'+
		'									<option value="EPSG:23031">EPSG:23031 (ED50-UTM 31N	Easting,Northing o X,Y)</option>'+
		'									<option value="EPSG:25831">EPSG:25831 (ETRS89-UTM 31N Easting,Northing o X,Y)</option>'+
		'									<option value="EPSG:4258">EPSG:4258 INSPIRE(ETRS89 geogràfiques (lat, lon) - G.G)</option>'+
		'									<option value="EPSG:4230">EPSG:4230 (ED50 geogràfiques (lat, lon) - G.G)</option>'+
		'									<option value="EPSG:32631">EPSG:32631 (WGS84 31N Easting,Northing o X,Y)</option>'+
		'									<option value="EPSG:3857">EPSG:3857 (WGS84 Pseudo-Mercator Easting,Northing o X,Y)</option>'+
		'									<option value="EPSG:2180">EPSG:2180 (ETRS89 / Poland CS92)</option>'+
		'								</select>'+
		'								</li>'+
		'							</ul>'+
		'							<button class="btn btn-success btn_mig" lang="ca" id="load_FF_SRS_coord">Processar arxiu</button>'+
		'						</div>'+
		'					</div>'+
		'				</div>'+
		'				<div id="dv_optCapa">'+
		'					<div class="panel panel-danger">'+
		'						<div lang="ca" class="panel-heading">Com vols geolocalitzar'+
		'							aquest arxiu?</div>'+
		'						<div class="panel-body">'+
		'							<ul id="nav_pill" class="nav nav-pills">'+
		'								<li class="active"><a href="#opt_coord" lang="ca"'+
		'									data-toggle="tab">Per coordenades</a></li>'+
		'								<li><a href="#opt_adreca" lang="ca" data-toggle="tab">Per adreces</a></li>'+
		'								<li><a href="#opt_codi" lang="ca" data-toggle="tab">Per codis</a></li>'+
		'							</ul>'+
		'							<!-- Tab panes -->'+
		'							<div id="dv_contentOpt" class="tab-content">'+
		'								<div class="tab-pane active" id="opt_coord">'+
		'									<ul class="bs-dadesO_JSON">'+
		'										<li><label lang="ca">On són les coordenades?</label></li>'+
		'										<li></li>'+
		'										<li lang="ca">Coordenada X o Longitud</li>'+
		'										<li><select style="width: 100%;" id=\'cmd_upload_colX\'></select></li>'+
		'										<li lang="ca">Coordenada Y o Latitud</li>'+
		'										<li><select style="width: 100%;" id=\'cmd_upload_colY\'></select></li>'+
		'										<li><label lang="ca">Quin és el sistema de referència?</label></li>'+
		'										<li>'+
		'										<select id="select-upload-epsg" style="width: 100%;">'+
		'											<option lang="ca" value="null">Selecciona un SR</option>'+
		'											<option value="EPSG:4326">EPSG:4326 GPS (WGS84 geogràfiques (lat, lon) - G.G)</option>'+
		'											<option value="EPSG:23031">EPSG:23031 (ED50-UTM 31N Easting,Northing o X,Y)</option>'+
		'											<option value="EPSG:25831">EPSG:25831 (ETRS89-UTM 31N Easting,Northing o X,Y)</option>'+
		'											<option value="EPSG:4258">EPSG:4258 INSPIRE (ETRS89 geogràfiques (lat, lon) - G.G)</option>'+
		'											<option value="EPSG:4230">EPSG:4230 (ED50 geogràfiques (lat, lon) - G.G)</option>'+
		'											<option value="EPSG:32631">EPSG:32631 (WGS84 31N Easting,Northing o X,Y)</option>'+
		'											<option value="EPSG:3857">EPSG:3857 (WGS84 Pseudo-Mercator Easting,Northing o X,Y)</option>'+
		'										</select>'+
		'										</li>'+
		'									</ul>'+
		'									<button class="btn btn-success btn_mig" lang="ca" id="load_TXT_coord">Processar arxiu</button>'+
		'								</div>'+
		'								<div class="tab-pane" id="opt_adreca">'+
		'								<!--<label lang="ca">L\'adreça ha de contenir: Nom carrer, número i municipi</label> -->'+
		'									<div id="div_formats" class="alert alert-info">'+
		'										<span class="glyphicon glyphicon-info-sign"></span>'+ 
		'										<span lang="ca">Per codificar per adreces utilitza aquest</span>'+ 
		'										<a class="alert-link" lang="ca"	href="dades/exemple_geocod_adreces.xlsx">arxiu tipus</a>'+ 
		'										<span lang="ca">amb les teves dades.</span>'+
		'										<br/>'+
		'										<span lang="ca">Els camps Nom_via, Portal i Municipi són obligatoris.</span>'+
		'									</div>'+
		'									<!--'+ 
		'									<p lang="ca">Selecciona una de les tres possibles combinacions</p>'+
		'									<ul class="bs-dadesO_JSON3">'+
		'										<li><input checked value="0" type="radio" name="radio_adre"><label lang="ca">Adreça en 1 camp</label></li>'+
		'										<li><input value="1" type="radio" name="radio_adre"><label lang="ca">Adreça en 2 camps</label></li>'+
		'										<li><input value="2" type="radio" name="radio_adre"><label lang="ca">Adreça en 3 camps</label></li>'+
		'										<li><select style="width: 100%;" id=\'cmd_upload_adre_0\'></select></li>'+
		'										<li><select disabled style="width: 100%;" id=\'cmd_upload_adre_11\'></select></li>'+
		'										<li><select disabled style="width: 100%;" id=\'cmd_upload_adre_21\'></select></li>'+
		'										<li></li>'+
		'										<li><select disabled style="width: 100%;" id=\'cmd_upload_adre_12\'></select></li>'+
		'										<li><select disabled style="width: 100%;" id=\'cmd_upload_adre_22\'></select></li>'+
		'										<li></li>'+
		'										<li></li>'+
		'										<li><select disabled style="width: 100%;" id=\'cmd_upload_adre_23v\'></select></li>'+
		'									</ul>'+
		'									-->'+
		'									<button class="btn btn-success btn_mig" lang="ca"'+
		'										id="load_TXT_adre">Processar arxiu</button>'+
		'								</div>'+
		'								<div class="tab-pane" id="opt_codi">'+
		'									<ul class="bs-dadesO_JSON">'+
		'										<li><label lang="ca">Els teus codis són de</label>:</li>'+
		'										<li>'+
		'										<select id=\'cmd_codiType_Capa\'>'+
		'											<option lang="ca" selected value=\'municipis\'>Municipis</option>'+
		'											<option lang="ca" value=\'comarques\'>Comarques</option>'+
		'										</select>'+
		'										</li>'+
		'										<li><label lang="ca">Tipus codi</label></li>'+
		'										<li>'+
		'										<select id=\'cmd_codiType\'>'+
		'											<option value=\'ine\'>INE (5 digits)</option>'+
		'											<option value=\'idescat\'>IDESCAT (6 digits)</option>'+
		'											<option value=\'municat\'>MUNICAT (10 digits)</option>'+
		'											<option value=\'cadastre\'>CADASTRE (5 digits)</option>'+
		'										</select>'+
		'										</li>'+
		'										<li><label lang="ca">Camp que conté el codi</label></li>'+
		'										<li><select style="width: 100%;" id=\'cmd_upload_codi\'></select></li>'+
		'									</ul>'+
		'									<button class="btn btn-success btn_mig" lang="ca" id="load_TXT_codi">Processar arxiu</button>'+
		'								</div>'+
		'							</div>'+
		'						</div>'+
		'					</div>'+
		'				</div>'+
		'				<div class="modal-footer">'+
		'					<div id="progress_bar_carrega_dades" class="progress progress-striped active">'+
		'						<div id="prg_bar" class="progress-bar progress-bar-success"	role="progressbar" aria-valuenow="60" aria-valuemin="0"	aria-valuemax="100" style="width: 0%;"></div>'+
		'					</div>'+
		'					<button id="bt_upload_cancel" lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
		'				</div>'+
		'			</div>'+
		'			<!-- /.modal-content -->'+
		'		</div>'+
		'		<!-- /.modal-dialog -->'+
		'	</div>'+
		'	<!-- /.modal -->'+
		'	<!-- fi Modal Carrega dades -->'+
		'</div>'
	);	
	
	
	
	$('#dialog_carrega_dades').on('hide.bs.modal', function (event) {
		jQuery("#div_carrega_dades_message").html("");
		jQuery("#div_carrega_dades_message").hide();		
		if(envioArxiu.isDrag){
			drgFromMapa.removeAllFiles(true);
		}else{
			drgFromBoto.removeAllFiles(true);
		}
	});
	
}

function addHtmlModalErrorCarregarFitxers(){
	
	jQuery('#mapa_modals').append(
		'	<!-- Modal Error Carrega dades -->'+
		'	<div class="modal fade" id="dialog_error_carrega_dades">'+
		'	<div class="modal-dialog">'+
		'		<div class="modal-content">'+
		'			<div class="modal-body">'+
		'				<div id="div_carrega_dades_message" class="alert alert-danger"></div>'+
		'				<div class="modal-footer">'+
		'					<button id="bt_upload_cancel_error" lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Tancar</button>'+
		'				</div>'+
		'			</div>'+
		'			<!-- /.modal-content -->'+
		'		</div>'+
		'		<!-- /.modal-dialog -->'+
		'	</div>'+
		'	<!-- /.modal -->'+
		'	<!-- fi Modal Carrega dades -->'+
		'</div>'
	);
	
	$('#dialog_error_carrega_dades').on('hide.bs.modal', function (event) {
		jQuery("#div_carrega_dades_message").html("");
		jQuery("#div_carrega_dades_message").hide();		
	});
	
	jQuery('#bt_upload_cancel_error').on("click", function(e) {
		jQuery("#div_carrega_dades_message").html("");
		$('#dialog_error_carrega_dades').modal('hide');
		$('#dialog_carrega_dades').modal('hide');
		if(envioArxiu.isDrag){
			progressBarShow=true;
			drgFromMapa.removeAllFiles(true);
		}else{
			progressBarShow=true;
			drgFromBoto.removeAllFiles(true);
		}
	});
};

function addHtmlInterficieCarregarFitxers(){
	jQuery("#funcio_carregar_fitxers").append(
			'<div lang="ca" id="div_carrega_dades" class="div_carrega_dades"></div>'		
	);
	
	$('.div_carrega_dades').tooltip({
		placement : 'bottom',
		container : 'body',
		title : window.lang.convert('Arrossega les teves dades sobre el mapa o fes clic aquí')
	});	
}
