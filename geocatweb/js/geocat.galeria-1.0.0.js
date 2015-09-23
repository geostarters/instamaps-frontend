/*require Listjs http://www.listjs.com/docs/list-api*/

var pageGaleria = 0;
var	userList;
var loading = false;
var searchString;
var businessIds = [];
var mapsGalery = [];

$(function(){
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	var sourcePublic = $("#galeriaPublic-template").html();
	var templatePublic = Handlebars.compile(sourcePublic);

	var sourceAdmin = $("#galeriaAdmin-template").html();
	var templateAdmin = Handlebars.compile(sourceAdmin);
	
	var privatGaleria = url('?private');
	
	//per GA
	defineTipusUser();
		
	if(typeof url('?uid') == "string"){
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
		privatGaleria = "1";
		checkUserLogin();
	}
		
	$("body").on("change-lang", function(event, lang){
		$('#galeriaSort>div>input').attr("placeholder", window.lang.convert("Cerca"));
	});
	
	/*******PRIVAT GALERIA**********/
	if ((typeof privatGaleria == "string") && (typeof $.cookie('uid') !== "undefined")){
		$('#tabs_links').removeClass('hide');
		
		$('.total_maps').hide();
		
		var data = {uid: $.cookie('uid')};
		loadGaleria(data).then(function(results){
			$('#loadingGaleria').hide();
			
			results.results = jQuery.map( results.results, function( val, i ) {
				val.thumbnail = paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + val.businessId;
				if (val.options){
					val.options = $.parseJSON(val.options);	
				}
				val.uid=$.cookie('uid');
				val.convidats=val.convidats;				
				return val;
			});
			var html = template(results);
			$('#galeriaSort .list').append(html);	
			//Search function
			var optionsSearch = {
					valueNames: [ 'nomAplicacioSort','dataPublicacio', 'rankSort' ],
					page:1000
			};
			$('#sortbyuser').attr("style","display:none;");
			var userList = new List('galeriaSort', optionsSearch);	
			if ($('.new_map').is(':visible')){
				escriuResultats(userList.visibleItems.length-1);
			}else{
				escriuResultats(userList.visibleItems.length);
			}
						
			$('input.search.form-control').on('keyup', function(event){
				if ($('.new_map').is(':visible')){
					escriuResultats(userList.visibleItems.length-1);
				}else{
					escriuResultats(userList.visibleItems.length);
				}
			});
			
			
			$('#galeriaSort>input').attr("placeholder", window.lang.convert("Cerca"));
			//$('#galeriaSort>button').html(window.lang.convert("Ordena per nom"));
			

			$('.new_map').on('click', function(event){
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'fer mapa'/*, 'acquisition'*/]);
				//_kmq.push(['record', 'fer mapa', {'from':'galeria privada', 'tipus user':t_user_loginat}]);
				window.location.href = paramUrl.mapaPage;
			});
			
			$('.btn.btn-danger').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				$('#dialgo_delete').modal('show');
				$('#dialgo_delete .nom_mapa').text($this.data("nom"));
				$('#dialgo_delete .btn-danger').data("businessid", $this.data("businessid"));
				
			});
			
			$('#dialgo_delete .btn-danger').on('click', function(event){
				var $this = $(this);
				var data = {
					businessId: $this.data("businessid"),
					uid: $.cookie('uid')
				};
				deleteMap(data).then(function(results){
					if (results.status == "OK"){

						$('#'+$this.data("businessid")).remove();
						$('#dialgo_delete').modal('hide');
						_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'esborrar mapa'/*, 'acquisition'*/]);
						//_kmq.push(['record', 'esborrar mapa', {'from':'galeria privada', 'tipus user':t_user_loginat}]);
						updateResultats();
					}
				});
			});
						
			$('.btn.btn-warning').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				//_kmq.push(['record', 'editar mapa', {'from':'galeria privada', 'tipus user':t_user_loginat}]);
				var urlMap = paramUrl.mapaPage+"?businessid="+$this.data("businessid");
				if ($this.data("colaboracio")) {
					urlMap = urlMap +"&mapacolaboratiu=si";
					_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'editar mapa','col.laboratiu']);
				}	
				else _gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'editar mapa','no col.laboratiu']);
				
				//alert(urlMap);
				window.location.href = urlMap;
			});
			
			$('.btn.btn-success').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				//$('#dialgo_colaborate').modal('show');
				$('#dialgo_colaborate').data('businessid', $this.data("businessid")).modal('show');
				
				if ($this.data("title")!=undefined) {
					var idConvidats="#convidats_"+$this.data("businessid");
					var data1 = {
						businessId: $this.data("businessid"),
						uid: $.cookie('uid')
					}
					getConvidatsByBusinessId(data1).then(function(results){
						for (var j=1;j<6;j++){ //Netejem els camps dels convidats
							$('#convidats'+j).val("");
							$('#convidats'+j).prop('disabled',false);
							$('#convidats'+j).attr("style","margin-bottom:3px;width:88%;");
							$('#convidats'+j+"_remove").attr("style","display:none;");
							$('#convidats'+j+"_remove").on('click', function(event){
								event.preventDefault();
								event.stopPropagation();
								var id=event.target.attributes.id.value;
								var idC=id.toString().substring(0,10);
								console.debug($('#'+idC).val());
								console.debug($('#dialgo_colaborate').data('businessid'));
								var data = {
										convidatEsborrar: $('#'+idC).val(),
										businessId: $('#dialgo_colaborate').data('businessid'),
										uid: $.cookie('uid')
								}
								console.debug(data);
								deleteConvidatByBusinessId(data).then(function(results2){
									if (results2.status=="OK"){
										alert( window.lang.convert("Col·laborador ")+$('#'+idC).val()+window.lang.convert(" esborrat"));
										$('#'+idC).val("");
										$('#'+idC).prop('disabled',false);
										$('#'+idC).attr("style","margin-bottom:3px;width:88%;");
										$('#'+idC+"_remove").attr("style","display:none;");										
									}				
								});
							});
						}
						if (results.results!=null) {
							var convidatsJson=$.parseJSON(results.results);
							var jsonObj = [];
							jQuery.map( convidatsJson, function( val, i ) {
								console.debug(val.email+","+val.validat);					
								var conv='#convidats'+(i+1);
								var convR='#convidats'+(i+1)+"_remove";	
								if (val.validat=="S") {
									$(conv).val(val.email);
									$(conv).prop('disabled', true);
									var item = {};
							        item ["email"] = val.email;
							        jsonObj.push(item);
							        $(convR).attr("style","display:none;");
								}
								else {
									$(conv).val(val.email);
									$(conv).prop('disabled', true);
									$(conv).attr("style","background-color:#d9534f;opacity:0.85;margin-bottom:3px;width:88%;");
									var item = {};
							        item ["email"] = val.email;
							        jsonObj.push(item);
							        $(convR).attr("style","display:block;");
								}					
							});		
						}
					});
					
					$('#businessIdConvidar').val($this.data("businessid"));
				}
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'preconvidar']);
				//_kmq.push(['record', 'veure mapa', {'from':'galeria privada', 'tipus user':t_user_loginat}]);
				//window.location.href = urlMap;
			});
			
			$('.btn.btn-primary').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var urlMap = 'http://'+DOMINI+paramUrl.visorPage+'?businessid='+$this.data("businessid");
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				shortUrl(urlMap).then(function(results){
					$('#urlMap').val(results.data.url);
				});
				//$('#urlMap').val(urlMap);
				$('#urlVisor').attr("href", urlMap);
				$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
				$('#dialgo_url_iframe').modal('show');
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'enllaça mapa', 'referral', 1]);
				//_kmq.push(['record', 'enllaça mapa', {'from':'galeria privada','funnel':'referral', 'tipus user':t_user_loginat}]);
			});
			
			$('.caption.descAplicacio').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var appbusinessid = appbusinessid = $this.parent().data("businessid");
				var urlMap = paramUrl.visorPage+"?businessid="+appbusinessid;
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				_gaq.push(['_trackEvent', 'galeria privada', tipus_user+'veure mapa']);
				//_kmq.push(['record', 'veure mapa', {'from':'galeria publica', 'tipus user':tipus_user}]);
				window.open(urlMap);
			});
			
			/*$('.btn-tooltip').tooltip().each(function(){
				$(this).attr('data-original-title', window.lang.convert($(this).attr('data-title')));
			});*/
			
			//Change visibility
			$('.btn.btn-visibility').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				
				var visibilitatAntiga="P";
				var idPriv="#privacitat_"+$this.data("businessid");
				
				if ($(idPriv).attr("class") == "unlock" ) visibilitatAntiga="O";				
				
				var visibilitatNova="";
				var textVisibilitatNova="";
				if (visibilitatAntiga=="P") {
					visibilitatNova="O";
					textVisibilitatNova="public";
				}
				else {
					visibilitatNova="P";
					textVisibilitatNova="privat";
				}
				
				var data1 = {
						businessId: $this.data("businessid"),
						uid: $.cookie('uid'),
						visibilitat: visibilitatNova
				};
				updateMapVisibility(data1).then(function(results){
					if (results.status=="OK") {
						console.debug(results);
						if (visibilitatAntiga=="P") {
							$(idPriv).attr("class", "unlock");
							$this.data("title", window.lang.convert("El mapa és visible a la galeria pública"));
							$this.attr('title', window.lang.convert("El mapa és visible a la galeria pública")).tooltip('fixTitle').tooltip('show');
						}
						else {
							$(idPriv).attr("class", "lock");
							$this.data("title",window.lang.convert("El mapa només és visible a la teva galeria privada"));
							$this.attr('title', window.lang.convert("El mapa només és visible a la teva galeria privada")).tooltip('fixTitle').tooltip('show');
							
						}
					}
					else alert(window.lang.convert("No ha sigut possible canviar la visibilitat del mapa"));
				});
				
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'visibilitat',textVisibilitatNova]);
				
			});			

			$('.thumbnail').hover(function(){
				var descAplicacio = $(this).find(".descAplicacio");
				descAplicacio.fadeIn(500);
				if (descAplicacio.find(".starwarsbody").text().length > 160){
					descAplicacio.find(".starwarsmain").addClass('starwars');
					descAplicacio.find(".starwarsbody").addClass('starwarscontent');
				}
				return false;	
			}, function(){
				$(this).find(".descAplicacio").fadeOut();
				return false;	
			});
			/*
			$('.flip').hover(function(){
				$(this).find(".card").toggleClass("flipped");
				return false;
			});
			*/
			$('#dialgo_colaborate #convidar').on('click', function(event){
				var businessId= $('#dialgo_colaborate').data('businessid');
				var urlMap = HOST_APP+paramUrl.visorPage+'?businessid='+businessId;
				//console.debug(htmlentities($('#nomAplicacioSort_'+businessId).val()));
				var contingut= window.lang.convert("Et convido a col&#183;laborar en el mapa ")+"<span style='font-weight:bold'>"+$('#nomAplicacioSort_'+businessId).val()+"</span>"+ window.lang.convert(" d'Instamaps (creat per ")+$('#userAplicacio_'+businessId).val()+window.lang.convert(" ). Clica a l'enllaç per accedir-hi. Hauràs de registrar-te si no ho has fet encara.")+"<br/>";
				contingut=htmlentities(contingut)+urlMap;
				var to = "";
				var idConv="#convidats_"+businessId;
				var convidats=$(idConv).val();
				var totalConv=0;
				for (var i=1;i<6;i++){
					if ($('#convidats'+i) && $('#convidats'+i).val()!="" ) {
						var convidat=$('#convidats'+i).val();
						if (convidats.indexOf(convidat)!=-1) {
							if ($('#convidats'+i).prop("disabled")!=true) alert("Aquest mail "+convidat+" ja el tens afegit com a col·laborador");
						}
						else {
							if ($('#convidats'+i).prop("disabled")!=true)
							{
								if (to!="")	to=to+","+$('#convidats'+i).val();
								else to=to+$('#convidats'+i).val();
							}

							totalConv++;
							var data = {
								uid: $.cookie('uid'),
								to:to,
								subject:window.lang.convert('Mapa col&#183;laboratiu a Instamaps. Invitaci&oacute;'),
								content: contingut,
								esColaboratiu: 'S',
								businessId: businessId
							};
							console.debug(data);
							sendMail(data).then(function(results){
								console.debug(results);					
								if (results.status=="OK") {
									console.debug(results);
									$('#dialgo_colaborate').modal('hide');
								}
								else alert(window.lang.convert("Hi ha hagut algun problema amb la tramesa dels correus electrònics"));
							});
						}
					}
				}
				
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'convidar',totalConv]);
				
			});
			window.lang.run();
		});

	}else{
		
		/*******PUBLIC GALERIA**********/
		var data = {};
		if(typeof $.cookie('uid') !== "undefined"){
			data = {uid: $.cookie('uid')};
		}
			
		/*
		$('input.search.form-control').on('keyup', function(event){
			escriuResultats(userList.visibleItems.length);
		});
		*/
		
		$('.cleansort').on('click', function(){
			userList.sort('rankSort', { order: "desc" });
		});
		
		$('#galeriaSort>input').attr("placeholder", window.lang.convert("Cerca"));
		//$('#galeriaSort>button').html(window.lang.convert("Ordena per nom"));			
		
		var delay = (function(){
			  var timer = 0;
			  return function(callback, ms){
			    clearTimeout (timer);
			    timer = setTimeout(callback, ms);
			  };
		})();
		
		$('input.search.form-control').on('keyup', function(event){
			var q = $(this).val();
			q = $.trim(q);
			if(q != "" && q.length >= 3){
				if (userList.size() < $('.sp_total_maps').text()){
					delay(function(){
						loading = true;
						$('#loadingGaleria').show();
						if (userList && userList.searched){
			    			searchString = userList.searchString;
			    			searchString = $.trim(searchString);
			    			//userList.search();
			    		}
						searchGaleriaMaps({q: q.toLowerCase()}).then(function(results){
							pintaGaleria(results);
							loading = false;
							if (searchString && searchString != ""){
								userList.search(searchString);
								searchString = null;
							}
						});
				    }, 400 );
				}	
			}else if (q == ""){
				escriuTotal();
			}
		});
		
		$('#geoRss').on('click', function(event){
			_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'rss']);
		});
		
		$('#galeriaSort > button.sort').on('click',function(event){
			if (userList && !userList.searched){
				var that = $(this);
				data.field = that.data('sort');
				data.ordre = 'asc';
				if(that.hasClass('asc')){
					data.ordre = 'desc';
				}
				loading = true;
				loadPublicGaleria(data).then(function(results){
					var sort = getOrderGaleria();
					$('#loadingGaleria').show();
					pintaGaleria(results);
					loading = false;
					reorderGaleria(sort);
				});
			}
		});
		
		window.lang.run();
		$('#galeriaSort>div>input').attr("placeholder", window.lang.convert("Cerca"));
		
		loadNumGaleria().then(function(results){
			if (results.status == "OK"){
				$('.sp_total_maps').html(results.results);
			}else{
				$('.total_maps').hide();
			}
		});
		
		//cargar mapas
		if(typeof url('?q') == "string"){
			var searchString = url('?q');
			searchString = $.trim(searchString);
			if(searchString != "" && searchString.length >= 3){
				$('#galeriaSort>div>input').val(searchString);
				searchGaleriaMaps({q: searchString.toLowerCase(), page: pageGaleria}).then(function(results){
					pintaGaleria(results);
					loading = false;
					if (searchString && searchString != ""){
						userList.search(searchString);
					}
					loadPublicGaleria(data).then(function(results){
						pintaGaleria(results);
						if (searchString && searchString != ""){
							userList.search(searchString);
							searchString = null;
						}
					});
				});
			}else{
				loadPublicGaleria(data).then(function(results){
					pintaGaleria(results);
				});
			}
		}else{
			loadPublicGaleria(data).then(function(results){
				pintaGaleria(results);
			});
		}
						
		$(window).scroll(function(){
		    if ($(window).scrollTop() == $(document).height() - $(window).height()){
		    	if (!loading){
		    		if(userList && !userList.searched){
			    		if (userList.size() < $('.sp_total_maps').text()){
			    			loading = true;
			    			pageGaleria++;
			    			var sort = getOrderGaleria();
			    			$('#loadingGaleria').show();
		    				var data = {};
							if(typeof $.cookie('uid') !== "undefined"){
								data = {uid: $.cookie('uid')};
							}
							data.page = pageGaleria;
							data.ordre = sort.order;
							data.field = sort.sortField;
							loadPublicGaleria(data).then(function(results){
								pintaGaleria(results);
								loading = false;
								reorderGaleria(sort);
							});
		    			
			    		}
		    		}
		    	}
			}
		});
	}
	
	function reorderGaleria(sort){
		if (sort.order == "asc"){
			userList.sort(sort.sortField, { order: "asc" });
		}else if(sort.order == "desc"){
			userList.sort(sort.sortField, { order: "desc" });
		}
	}
	
	function getOrderGaleria(){
		var asc = $('#galeriaSort > button.sort.asc');
		var desc = $('#galeriaSort > button.sort.desc');
		var sort = {};
		if (asc.length > 0){
			var btn = asc[0];
			var sortField = $(btn).data('sort');
			sort.sortField = sortField;
			sort.order = "asc";
		}else if(desc.length > 0){
			var btn = desc[0];
			var sortField = $(btn).data('sort');
			sort.sortField = sortField;
			sort.order = "desc";
		}
		return sort;
	}
	
	function pintaGaleria(results){
		$('#loadingGaleria').hide();
		results.results = jQuery.map( results.results, function( val, i ) {
			if($.inArray(val.businessId, businessIds) == -1){
				businessIds.push(val.businessId);
				val.thumbnail = paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + val.businessId;
				if (val.options){
					val.options = $.parseJSON(val.options);	
				}
				if (isDefaultMapTitle(val.nomAplicacio)){
					val.rank = -1;
				}
				val.entitatUid = val.entitatUid.split("@")[0];
				val.data =  new Date(val.dataPublicacio).toLocaleDateString();
				mapsGalery.push(val);
				return val;
			}else{
				return null;
			}
		});
		
		results.results = mapsGalery;
		
		results.results.sort(function(a,b) { 
            return parseFloat(a.rank) < parseFloat(b.rank) 
		});
		
		if (results.admin == "OK"){
			var html = templateAdmin(results);
		}else{
			var html = templatePublic(results);
		}
					
		$('#galeriaSort .list').html(html);						
		
		$('.btn.btn-success').on('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			var $this = $(this);
			var appbusinessid = $this.data("businessid");
			if (!appbusinessid){
				appbusinessid = $this.parent().data("businessid");
			}
			var urlMap = paramUrl.visorPage+"?businessid="+appbusinessid;
			if ($.trim($this.data("idusr")) != ""){
				urlMap += "&id="+$this.data("idusr");
				
			}
			_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'veure mapa']);
			//_kmq.push(['record', 'veure mapa', {'from':'galeria publica', 'tipus user':tipus_user}]);
			window.open(urlMap);
		});
		
		$('.btn-acctions .btn.btn-primary').on('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			var $this = $(this);
			var urlMap = 'http://'+DOMINI+paramUrl.visorPage+'?businessid='+$this.data("businessid");
			if ($.trim($this.data("idusr")) != ""){
				urlMap += "&id="+$this.data("idusr");
			}
			//$('#urlMap').val(urlMap);
			shortUrl(urlMap).then(function(results){
				$('#urlMap').val(results.data.url);
			});
			$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
			$('#dialgo_url_iframe').modal('show');
			_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'enllaça mapa', 'referral', 1]);
			//_kmq.push(['record', 'enllaça mapa', {'from':'galeria publica', 'tipus user':tipus_user}]);
		});
		
		$('.btn.btn-warning').on('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			var $this = $(this);
			$('#dialgo_rank').modal('show');
			$('#dialgo_rank .rank_mapa').val($this.data("rank"));
			$('#dialgo_rank .btn-primary').data("businessid", $this.data("businessid"));
		});
		
		$('#dialgo_rank .btn-primary').on('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			var $this = $(this);
			var businessid =  $this.data("businessid");
			var params = {
				businessId: businessid,
				rank: $('#dialgo_rank .rank_mapa').val(),
				uid: $.cookie('uid')
			};
			updateRankAplicacio(params).then(function(results){
				if (results.status == "OK"){
					$('#'+businessid + ' .rank').text(results.results);
					$('#'+businessid + ' .rankSort').text(results.results);
					userList.sort('rankSort', { order: "desc" });
				}
				$('#dialgo_rank').modal('hide');
			});
		});
		
		$('.thumbnail').hover(function(){
			var descAplicacio = $(this).find(".descAplicacio");
			descAplicacio.fadeIn(500);
			if (descAplicacio.find(".starwarsbody").text().length > 160){
				descAplicacio.find(".starwarsmain").addClass('starwars');
				descAplicacio.find(".starwarsbody").addClass('starwarscontent');
			}

			return false;	
		}, function(){
			$(this).find(".descAplicacio").fadeOut();
			return false;	
		});
		
		$('.caption.descAplicacio').on('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			var $this = $(this);
			var appbusinessid = appbusinessid = $this.parent().data("businessid");
			var urlMap = paramUrl.visorPage+"?businessid="+appbusinessid;
			if ($.trim($this.data("idusr")) != ""){
				urlMap += "&id="+$this.data("idusr");
			}
			_gaq.push(['_trackEvent', 'galeria privada', tipus_user+'veure mapa']);
			window.open(urlMap);
		});
		
		if (userList){
			userList.reIndex();
		}else{
			//Search function
			var optionsSearch = {
				valueNames: [ 'nomAplicacioSort', 'byuser', 'dataPublicacio', 'rankSort' ],
				page: 10000
			};
			
			userList = new List('galeriaSort', optionsSearch);
			
			userList.on('searchComplete',function(){
				escriuResultats(userList.visibleItems.length);
			});
		}
		
		if(userList && userList.searched){
			escriuResultats(userList.visibleItems.length);
		}else{
			escriuTotal();
		}
	}
	
	function escriuResultats(total){
		$('.sp_rs_maps').html(total);
		$('.sp_total_maps').hide();
		$('.sp_rs_maps').show();
	}
	
	function updateResultats(){
		var total=(parseInt($('.sp_rs_maps').html()) -1);
		$('.sp_rs_maps').html(total);
		$('.sp_total_maps').hide();
		$('.sp_rs_maps').show();
	}
	
	function escriuTotal(){
		$('.sp_total_maps').show();
		$('.sp_rs_maps').hide();
	}
	
	
});
