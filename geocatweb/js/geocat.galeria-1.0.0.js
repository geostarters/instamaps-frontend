$(function(){
	var source = $("#galeria-template").html();
	var template = Handlebars.compile(source);
	
	console.debug("hola");
	loadGaleria().then(function(results){
		console.debug(results);
		var html = template(results);
		$('#galeriaRow').append(html);
		
		$('.thumbnail').on('click', function(event){
			event.preventDefault();
			var $this = $(this);
			console.debug($this.data("businessid"));
		});
		
		$('.btn.btn-danger').on('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			var $this = $(this);
			console.info($this.data("businessid"));
			var data = {
				businessId: $this.data("businessid"),
				uid: 'wszczerban'
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
			console.warn($this.data("businessid"));
		});
		
	});
	
});

function loadGaleria(){
	//console.debug("cargaEntitat");
	jQuery('#wait').show();
	return jQuery.ajax({
		type: "get",
  		url: paramUrl.getAllPublicsMaps,
  		dataType: 'jsonp'
	}).promise();
}

function deleteMap(data){
	return jQuery.ajax({
		url: paramUrl.deleteMap,
		data: data,
		dataType: 'jsonp'
	}).promise();
}