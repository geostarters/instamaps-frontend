/**
 *Funcionalitat Hill shading 
 */


function addControlHillShading(){
	
	//Nou control hillshading
	var ctr_hill = L.control({
		position : 'topleft'
	});
	
	ctr_hill.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'leaflet-bar div_hill_f');
		var btllista = L.DomUtil.create('div', 'div_hill bt_hill');
		this._div.appendChild(btllista);
		return this._div;
	};
	
	ctr_hill.addTo(map);
	jQuery('.bt_hill').prop( "disabled", true );	
	
	jQuery('.bt_hill').on('mousemove',function(e){		
		if(jQuery(this).prop('disabled')){
			jQuery(this).css('cursor','not-allowed');
		}else{
			jQuery(this).css('cursor','pointer');
		}	
	});	
	
	jQuery('.bt_hill').on('click',function(e){		
		if(!jQuery(this).prop('disabled')){			
			if(jQuery(this).hasClass('div_hill_verd')){
				jQuery(this).removeClass('div_hill_verd');	
				jQuery(this).addClass('div_hill');	
				map.setTransActiveMap(1,false);				
			}else{
				jQuery(this).removeClass('div_hill');	
				jQuery(this).addClass('div_hill_verd');	
				map.setTransActiveMap(0.6,true);				
			}		
		}			
	});
	
	$('.bt_hill').tooltip('destroy').tooltip({
		placement : 'right',
		container : 'body',
		title : window.lang.convert("Mostrar l'ombra del relleu")
	});	
	
}