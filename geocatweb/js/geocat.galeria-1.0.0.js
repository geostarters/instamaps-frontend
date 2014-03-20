$(function(){
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	var sourcePublic = $("#galeriaPublic-template").html();
	var templatePublic = Handlebars.compile(sourcePublic);
	
	var privatGaleria = url('?private');
	
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
	});
		
	if ((typeof privatGaleria == "string") && (typeof $.cookie('uid') !== "undefined")){
		var data = {uid: $.cookie('uid')};
		loadGaleria(data).then(function(results){
			var html = template(results);
			$('#galeriaRow').append(html);
						
			$('.new_map').on('click', function(event){
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
					}
				});
			});
						
			$('.btn.btn-warning').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				window.location.href = paramUrl.mapaPage+"?businessid="+$this.data("businessid");
			});
			
			$('.btn.btn-success').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				window.location.href = paramUrl.visorPage+"?businessid="+$this.data("businessid");
			});
			
			$('.btn.btn-primary').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var urlMap = 'http://'+DOMINI+paramUrl.visorPage+'?businessid='+$this.data("businessid");
				$('#urlMap').val(urlMap);
				$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
				$('#dialgo_url_iframe').modal('show');
				_gaq.push(['_trackEvent', 'galeria', 'compartir', 'referral', t_user_loginat]);
			});
			
			$('.btn-tooltip').tooltip().each(function(){
				$(this).attr('data-original-title', window.lang.convert($(this).attr('data-title')));
			});
			
			window.lang.run();
			
		});
	}else{
		loadPublicGaleria().then(function(results){
			console.debug(results);
			var html = templatePublic(results);
			$('#galeriaRow').append(html);
			
			$('.btn.btn-success').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				window.open(paramUrl.visorPage+"?businessid="+$this.data("businessid"));
			});
			
			$('.btn.btn-primary').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var urlMap = 'http://'+DOMINI+paramUrl.visorPage+'?businessid='+$this.data("businessid");
				$('#urlMap').val(urlMap);
				$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
				$('#dialgo_url_iframe').modal('show');
				_gaq.push(['_trackEvent', 'galeria', 'compartir', 'referral', t_user_random]);
			});
			
			$('.btn-tooltip').tooltip().each(function(){
				$(this).attr('data-original-title', window.lang.convert($(this).attr('data-title')));
			});
			
			window.lang.run();
		});
	}	
});
