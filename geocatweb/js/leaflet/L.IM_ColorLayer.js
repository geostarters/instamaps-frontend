/*
 * L.IM_ColorLayer is a regular tilelayer with grayscale makeover.
 */

L.IM_ColorLayer = L.TileLayer.extend({
	options: {
		enableCanvas: true,
		color:'gris'
	},

	initialize: function (url, options) {
		var canvasEl = document.createElement('canvas');
		if( !(canvasEl.getContext && canvasEl.getContext('2d')) ) {
			options.enableCanvas = false;
		}

		L.TileLayer.prototype.initialize.call(this, url, options);
	},

	_loadTile: function (tile, tilePoint) {
		tile.setAttribute('crossorigin', 'anonymous');
		L.TileLayer.prototype._loadTile.call(this, tile, tilePoint);
	},

	_tileOnLoad: function () {
		if (this._layer.options.enableCanvas && !this.canvasContext) {
			var canvas = document.createElement("canvas");
			canvas.width = canvas.height = this._layer.options.tileSize;
			this.canvasContext = canvas.getContext("2d");
		}
		var ctx = this.canvasContext;

		if (ctx) {
			this.onload  = null; // to prevent an infinite loop
			ctx.drawImage(this, 0, 0);
			var imgd = ctx.getImageData(0, 0, this._layer.options.tileSize, this._layer.options.tileSize);
			var d = imgd.data;
			
			if(this._layer.options.color=='gris'){
								for (var i = 0; i < d.length; i += 4) {
						  var r = d[i];
						  var g = d[i + 1];
						  var b = d[i + 2];
						  d[i] = d[i + 1] = d[i + 2] = (r+g+b)/3;
						}
			}
			
			
			
			if(this._layer.options.color=='grisClar'){
				for (var i = 0; i < d.length; i += 4) {
					var brightness = 0.44 * d[i] + 0.5 * d[i + 1] + 0.16 * d[i + 2];
			          // r
			          d[i] = brightness;
			          // green
			          d[i + 1] = brightness;
			          // blue
			          d[i + 2] = brightness;
			        }
		}

			
			
			
			
			
			if(this._layer.options.color=='sepia'){
							 for (var i = 0; i < d.length; i += 4) {
					  var r = d[i];
					  var g = d[i + 1];
					  var b = d[i + 2];
					  d[i]     = (r * 0.393)+(g * 0.769)+(b * 0.189); // red
					  d[i + 1] = (r * 0.349)+(g * 0.686)+(b * 0.168); // green
					  d[i + 2] = (r * 0.272)+(g * 0.534)+(b * 0.131); // blue
					}
			}
			
			
			
			if(this._layer.options.color=='orquidea'){
				
				
				/*
				for (var i = 0; i < d.length; i += 4) {
			        r = d[i];
			        g = d[i + 1];
			        b = d[i + 2];

			        d[i] = (r * 0.393 + g * 0.769 + b * 0.189 ) / 1.351;
			        d[i + 1] = (r * 0.349 + g * 0.686 + b * 0.168 ) / 1.203;
			        d[i + 2] = (r * 0.272 + g * 0.534 + b * 0.131 ) / 2.140;
			      }
				*/
				
				for (var i = 0; i < d.length; i += 4) {
				        avg = 0.25  * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
				        d[i] = avg + 250;
				        d[i + 1] = avg + 20;
				        d[i + 2] = avg + 200;
				      }

				
				
				/*
				
				 for (var i = 0; i < d.length; i += 4) {
					  var r = d[i];
					  var g = d[i + 1];
					  var b = d[i + 2];
					  
					  d[i]     = (r * 0.95)+(g * 2.169)+(b * 2.989); // red
					  d[i + 1] = (r * 0.26)+(g * 0.5)+(b * 0.168); // green
					  d[i + 2] = (r * 0.96)+(g * 2.734)+(b * 2); // blue
					  
					  
					
					}
					*/
			
}
			
						
			if(this._layer.options.color=='zombie'){
				
				
				for (var i = 0; i < d.length; i += 4) {
			        avg = 0.2  * d[i] + 0.49 * d[i + 1] + 0.21 * d[i + 2];
			        d[i] = avg + 255;
			        d[i + 1] = avg + 1;
			        d[i + 2] = avg + 20;
			      }

				
				
				/*
						 for (var i = 0; i < d.length; i += 4) {
				  var r = d[i];
				  var g = d[i + 1];
				  var b = d[i + 2];
				  d[i] = (r+g+b)/2.5;      				  
				  d[i + 1] = d[i + 2] = 50; // zero out green and blue channel
				}
				
				*/
				
			}
			if(this._layer.options.color=='nit'){
			 for (var i = 0; i < d.length; i += 4) {
			 // red
				d[i] = 255 - d[i];
          // green
				d[i + 1] = 255 - d[i + 1];
          // blue
				d[i + 2] = 255 - d[i + 2];
			}
			}
			if(this._layer.options.color=='brillant'){
			 for (var i = 0; i < d.length; i += 4) {
			  var brightness = 0.54 * d[i] + 0.7 * d[i + 1] + 0.16 * d[i + 2];
          // red
				d[i] = brightness;
          // green
				d[i + 1] = d[i + 1];
          // blue
				d[i + 2] =d[i + 2];
			}
			}
			if(this._layer.options.color=='negre_blau'){
			
						 for (var i = 0; i < d.length; i += 4) {
				  var r = d[i];
				 
				  var g = d[i + 1];
				  var b = d[i + 2];
				  
				  if((r>=0 && r <=100) && (g >=0 && g <=100) && (b >=0 && b <=100)){ //NEGRE
				// if((r>=0 && r <=220) && (g >=160 && g <=240) && (b >=200 && b <=255)){ //NEGRE
				 // console.info(r);
				   d[i] = 0
				  d[i + 1] = 0;
				  d[i + 2] = 255;
				  
				  }else{
				  
				  
				 // d[i] = r;    // apply average to red channel
				  //d[i + 1] = g;
				  //d[i + 2] = b;

				  }
				  
				  // zero out green and blue channel
				}
			}
			
			if(this._layer.options.color=='gris_verd'){
			
						 for (var i = 0; i < d.length; i += 4) {
				  var r = d[i];
				 
				  var g = d[i + 1];
				  var b = d[i + 2];
				  
				  if((r>=120 && r <=190) && (g >=120 && g <=190) && (b >=120 && b <=190)){ //NEGRE
				// if((r>=0 && r <=220) && (g >=160 && g <=240) && (b >=200 && b <=255)){ //NEGRE
				 // console.info(r);
				   d[i] = 9
				  d[i + 1] = 190;
				  d[i + 2] = 0;
				  
				  }
				  
				  
			}
			}
			
			
			if(this._layer.options.color=='gris_vermell_tot'){
			
						 for (var i = 0; i < d.length; i += 4) {
				  var r = d[i];
				 
				  var g = d[i + 1];
				  var b = d[i + 2];
				  
				  if((r>=120 && r <=190) && (g >=120 && g <=190) && (b >=120 && b <=190)){ //NEGRE
				// if((r>=0 && r <=220) && (g >=160 && g <=240) && (b >=200 && b <=255)){ //NEGRE
				 // console.info(r);
				   d[i] = 255
				  d[i + 1] = 204;
				  d[i + 2] = 0;
				  
				  }else{
				    d[i] = 230
				  d[i + 1] = 230;
				  d[i + 2] = 230;
				  }
				  
				  
			}
			}
			
			
			
			
			
			/*Gris
			 if(imageData.data[i]==oldRed &&
         imageData.data[i+1]==oldGreen &&
         imageData.data[i+2]==oldBlue
      ){
          // change to your new rgb
          imageData.data[i]=newRed;
          imageData.data[i+1]=newGreen;
          imageData.data[i+2]=newBlue;
      }
			 
			
			*/
			
			
			
			
			/*
			for (var i = 0, n = pix.length; i < n; i += 4) {
				pix[i] = pix[i + 1] = pix[i + 2] = (3 * pix[i] + 4 * pix[i + 1] + pix[i + 2]) / 8;
			}
			*/
			ctx.putImageData(imgd, 0, 0);
			this.removeAttribute("crossorigin");
			this.src = ctx.canvas.toDataURL();
		}

		L.TileLayer.prototype._tileOnLoad.call(this);
	}
});

/*
L.IM_ColorLayer = function (url, options) {
	return new L.IM_ColorLayer(url, options);
};
*/
