var map;
var mapConfig = {};

jQuery(document).ready(function() {
	if (!Modernizr.canvas ){
		jQuery("#mapaFond").show();
		jQuery("#dialgo_old_browser").modal('show');
		jQuery('#dialgo_old_browser').on('hide.bs.modal', function (e) {
			window.location = paramUrl.mainPage;
		});
	}else{
		jQuery.cookieCuttr({
			cookieAnalytics: false,
			cookieAcceptButtonText: window.lang.convert("Acceptar"),
			cookieMessage: window.lang.convert("Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal")
		});
		loadApp();
	}
}); // Final document ready

function loadApp(){
	if(typeof url('?businessid') == "string"){
		map = new L.IM_Map('map', {
			typeMap : 'topoMap',
			maxZoom : 19,
			//drawControl: true
		}).setView([ 41.431, 1.8580 ], 8);
		
		var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
		var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
		
		L.control.scale({'metric':true,'imperial':false}).addTo(map);
		
		//iniciamos los controles
		initControls();

		getMapByBusinessId(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
				return false;
			}
			mapConfig = results.results;
			mapConfig.options = $.parseJSON( mapConfig.options );
			mapConfig.newMap = false;
			
			loadMapConfig(mapConfig).then(function(){
				//avisDesarMapa();
			});
		},function(results){
			window.location.href = paramUrl.galeriaPage;
		});
	}else{
		if (!$.cookie('uid')){
			jQuery("#mapaFond").show();
			jQuery("#sidebar").hide();
			
			jQuery('#dialgo_leave').modal('show');
			
			jQuery('#dialgo_leave .btn-success').on('click',function(){
				window.location = paramUrl.registrePage;
			});
			
			jQuery('#dialgo_leave').on('hide.bs.modal', function (e) {
				createRandomUser().then(function(results){
					if (results.status==='OK'){
						var user_login = results.results.uid;
						var pass_login = "user1234";
						doLogin(user_login, pass_login).then(function(results){
							console.debug(results);
							if(results.status==='OK'){
								jQuery.cookie('uid', user_login, {path:'/'});
								createNewMap();
							}				
						});
					}
				});
				
				jQuery(window).on('beforeunload',function(event){
					deleteRandomUser({uid: $.cookie('uid')});
				});
			});
		}else{	
			mapConfig.newMap = true;
			createNewMap();
			//avisDesarMapa();
		}
	}
	
	if ($.cookie('uid') && $.cookie('uid').indexOf("random_") != -1 && $.cookie('uid').indexOf("random_") == 0){
		console.debug("registro el unload");
		jQuery(window).on('beforeunload',function(event){
			deleteRandomUser({uid: $.cookie('uid')});
		});
	}
		
	//carrega las capas del usuario si esta loginat
	if ($.cookie('uid')){
		var data = {uid: $.cookie('uid')};
		carregaDadesUsuari(data);
	}
		
	jQuery('.bt_publicar').on('click',function(){
		$('#dialgo_publicar #nomAplicacio').removeClass("invalid");
		$( ".text_error" ).remove();
		$('#dialgo_publicar').modal('show');
		var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val();
		$('#urlMap').val(urlMap);
		$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'" ></iframe>');
	});
	
	jQuery('#dialgo_publicar .btn-primary').on('click',function(){
		publicarMapa();
	});
	
	jQuery('#dialgo_leave .btn-primary').on('click',function(){
		leaveMapa();
	});
	
	//botons tematic
	jQuery('#st_Color').on('click',function(){
		showTematicLayersModal(tem_simple,jQuery(this).attr('class'));
	});
	
	jQuery('#st_Tema').on('click',function(){
		showTematicLayersModal(tem_clasic);
	});

	jQuery('#st_Size').on('click',function(){
		showTematicLayersModal(tem_size);
	});
	
	jQuery('#st_Heat').on('click',function(e) {
		showTematicLayersModal(tem_heatmap);
		
	});	

	jQuery('#st_Clust').on('click',function(e) {		
		showTematicLayersModal(tem_cluster);
		
	});	
	
	$('#nomAplicacio').editable({
		type: 'text',
		mode: 'inline',
		success: function(response, newValue) {
			var data = {
			 	businessId: url('?businessid'), 
			 	nom: newValue, 
			 	uid: $.cookie('uid')
			}


			updateMapName(data).then(function(results){
				if(results.status!='OK') $('#nomAplicacio').html(results.results.nom);
			},function(results){
				$('#nomAplicacio').html(mapConfig.nomAplicacio);				
			});	
		}

	});
	//$.fn.editable.defaults.mode = 'inline';
	$('.leaflet-remove').click(function() {
		alert( "Handler for .click() called." );
	});	
	
	jQuery('#socialShare').share({
	        networks: ['email','facebook',/*'googleplus',*/'twitter','linkedin','pinterest'],
	        theme: 'square',
//	        title: 'InstaMapes',
//	        urlToShare: 'http://www.google.com'
//	        urlToShare: 'http://localhost/geocatweb/mapa.html?businessId='+url('?businessid')
	 });	
	  
	jQuery('#socialShare').on('click', function(evt){
			evt.preventDefault();
			console.debug('on click social');
//			var $thisIndex = jQuery(this).index();
//			var socialId = "";
//			switch($thisIndex){
//				case 0:
//					socialId = "email";
//					break;
//				case 1:
//					socialId = "facebook";
//					break;
//				case 2:
//					socialId = "googleplus";
//					break;
//				case 3:
//					socialId = "twitter";
//					break;
//				case 4:
//				socialId = "linkedin";
//				break;
//				case 5:
//					socialId = "pinterest";
//					break;
//			}
			
			
//			var url = 'http://localhost/geocatweb/mapa.html'+$('#permalink').attr('href');
//			
//			shortUrl(url).then(function(results){
//				$('#socialShare').share('refresh',{
//														url: results.data.url, 
//														text: $(document).attr('title'), 
//														pageDesc: window.lang.convert("InstaMapes")
//														}
//									).then(function(){
//				
//										var $this = $('.pop').get( $thisIndex );
//										window.open(jQuery($this).attr('href'),'t','toolbar=0,resizable=1,status=0,width=640,height=528');
//				});
//				
//				return false;
//				
//			}); 		
//			console.debug('Entra a on click!');
	});	
		
	//JESS
		//$.fn.editable.defaults.mode = 'inline';
		
		jQuery('#select-download-format').change(function() {	
			var ext = jQuery(this).val();
			if ((ext=="KML#.kml")||(ext=="GPX#.gpx")){
			jQuery("#select-download-epsg").val("EPSG:4326").attr('disabled',true);
			}else{
				jQuery("#select-download-epsg").attr('disabled',false);	
			}
		});		
		
		$('#bt_download_accept').on('click', function(evt){
			var formatOUT = $('#select-download-format').val();
			var epsgOUT = $('#select-download-epsg').val();
			var filename = $('#input-download-name').val();
			var layer_GeoJSON = download_layer.layer.toGeoJSON();
			for(var i=0;i<layer_GeoJSON.features.length;i++){
				layer_GeoJSON.features[i].properties.tipus = "downloaded";
			}

			var data = {
					cmb_formatOUT: formatOUT,
					cmb_epsgOUT: epsgOUT,
					layer_name: filename,
					fileIN: JSON.stringify(layer_GeoJSON)
			};
			
			getDownloadLayer(data).then(function(results){
				results = results.trim();
				if (results == "ERROR"){
					//alert("Error 1");
					$('#modal-body-download-error').show();
					$('#modal-body-download').hide();
					$('#modal_download_layer .modal-footer').hide();
					$('#modal_download_layer').modal('show');
				}else{
					window.location.href = GEOCAT02+results;
				}
			},function(results){
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			});
			
		});
}