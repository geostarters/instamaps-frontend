/**
 * 
 */

function addControlAltresFontsDades() {
	
	addHtmlInterficieDadesExt();
	addHtmlModalDadesExt();
	
	jQuery(".div_dades_ext").on('click', function() {
		//gestionaPopOver(this);
		jQuery('.modal').modal('hide');
		$('#dialog_dades_ex').modal('show');
		
		jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			var tbA = e.target.attributes.href.value;

			if (tbA == "#id_do") {
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlDadesObertes.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://www20.gencat.cat/portal/site/dadesobertes">Dades Obertes Gencat</a></span>');

				jQuery(tbA+" a.label-explora").on('click', function(e) {
					if(e.target.id !="id_do"){
						addCapaDadesObertes(e.target.id,jQuery(e.target).text());
					}
				});
			}else if(tbA == "#id_srvw"){
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisWMS.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://catalegidec.icc.cat">Cat&agrave;leg IDEC</a></span>');
				jQuery(tbA+" a.label-wms").on('click', function(e) {
					if(e.target.id !="id_srvw"){
						$("#txt_URLWMS").val(e.target.id);
						jQuery("#div_layersWMS").empty();
						jQuery("#div_layersWMS").hide();
						jQuery('#div_emptyWMS').empty();
						getCapabilitiesWMS(e.target.id,jQuery(e.target).text());
					}
				});
				jQuery("#div_layersWMS").hide();
				
				
				$("#txt_URLWMS").focus(function() {
					jQuery("#div_layersWMS").empty();
					jQuery("#div_layersWMS").hide();
					jQuery('#div_emptyWMS').empty();
				});
				
				
//			}else if(tbA == "#id_srvj"){
//				jQuery(tbA).empty();
//				jQuery(tbA).html(_htmlServeisJSON.join(' '));
//				jQuery("#bt_connJSON").on('click', function(e) {
//					if(e.target.id !="#id_srvj"){
//						getServeiJSONP(jQuery("#txt_URLJSON").val());
//					}
//				});		
			}else if(tbA == "#id_xs"){//Xarxes socials
				var label_xarxes = "La informació es mostra en funció de l'àrea geogràfica visualitzada."
				jQuery(tbA).html(
						'<div class="panel-info">'+
						'<ul class="bs-dadesO_XS panel-heading">'+
						'<li><a id="add_twitter_layer" href="javascript:toggleCollapseDiv(\'#twitter-collapse\')" class="label-xs">Twitter <i class="fa fa-twitter"></i></a></li>'+
						'<li><a id="add_panoramio_layer" href="javascript:addPanoramioLayer();" class="label-xs">Panoramio <i class="fa fa-picture-o"></i></a></li>'+
						'<li><a id="add_wikipedia_layer" href="javascript:addWikipediaLayer();" class="label-xs">Wikipedia <i class="fa fa-book"></i></a></li>'+
						//'<li><a id="add_wikipedia_layer" href="javascript:toggleCollapseDiv(\'#wikipedia-collapse\')" class="label-xs">Wikipedia <i class="fa fa-book"></i></a></li>'+
						'</ul>'+
						'<div class="panel-body"><span class="label-xarxes" lang="ca">'+window.lang.convert(label_xarxes)+'</span></div>'+
						'<div id="twitter-collapse">'+
							'<div class="input-group">'+
			      				'<span class="input-group-addon">Hashtag #</span>'+
			      				'<input id="hashtag_twitter_layer" type="text" class="form-control">'+
			      				'<span class="input-group-btn">'+
			      					'<button id="btn-add-twitter-layer" class="btn btn-primary editable-submit" type="button"><i class="glyphicon glyphicon-ok"></i></button>'+
			      				'</span>'+
				      		'</div>'+
				      		'</div>'+
			      		'</div>'+
						'<div id="wikipedia-collapse">'+
							'<div class="input-group">'+
			      				'<span class="input-group-addon">Paraula clau #</span>'+
			      				'<input id="name_wikipedia_layer" type="text" class="form-control">'+
			      				'<span class="input-group-btn">'+
			      					'<button id="btn-add-wikipedia-layer" class="btn btn-primary editable-submit" type="button"><i class="glyphicon glyphicon-ok"></i></button>'+
			      				'</span>'+
				      		'</div>'+
				      		'</div>'+
			      		'</div>'			      		
				);
				$('#twitter-collapse').hide();
				$('#twitter-collapse .input-group .input-group-btn #btn-add-twitter-layer').click(function(){
					addTwitterLayer();
				});

				$('#wikipedia-collapse').hide();
				$('#wikipedia-collapse .input-group .input-group-btn #btn-add-wikipedia-layer').click(function(){
					addWikipediaLayer();
				});				
				
			}else if(tbA == "#id_capes_instamaps"){
				jQuery(tbA).empty();
				jQuery(tbA).html('<div class="input-group txt_capes"><input type="text" lang="ca" class="form-control" placeholder="Entra el nom de la capa que vols buscar" style="height:33px" id="txt_capesInstamaps"> <span class="input-group-btn"><button type="button" id="bt_capesInstamaps" class="btn btn-success"><span class="glyphicon glyphicon-play"></span></button></span> </div>');
				jQuery("#bt_capesInstamaps").on('click', function(e) {
					alert(jQuery("#txt_capesInstamaps").val());
				});
			}
			else if(tbA == "#id_url_file"){
				jQuery(tbA).empty();

				//Carreguem exemples de dades externes 
				//_htmlServeisWMS.push('<div class="panel-success"><ul class="bs-dadesO panel-heading">');
				var lDadesExternes = '<ul class="bs-dadesO panel-heading llista-dadesExternes">';
				jQuery.each(llista_dadesExternes.dadesExternes, function(key, dadesExternes) {
						lDadesExternes += '<li><a class="label-dadesExternes" href="#" data-url="'
							+ dadesExternes.urlDadesExternes
							+ '" data-format="'
							+ dadesExternes.formatDadesExternes
							+ '" data-epsg="'
							+ dadesExternes.epsgDadesExternes
							+ '">'
							+ window.lang.convert(dadesExternes.titol)
							+ '</a>'
							+ '<a target="_blank" lang="ca" title="Informació" href="'
							+ dadesExternes.urlOrganitzacio
							+ '"><span class="glyphicon glyphicon-info-sign info-dadesExternes"></span></a>'
							+ '</li>';
				});				
				lDadesExternes += '</ul>';
				
				jQuery(tbA).html(
						'<div class="panel-dadesExternes">'+
							lDadesExternes +
							//TODO agregar mensaje
							//'<div>'+window.lang.convert("Entrar URL de dades externes")+' <a lang="ca href="" title="Informació" target="_blank"><span class="glyphicon glyphicon-info-sign"></span></a></div>'+
							'<div class="input-group txt_ext">'+
								'<input type="text" lang="ca" class="form-control" value="" placeholder="'+window.lang.convert("Entrar URL de dades externes")+'" style="height:33px" id="txt_URLfile">'+ 
								'<span class="input-group-btn">'+
									'<button type="button" id="bt_URLfitxer" class="btn btn-success">'+
										'<span class="glyphicon glyphicon-play"></span>'+
									'</button>'+
								'</span>'+
							'</div>'+
						'</div>'+
						'<div id="div_url_file"  class="tbl_url_file"></div>'
//						+'<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>'
				);
				
				jQuery("#div_url_file").hide();
				
				jQuery(".label-dadesExternes").on('click', function(e) {
					//console.debug(e);
					//URL PRESIDENT JSON
					if(this.dataset.url.indexOf(paramUrl.presidentJSON)!= -1){
						jQuery("#div_url_file").show();
						jQuery("#div_url_file").html(
								'<div style="height:230px;overflow:auto" id="div_layersJSON"  class="tbl"></div>'+
								'<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>'
						);
						getServeiJSONP(this.dataset.url);
						
					}else{//LA RESTA
						if(!busy){
							//console.debug("No esta busy.. faig la carrega!");
							busy = true;
							createURLfileLayer(this.dataset.url, this.dataset.format, this.dataset.epsg, false, this.text);
						}else{
							//console.debug("Esta busy, no puc carregar");
							$('#dialog_dades_ex').modal('hide');
							$('#dialog_info_upload_txt').html(window.lang.convert("S'està processant un arxiu. Si us plau, espereu que aquest acabi."));
							$('#dialog_info_upload').modal('show');
							//drgFromMapa.removeAllFiles(true);							
						}
					}
				});
				
				jQuery("#bt_URLfitxer").on('click', function(e) {
					jQuery("#div_url_file").show();
					var urlFile = $.trim(jQuery("#txt_URLfile").val());
					if(isValidURL(urlFile)){
						
						//URL PRESIDENT JSON
						if(urlFile.indexOf(paramUrl.presidentJSON)!= -1){
							jQuery("#div_url_file").html(
									'<div style="height:230px;overflow:auto" id="div_layersJSON"  class="tbl"></div>'+
									'<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>'
							);
							getServeiJSONP(urlFile);
							
						}else{//LA RESTA
							jQuery("#div_url_file").html(
									'<br>'+
									'<div class="input-group input-group-sm">'+
										'<span lang="ca" class="input-group-addon">'+window.lang.convert("Nom capa")+'</span>'+
										'<input type="text" id="input-url-file-name" class="form-control">'+
									'</div>'+	
									'<br>'+
									'<div>'+
									window.lang.convert("Format")+
									':&nbsp;'+
										'<select id="select-url-file-format" class="form-download-format">'+
										  '<option value=".geojson">GeoJSON</option>'+
										  '<option value=".shp">ESRI Shapefile</option>'+
										  '<option value=".dxf">DXF</option>'+
										  '<option value=".dgn">DGN</option>'+
										  '<option value=".kml">KML</option>'+
										  '<option value=".gpx">GPX</option>'+
										  '<option value=".gml">GML</option>'+
										  '<option value=".kmz">KMZ</option>'+
										  '<option value=".csv">CSV</option>'+
										  '<option value=".txt">TXT</option>'+
										  '<option value=".xls">XLS</option>'+
										  '<option value=".xlsx">XLSX</option>'+
										  '<option value=".zip">Zip File</option>'+
										  '<option value="-1">'+window.lang.convert("Selecciona el Format")+'</option>'+
										'</select>'+
										'<br><br>'+
										'<div id="input-excel-url-file">'+
										'	<div class="panel-body">'+
										'	   <ul class="nav nav-pills nav-pills-urlfile" id="nav_pill">'+
										'	      <li id="coordenades" class="active"><a lang="ca" data-toggle="tab" href="#opt_urlfile_coord" aria-expanded="true">'+window.lang.convert("Per coordenades")+'</a></li>'+
										'	      <li id="adreca"  class=""><a lang="ca" data-toggle="tab" href="#opt_urlfile_adreca" aria-expanded="false">'+window.lang.convert("Per adreces")+'</a></li>'+
										'	      <li id="codis"  class=""><a lang="ca" data-toggle="tab" href="#opt_urlfile_codi" aria-expanded="false">'+window.lang.convert("Per codis")+'</a></li>'+
										'	   </ul>'+
										'	   <!-- Tab panes -->		'+					
										'	   <div class="tab-content-urlfile tab-content" id="div_opt_urlfile">'+
										'	      <div id="opt_urlfile_coord" class="tab-pane active">'+
										'	         <ul class="pane-excel-urlfile">'+
														'<label lang="ca">'+window.lang.convert("On són les coordenades?")+'</label>'+
														'<br>'+
														'<div class="input-group input-group-sm">'+
															'<span lang="ca" class="input-group-addon">'+window.lang.convert("Coordenada X o LON")+'</span>'+
															'<input type="text" id="input-coord-x" class="form-control">'+
														'</div>'+	
														'<br>'+	
														'<div class="input-group input-group-sm">'+
															'<span lang="ca" class="input-group-addon">'+window.lang.convert("Coordenada Y o LAT ")+'</span>'+
															'<input type="text" id="input-coord-y" class="form-control">'+
														'</div>'+
										'	         </ul>'+
										'	      </div>'+
										'	      <div id="opt_urlfile_adreca" class="tab-pane active">'+
										'	         <ul class="pane-excel-urlfile">'+
										'					<span lang="ca">Per codificar per adreces utilitza aquest</span>'+ 
										'					<a class="alert-link" lang="ca"	href="dades/exemple_geocod_adreces.xlsx">arxiu tipus</a>'+ 
										'					<span lang="ca">amb les teves dades.</span>'+
										'					<br/>'+
										'					<span lang="ca">Els camps Nom_via, Portal i Municipi són obligatoris.</span>'+
										'	         </ul>'+
										'	      </div>'+
										'	      <div id="opt_urlfile_codi" class="tab-pane tab-pane-urlfile">'+
										'	         <ul class="pane-excel-urlfile">'+
										'	            <li><label lang="ca">'+window.lang.convert("Els teus codis són de")+'</label>:</li>'+
										'	            <li>'+
										'	               <select id="cmd_codiType_Capa_de">'+
										'	                  <option lang="ca" value="municipis" selected="">'+window.lang.convert("Municipis")+'</option>'+
										'	                  <option lang="ca" value="comarques">'+window.lang.convert("Comarques")+'</option>'+
										'	               </select>'+
										'	            </li>'+
										'	            <li><label lang="ca">'+window.lang.convert("Tipus codi")+'</label></li>'+
										'	            <li>'+
										'	               <select name="select_codiType" id="cmd_codiType_de">'+
										'	                  <option value="ine">INE (5 digits)</option>'+
										'	                  <option value="idescat">IDESCAT (6 digits)</option>'+
										'	                  <option value="municat">MUNICAT (10 digits)</option>'+
										'	                  <option value="cadastre">CADASTRE (5 digits)</option>'+
										'	               </select>'+
										'	            </li>'+
										'	            <li><label lang="ca">'+window.lang.convert("Camp que conté el codi")+'</label></li>'+
										'	            <li>'+
															'<div class="input-group input-group-sm">'+
																'<input type="text" id="input-camp-codi-urlfile" class="form-control" placeholder="'+window.lang.convert("Entrar camp")+'">'+
															'</div>'+
										'	            </li>'+
										'	         </ul>'+
										'	      </div>'+
										'	   </div>'+
										'	</div>'+											
										'</div>'+
										'<br>'+
									'EPSG:&nbsp;'+
										'<select id="select-url-file-epsg" class="form-download-epsg">'+
											'<option value="EPSG:4326">EPSG:4326 (WGS84 geogràfiques (lat, lon) - G.G)</option>'+
					              			'<option value="EPSG:23031"><b>EPSG:23031</b> (ED50-UTM 31N Easting,Northing o X,Y)</option>'+
					              			'<option value="EPSG:25831">EPSG:25831 (ETRS89-UTM 31N Easting,Northing o X,Y)</option>'+
					              			'<option value="EPSG:4258">EPSG:4258 INSPIRE(ETRS89 geogràfiques (lat, lon) - G.G)</option>'+
					              			'<option value="EPSG:4230">EPSG:4230 (ED50 geogràfiques (lat, lon) - G.G)</option>'+
					              			'<option value="EPSG:32631">EPSG:32631 (WGS84 31N Easting,Northing o X,Y)</option>'+
					              			'<option value="EPSG:3857">EPSG:3857 (WGS84 Pseudo-Mercator Easting,Northing o X,Y)</option>'+
					              			'<option value="-1">'+window.lang.convert("Selecciona el EPSG")+'</option>'+
										'</select>'+
										'<br><br>'+								
										'<input id="dinamic_chck" type="checkbox" checked="checked">'+
										'&nbsp;'+window.lang.convert("Dinàmica")+
										'<br><small lang="ca" class="label label-success" id="label-dinamic">'+
											window.lang.convert("Dinàmic: S'accedirà a la font de dades cada cop que es carregui la capa")+
										'</small>'+
									'</div>&nbsp;'+
									'<div>'+
										'<span class="input-group-btn">'+
										'<button type="button" id="bt_URLfitxer_go" class="btn btn-success">'+
											'<span class="glyphicon glyphicon-play"></span>'+
										'</button>'+
										'</span>'+
									'</div>'+
									'<div id="div_url_file_message" class="alert alert-danger"></div>'
							);
							
							$('#opt_urlfile_codi').on('click',function(){
								//console.debug("click opt_urlfile_codi");
							});
							
							jQuery("#div_url_file_message").hide();
							jQuery("#input-excel-url-file").hide();
							
							//Comprovem tipus del file
							var type = "-1";
							if(urlFile.indexOf(t_file_kml)!=-1) type = t_file_kml;
							else if(urlFile.indexOf(t_file_gpx)!=-1) type = t_file_gpx;
							else if(urlFile.indexOf(t_file_shp)!=-1) type = t_file_shp;
							else if(urlFile.indexOf(t_file_dxf)!=-1) type = t_file_dxf;
							else if(urlFile.indexOf(t_file_xlsx)!=-1) type = t_file_xlsx;
							else if(urlFile.indexOf(t_file_xls)!=-1) type = t_file_xls;
							else if(urlFile.indexOf(t_file_topojson)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_geojson)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_json)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_csv)!=-1) type = t_file_csv;
							else if(urlFile.indexOf(t_file_txt)!=-1) type = t_file_txt;
							else if(urlFile.indexOf(t_file_dgn)!=-1) type = t_file_dgn;
							else if(urlFile.indexOf(t_file_gml)!=-1) type = t_file_gml;
							
							$('#select-url-file-format option[value="'+type+'"]').prop("selected", "selected");
							
							if (type==".kml" ||type==".gpx" || type==".gml"){
								$('#select-url-file-epsg option[value="EPSG:4326"]').prop("selected", "selected");
								jQuery("#select-url-file-epsg").attr('disabled',true);
							}else if(type==".xls" || type==".xlsx" || type==".csv" || type==".txt"){
								jQuery("#input-excel-url-file").show();
								$('#input-excel-url-file .nav-pills-urlfile li#codis').removeClass("disabled");
								$('#input-excel-url-file .nav-pills-urlfile li a[href="#opt_urlfile_codi"]').attr("data-toggle","tab");
							}else{
								$('#select-url-file-epsg option[value="-1"]').prop("selected", "selected");
								jQuery("#select-url-file-epsg").attr('disabled',false);
							}
							
							var nom_capa = window.lang.convert("Capa de fitxer");
							if(type!="-1") nom_capa+=type;
							jQuery("#input-url-file-name").val(nom_capa);
							
							jQuery("#bt_URLfitxer_go").on('click', function(e) {
								e.stopImmediatePropagation();
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
								
								var urlFile = $.trim(jQuery("#txt_URLfile").val());
								var type = jQuery("#select-url-file-format").val();
								var epsg = jQuery("#select-url-file-epsg").val();
								var opcio = jQuery('.nav-pills-urlfile .active').attr('id');
								var coordX = jQuery("#input-coord-x").val();
								var coordY = jQuery("#input-coord-y").val();
								console.debug(opcio);
								
								if(type.indexOf("-1")!= -1 || epsg.indexOf("-1")!= -1 && opcio!="codis" && opcio!="adreca"){
									if(type.indexOf("-1")!= -1) jQuery("#select-url-file-format").addClass("class_error");
									if(epsg.indexOf("-1")!= -1) jQuery("#select-url-file-epsg").addClass("class_error");
									
								}else if( (type==".xls" || type==".xlsx" || type==".csv" || type==".txt") 
											&&  opcio == "coordenades" && (!isValidValue(coordX) || !isValidValue(coordY) ) ){
									
									if(!isValidValue(coordX)) jQuery("#input-coord-x").addClass("class_error");
									if(!isValidValue(coordY)) jQuery("#input-coord-y").addClass("class_error");
								
								}else if( (type==".xls" || type==".xlsx" || type==".csv" || type==".txt") 
											&&  opcio == "codis" && (!isValidValue(jQuery("#input-camp-codi-urlfile").val())) ){
									
									jQuery("#input-camp-codi-urlfile").addClass("class_error");
								
								}else{
									if(!busy){
										busy = true;
										createURLfileLayer(urlFile, type, epsg, $("#dinamic_chck").is(':checked'),jQuery("#input-url-file-name").val(), 
												   jQuery("#input-coord-x").val(),jQuery("#input-coord-y").val(),
												   jQuery('.nav-pills-urlfile .active').attr('id'),//per coordenades o codis o adreces
												   jQuery('#cmd_codiType_Capa_de').val(), jQuery('#cmd_codiType_de').val(), jQuery("#input-camp-codi-urlfile").val());
									}else{
										$('#dialog_dades_ex').modal('hide');
										$('#dialog_info_upload_txt').html(window.lang.convert("S'està processant un arxiu. Si us plau, espereu que aquest acabi."));
										$('#dialog_info_upload').modal('show');										
									}
								}
							});
							
							jQuery('#cmd_codiType_Capa_de').on('change',function(e) {
								var html = "";
								if (jQuery(this).val() == "municipis") {
									html = "<option value='ine'>INE (5 digits)</option><option value='idescat'>IDESCAT (6 digits)</option><option value='municat'>MUNICAT (10 digits)</option><option value='cadastre'>CADASTRE (5 digits)</option>";
								} else {
									html = "<option value='ine'>NUM_COMARCA (2 digits)</option><option value='municat'>MUNICAT (10 digits)</option>";
								}
								jQuery('#cmd_codiType_de').html(html);
							});
							
							jQuery('.nav-pills-urlfile #codis').on('click', function(){
								jQuery("#select-url-file-epsg").attr('disabled',true);
							});
							
							jQuery('.nav-pills-urlfile #coordenades').on('click', function(){
								jQuery("#select-url-file-epsg").attr('disabled',false);
							});
							
							jQuery('.nav-pills-urlfile #adreca').on('click', function(){
								jQuery("#select-url-file-epsg").attr('disabled',false);
							});
							
							jQuery("#input-coord-x").focus(function() {
								jQuery(this).removeClass("class_error");
							});	
							
							jQuery("#input-coord-y").focus(function() {
								jQuery(this).removeClass("class_error");
							});
							
							jQuery("#input-camp-codi-urlfile").focus(function() {
								jQuery(this).removeClass("class_error");
							});
							
							jQuery("#select-url-file-epsg").change(function(){
								jQuery(this).removeClass("class_error");
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
							});						
							
							jQuery('#select-url-file-format').change(function() {
								jQuery(this).removeClass("class_error");
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
								jQuery("#input-excel-url-file").hide();
								
								var ext = jQuery(this).val();
								if ((ext==".kml")||(ext==".gpx") ||(ext==".gml")){
									$('#select-url-file-epsg option[value="EPSG:4326"]').prop("selected", "selected");
									jQuery("#select-url-file-epsg").attr('disabled',true);
//									jQuery("#input-excel-url-file").hide();
								}else if((ext==".xls")||(ext==".xlsx") || (ext==".csv") || (ext==".txt") ){
									jQuery("#input-excel-url-file").show();
									$('#input-excel-url-file .nav-pills-urlfile li#codis').removeClass("disabled");
									$('#input-excel-url-file .nav-pills-urlfile li a[href="#opt_urlfile_codi"]').attr("data-toggle","tab");
								}else{
									jQuery("#select-url-file-epsg").attr('disabled',false);
//									jQuery("#input-excel-url-file").hide();
								}
							});								
						}
						
					}else{
						jQuery("#div_url_file").html(
								'<div id="txt_URLfile_error" class="alert alert-danger">'+
									'<span class="glyphicon glyphicon-warning-sign"> </span> '+
   									 window.lang.convert("Introdueix una URL vàlida")+
								'</div>'
						);
					}
				});
				
				$("#txt_URLfile").focus(function() {
					jQuery("#div_url_file").empty();
					jQuery("#div_url_file").hide();
				});				
			}		
		});
	})
}


function addHtmlModalDadesExt(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Dades Externes -->'+
	'		<div class="modal fade" id="dialog_dades_ex" style="width:105%">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title" lang="ca">Explora altres fonts de dades</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<ul class="nav nav-tabs etiqueta">'+
	'						<li><a href="#id_do" lang="ca" data-toggle="tab">Dades Obertes</a></li>'+
	'						<li><a href="#id_xs" lang="ca" data-toggle="tab">Xarxes socials</a></li>'+
	'						<!--  <li><a href="#id_srvj" lang="ca" data-toggle="tab">Serveis JSON</a></li>-->'+
	'						<li><a href="#id_srvw" lang="ca" data-toggle="tab">Serveis WMS</a></li>'+
	'						<li><a href="#id_capes_instamaps" lang="ca" data-toggle="tab">Capes d\'Instamaps</a></li>'+
	'						<li><a href="#id_url_file" data-toggle="tab"><span lang="ca">Dades externes</span> <i class="icon icon-dropbox"></i><i class="icon icon-github"></i><i class="icon icon-drive"></i></a></li>'+
	'					</ul>'+
	'					<div class="tab-content tab-content-margin5px">'+
	'						<div class="tab-pane fade" id="id_do"></div>'+
	'						<div class="tab-pane fade" id="id_xs"></div>'+
	'						<!--  <div class="tab-pane fade" id="id_srvj"></div>-->'+
	'						<div class="tab-pane fade" id="id_srvw"></div>'+
	'						<div class="tab-pane fade" id="id_capes_instamaps"></div>'+
	'						<div class="tab-pane fade" id="id_url_file"></div>'+
	'					</div>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<!-- <button type="button" class="btn btn-default" data-dismiss="modal">Tancar</button>'+
	'         			<button type="button" class="btn btn-success">Canviar</button> -->'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal Dades Externes -->'		
	);
	
}

function addHtmlInterficieDadesExt(){
	
	jQuery("#carregar_dades .div_gr2").append(
			'<div lang="ca" id="div_dades_ext" class="div_dades_ext" data-toggle="tooltip" title="Explora altres fonts de dades" data-lang-title="Explora altres fonts de dades"></div>'		
	);
	$('#div_dades_ext').tooltip({
		placement : 'bottom',
		container : 'body'
	});
}

//function toggleCollapseTwitter(){
//	console.debug('toggleCollapseTwitter');
//	$('#twitter-collapse').toggle();
//}
//
//function toggleCollapseTwitter(){
//	console.debug('toggleCollapseTwitter');
//	$('#twitter-collapse').toggle();
//}

