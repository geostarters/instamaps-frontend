function retornaEstilaDO(dataset) {
	var estil = { radius : 6, fillColor : "#FC5D5F", color : "#ffffff", weight : 2, opacity : 1, fillOpacity : 0.8 };

	if(dataset=="radars"){ estil.fillColor = "##A00698";}
	else if(dataset=="turisme_rural"){ estil.fillColor = "#06A010";}
	else if(dataset=="hotels"){ estil.fillColor = "#ED760E";}
	else if(dataset=="incidencies"){ estil.fillColor = "#991032";}
	else if(dataset=="cameres"){ estil.fillColor = "#495CBC";}
	else if(dataset=="campings"){ estil.fillColor = "#62A50B";}
	else if(dataset=="meteo_comarca"){ estil.fillColor = "#200BA5";}
	else if(dataset=="meteo_costa"){ estil.fillColor = "#E1EA3A";}
	else{ estil.fillColor = "#CCDD00";}

return estil;
}

function tradueixMenusToolbar() {

	// L.drawLocal.draw.toolbar.buttons.polygon = 'Dibuixa un polígon';
	// L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Arrastra i marca una
	// area';

	L.drawLocal = {
		draw : {
			toolbar : {
				actions : {
					title : 'Cancel.lar dibuix',
					text : 'Cancel·lar'
				},
				buttons : {

					polyline : 'Dibuixa una línia',
					polygon : 'Dibuixa una àrea',
					rectangle : 'Dibuixa un rectangle',
					circle : 'Dibuixa un cercle',
					marker : 'Dibuixa un punt'
				}
			},
			handlers : {
				circle : {
					tooltip : {
						start : 'Clica i arrossega per dibuixar un cercle.'
					}
				},
				marker : {
					tooltip : {
						start : 'Fes clic al mapa per posar un punt.'
					}
				},
				polygon : {
					tooltip : {
						start : 'Clica per començar a dibuixar una àrea.',
						cont : 'Clica per continuar dibuixant una àrea.',
						end : 'Clica el primer punt per tancar aquesta àrea.'
					}
				},
				polyline : {
					error : '<strong>Error:</strong> àrees no es poden creuar!',
					tooltip : {
						start : 'Clica per començar a dibuixar una línia.',
						cont : 'Clica per continuar dibuixant una línia.',
						end : 'Clica el darrer punt per acabar la línia.'
					}
				},
				rectangle : {
					tooltip : {
						start : 'Clica i arrossega per dibuixar un rectangle.'
					}
				},
				simpleshape : {
					tooltip : {
						end : 'Amolla el mouse per acabar el dibuix.'
					}
				}
			}
		},
		edit : {
			toolbar : {
				actions : {
					save : {
						title : 'Desa els canvis.',
						text : 'Desa'
					},
					cancel : {
						title : 'Cancel·la l\'edició, descarta tots els canvis.',
						text : 'Cancel·la'
					}
				},
				buttons : {
					edit : 'Edita les capes.',
					editDisabled : 'Cap capa per editar.',
					remove : 'Esborra les capes.',
					removeDisabled : 'Cap capa per esborrar.'
				}
			},
			handlers : {
				edit : {
					tooltip : {
						text : 'Arrossega els controls o el punt per editar l\'objecte.',
						subtext : 'Fes clic a cancel·la per desfer els canvis.'
					}
				},
				remove : {
					tooltip : {
						text : 'Fes clic a una feature per eliminar-la'
					}
				}
			}
		}
	};

	return L.drawLocal;

}