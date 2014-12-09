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
				console.debug(val);				
				val.thumbnail = paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + val.businessId;
				if (val.options){
					val.options = $.parseJSON(val.options);	
				}
				val.uid=$.cookie('uid');
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
			var userList = new List('galeriaSort', optionsSearch);			
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
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'editar mapa']);
				//_kmq.push(['record', 'editar mapa', {'from':'galeria privada', 'tipus user':t_user_loginat}]);
				var urlMap = paramUrl.mapaPage+"?businessid="+$this.data("businessid");
				if ($this.data("colaboracio")) {
					urlMap = urlMap +"&mapacolaboratiu=si";
				}
				window.location.href = urlMap;
				
			});
			
			$('.btn.btn-success').on('click', function(event){
				//afegir col·laboradors
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				
				//$('#dialgo_colaborate').modal('show');
				$('#dialgo_colaborate').data('businessid', $this.data("businessid")).modal('show');
				var data1 = {
					aplicacioId: $this.data("id")
				}
				getEntitatsColaboradorsByAplicacio(data1).then(function(results){
					results.results = jQuery.map( results.results, function( val, i ) {
						var conv='#convidats'+(i+1);
						$(conv).val(val.email);		
						$(conv).prop('disabled', true);
					}
				)});
				$('#businessIdConvidar').val($this.data("businessid"));
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'colaboracio']);
				//_kmq.push(['record', 'veure mapa', {'from':'galeria privada', 'tipus user':t_user_loginat}]);
				//window.location.href = urlMap;
			});
			
			$('.btn.btn-primary').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var urlMap = 'http://localhost'+paramUrl.visorPage+'?businessid='+$this.data("businessid");
				if ($.trim($this.data("idusr")) != ""){
					urlMap += "&id="+$this.data("idusr");
				}
				$('#urlMap').val(urlMap);
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
			$('#canviar_visibilitat').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				
				var visibilitatAntiga="P";
				var idPriv="#privacitat_"+$this.data("businessid");
				console.debug(idPriv);
				if ($(idPriv).attr("class") == "fa fa-unlock" ) visibilitatAntiga="O";				
				
				var visibilitatNova="";
				
				if (visibilitatAntiga=="P") visibilitatNova="O";
				else visibilitatNova="P";
				
					
				var data1 = {
						businessId: $this.data("businessid"),
						uid: $.cookie('uid'),
						visibilitat: visibilitatNova
				};
				updateMapVisibility(data1).then(function(results){
					if (results.status=="OK") {
						console.debug(results);
						if (visibilitatAntiga=="P") {
							$(idPriv).attr("class", "fa fa-unlock");
							$this.data("title", "El mapa és visible a la galeria pública");
							console.debug("1:"+$this.data("title"));
						}
						else {
							$(idPriv).attr("class", "fa fa-lock");
							$this.data("title","El mapa només és visible a la teva galeria privada");
							console.debug("2:"+$this.data("title"));
						}
					}
					else alert("No ha sigut possible canviar la visibilitat del mapa");
				});
				
				
				_gaq.push(['_trackEvent', 'galeria privada', t_user_loginat+'canviar visibilitat', 'referral', 1]);
				//_kmq.push(['record', 'enllaça mapa', {'from':'galeria privada','funnel':'referral', 'tipus user':t_user_loginat}]);
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
				var urlMap = 'http://localhost'+paramUrl.visorPage+'?businessid='+businessId;
				//console.debug(htmlentities($('#nomAplicacioSort_'+businessId).val()));
				var contingut= "Et convido a col·laborar en el mapa <span style='font-weight:bold'>"+$('#nomAplicacioSort_'+businessId).val()+"</span> d'Instamaps. Clica a l'enllaç per accedir-hi. Hauràs de registrar-te si no ho has fet encara.<br/>";
				contingut=htmlentities(contingut)+urlMap;
				var to = "";
				if ($('#convidats1')) to=to+$('#convidats1').val();
				if ($('#convidats2') && $('#convidats2').val()!="") {
					if (to!="")	to=to+","+$('#convidats2').val();
					else to=to+$('#convidats2').val();
				}
				if ($('#convidats3') && $('#convidats3').val()!="") {
					if (to!="")	to=to+","+$('#convidats3').val();
					else to=to+$('#convidats3').val();
				}
				if ($('#convidats4') && $('#convidats4').val()!="") {
					if (to!="")	to=to+","+$('#convidats4').val();
					else to=to+$('#convidats4').val();
				}
				if ($('#convidats5') && $('#convidats5').val()!="") {
					if (to!="")	to=to+","+$('#convidats5').val();
					else to=to+$('#convidats5').val();
				}
				var data = {
					uid: $.cookie('uid'),
					to:to,
					from:'ammont82@gmail.com',
					subject:'Mapa col&#183;laboratiu a Instamaps. Invitaci&oacute;',
					content: contingut,
					esColaboratiu: 'S'
				};
				console.debug(data);
				sendMail(data).then(function(results){
					console.debug(results);					
					if (results.status=="OK") {
						console.debug(results);
						$('#dialgo_colaborate').modal('hide');
					}
					else alert("No ha sigut possible enviar el e-mail");
				});
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
					valueNames: [ 'nomAplicacioSort' ]
			};
			var userList = new List('galeriaSort', optionsSearch);				
			
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
				$('#urlMap').val(urlMap);				
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
			
			window.lang.run();
			$('#galeriaSort>div>input').attr("placeholder", window.lang.convert("Cerca"));
		});
	}
	
});
