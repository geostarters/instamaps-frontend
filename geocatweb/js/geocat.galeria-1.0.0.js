$(function(){
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	var sourcePublic = $("#galeriaPublic-template").html();
	var templatePublic = Handlebars.compile(sourcePublic);

	var privatGaleria = url('?private');
	
	//per GA
	defineTipusUser();
//	var uid = $.cookie('uid');
//	var tipus_user = t_user_loginat;
//	if(!uid || isRandomUser(uid)){
//		tipus_user = t_user_random;
//	}
	
	
	
	if(typeof url('?uid') == "string"){
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
		privatGaleria = "1";
		checkUserLogin();
	}
	
	$("body").on("change-lang", function(event, lang){
		$('.btn-tooltip').tooltip().each(function(){
			$(this).attr('data-original-title', window.lang.convert($(this).attr('data-title')));
		});
		$('#galeriaSort>div>input').attr("placeholder", window.lang.convert("Cerca"));
		$('#galeriaSort>button').html(window.lang.convert("Ordena per nom"));		
		
	});
	
	if ((typeof privatGaleria == "string") && (typeof $.cookie('uid') !== "undefined")){
		var data = {uid: $.cookie('uid')};
		loadGaleria(data).then(function(results){
			

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
			$('#galeriaRow').append(html);
			
//			console.debug("galeria Row html:");
//			console.debug(html);
			
			//Search function
			var optionsSearch = {
					valueNames: [ 'nomAplicacioSort' ]
			};
			userList = new List('galeriaSort', optionsSearch);	
			
			
				escriuResultats(userList.visibleItems.length);
			
			$('input.search.form-control').on('keyup', function(event){
		
				escriuResultats(userList.visibleItems.length);
			});
			
			
			$('#galeriaSort>input').attr("placeholder", window.lang.convert("Cerca"));
			$('#galeriaSort>button').html(window.lang.convert("Ordena per nom"));
			


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
			
			$('.btn-tooltip').tooltip().each(function(){
				$(this).attr('data-original-title', window.lang.convert($(this).attr('data-title')));
			});
			
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
		loadPublicGaleria().then(function(results){
			
			results.results = jQuery.map( results.results, function( val, i ) {
				val.thumbnail = paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + val.businessId;
				if (val.options){
					val.options = $.parseJSON(val.options);	
				}
				if (isDefaultMapTitle(val.nomAplicacio)){
					val.rank = -1;
				}
				val.entitatUid = val.entitatUid.split("@")[0];
				return val;
			});
			
			results.results.sort(function(a,b) { 
                return parseFloat(a.rank) < parseFloat(b.rank) 
			});
			
			var html = templatePublic(results);
			$('#galeriaRow').append(html);
			
			//Search function
			var optionsSearch = {
					valueNames: [ 'nomAplicacioSort' ],
					page: 500
			};
			
			var	userList = new List('galeriaSort', optionsSearch);				
			
			escriuResultats(userList.visibleItems.length);
			
			$('input.search.form-control').on('keyup', function(event){
		
				escriuResultats(userList.visibleItems.length);
			});
			
			
			$('#galeriaSort>input').attr("placeholder", window.lang.convert("Cerca"));
			$('#galeriaSort>button').html(window.lang.convert("Ordena per nom"));			
			
			$('.btn.btn-success').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var urlMap = paramUrl.visorPage+"?businessid="+$this.data("businessid");
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'veure mapa']);
				//_kmq.push(['record', 'veure mapa', {'from':'galeria publica', 'tipus user':tipus_user}]);
				window.open(urlMap);
			});
			
			$('.btn.btn-primary').on('click', function(event){
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
			
			$('.btn-tooltip').tooltip().each(function(){
				$(this).attr('data-original-title', window.lang.convert($(this).attr('data-title')));
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
			$('#geoRss').on('click', function(event){
				_gaq.push(['_trackEvent', 'galeria publica', tipus_user+'rss']);
			});
			
			window.lang.run();
			$('#galeriaSort>div>input').attr("placeholder", window.lang.convert("Cerca"));
			
			if(typeof url('?q') == "string"){
				$('#galeriaSort>div>input').val(url('?q'));
				userList.search(url('?q'));
				escriuResultats(userList.visibleItems.length);
			}
		});
	}
	
	
	function escriuResultats(total){
	 $('.sp_rs_maps').html(total);
	}
	
});
