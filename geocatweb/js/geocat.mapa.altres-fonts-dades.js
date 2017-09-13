/**
 * geocat.mapa.altres-fonts-dades
 */
function cercaCapes(e){
	var code = e.which; // recommended to use e.which, it's normalized across browsers
    if(code==13) {//enter
    	var data = {
        	searchInput: jQuery("#txt_capesInstamaps").val()
    	};
    	valorCampText=jQuery("#txt_capesInstamaps").val();
    	searchCapesPubliques(data).then(function(results){
    		if(results.status == 'OK'){
    			var lDadesInstamaps = '<ul class="bs-dadesO panel-heading llista-dadesInstamaps">';
    			var apBusinessIds = results.apBusinessIds;

    			jQuery.each(results.results, function(i, item) {
    				//console.debug(item);
    				lDadesInstamaps += '<li><a class="label-dadesInstamaps" href="#" data-url="'+item[0]+'" data-servertype="'+item[2]+'" data-nom="'+item[1]+'">'
    						+ item[1]
    						+ '</a>'
    						+'&nbsp;&nbsp;<a href="http://www.instamaps.cat/geocatweb/visor.html?businessid='+apBusinessIds[item[0]]+'" target="_blank"><span class="glyphicon glyphicon-eye-open" title="Veure al corresponent mapa">'
    						+'</span></a>'
    						+ '</li>';
    			});				
    		
    			lDadesInstamaps += '</ul>';
    			jQuery("#id_capes_instamaps").html(
    					'<div class="panel-dadesInstamaps">'+									
    					'<div class="input-group txt_capes">'+
    						'<input type="text" lang="ca" class="form-control" value="'+data.searchInput+'" placeholder="Entra el nom de la capa que vols buscar" style="height:33px" id="txt_capesInstamaps" onkeyup="cercaCapes(event);">'+ 
    						'<span class="input-group-btn">'+
    							'<button type="button" id="bt_capesInstamaps" class="btn btn-success" onclick="cercaCapesBtn();">'+
    								'<span class="glyphicon glyphicon-play"></span>'+
    							'</button>'+
    						'</span>'+
    					'</div>'+
    					lDadesInstamaps +
    				'</div>'
    			);
    			jQuery("#id_capes_instamaps a.label-dadesInstamaps").on('click', function(e) {
    				var data = {
    						uid: Cookies.get('uid'),
    						mapBusinessId: url('?businessid'),
    						businessId: this.dataset.url,
    						nom: this.dataset.nom +"_duplicat",
    						markerStyle:JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
    						lineStyle:JSON.stringify(getLineRangFromStyle(canvas_linia)),
    						polygonStyle:JSON.stringify(getPolygonRangFromStyle(canvas_pol))
    				};	
    				var servertype = this.dataset.servertype;
    				duplicateVisualitzacioLayer(data).then(function(results){
    					if(results.status==='OK'){
    						
    						var value = results.results;
    						
    						$.publish('analyticsEvent',{event:['mapa', tipus_user+'carregar dades instamaps', servertype, 1]});

    						
    						if (value.epsg == "4326"){
    							value.epsg = L.CRS.EPSG4326;
    						}else if (value.epsg == "25831"){
    							value.epsg = L.CRS.EPSG25831;
    						}else if (value.epsg == "23031"){
    							value.epsg = L.CRS.EPSG23031;
    						}else{
    							value.epsg = map.crs;
    						}							
    						if(servertype == t_wms){
    							loadWmsLayer(value);
    						}else if((servertype == t_dades_obertes)){
    							loadDadesObertesLayer(value);
    						}else if(servertype == t_xarxes_socials){
    							
    							var options = jQuery.parseJSON( value.options );
    							if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
    							else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
    							else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
    							
    						}else if(servertype == t_tematic){
    							loadTematicLayer(value);
    						}else if(servertype == t_visualitzacio){
    							loadVisualitzacioLayer(value);
    						}	
    					
    						$('#dialog_dades_ex').modal('hide');
    						activaPanelCapes(true);
    					}
    				});								
    				
    			});
    			
    		}
    	});
    }
}

function cercaCapesBtn(){
		var data = {
	    		searchInput: jQuery("#txt_capesInstamaps").val()
		};
		valorCampText=jQuery("#txt_capesInstamaps").val();
		searchCapesPubliques(data).then(function(results){
			if(results.status == 'OK'){
				
				
				var lDadesInstamaps = '<ul class="bs-dadesO panel-heading llista-dadesInstamaps">';
				var apBusinessIds = results.apBusinessIds;
				
				jQuery.each(results.results, function(i, item) {
					//console.debug(item);
					lDadesInstamaps += '<li><a class="label-dadesInstamaps" href="#" data-url="'+item[0]+'" data-servertype="'+item[2]+'" data-nom="'+item[1]+'">'
							+ item[1]
							+ '</a>'
							+'&nbsp;&nbsp;<a href="http://www.instamaps.cat/geocatweb/visor.html?businessid='+apBusinessIds[item[0]]+'" target="_blank"><span class="glyphicon glyphicon-eye-open" title="Veure al corresponent mapa"></span></a>'
							+ '</li>';
				});				
			
				lDadesInstamaps += '</ul>';
				jQuery("#id_capes_instamaps").html(
						'<div class="panel-dadesInstamaps">'+									
						'<div class="input-group txt_capes">'+
							'<input type="text" lang="ca" class="form-control" value="'+data.searchInput+'" placeholder="Entra el nom de la capa que vols buscar" style="height:33px" id="txt_capesInstamaps" onkeyup="cercaCapes(event);">'+ 
							'<span class="input-group-btn">'+
								'<button type="button" id="bt_capesInstamaps" class="btn btn-success" onclick="cercaCapesBtn();">'+
									'<span class="glyphicon glyphicon-play"></span>'+
								'</button>'+
							'</span>'+
						'</div>'+
						lDadesInstamaps +
					'</div>'
				);
				jQuery("#id_capes_instamaps a.label-dadesInstamaps").on('click', function(e) {
					var data = {
							uid: Cookies.get('uid'),
							mapBusinessId: url('?businessid'),
							businessId: this.dataset.url,
							nom: this.dataset.nom +"_duplicat",
							markerStyle:JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
							lineStyle:JSON.stringify(getLineRangFromStyle(canvas_linia)),
							polygonStyle:JSON.stringify(getPolygonRangFromStyle(canvas_pol))
					};	
					var servertype = this.dataset.servertype;
					duplicateVisualitzacioLayer(data).then(function(results){
						if(results.status==='OK'){
							
							var value = results.results;
							
							$.publish('analyticsEvent',{event:['mapa', tipus_user+'carregar dades instamaps', servertype, 1]});

							
							if (value.epsg == "4326"){
								value.epsg = L.CRS.EPSG4326;
							}else if (value.epsg == "25831"){
								value.epsg = L.CRS.EPSG25831;
							}else if (value.epsg == "23031"){
								value.epsg = L.CRS.EPSG23031;
							}else{
								value.epsg = map.crs;
							}							
							if(servertype == t_wms){
								loadWmsLayer(value);
							}else if((servertype == t_dades_obertes)){
								loadDadesObertesLayer(value);
							}else if(servertype == t_xarxes_socials){
								
								var options = jQuery.parseJSON( value.options );
								if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
								else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
								else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
								
							}else if(servertype == t_tematic){
								loadTematicLayer(value);
							}else if(servertype == t_visualitzacio){
								loadVisualitzacioLayer(value);
							}	
							
							$('#dialog_dades_ex').modal('hide');
							activaPanelCapes(true);
						}
					});								
					
				});
			
			}
		});

}

function addControlAltresFontsDades() {
	

	addHtmlInterficieDadesExt();
	addHtmlModalDadesExt();
	
	if(isSostenibilitatUser(true)){
		_Sostenibilitat=new IM_Sostenibilitat();
		_Sostenibilitat.initSostenibilitatUserMapa();
	}	
	
	var _DadesOficials=new IM_DadesOficials();
	jQuery(".div_dades_ext").on('click', function() {
		//gestionaPopOver(this);
		jQuery('.modal').modal('hide');
		$('#dialog_dades_ex').modal('show');
		$.publish('analyticsEvent',{event:['mapa', tipus_user+'button_altres_fons_dades', 'mapa_click_button', 1]});
		
		
		
		$('a[href^="#id_do').click();
		jQuery('#id_do').html(_htmlDadesObertes.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://www20.gencat.cat/portal/site/dadesobertes">Dades obertes Gencat</a></span>');

		jQuery("#id_do a.label-explora").on('click', function(e) {
			if(e.target.id !="id_do"){
				addCapaDadesObertes(e.target.id,jQuery(e.target).text());
			}
		});
		jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			var tbA = e.target.attributes.href.value;

			if (tbA == "#id_do") {
				
		$.publish('analyticsEvent',{event:['mapa', tipus_user+'tab_dades_obertes', 'modal_click_tab', 1]});
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlDadesObertes.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://www20.gencat.cat/portal/site/dadesobertes">Dades obertes Gencat</a></span>');

				jQuery(tbA+" a.label-explora").on('click', function(e) {
					if(e.target.id !="id_do"){
						addCapaDadesObertes(e.target.id,jQuery(e.target).text());
					}
				});
			}else if (tbA=='#id_ofi'){

				$.publish('analyticsEvent',{event:['mapa', tipus_user+'tab_dades_oficials', 'modal_click_tab', 1]});
				
				jQuery(tbA).empty();
				jQuery(tbA).html(_DadesOficials.generaOpcionsHTMLDadesOficials());							
				jQuery(tbA+" a.label-dof").on('click', function(e) {
						_DadesOficials.addOpcionsHTMLTipusDadesOficials(this);
						
					});
							
			
			}else if(tbA == "#id_srvw"){
				$.publish('analyticsEvent',{event:['mapa', tipus_user+'tab_serveis_wms', 'modal_click_tab', 1]});
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisWMS.join(' '));
						//'<span class="label label-font">Font: <a target="_blank" href="http://catalegidec.icc.cat">Cat&agrave;leg IDEC</a></span>');
				var instamapsWms = InstamapsWms({container:$('#div_controlWMS'), botons: $('#div_emptyWMS'),proxyUrl: paramUrl.ows2json, callback: addWmsToMap});
				jQuery(tbA+" a.label-wms").on('click', function(e) {
														
					if(e.target.id !="id_srvw"){			
						$('#cmd_geoserveis_list').val('WMS');					
						instamapsWms.getLayers({url: e.target.id, name: $(e.target).text()})						
					}
				});
	
			}else if(tbA == "#id_xs"){//Xarxes socials
				
			
				
			
				
				
				
			}else if(tbA == "#id_capes_instamaps"){
				
				$.publish('analyticsEvent',{event:['mapa', tipus_user+'tab_capes_reutilitzables', 'modal_click_tab', 1]});
				jQuery(tbA).empty();
				jQuery(tbA).html('<div class="input-group txt_capes"><input type="text" lang="ca" class="form-control" placeholder="Entrar el nom de la capa que es vol buscar" style="height:33px" id="txt_capesInstamaps" onkeyup="cercaCapes(event);" >'+ 
						'<span class="input-group-btn"><button type="button" id="bt_capesInstamaps" class="btn btn-success" onclick="cercaCapesBtn();"><span class="glyphicon glyphicon-play"></span></button></span> </div>');				
				
			}else if(tbA == "#id_sostenibilitat"){//sostenibilitat
				
					if(isSostenibilitatUser(false)){			
				
					jQuery(tbA).empty();
					jQuery(tbA).html(_Sostenibilitat.generaOpcionsHTMLSostenibilitat());
					jQuery('#bt_sos_config').on('click', function(e) {
						_Sostenibilitat.desaConfigSostenibilitat(true);
					
						});	
					}
				
			}else if(tbA == "#id_url_file"){
				$.publish('analyticsEvent',{event:['mapa', tipus_user+'tab_dades_externes', 'modal_click_tab', 1]});
				jQuery(tbA).empty();
				var label_xarxes = "La informació de les xarxes socials es mostra en funció de l'àrea geogràfica visualitzada."
				//Carreguem exemples de dades externes 

				var lDadesExternes = '<ul class="bs-dadesO panel-heading llista-dadesExternes">';
				jQuery.each(llista_dadesExternes.dadesExternes, function(key, dadesExternes) {
						lDadesExternes += '<li><a class="label-dadesExternes" href="#" data-url="'
							+ dadesExternes.urlDadesExternes
							+ '" data-format="'
							+ dadesExternes.formatDadesExternes
							+ '" data-epsg="'
							+ dadesExternes.epsgDadesExternes
							+ '">'
							+ window.lang.translate(dadesExternes.titol)
							+ '</a>'
							+ '<a target="_blank" lang="ca" title="Informació" href="'
							+ dadesExternes.urlOrganitzacio
							+ '"><span class="glyphicon glyphicon-info-sign info-dadesExternes"></span></a>'
							+ '</li>';
				});		

			//lDadesExternes +='<li><a id="add_panoramio_layer" href="#" data-url="panoramio" class="label-dadesExternes">Panoramio <span class="fa fa-picture-o"></span></a></li>';
			lDadesExternes +='<li><a id="add_wikipedia_layer" href="#" data-url="wikipedia" class="label-dadesExternes">Wikipedia <span class="fa fa-wikipedia-w"></span></a></li>';
			
			lDadesExternes +='<li><a id="add_twitter_layer" href="#" data-url="twitter" class="label-dadesExternes">Twitter <span class="fa fa-twitter"></span></a>'+
				'<div id="twitter-collapse">'+
							'<div class="input-group">'+
			      				'<span class="input-group-addon">Hashtag #</span>'+
			      				'<input id="hashtag_twitter_layer" type="text" class="form-control">'+
			      				'<span class="input-group-btn">'+
			      					'<button id="btn-add-twitter-layer" class="btn btn-primary editable-submit" type="button"><i class="glyphicon glyphicon-ok"></i></button>'+
			      				'</span>'+
				      		'</div>'+
				      		'</div>'+
					'</li>';
			
						


				
				lDadesExternes += '</ul>';
				
				jQuery(tbA).html(
						'<div class="panel-dadesExternes">'+
							lDadesExternes +
							
							'<div id="container_altres_fonts_dades">'
						
				);
				
				jQuery("#div_url_file").hide();
				$('#twitter-collapse').hide();
				$('#twitter-collapse .input-group .input-group-btn #btn-add-twitter-layer').click(function(){
					addTwitterLayer();
					$('#dialog_dades_ex').modal('hide');
				});
				jQuery(".label-dadesExternes").on('click', function(e) {
					
					
					//URL PRESIDENT JSON
					if(this.dataset.url.indexOf(paramUrl.presidentJSON)!= -1){
						
						getServeiJSONP(this.dataset.url);						
					}else if (this.dataset.url=="panoramio"){
						addPanoramioLayer();
						$('#dialog_dades_ex').modal('hide');
					}else if (this.dataset.url=="wikipedia"){
						addWikipediaLayer();	
						$('#dialog_dades_ex').modal('hide');						
					}else if (this.dataset.url=="twitter"){
						toggleCollapseDiv('#twitter-collapse');					
					}else{//LA RESTA
						if(!busy){
							//console.debug("No esta busy.. faig la carrega!");
							busy = true;
							createURLfileLayer(this.dataset.url, this.dataset.format, this.dataset.epsg, false, this.text);
						}else{
							//console.debug("Esta busy, no puc carregar");
							
							$('#dialog_dades_ex').modal('hide');
							$('#dialog_info_upload_txt').text(window.lang.translate("S'està processant un arxiu. Si us plau, espereu que aquest acabi."));
							$('#dialog_info_upload').modal('show');
							
							//drgFromMapa.removeAllFiles(true);							
						}
					}
				});
				
				var _instamapsDadesExternes = new InstamapsDadesExternes(
				{container:$('#container_altres_fonts_dades')});
				
				
						

			}		
		});
	})
}





function addHtmlModalDadesExt(){
	
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Dades Externes -->'+
	'		<div class="modal fade" id="dialog_dades_ex" style="width:105%">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title"><span lang="ca">Explora altres fonts de dades</span><span><a class="faqs_link" href="http://betaportal.icgc.cat/wordpress/faq-dinstamaps/#explorafonts" target="_blank"><i class="fa fa-question-circle-o fa-lg fa-fw"></i></a></span></h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<ul class="nav nav-tabs etiqueta">'+
	'						<li><a href="#id_ofi" lang="ca" data-toggle="tab">Dades oficials</a></li>'+
	'						<li><a href="#id_do" lang="ca" data-toggle="tab">Dades obertes</a></li>'+
	'						<li><a href="#id_srvw" lang="ca" data-toggle="tab">Geoserveis</a></li>'+
	'						<li><a href="#id_capes_instamaps" lang="ca" data-toggle="tab">Dades usuaris</a></li>'+
	'						<li><a href="#id_url_file" data-toggle="tab"><span lang="ca">Dades núvol</span></a></li>'+
	'						<li id="li_sostenibilitat"><a href="#id_sostenibilitat" data-toggle="tab"><span lang="ca">Sostenibilitat</span></a></li>'+
	'					</ul>'+
	'					<div class="tab-content tab-content-margin5px">'+
	'						<div class="tab-pane fade" id="id_ofi"></div>'+
	'						<div class="tab-pane fade" id="id_do"></div>'+
	//'						<div class="tab-pane fade" id="id_xs"></div>'+
	'						<div class="tab-pane fade" id="id_srvw"></div>'+
	'						<div class="tab-pane fade" id="id_capes_instamaps"></div>'+
	'						<div class="tab-pane fade" id="id_url_file"></div>'+
	'                       <div class="tab-pane fade" id="id_sostenibilitat"></div>'+
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






