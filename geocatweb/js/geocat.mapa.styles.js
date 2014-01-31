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
						text : 'Arrossega els vèrtex o el punt per editar l\'objecte.',
						subtext : 'Fes clic sobre el mapa per finalitzar.'
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



/**
 * bootstrap-colorpalette.js
 * (c) 2013~ Jiung Kang
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

(function($) {
  "use strict";
  var aaColor = [
    ['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF'],
    ['#FF0000', '#FF9C00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9C00FF', '#FF00FF'],
    ['#F7C6CE', '#FFE7CE', '#FFEFC6', '#D6EFD6', '#CEDEE7', '#CEE7F7', '#D6D6E7', '#E7D6DE'],
    ['#E79C9C', '#FFC69C', '#FFE79C', '#B5D6A5', '#A5C6CE', '#9CC6EF', '#B5A5D6', '#D6A5BD'],
    ['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
    ['#CE0000', '#E79439', '#FFC500', '#6BA54A', '#4A7B8C', '#3984C6', '#634AA5', '#A54A7B'],
    ['#9C0000', '#B56308', '#BD9400', '#397B21', '#104A5A', '#085294', '#311873', '#731842'],
    ['#630000', '#7B3900', '#846300', '#295218', '#083139', '#003163', '#21104A', '#4A1031']
  ];
  
  var createPaletteElement = function(element, _aaColor) {
    element.addClass('bootstrap-colorpalette');
    var aHTML = [];
    $.each(_aaColor, function(i, aColor){
      aHTML.push('<div>');
      $.each(aColor, function(i, sColor) {
        var sButton = ['<button type="button" class="btn-color" style="background-color:', sColor,
          '" data-value="', sColor,
          '" title="', sColor,
          '"></button>'].join('');
        aHTML.push(sButton);
      });
      aHTML.push('</div>');
    });
    element.html(aHTML.join(''));
  };

  var attachEvent = function(palette) {
    palette.element.on('click', function(e) {
      var welTarget = $(e.target),
          welBtn = welTarget.closest('.btn-color');

      if (!welBtn[0]) { return; }

      var value = welBtn.attr('data-value');
      palette.value = value;
      palette.element.trigger({
        type: 'selectColor',
        color: value,
        element: palette.element
      });
    });
  };

  var Palette = function(element, options) {
    this.element = element;
    createPaletteElement(element, options && options.colors || aaColor);
    attachEvent(this);
  };

  $.fn.extend({
    colorPalette : function(options) {
      this.each(function () {
        var $this = $(this),
            data = $this.data('colorpalette');
        if (!data) {
          $this.data('colorpalette', new Palette($this, options));
        }
      });
      return this;
    }
  });
})(jQuery);

