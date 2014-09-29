var old_email;
jQuery(document).ready(function() {
	getNumEntitatsActives().then(function(results){
		var count = parseInt(results.results);
		count = getCountText(count);
		jQuery('.stats_usuaris').html(count);
	});
	
	getNumMapes().then(function(results){
		var count = parseInt(results.results);
		count = getCountText(count);
		jQuery('.stats_mapes').html(count);
	});
	
	getNumCapes().then(function(results){
		var count = parseInt(results.results);
		count = getCountText(count);
		jQuery('.stats_capes').html(count);
	});
	
});

function getCountText(count){
	if (count > 1000000){
		count = parseFloat((count/1000000).toFixed(2)) + " M";
	}else if (count > 1000){
		count = parseFloat((count/1000).toFixed(2)) + " K";
	}
	return count;
}

