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
						getCapabilitiesWMS(e.target.id,jQuery(e.target).text());
					}
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
				
			}else if(tbA == "#id_url_file"){
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
						createURLfileLayer(this.dataset.url, this.dataset.format, this.dataset.epsg, false, this.text);
					}
				});
				
				jQuery("#bt_URLfitxer").on('click', function(e) {
					jQuery("#div_url_file").show();
					var urlFile = jQuery("#txt_URLfile").val();
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
										  '<option value=".kml">KML</option>'+
										  '<option value=".gpx">GPX</option>'+
										  '<option value=".kmz">KMZ</option>'+
										  '<option value=".zip">Zip File</option>'+
										  '<option value="-1">'+window.lang.convert("Selecciona el Format")+'</option>'+
										'</select>'+
										'<br><br>'+
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
							
							jQuery("#div_url_file_message").hide();
							
							//Comprovem tipus del file
							var type = "-1";
							if(urlFile.indexOf(t_file_kml)!=-1) type = t_file_kml;
							else if(urlFile.indexOf(t_file_gpx)!=-1) type = t_file_gpx;
							else if(urlFile.indexOf(t_file_shp)!=-1) type = t_file_shp;
							else if(urlFile.indexOf(t_file_dxf)!=-1) type = t_file_dxf;
//							else if(urlFile.indexOf(t_file_csv)!=-1) type = t_file_csv;
//							else if(urlFile.indexOf(t_file_wkt)!=-1) type = t_file_wkt;
							else if(urlFile.indexOf(t_file_topojson)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_geojson)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_json)!=-1) type = t_file_geojson;
							
							$('#select-url-file-format option[value="'+type+'"]').prop("selected", "selected");
							
							if (type==".kml" ||type==".gpx"){
								$('#select-url-file-epsg option[value="EPSG:4326"]').prop("selected", "selected");
								jQuery("#select-url-file-epsg").attr('disabled',true);
							}else{
								$('#select-url-file-epsg option[value="-1"]').prop("selected", "selected");
								jQuery("#select-url-file-epsg").attr('disabled',false);
							}
							
							var nom_capa = window.lang.convert("Capa de fitxer");
							if(type!="-1") nom_capa+=type;
							jQuery("#input-url-file-name").val(nom_capa);
							
							jQuery("#bt_URLfitxer_go").on('click', function(e) {
								e.stopImmediatePropagation();
//								e.stopPropagation();
//								e.preventDefault();
//								console.debug("bt_URLfitxer_go");
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
								var urlFile = jQuery("#txt_URLfile").val();
								var type = jQuery("#select-url-file-format").val();
								var epsg = jQuery("#select-url-file-epsg").val();
								
								if(type.indexOf("-1")!= -1 || epsg.indexOf("-1")!= -1){
									if(type.indexOf("-1")!= -1) jQuery("#select-url-file-format").addClass("class_error");
									if(epsg.indexOf("-1")!= -1) jQuery("#select-url-file-epsg").addClass("class_error");
								}else{
//									console.debug("abans createURLfileLayer");
									createURLfileLayer(urlFile, type, epsg, $("#dinamic_chck").is(':checked'),jQuery("#input-url-file-name").val());
//									console.debug("despres createURLfileLayer");
								}
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
								var ext = jQuery(this).val();
								if ((ext==".kml")||(ext==".gpx")){
									$('#select-url-file-epsg option[value="EPSG:4326"]').prop("selected", "selected");
									jQuery("#select-url-file-epsg").attr('disabled',true);
								}else{
									jQuery("#select-url-file-epsg").attr('disabled',false);	
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
	'		<div class="modal fade" id="dialog_dades_ex">'+
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
	'						<li><a href="#id_url_file" lang="ca" data-toggle="tab">Dades externes</a></li>'+
	'					</ul>'+
	'					<div class="tab-content">'+
	'						<div class="tab-pane fade" id="id_do"></div>'+
	'						<div class="tab-pane fade" id="id_xs"></div>'+
	'						<!--  <div class="tab-pane fade" id="id_srvj"></div>-->'+
	'						<div class="tab-pane fade" id="id_srvw"></div>'+
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
			'<div lang="ca" data-toggle="tooltip" title="Explora altres fonts de dades" id="div_dades_ext" class="div_dades_ext"></div>'		
	);
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

