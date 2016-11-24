/**
 * require jquery, chroma.js
 */
(function ( $, window, document, undefined ) {
	"use strict";
	
	var ColorScales = {
		init: function() {
			return this;
		},
		
		createScale: function(palete, domain, reverse){
			if($.type(domain) === 'array'){
				
			}else{
				domain = [0,domain];
			}
			
			if($.type(palete) === 'array'){
				
			}else{
				if (palete.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)){
					palete ? [palete, palete] : ['#FFC500','#FFC500']
				}else{
					palete = palete ? palete : 'Paired';
				}
			}
			
			var scale;
			scale = chroma.scale(palete).domain(domain);
			var colors = scale.colors();
			if(chroma.brewer[palete]){
				colors = chroma.brewer[palete];
			}
			if(reverse){

				if('array' === $.type(palete))
				{
					//Chroma always returns two colors so if we have a color array as the palette, reverse that
					colors = palete.slice().reverse();
				}
				else
					colors = colors.slice().reverse();
				//colors = colors.reverse();
				scale = chroma.scale(colors).domain(domain);
			}
			return scale;
		}
		
	}
	
	//Registre module if AMD is present:
   	if(typeof define === "function" && define.amd){
   		define([], function(){return ColorScales.init();} );
   	}
   	
   	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
   	window.ColorScales = ColorScales.init();
	
})( jQuery, window, document );