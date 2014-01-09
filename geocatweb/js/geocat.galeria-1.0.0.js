$(function(){
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	var sourcePublic = $("#galeriaPublic-template").html();
	var templatePublic = Handlebars.compile(sourcePublic);
	
	if ((typeof url('?private') == "string") && (typeof $.cookie('uid') !== "undefined")){
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