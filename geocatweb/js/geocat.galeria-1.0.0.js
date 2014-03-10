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
		
	if ((typeof privatGaleria == "string") && (typeof $.cookie('uid') !== "undefined")){
		var data = {uid: $.cookie('uid')};
		loadGaleria(data).then(function(results){
			console.debug(results);
			var html = template(results);
			$('#galeriaRow').append(html);
			
			$('.thumbnail').on('click', function(event){
				event.preventDefault();
				var $this = $(this);
				window.location.href = "/geocatweb/visor.html?businessid="+$this.data("businessid");
			});
			
			$('.btn.btn-danger').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				console.info($this.data("businessid"));
				var data = {
					businessId: $this.data("businessid"),
					uid: $.cookie('uid')
				};
				deleteMap(data).then(function(results){
					if (results.status == "OK"){
						$('#'+$this.data("businessid")).remove();
					}
				});
			});
			
			$('.btn.btn-primary').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				window.location.href = "/geocatweb/mapa.html?businessid="+$this.data("businessid");
			});
			
			$('.btn.btn-success').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				var urlMap = 'http://instamapes.igcg.cat/geocatweb/mapa.html?businessid='+$this.data("businessid");
				$('#urlMap').val(urlMap);
				$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
				$('#dialgo_url_iframe').modal('show');
			});
			
			window.lang.run();
			
		});
	}else{
		loadPublicGaleria().then(function(results){
			console.debug(results);
			var html = templatePublic(results);
			$('#galeriaRow').append(html);
			
			$('.thumbnail').on('click', function(event){
				event.preventDefault();
				var $this = $(this);
				window.location.href = "/geocatweb/visor.html?businessid="+$this.data("businessid");
			});
			
			$('.btn.btn-success').on('click', function(event){
				event.preventDefault();
				event.stopPropagation();
				var $this = $(this);
				window.location.href = "/geocatweb/visor.html?businessid="+$this.data("businessid");
			});
			
			window.lang.run();
		});
	}	
});
