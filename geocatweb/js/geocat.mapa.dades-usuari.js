var delay = (function(){
			  var timer = 0;
			  return function(callback, ms){
			    clearTimeout (timer);
			    timer = setTimeout(callback, ms);
			  };
		})();

var serverType="";
var primerCop="";
var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Encara no has creat cap capa de dades')+"<strong>  <span class='fa fa-warning sign'></span></div>";

$(function() {
	$(document).on("keyup", 'input.search.form-control', function() {
		var q = $(this).val();
		q = $.trim(q);
		if(q != "" && q.length >= 3 ){
			jQuery("#id_sw").empty();
			
			var data ={
				uid: $.cookie('uid'),
				serverName: q,
				serverType: serverType
			};
			delay(function(){
				primerCop="false";
				refrescaPopOverMevasDades(data).then(function(results){
						actualitzarMevesDades(results);
						$('input.search.form-control').val(q);
				});
			}, 400 );
		}
		else if (q==""){
			jQuery("#id_sw").empty();
			
			var data ={
				uid: $.cookie('uid'),
				serverType: serverType
			};
			primerCop="false";
			refrescaPopOverMevasDades(data).then(function(results){
					actualitzarMevesDades(results);
			});
		}
	});
	
	$(document).on("click",'#bt_cercaTevesDades', function() {
		var q = $('input.search.form-control').val();
		q = $.trim(q);
		if(q != "" && q.length >= 3 ){
			jQuery("#id_sw").empty();
			
			var data ={
				uid: $.cookie('uid'),
				serverName: q,
				serverType: serverType
			};
			delay(function(){
				primerCop="false";
				refrescaPopOverMevasDades(data).then(function(results){
						actualitzarMevesDades(results);
						$('input.search.form-control').val(q);
				});
			}, 400 );
		}
		else if (q==""){
			jQuery("#id_sw").empty();
			
			var data ={
				uid: $.cookie('uid'),
				serverType: serverType
			};
			primerCop="false";
			refrescaPopOverMevasDades(data).then(function(results){
					actualitzarMevesDades(results);
			});
		}
	});
	
	$(document).on("ifChecked",'#checkbox-filtres input',function () {
		if (primerCop=="false") {
			 var sThisVal =  $(this).val() ;
			 if (serverType.indexOf(sThisVal)==-1) {
				 if (serverType=="") serverType += sThisVal;
				 else serverType += ","+sThisVal;
			 }
		     $('#listnav-teves-dades > .'+sThisVal).each(function(){
		    	  $(this).removeClass("display-none");
	   		      $(this).addClass("display-block");  		      
		     });
		}		
	 });
	
	$(document).on("ifUnchecked",'#checkbox-filtres input',function () {
		 var sThisVal =  $(this).val() ;
		 if (serverType.indexOf(sThisVal)>-1) {
			 serverType = serverType.replace(","+sThisVal,"");			 
		 }
		 $('#listnav-teves-dades > .'+sThisVal).each(function(){
	    	  $(this).removeClass("display-block");
  		      $(this).addClass("display-none");   	
	     });
	   });

});

function carregaDadesUsuari(){
	addHtmlInterficieDadesUsuari();
	addHtmlModalDadesUsuari();
	addHtmlModalErrorMsg();
	primerCop="true";
	var data = {uid: $.cookie('uid')};
	//console.debug("carregaDadesUsuari");
	getAllServidorsWMSByUser(data).then(function(results){
		if (results.status == "ERROR"){
			//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
			return false;
		}
		dades1=results;
		creaPopOverMevasDades();
	},function(results){
		//JESS DESCOMENTAR!!!!
		console.debug(results);
		//gestioCookie('carregaDadesUsuari');
	});
}


function creaPopOverMevasDades(){
	
	
	jQuery(".div_dades_usr").on('click', function() {
		//console.debug("creaPopOverMevasDades");
		jQuery('.modal').modal('hide');
		$('#cercaTevesDades').attr("style","width:98%");
		$('#dialog_teves_dades').modal('show');
				
		//Per tenir actualitzar canvis: remove layers, add layers, etc
		serverType="";
		jQuery("#id_sw").empty();
		var data = {uid: $.cookie('uid')};
		refrescaPopOverMevasDades(data).then(function(results){
			actualitzarMevesDades(results);
		});
	});
	
}

function actualitzarMevesDades(results){
			initMevesDades = true;
			if(results.results.length == 0){
				jQuery('#id_sw').html(warninMSG);		
			}else{
				var source1 = jQuery("#meus-wms-template").html();
				var template1 = Handlebars.compile(source1);
//				jQuery.each(results.results, function(i,item){
//					if(item.options){
//						var options = jQuery.parseJSON( item.options );
//						console.debug(i+":"+item.serverName+"-"+options.geometryType);
//					}else{
//						console.debug(i+":"+item.serverName);
//					}
//				});
				var html1 = template1(results);				
				jQuery("#id_sw").append(html1);
				
				$('#checkbox-filtres input').iCheck({
	        	    checkboxClass: 'icheckbox_flat-blue',
	        	    radioClass: 'iradio_flat-blue'
	        	});
				
				$('#checkbox-filtres input').each(function(){
					if (serverType==""){
						 var sThisVal =  $(this).val() ;
						$(this).iCheck('check');
						 if (serverType=="") serverType += sThisVal;
						 else serverType += ","+sThisVal;
					}
					else {
						if (serverType.indexOf($(this).val())>-1) {
							$(this).iCheck('check');
						}
						else {
							$(this).iCheck('uncheck');
						}
					}
			     });
				
				$('#id_sw>input').attr("placeholder", window.lang.convert("Cerca"));
				
				$("#listnav-teves-dades").listnav({					
				    initLetter: '',				    
				    allText: window.lang.convert('Tots'),
				    noMatchText: window.lang.convert('No hi ha entrades coincidents'),
				    onClick: function(letter){
				    	if (jQuery("#error-message").length>0) $('#dialog_error_teves_dades').modal('hide');
				     } 
				});
				
				jQuery("ul.llista-teves-dades").on('click', '.usr_wms_layer', function(event) {
					event.preventDefault();
					var _this = jQuery(this);
				
					var data = {
							uid: $.cookie('uid'),
							businessId: mapConfig.businessId,
							servidorWMSbusinessId: _this.data("businessid"),
							layers: _this.data("layers"),
							calentas:false,
							activas:true,
							visibilitats:true,
							order: controlCapes._lastZIndex+ 1
					};						
					
					addServerToMap(data).then(function(results){
						if(results.status==='OK'){
							
							var value = results.results;
							_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar meves dades', value.serverType, 1]);
//							_kmq.push(['record', 'carregar meves dades', {'from':'mapa', 'tipus user':tipus_user, 'tipus layer':value.serverType}]);
							
							if (value.epsg == "4326"){
								value.epsg = L.CRS.EPSG4326;
							}else if (value.epsg == "25831"){
								value.epsg = L.CRS.EPSG25831;
							}else if (value.epsg == "23031"){
								value.epsg = L.CRS.EPSG23031;
							}else{
								value.epsg = map.crs;
							}							
							
							if(_this.data("servertype") == t_wms){
								loadWmsLayer(value);
							}else if((_this.data("servertype") == t_dades_obertes)){
								loadDadesObertesLayer(value);
							}else if(_this.data("servertype") == t_xarxes_socials){
								
								var options = jQuery.parseJSON( value.options );
								if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
								else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
								else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
								
							}else if(_this.data("servertype") == t_tematic){
								loadTematicLayer(value);
							}else if(_this.data("servertype") == t_visualitzacio){
								loadVisualitzacioLayer(value);
							}							
							$('#dialog_teves_dades').modal('hide');
							activaPanelCapes(true);
						}		
					});							
				});					
						
				//Eliminem servidors
				jQuery("ul.llista-teves-dades").on('click', 'span.glyphicon-remove', function(event) {
					event.preventDefault();
					event.stopPropagation();
					var _this = jQuery(this);
					var data = {
						uid: $.cookie('uid'),
						businessId: _this.data("businessid")
					};
					
					var firstLetter = _this.data("servername").charAt(0).toLowerCase();
					if($.isNumeric(firstLetter)) firstLetter = "_";
					
					var parent = _this.parent();
					var parentul = parent.parent();
					//_this.parent().remove();
					if (jQuery.trim(jQuery("#id_sw").text()) == ""){
						jQuery('#id_sw').html(warninMSG);
					}
					jQuery("#error-message").remove();
					if(_this.data("servertype") == t_tematic){
						deleteTematicLayerAll(data).then(function(results){
							if (results.status == "ERROR"){
								//parentul.append(parent);
								if (results.results){
									if (results.results.indexOf("DataIntegrityViolationException")!=-1){
									var aplicacions=results.results.split("__");
									var visors="";
									for (var i=0;i<aplicacions.length;i++){
										var businessIdNom=aplicacions[i].split("#");
										var businessId=businessIdNom[0];
										if (businessId.indexOf("DataIntegrityViolationException")!=-1) businessId=businessId.replace("DataIntegrityViolationException_","");
										var nom=businessIdNom[1];
										if (visors!= "") visors = visors +'<br/>'+ '<a target="_blank" class="deleteCapa" href="http://'+DOMINI+paramUrl.mapaPage+'?businessid='+businessId
										+'">'+nom+"</a>";
										else visors = '<br/>'+visors +'<a target="_blank" class="deleteCapa" href="http://'+DOMINI+paramUrl.mapaPage+'?businessid='+businessId
										+'">'+nom+"</a>";
										
									}
									var errorMSG="<div id='error-message' class='alert alert-danger'>" +
									 "<span class='fa fa-warning sign'></span><strong>"+window.lang.convert('La capa ')+_this.data("servername")+
									 window.lang.convert(' no es pot esborrar perquè actualment és en ús: ')+visors+"<strong>  " +
								     "</div>";
									
									$('#dialog_error_teves_dades').modal('show');
									jQuery('#dialog_error_teves_dades #id_sw').append(errorMSG);
									
									
								}}
							}else{
								_this.parent().remove();
								$('#dialog_error_teves_dades').modal('hide');
								//jQuery("ln-letter-count").init();
//								console.debug(globalCounts);
								globalCounts[''+firstLetter +'']--;
//								console.debug(globalCounts[''+firstLetter +'']);
//								if(globalCounts[''+firstLetter +'']<=0){
//									jQuery(".ln-letters."+firstLetter).addClass('ln-disabled');
//									//jQuery(".ln-letters."+firstLetter).removeClass('ln-selected');
//								}
								
								
								//esborra MapFile WMS
								
								
								
								
							}					
						});
					}else{
						deleteServidorWMS(data).then(function(results){
							if (results.status == "ERROR"){
								//parentul.append(parent);
								if (results.results) {
									if ( results.results.indexOf("DataIntegrityViolationException")!=-1){
								
									var aplicacions=results.results.split("__");
									var visors="";
									for (var i=0;i<aplicacions.length;i++){
										var businessIdNom=aplicacions[i].split("#");
										var businessId=businessIdNom[0];
										if (businessId.indexOf("DataIntegrityViolationException")!=-1) businessId=businessId.replace("DataIntegrityViolationException_","");
										var nom=businessIdNom[1];
										if (visors!= "") visors = visors +'<br/>'+ '<a target="_blank" class="deleteCapa" href="http://'+DOMINI+paramUrl.mapaPage+'?businessid='+businessId
										+'">'+nom+"</a>";
										else visors = '<br/>'+visors +'<a target="_blank" class="deleteCapa" href="http://'+DOMINI+paramUrl.mapaPage+'?businessid='+businessId
										+'">'+nom+"</a>";
										
									}
									var errorMSG="<div  id='error-message' class='alert alert-danger'>" +
									 "<span class='fa fa-warning sign'></span><strong>"+window.lang.convert('La capa ')+_this.data("servername")+
									 window.lang.convert(' no es pot esborrar perquè actualment és en ús: ')+visors+"<strong>  " +
								     "</div>";
									$('#dialog_error_teves_dades').modal('show');
									jQuery('#dialog_error_teves_dades #id_sw').append(errorMSG);
									}}														
									
							}else{
								_this.parent().remove();
								$('#dialog_error_teves_dades').modal('hide');
//								console.debug(globalCounts);
								globalCounts[''+firstLetter +'']--;
								var data2 = {
										uid: $.cookie('uid'),
										businessId: _this.data("businessid")
								};
								deleteVisualitzacioLayer(data2).then(function(results){
									
								});
//								console.debug(globalCounts[''+firstLetter +'']);
//								if(globalCounts[''+firstLetter +'']<=0){
//									jQuery(".ln-letters."+firstLetter).addClass('ln-disabled')
//								}
								
								

								//Esborra GeoJson creat per el servei WMS
								
								var data3 = {
										businessId:  _this.data("businessid"),
										entitatUid: mapConfig.id,
										metode: "deleteGeoJSONfromMap"
									};
								console.debug(data3);
								createMapToWMS(data3).then(function(results){});
								
								
								
								
							}
						});						
					}
				});
				
			}	
		
}

function refrescaPopOverMevasDades(data){
	//console.debug("refrescaPopOverMevasDades");
	var dfd = jQuery.Deferred();
	var data = {uid: $.cookie('uid')};
	getAllServidorsWMSByUser(data).then(function(results){
		var serverOrigen = [];
		jQuery.each(results.results, function(i, item){
//			console.debug(item);
			if (item.serverType == t_tematic || item.serverType == t_visualitzacio){
				if (item.options == null){
					serverOrigen.push(item);
				}else{
					var options = jQuery.parseJSON( item.options );
					if (options.tem == tem_origen || options.tipus == tem_origen){
						serverOrigen.push(item);
					}
				}
			}else if(item.serverType ==t_wms || item.serverType ==t_url_file){
				serverOrigen.push(item);
			}
		});
		dades1.results = serverOrigen;
		dfd.resolve(dades1);
	},function(results){
		gestioCookie('refrescaPopOverMevasDades');
	});
	return dfd.promise();
}

function addHtmlInterficieDadesUsuari(){
	
	jQuery("#carregar_dades .div_gr2").append(
		'<div lang="ca" id="div_dades_usr" class="div_dades_usr" data-toggle="tooltip" title="Accedeix a les teves dades" data-lang-title="Accedeix a les teves dades">'+
		'	<script id="meus-wms-template" type="text/x-handlebars-template">'+
		'	<div class="panel-body">'+
		'		<div >'+
		'			<button id="bt_cercaTevesDades" class="btn btn-tevesDades" type="button"><span class="glyphicon glyphicon-search"></span></button>'+
		'			<input type="text" class="search form-control input-tevesDades" id="cercaTevesDades" placeholder="Cercar a les teves dades"><br/>'+
		'		</div>'+
		'		<!--div style="margin-bottom:3px;" id="checkbox-filtres">'+
		'           Filtre per: '+
		'				<input type="checkbox" id="filtre" style="position: absolute; opacity: 0;" name="tipusCapa" value="visualitzacio">'+
		'			Capes Vector'+
		'				<input type="checkbox" id="filtre" style="position: absolute; opacity: 0;" name="tipusCapa" value="wms">'+
		'			Capes WMS'+
		'				<input type="checkbox" id="filtre" style="position: absolute; opacity: 0;" name="tipusCapa" value="url_file">'+
		'			Capes de fitxers'+
		'		</div-->'+
		'		<div id="list-teves-dades" >'+
		'		<ul id="listnav-teves-dades" class="llista-teves-dades">'+
		'		{{#each results}}'+				    
		'			<li  class="{{serverType}}"><a href="#" data-businessid="{{businessId}}" data-layers="{{layers}}" data-servertype="{{serverType}}" data-options="{{options}}" class="usr_wms_layer label-teves-dades">{{serverName}}</a>'+
		'			<span data-businessid="{{businessId}}" data-servername="{{serverName}}" data-servertype="{{serverType}}" class="glyphicon glyphicon-remove info-teves-dades"></span>'+
		'			</li>'+
		'		{{/each}}'+
		'		</ul>'+
		'		</div>'+
		'	</div>'+
		'	</script>'+
		'</div>'		
	);
	$('#div_dades_usr').tooltip({
		placement : 'bottom',
		container : 'body'
	});
}

function addHtmlModalDadesUsuari(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal les teves dades -->'+
	'		<div class="modal fade" id="dialog_teves_dades">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 id="modal-title-teves-dades" class="modal-title" lang="ca">Accedeix a les teves dades</h4>'+
	'				</div>'+
	'				<div id="id_sw" class="modal-body">'+
	'					<!-- <ul class="nav nav-tabs etiqueta">'+
	'						<li><a href="#id_sv" lang="ca" data-toggle="tab">Serveis Vector</a></li>'+
	'						<li><a href="#id_sw" lang="ca" data-toggle="tab">Serveis WMS</a></li>'+
	'					</ul>'+
	'					<div class="tab-content tab-content-margin5px">'+
	'						<div class="tab-pane fade" id="id_sv"></div>'+
	'						<div class="tab-pane fade" id="id_sw"></div>'+
	'					</div> -->'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<!-- <button type="button" class="btn btn-default" data-dismiss="modal">Tancar</button>'+
	'         <button type="button" class="btn btn-success">Canviar</button> -->'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal les teves dades -->'		
	);
}

function addHtmlModalErrorMsg(){
	jQuery('#mapa_modals').append(
			'	<!-- Modal error les teves dades -->'+
			'		<div class="modal fade" id="dialog_error_teves_dades">'+
			'		<div class="modal-dialog">'+
			'			<div class="modal-content panel-primary">'+
			'				<div id="id_sw" class="modal-body">'+								
			'				</div>'+
			'				<div class="modal-footer">'+
			'					<button type="button" class="btn btn-default" data-dismiss="modal">Tancar</button>'+
			'        <!-- <button type="button" class="btn btn-success">Canviar</button> -->'+
			'				</div>'+
			'			</div>'+
			'			<!-- /.modal-content -->'+
			'		</div>'+
			'		<!-- /.modal-dialog -->'+
			'	</div>'+
			'	<!-- /.modal -->'+
			'	<!-- fi Modal les teves dades -->'		
			);
}
