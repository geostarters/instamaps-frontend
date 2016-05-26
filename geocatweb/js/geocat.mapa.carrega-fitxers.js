
//var matriuActiva = [];
//var pending = false
var drgFromMapa = null;
var drgFromBoto = null;
var midaFitxer = 500000000;//en bytes
var midaFitxerRandom = 10000000;//en bytes

var busy = false; //per controlar si ja estem pujant un fitxer


var envioArxiu={isDrag:false,
	tipusAcc:'gdal', //gdal,adreca,coordenades,codis
	colX:null,
	colY:null,
	colWKT:null,
	tipusCSV:null,
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
	midaFitxer: null,
	serverName: null,
	format : ""
};

var drOpcionsMapa = {
	url : paramUrl.upload_gdal_2015,
	paramName : "file", 
	maxFilesize : 500, // MB
	method : 'post',
	accept : function(file, done) {
	}
};

function creaAreesDragDropFiles() {
	// dropzone
	var opcionsBoto = drOpcionsMapa;
	opcionsBoto.clickable=false;
	
	if (drgFromMapa == null) {

		var divMapa="div#map";	
		estatMapa3D?divMapa="div#map3D":divMapa="div#map";	
		
		
		
		drgFromMapa = new window.Dropzone(divMapa, drOpcionsMapa);

		drgFromMapa.on("addedfile", function(file) {
			if(!busy){
				envioArxiu.isDrag=true;
				busy = true;
				accionaCarrega(file,envioArxiu.isDrag);
			}else{
				$('#dialog_info_upload_txt').html(window.lang.convert("S'està processant un arxiu. Si us plau, espereu que aquest acabi."));
				$('#dialog_info_upload').modal('show');
				drgFromMapa.removeAllFiles(true);
			}
		});
		
		
		drgFromMapa.on("processing ", function(file) {
			
		});
		
		drgFromMapa.on("sending", function(file, xhr, formData) {
			
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades drag&drop', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
			
			if( envioArxiu.ext == "tif" || (envioArxiu.ext=="sid") || (envioArxiu.ext=="jpg") || (envioArxiu.ext=="ecw") 
					|| envioArxiu.format == "tif" || (envioArxiu.format =="sid") || (envioArxiu.format =="jpg") ){	
				
				$('#dialog_carrega_dades').modal('hide');
				formData.append("srs", envioArxiu.srid.toLowerCase());
				formData.append("format", (envioArxiu.ext== "zip" ? envioArxiu.format : envioArxiu.ext));
				formData.append("name", envioArxiu.serverName);
				jQuery("#div_uploading_txt").html('<div id="div_upload_step1" class="status_current" lang="ca">'+window.lang.convert('Processant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>');
				jQuery('#info_uploadFile').show();
				
			}else{
				
				formData.append("nomArxiu", file.name); 
				formData.append("tipusAcc", envioArxiu.tipusAcc); //gdal,coordenades,codis,adreca
				formData.append("colX", envioArxiu.colX);	
				formData.append("colY", envioArxiu.colY);
				formData.append("colWKT", envioArxiu.colWKT);
				formData.append("tipusCSV", envioArxiu.tipusCSV);
				formData.append("srid", envioArxiu.srid);
				formData.append("bid", envioArxiu.bid);
				formData.append("codiCAMP", envioArxiu.codi);//Nom de la columna de l'excel on esta el codi
				formData.append("codiType", envioArxiu.codiType);//ine,municat,cadastre...
				formData.append("geomType", envioArxiu.geomType);//comarques/municipis
				formData.append("type", envioArxiu.type);//codis, coordenades
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
				formData.append("createMapFile", paramUrl.createMapFile);
				var codiUnic = getCodiUnic();
				formData.append("codiUnic", codiUnic);
				
				$('#dialog_carrega_dades').modal('hide');

				jQuery("#div_uploading_txt").html("");
				jQuery("#div_uploading_txt").html(
						'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Pujant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>'+
						'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Analitzant fitxer')+'</div>'+
						'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Creant geometries')+'</div>'+
						'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
				);				
				jQuery('#info_uploadFile').show();			
				jQuery('#info_uploadFile').show();
				
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime = getPollTime(envioArxiu.midaFitxer);
				
				//Fem polling
				(function(){							
					poll = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ codiUnic + url('?businessid')+".json",
							dataType: 'json',
							type: 'get',
							success: function(data){
								
								if(data.status.indexOf("PAS2")!=-1){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
										'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer pujat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
										'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Analitzant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
										'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Creant geometries')+'</div>'+
										'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
									);									
									
								}else if(data.status.indexOf("PAS3")!=-1){
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
										'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer pujat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
										'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
										'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
										'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
									);									
								}else if(data.status.indexOf("OK")!=-1){
									clearInterval(pollInterval);
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
										'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer pujat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
										'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
										'<div id="div_upload_step3" class="status_check" lang="ca">3. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
										'<div id="div_upload_step4" class="status_current" lang="ca">4. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
									);									
									
									$.get(HOST_APP+tmpdirPolling +codiUnic + url('?businessid')+"_response.json", function(data) { 
										if(data.status.indexOf("OK")!=-1){											
												addDropFileToMap(data);
										 }							
									});
									
								
									
									_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades ok', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
								}else if(data.status.indexOf("KO")!=-1){
									console.error("Error al carregar fitxer:");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									var msg = "[08]: " + window.lang.convert("Error durant el processament de la informació del fitxer. Comprovi que el fitxer és correcte.");
									msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
									$('#dialog_error_upload_txt').html(msg);
									$('#dialog_error_upload').modal('show');
									_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error sense codi', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
									
									
								}else if(data.status.indexOf("ERROR")!=-1){
									console.error("Error al carregar fitxer:");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									if(data.codi){
										
										_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error '+data.codi, envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
										
										if(data.codi.indexOf("01")!=-1){//cas 01: Exception durant el tractament del fitxer
											var msg = "[01]: " + window.lang.convert("Ha ocorregut un error inesperat durant la càrrega del fitxer.");
											$('#dialog_error_upload_txt').html(msg);
											
										}else if(data.codi.indexOf("02")!=-1){//cas 02: Error durant les conversions de format del fitxer
											var msg = "[02]: " + window.lang.convert("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
											msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
											$('#dialog_error_upload_txt').html(msg);
											
										}else if(data.codi.indexOf("03")!=-1){//cas 03: OGRInfo ha donat resposta fallida
											var msg = "[03]: " + window.lang.convert("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
											msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";										
											$('#dialog_error_upload_txt').html(msg);
												
										}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
											var msg = "[04]: " + window.lang.convert("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
												$('#dialog_error_upload_txt').html(msg);
										
										}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
											var msg = "[05]: " + window.lang.convert("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
											msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";										
											$('#dialog_error_upload_txt').html(msg);
											
										}else if(data.codi.indexOf("06")!=-1){//cas 06: Accedeix a fileDefault_Error, no li ha arribat be el nom del fitxer
											var msg = "[06]: " + window.lang.convert("Problema de comunicació amb el servidor. Si us plau, torni a intentar-ho.");
											$('#dialog_error_upload_txt').html(msg);
											
										}else if(data.codi.indexOf("07")!=-1){//cas 07: EnviaFileReady a myUtils.jsp ha donat una excepcio
											var msg = "[07]: " + window.lang.convert("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");
											$('#dialog_error_upload_txt').html(msg);
											
										}
										
									}else{
										_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error sense codi', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
										var msg = window.lang.convert("Error en la càrrega de l'arxiu");
										msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";										
										$('#dialog_error_upload_txt').html(msg);
									}
									
									$('#dialog_error_upload').modal('show');
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						poll();
					},pollTime);
					
				})();				
			}

			
			
		});
		
		drgFromMapa.on('success', function(file, resposta) {
			drgFromMapa.removeAllFiles(true);
			busy = false;
			if(resposta.map){
				ActiuWMS.url = "http://betaserver.icgc.cat/geoservice/"+resposta.map;
				ActiuWMS.servidor = envioArxiu.serverName;
				ActiuWMS.layers = envioArxiu.serverName;
				ActiuWMS.epsg = undefined;
				addExternalWMS(true).then(function(success){
					jQuery('#info_uploadFile').hide();
					if(!success){
						var msg = window.lang.convert("Error en la càrrega de l'arxiu");
						$('#dialog_error_upload_txt').html(msg);
					}
				},function(error){
					jQuery('#info_uploadFile').hide();
				});
				
			}
			
		});
		
		drgFromMapa.on('error', function(file, errorMessage) {
			drgFromMapa.removeAllFiles(true);
			busy = false;
//			_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', 'Sense codi error', 1]);
//			console.error("drgFromMapa Error");
//			$('#dialog_error_upload').modal('show');
		});
	}
}

function addHtmlModals(){
	var dfd = $.Deferred();
	$.when( addHtmlModalCarregarFitxers(), addHtmlModalErrorUpload(), addHtmlModalInfoUpload() ).done(function ( v1, v2 ) {
		dfd.resolve();
	});
	return dfd.promise();
}

function addFuncioCarregaFitxers(){
	
	addHtmlInterficieCarregarFitxers();
	addHtmlModals().then(function(){
	
	// zona 1
	jQuery('#div_carrega_dades').on("click", function(e) {
		
		obreModalCarregaDades(false);
		var opcionsBoto = drOpcionsMapa;
		opcionsBoto.clickable = true;

		
		if (drgFromBoto == null) {
			drgFromBoto = new window.Dropzone("button#upload_file", opcionsBoto);

			drgFromBoto.on("addedfile", function(file) {
				if(!busy){
					envioArxiu.isDrag=false;
					busy = true;
					accionaCarrega(file, envioArxiu.isDrag);	
				}else{
					$('#dialog_info_upload_txt').html(window.lang.convert("S'està processant un arxiu. Si us plau, espereu que aquest acabi."));
					$('#dialog_info_upload').modal('show');
					drgFromMapa.removeAllFiles(true);
				}
			});

			drgFromBoto.on("sending", function(file, xhr, formData) {
				
				_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades menu', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);				
				
				if( envioArxiu.ext == "tif" || (envioArxiu.ext=="sid") || (envioArxiu.ext=="jpg") || (envioArxiu.ext=="ecw") 
						|| envioArxiu.format == "tif" || (envioArxiu.format =="sid") || (envioArxiu.format =="jpg") ){	
					
					$('#dialog_carrega_dades').modal('hide');
					formData.append("srs", envioArxiu.srid.toLowerCase());
					formData.append("format", (envioArxiu.ext== "zip" ? envioArxiu.format : envioArxiu.ext));
					formData.append("name", envioArxiu.serverName);
					jQuery("#div_uploading_txt").html('<div id="div_upload_step1" class="status_current" lang="ca">'+window.lang.convert('Processant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>');
					jQuery('#info_uploadFile').show();
					
				}else{
					//console.info("sending");
					formData.append("nomArxiu", file.name); 
					formData.append("tipusAcc", envioArxiu.tipusAcc); 
					formData.append("colX", envioArxiu.colX);	
					formData.append("colY", envioArxiu.colY);
					formData.append("colWKT", envioArxiu.colWKT);
					formData.append("tipusCSV", envioArxiu.tipusCSV);
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
					formData.append("createMapFile", paramUrl.createMapFile);
					var codiUnic = getCodiUnic();
					formData.append("codiUnic", codiUnic);
					
					//Comencem polling...
					//console.debug("Comença polling....");
//					progressBarShow = true;
					$('#dialog_carrega_dades').modal('hide');

					//jQuery("#div_uploading_txt").html("");
					//jQuery("#div_uploading_txt").html(window.lang.convert("Carregant, esperi si us plau..."));
					jQuery("#div_uploading_txt").html("");
					jQuery("#div_uploading_txt").html(
							'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Pujant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>'+
							'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Analitzant fitxer')+'</div>'+
							'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Creant geometries')+'</div>'+
							'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
							//'<div id="div_uploading_txt2" lang="ca">(Pot seguir navegant)</div>'												
					);					
					jQuery('#info_uploadFile').show();
					
					//Definim interval de polling en funcio de la mida del fitxer
					var pollTime = getPollTime(envioArxiu.midaFitxer);
					
					//Fem polling
					(function(){							
						poll = function(){
							$.ajax({
//								url: HOST_APP +"share/tmp/"+ codiUnic + url('?businessid')+".json",
								url: paramUrl.polling +"pollingFileName="+ codiUnic + url('?businessid')+".json",
								dataType: 'json',
								type: 'get',
								success: function(data){
									
									if(data.status.indexOf("PAS2")!=-1){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer pujat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Analitzant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
//											'<div id="div_uploading_txt2" lang="ca">(Pot seguir navegant)</div>'											
										);									
										
									}else if(data.status.indexOf("PAS3")!=-1){
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer pujat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
//											'<div id="div_uploading_txt2" lang="ca">(Pot seguir navegant)</div>'											
										);									
									}else if(data.status.indexOf("OK")!=-1){
//										console.debug("Ha acabat:");
//										console.debug(data);
										clearInterval(pollInterval);
										//jQuery("#div_uploading_txt").html("");
										//jQuery("#div_uploading_txt").html(window.lang.convert("Processant dades..."));
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer pujat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step3" class="status_check" lang="ca">3. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step4" class="status_current" lang="ca">4. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
//											'<div id="div_uploading_txt2" lang="ca">(Pot seguir navegant)</div>'											
										);									
										
										//addDropFileToMap(data);					
										$.get(HOST_APP+tmpdirPolling +codiUnic + url('?businessid')+"_response.json", function(data) { 
											if(data.status.indexOf("OK")!=-1){											
													addDropFileToMap(data);
												}								
										});
										
										_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades ok', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
									
									}else if(data.status.indexOf("KO")!=-1){
//									
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$.get(HOST_APP+tmpdirPolling +codiUnic + url('?businessid')+"_response.json", function(data) { 
											var msg = "[08]: " + window.lang.convert("Error durant el processament de la informació del fitxer. Comprovi que el fitxer és correcte.");
											msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
											$('#dialog_error_upload_txt').html(msg);
											$('#dialog_error_upload').modal('show');
										});
										
										
										_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error sense codi', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
									
									
									}else if(data.status.indexOf("ERROR")!=-1){
										console.error("Error al carregar fitxer:");
										console.error(data);
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										if(data.codi){
											
											_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error '+data.codi, envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
											
											if(data.codi.indexOf("01")!=-1){//cas 01: Exception durant el tractament del fitxer
												var msg = "[01]: " + window.lang.convert("Ha ocorregut un error inesperat durant la càrrega del fitxer.");
												$('#dialog_error_upload_txt').html(msg);
												
											}else if(data.codi.indexOf("02")!=-1){//cas 02: Error durant les conversions de format del fitxer
												var msg = "[02]: " + window.lang.convert("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
												msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
												$('#dialog_error_upload_txt').html(msg);
												
											}else if(data.codi.indexOf("03")!=-1){//cas 03: OGRInfo ha donat resposta fallida
												var msg = "[03]: " + window.lang.convert("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
												msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
												$('#dialog_error_upload_txt').html(msg);
													
											}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
												var msg = "[04]: " + window.lang.convert("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
													$('#dialog_error_upload_txt').html(msg);
											
											}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
												var msg = "[05]: " + window.lang.convert("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
												msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
												$('#dialog_error_upload_txt').html(msg);
												
											}else if(data.codi.indexOf("06")!=-1){//cas 06: Accedeix a fileDefault_Error, no li ha arribat be el nom del fitxer
												var msg = "[06]: " + window.lang.convert("Problema de comunicació amb el servidor. Si us plau, torni a intentar-ho.");
												$('#dialog_error_upload_txt').html(msg);
												
											}else if(data.codi.indexOf("07")!=-1){//cas 07: EnviaFileReady a myUtils.jsp ha donat una excepcio
												var msg = "[07]: " + window.lang.convert("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");
												$('#dialog_error_upload_txt').html(msg);
												
											}
											
										}else{
											_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error sense codi', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
											var msg =window.lang.convert("Error en la càrrega de l'arxiu");
											msg += "<br/><br/><span style='font-weight:normal'>"+window.lang.convert("Per a més informació consultar")+": </span><a href='http://betaportal.icgc.cat/wordpress/errors_carregar_arxius/' target='_blank'>"+window.lang.convert("Errors freqüents en carregar arxius a Instamaps")+"</a>";
											$('#dialog_error_upload_txt').html(msg);
										}
										
										$('#dialog_error_upload').modal('show');
									}
								}
							});
						};
						
						pollInterval = setInterval(function(){
							poll();
						},pollTime);
						
					})();
				}
				
				
				
			});
			
			drgFromBoto.on('success', function(file, resposta) {
				drgFromBoto.removeAllFiles(true);
				busy = false;
				if(resposta.map){
					ActiuWMS.url = "http://betaserver.icgc.cat/geoservice/"+resposta.map;
					ActiuWMS.servidor = envioArxiu.serverName;
					ActiuWMS.layers = envioArxiu.serverName;
					ActiuWMS.epsg = undefined;
					addExternalWMS(true).then(function(success){
						jQuery('#info_uploadFile').hide();
						if(!success){
							var msg = window.lang.convert("Error en la càrrega de l'arxiu");
							$('#dialog_error_upload_txt').html(msg);
						}
					},function(error){
						jQuery('#info_uploadFile').hide();
					});
					
				}
			});
			
			drgFromBoto.on('error', function(file, errorMessage) {
				drgFromBoto.removeAllFiles(true);
				busy = false;
//				$('#dialog_carrega_dades').modal('hide');
//				_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error', 'Sense codi error', 1]);
//				console.error("drgFromBoto Error");
//				$('#dialog_error_upload').modal('show');	
			});
		}

	});	
	
	//Botons per enviar arxius
	jQuery("#bt_esborra_ff").on('click', function() {
		if(envioArxiu.isDrag){
			drgFromMapa.removeAllFiles(true);	
		}else{
			if (drgFromBoto != null) drgFromBoto.removeAllFiles(true); 
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
		var colWKT=jQuery("#cmd_upload_wkt").val();
		var srid = jQuery("#select-upload-epsg").val();
		var tipusCSV=jQuery('input:radio[name="opt_csv_field"]:checked').val();
		
		if ((colX == "null" || colY == "null" ||srid == "null")  && tipusCSV=='coords') {
			isOK = false;
			alert(window.lang.convert("Cal indicar els camps de les coordenades i el sistema de referència"));		
		}else if ((srid == "null" || colWKT=="null") && tipusCSV=='wkt') {	
			isOK = false;
			alert(window.lang.convert("Cal indicar el camp geomètric i el sistema de referència"));		
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
			envioArxiu.colWKT=colWKT;
			envioArxiu.srid=srid;
			envioArxiu.tipusCSV=tipusCSV;			
			enviarArxiu();
		}	
	});	
	
	
	jQuery('input:radio[name="opt_csv_field"]').on('click', function() {

		var ori=this.id;
		
		if(ori.indexOf('coords')!=-1){
			jQuery('#ul_coords').show();
			jQuery('#ul_geom').hide();				
		}else if(ori.indexOf('geom')!=-1){
			jQuery('#ul_coords').hide();
			jQuery('#ul_geom').show();	
		}else{		
			jQuery('#ul_coords').toggle();
			jQuery('#ul_geom').toggle();
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

function getPollTime(midaFitxer){
	if(midaFitxer > 0 && midaFitxer <= 50000) return 3000;
	else if (midaFitxer > 50000 && midaFitxer <= 500000) return 5000;
	else if (midaFitxer > 500000 && midaFitxer <= 5000000) return 7000;
	else if (midaFitxer > 5000000 && midaFitxer <= 10000000) return 10000;
	else if (midaFitxer > 10000000 && midaFitxer <= 25000000) return 20000;
	else return 30000;	
}

function getCategoriaMidaFitxer(midaFitxer){
//	console.debug("categoria midaFitxer:");
//	console.debug(midaFitxer);
	if(midaFitxer <= 1000) return "<=1MB";
	else if (midaFitxer > 1000 && midaFitxer <= 5000) return "1-5MB";
	else if (midaFitxer > 5000 && midaFitxer <= 10000) return "5-10MB";
	else if (midaFitxer > 10000 && midaFitxer <= 25000) return "10-25MB";
	else if (midaFitxer > 25000 && midaFitxer <= 50000) return "25-50MB";
	else return ">50MB";	
}

function enviarArxiu(){
	
	ldpercent=0;
	if(envioArxiu.isDrag){
		drgFromMapa.uploadFile(drgFromMapa.files[0]);	
	}else{
		drgFromBoto.uploadFile(drgFromBoto.files[0]);;
	}

	if(envioArxiu.tipusAcc=="codis"){
		map.divadminMap();
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
	if(isDrag){
		drgFromMapa.options.url = paramUrl.upload_gdal_2015;
		drgFromMapa.options.paramName = "file";
	}else if(drgFromBoto != null){
		drgFromBoto.options.url = paramUrl.upload_gdal_2015;
		drgFromBoto.options.paramName = "file";
	}
	
	var obroModal = false;
	
	miraFitxer(file).then(function(res){
		
		console.debug("res miraFitxer:");
		console.debug(res);
		
		var ff = res;
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
				
			} else if( (ff.ext == "tif")  || (ff.ext=="sid") || (ff.ext=="jpg") || (ff.ext=="ecw") || (ff.ext=="zip" && !ff.isShape)) {
				if(isDrag){
					drgFromMapa.options.url = "/cloudifier/";
					drgFromMapa.options.paramName = "clientfile";
				}else{
					console.info("is from BOTO!");
					drgFromBoto.options.url = "/cloudifier/";
					drgFromBoto.options.paramName = "clientfile";
				}
				var name = file.name.split(".");
				envioArxiu.serverName = name[0];
//				drgFromMapa.options.url = "http://betaserver.icgc.cat/cgi-bin/cloudifier.cgi";
				jQuery('#dv_optCapa').hide();
				jQuery('#dv_optSRS').show();
				obroModal = true;
				
			}else if ((ff.ext == "dgn") || (ff.ext == "dxf") || (ff.ext == "geojson") || (ff.ext == "json") || (ff.ext=="zip" && ff.isShape)) {
				jQuery('#dv_optCapa').hide();
				jQuery('#dv_optSRS').show();
				obroModal = true;
				
			}else{
				envioArxiu.tipusAcc='gdal'; 
				enviarArxiu();
				obroModal = false;
			}

		}else{ // novalid
			$('#dialog_info_upload_txt').html(ff.msg);
			$('#dialog_info_upload').modal('show');		
			obroModal = false;
			busy = false;
			if(isDrag){
				drgFromMapa.removeAllFiles(true);		
			}else if (drgFromBoto != null){
				drgFromBoto.removeAllFiles(true); 								
			}
		}
	},function(res){
		
	});
	
	
//	var ff = miraFitxer(file);
//	var obroModal = false;
//	if (ff.isValid) {
//		//Careguem estils seleccionats per enviar amb el fitxer
//		loadDefaultStyles();
//		
//		if ( isDrag) {obreModalCarregaDades(true);}
//		jQuery("#file_name").text(file.name);
//		jQuery("#bt_esborra_ff").show();
//		
//		if ((ff.ext == "csv") || (ff.ext == "txt")) {
//			obteCampsCSV(file);
//			obroModal = true;
//			
//		} else if (ff.ext == "xlsx") {
//			obteCampsXLSX(file);
//			obroModal = true;
//			
//		} else if (ff.ext == "xls") {
//			obteCampsXLS(file);
//			obroModal = true;
//			
//		} else if( (ff.ext == "tif")  || (ff.ext=="sid") || (ff.ext=="jpg") || (ff.ext=="ecw")) {
//			if(isDrag){
//				drgFromMapa.options.url = "/cloudifier/";
//				drgFromMapa.options.paramName = "clientfile";
//			}else{
//				console.info("is from BOTO!");
//				drgFromBoto.options.url = "/cloudifier/";
//				drgFromBoto.options.paramName = "clientfile";
//			}
//			var name = file.name.split(".");
//			envioArxiu.serverName = name[0];
////			drgFromMapa.options.url = "http://betaserver.icgc.cat/cgi-bin/cloudifier.cgi";
//			jQuery('#dv_optCapa').hide();
//			jQuery('#dv_optSRS').show();
//			obroModal = true;
//			
//		} else if (ff.ext == "zip") {
//			
//
//			
//		}else if ((ff.ext == "dgn") || (ff.ext == "dxf") || (ff.ext == "geojson") || (ff.ext == "json")) {
//			jQuery('#dv_optCapa').hide();
//			jQuery('#dv_optSRS').show();
//			obroModal = true;
//			
//		}else{
//			envioArxiu.tipusAcc='gdal'; 
//			enviarArxiu();
//			obroModal = false;
//		}
//
//	}else{ // novalid
//		$('#dialog_info_upload_txt').html(ff.msg);
//		$('#dialog_info_upload').modal('show');		
//		obroModal = false;
//		busy = false;
//		if(isDrag){
//			drgFromMapa.removeAllFiles(true);		
//			}else{
//				if (drgFromBoto != null) drgFromBoto.removeAllFiles(true); 								
//			}
//	}
}


function analitzaMatriu(matriu) {
	var op = [];
	jQuery('#dv_optCapa').show();
	jQuery('#dv_optSRS').hide();

	$('#nav_pill a[href="#opt_codi"]').attr("data-toggle","tab");
	$('#nav_pill a[href="#opt_adreca"]').attr("data-toggle","tab");
	
	
	$.each(matriu, function(index, value) {
		op.push("<option value=\"" + value + "\">" + value.toUpperCase()
				+ "</option>");
	});

	jQuery('#cmd_upload_colX').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_colY').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	jQuery('#cmd_upload_wkt').html("<option value='null'>" + window.lang.convert('Selecciona un camp')+ "</option>"+op.join(" "));
	
	
	
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

			
		} else if (matriu[x].toUpperCase() == "POLIGONO"
				|| matriu[x].toUpperCase() == "POLYGON"
				|| matriu[x].toUpperCase() == "POINT"
				|| matriu[x].toUpperCase() == "GEOM"
				|| matriu[x].toUpperCase() == "LINESTRING") {

			fieldType = "wkt";
			$('#cmd_upload_wkt option:contains("' + matriu[x] + '")').prop(
					'selected', true);
//			isCoordinates = true;
			$('#nav_pill a[href="#opt_coord"]').tab('show');	
			//
			jQuery("#opt_csv_geom").click();
			
			
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
		busy = false;
		//alert(window.lang.convert("Versió incorrecta. No es pot llegir aquest XLS."));
		$('#dialog_error_upload_txt').html("");
		var msg = window.lang.convert("Versió incorrecta. No es pot llegir aquest XLS.");
		$('#dialog_error_upload_txt').html(msg);
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
//				alert(window.lang.convert("No es pot llegir l'arxiu"));
				$('#dialog_carrega_dades').modal('hide');
				busy = false;
				$('#dialog_error_upload_txt').html("");
				var msg = window.lang.convert("No es pot llegir l'arxiu");
				$('#dialog_error_upload_txt').html(msg);
			}
		}

		//Comprovem  mida fitxer i si usuari loginat
		if (isRandomUser($.cookie('uid'))){
			if(e.target.result.length < midaFitxerRandom){
				doit();
			}else{
				//console.debug(window.lang.convert("Arxiu massa gran per usuaris random!!"));
				$('#dialog_info_upload_txt').html(window.lang.convert("La mida del fitxer supera el límit preestablert per usuaris que no han iniciat sessió (10MB)."));
				$('#dialog_info_upload').modal('show');
				drgFromMapa.removeAllFiles(true);
				busy = false;
			}
		}else if(e.target.result.length < midaFitxer){
			doit();
		}else{
			//console.debug(window.lang.convert("Arxiu massa gran!!"));
			$('#dialog_info_upload_txt').html(window.lang.convert("La mida del fitxer supera el límit preestablert (500MB)."));
			$('#dialog_info_upload').modal('show');
			drgFromMapa.removeAllFiles(true);
			busy = false;
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
			var edata;
			if (typeof(e.data.d) == "string"){
				try {
					edata = JSON.parse(e.data.d);
				}
				catch (err) {
					edata = e.data.d;	
				}				
			}else{				
				edata = e.data.d;	
			}
			cb(edata, e.data.t);
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

function checkFileRaster(file){
	
	console.info("checkFileRaster....");
	var dfd = $.Deferred();
	var res = {
		formatInvalid : false,
		isShape : false
	};
//	var formatInvalid = false;

	var reader = new FileReader();
	//Closure to capture the file information.
	reader.onload = (function(theFile) {
	  return function(e) {
		  var zip = new JSZip(e.target.result);
		  // that, or a good ol' for(var entryName in zip.files)
		  var extArray= [];
		  $.each(zip.files, function (index, zipEntry) {
//			console.debug(zipEntry.name);
			var ext = zipEntry.name.split('.').pop().toLowerCase();
//			console.debug(ext);
			extArray.push(ext);
//			console.debug(extArray);
		  });

			//console.debug(extArray);
			formatInvalid = true;
			if(jQuery.inArray("shp", extArray)!=-1){
				res.isShape = true;
				res.formatInvalid = res.formatInvalid && false;
			}else if(jQuery.inArray("dgn", extArray)!=-1){
				res.formatInvalid = res.formatInvalid && false;
			}else if(jQuery.inArray("dxf", extArray)!=-1){
				envioArxiu.format = "dxf";
				res.formatInvalid = res.formatInvalid && false;
			}else if(jQuery.inArray("sid", extArray)!=-1){
				envioArxiu.format = "sid";
				res.formatInvalid = res.formatInvalid && false;
			}else if(jQuery.inArray("jpg", extArray)!=-1){
				envioArxiu.format = "jpg";
				res.formatInvalid = res.formatInvalid && false;
			}else if(jQuery.inArray("tif", extArray)!=-1){
				envioArxiu.format = "tif";
				res.formatInvalid = res.formatInvalid && false;
			}else if(jQuery.inArray("ecw", extArray)!=-1){
				envioArxiu.format = "ecw";
				res.formatInvalid = res.formatInvalid && false;
			}

			if (!res.formatInvalid) { // hi hso
				console.debug("Hi ha alguna extensio valida...");
				if(jQuery.inArray("tif", extArray)!=-1 || jQuery.inArray("sid", extArray)!=-1 || jQuery.inArray("jpg", extArray)!=-1){
					res.formatInvalid = (jQuery.inArray("sdw", extArray)==-1) && (jQuery.inArray("tfw", extArray)==-1) && (jQuery.inArray("jpw", extArray)==-1) && (jQuery.inArray("jgw", extArray)==-1);
					console.debug("es geotiif o mrsid o geo-jpg");
				}
				dfd.resolve(res);
			}else{
				dfd.resolve(res);
			}
	  }

	})(file);
	// read the file !
	reader.readAsArrayBuffer(file);
	console.debug("formatInvalid:"+res.formatInvalid);
	
    return dfd.promise();
}

function miraFitxer(fitxer) {

	console.info("miraFitxer....");
	var dfd = $.Deferred();
	
	var obj = {}
	obj.isShape = false;
	obj.ext = fitxer.name.split('.').pop().toLowerCase();

	var arr = [ 'shp', 'xls', 'xlsx', 'dgn', 'dxf', 'zip', 'geojson', 'kml',
				'kmz', 'gml', 'xml', 'gpx', 'txt', 'csv', 'json', 'jpg', 'tif', 'sid', 'ecw' ];
	
	if (jQuery.inArray(obj.ext, arr) != -1) { // hi hso
		
		console.debug("Extensio:"+ obj.ext);
		
		if(obj.ext=="shp"){
			obj.isValid = false;
			obj.msg =  window.lang.convert("El fitxer SHP ha d'anar dins d'un ZIP juntament amb els fitxers SHX i DBF.");	
			dfd.resolve(obj);
		}else{
			//Comprovem  mida fitxer i si usuari loginat
			var randomUser = isRandomUser($.cookie('uid'));
			if( (randomUser && fitxer.size<midaFitxerRandom) || (!randomUser && fitxer.size < midaFitxer) ){
				
				if(obj.ext=="zip"){
					//TODO
					checkFileRaster(fitxer).then(function(res){
						
						obj.isValid = !res.formatInvalid;
						if(res.formatInvalid){
							obj.msg =  window.lang.convert("Els fitxers TIF, SID i JPG han d'anar dins d'un ZIP juntament amb els seus TFW, SDW, JPW/JGW corresponents.");
						}
						obj.isShape = res.isShape;
						dfd.resolve(obj);
					},function(res){
						obj.isValid = false;
						dfd.resolve(obj);
					});
				}else{
					obj.isValid = true;
					dfd.resolve(obj);
				}
				
			}else{
				obj.isValid = false;
				if(randomUser) obj.msg =  window.lang.convert("La mida del fitxer supera el límit preestablert per usuaris que no han iniciat sessió (10MB).");
				else obj.msg = window.lang.convert("La mida del fitxer supera el límit preestablert (500MB).");
				busy = false;
				dfd.resolve(obj);
			}
			
			
			
//			if(isRandomUser($.cookie('uid'))){
//				if(fitxer.size < midaFitxerRandom){
//					if(obj.ext=="zip"){
//						//TODO
//						checkFileRaster(fitxer).then(function(res){
//							obj.isValid = !res.formatInvalid;
//							if(res.formatInvalid){
//								obj.msg =  window.lang.convert("Els fitxers TIF, SID i JPG han d'anar dins d'un ZIP juntament amb els seus TFW, SDW, JPW/JGW corresponents.");
//							}
//							obj.isShape = res.isShape;
//							dfd.resolve(obj);
//						},function(res){
//							obj.isValid = false;
//							dfd.resolve(obj);
//						});
//					}else{
//						obj.isValid = true;
//						dfd.resolve(obj);
//					}
//				}else{
//					obj.isValid = false;
//					obj.msg =  window.lang.convert("La mida del fitxer supera el límit preestablert per usuaris que no han iniciat sessió (10MB).");
//					busy = false;
//					dfd.resolve(obj);
//				}
//			}else if(fitxer.size < midaFitxer){
//				if(obj.ext=="zip"){
//					//TODO
//					obj.isValid = checkFileRaster(fitxer);
//				}else{
//					obj.isValid = true;
//					dfd.resolve(obj);
//				}		
//			}else{
//				//console.debug(window.lang.convert("Arxiu massa gran!!"));
//				obj.isValid = false;
//				obj.msg = window.lang.convert("La mida del fitxer supera el límit preestablert (500MB).");
//				busy = false;
//				dfd.resolve(obj);
//			}				
		}

	}else{
		obj.isValid = false;
		obj.msg = window.lang.convert("Tipus de fitxer no acceptat");
		dfd.resolve(obj);
	}
	
	envioArxiu.ext=obj.ext;
	envioArxiu.midaFitxer=fitxer.size;
	//Categoria segons mida fitxer per GA
	envioArxiu.categoriaMidaFitxer = getCategoriaMidaFitxer(fitxer.size/1000);
	
//	console.debug("midaFItxer:");
//	console.debug(midaFitxer);
	
	return dfd.promise();
}

function addDropFileToMap(results) {
		
			if(results.layer && results.layer.serverType.indexOf(t_vis_wms_noedit)!=-1){
	
				loadVisualitzacioWmsLayer(results.layer);
				jQuery('#info_uploadFile').hide();
				
			}else{
				//Si geometries tipus marker
				if(results.layerMarker){
					
					//LIMIT GEOMETRIES: Comprovem si es vis_wms o normal
					if(results.layerMarker.serverType.indexOf(t_vis_wms)!=-1){
						
						loadVisualitzacioWmsLayer(results.layerMarker);
						jQuery('#info_uploadFile').hide();
						
					}else{
						var defer = $.Deferred();
						loadVisualitzacioLayer(results.layerMarker).then(function(results1){
							if(results1 && !jQuery.isEmptyObject(results1._layers)){
								map.fitBounds(results1.getBounds());
							}								
							jQuery('#info_uploadFile').hide();
							
						});					
					}
				}					
				//Si geometries tipus línies
				if(results.layerLine){
					if(results.layerLine.serverType.indexOf(t_vis_wms)!=-1){
						loadVisualitzacioWmsLayer(results.layerLine);
						jQuery('#info_uploadFile').hide();
					}else{
						var defer = $.Deferred();
//						readVisualitzacio(defer, results.visualitzacioLine, results.layerLine).then(function(results1){
						loadVisualitzacioLayer(results.layerLine).then(function(results1){
							if(results1 && !jQuery.isEmptyObject(results1._layers)){
								map.fitBounds(results1.getBounds());
							}
							jQuery('#info_uploadFile').hide();
							
						});					
					}
				}
				//Si geometries tipus polygon
				if(results.layerPolygon){
					if(results.layerPolygon.serverType.indexOf(t_vis_wms)!=-1){
						loadVisualitzacioWmsLayer(results.layerPolygon);
						jQuery('#info_uploadFile').hide();
					}else{
						var defer = $.Deferred();
//						readVisualitzacio(defer, results.visualitzacioPolygon, results.layerPolygon).then(function(results1){
						loadVisualitzacioLayer(results.layerPolygon).then(function(results1){
							//console.debug(results.layerPolygon);
							//console.debug(results1);
							if(results1 && !jQuery.isEmptyObject(results1._layers)){
								map.fitBounds(results1.getBounds());
							}
							jQuery('#info_uploadFile').hide();
							
						});					
					}
				}				
			}

			
			//En cas que no hagi retornat cap geometria com a resultat, amaguem finestra carregant
			if(!results.layer && !results.layerPolygon && !results.layerLine && !results.layerMarker){
				jQuery('#info_uploadFile').hide();
			}
			var dataPopover ={
					//uid: $.cookie('uid')
					iduser:_UsrID
			};
			// carregarCapa(businessId);
			refrescaPopOverMevasDades(dataPopover);
			//jQuery('#dialog_carrega_dadesfields').modal('hide');
			//console.debug(busy);
			busy = false;
			//console.debug(busy);
			map.spin(false);
			
}

function loadDefaultStyles(){
	envioArxiu.markerStyle = JSON.stringify(getMarkerRangFromStyle(defaultPunt));
	envioArxiu.lineStyle = JSON.stringify(getLineRangFromStyle(canvas_linia));
	envioArxiu.polygonStyle = JSON.stringify(getPolygonRangFromStyle(canvas_pol));
}

function addHtmlModalCarregarFitxers(){
	var dfd = $.Deferred();
	$.get("templates/modalCarregarFitxers.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data);
		
		$('#dialog_carrega_dades').on('hide.bs.modal', function (event) {
			if(envioArxiu.isDrag){
				drgFromMapa.removeAllFiles(true);
			}else{
				if (drgFromBoto != null) drgFromBoto.removeAllFiles(true);
			}
		});
		
		jQuery('#dialog_carrega_dades #bt_upload_cancel').on("click", function(e) {
			$('#dialog_carrega_dades').modal('hide');
			busy = false;
			if(envioArxiu.isDrag){
				drgFromMapa.uploadFile(drgFromMapa.files[0]);	
			}else{
				drgFromBoto.uploadFile(drgFromBoto.files[0]);;
			}
		});	
		dfd.resolve();
	});
	return dfd.promise();
}

function addHtmlModalErrorUpload(){
	var dfd = $.Deferred();
	$.get("templates/modalErrorUpload.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data);
		dfd.resolve();
	});
	return dfd.promise();
}

function addHtmlModalInfoUpload(){
	var dfd = $.Deferred();
	$.get("templates/modalInfoUpload.html",function(data){
		//TODO ver como pasar el modal container
		$('#mapa_modals').append(data);
		dfd.resolve();
	});
	return dfd.promise();
}

function addHtmlInterficieCarregarFitxers(){
	jQuery("#funcio_carregar_fitxers").append(
			'<div lang="ca" id="div_carrega_dades" class="div_carrega_dades" data-toggle="tooltip" title="Arrossega les teves dades sobre el mapa o fes clic aquí" data-lang-title="Arrossega les teves dades sobre el mapa o fes clic aquí"></div>'		
	);
	
	$('.div_carrega_dades').tooltip({
		placement : 'bottom',
		container : 'body'
	});	
}
