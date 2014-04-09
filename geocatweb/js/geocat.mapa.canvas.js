  var context;
  var newCanvas;
function capturaPantalla(tipus){

    html2canvas(jQuery('#map .leaflet-map-pane'), {
        onrendered: function(canvas) {
        
        	newCanvas = document.getElementById('myCanvas');
            context = newCanvas.getContext('2d');
            
            
            newCanvas.width =canvas.width;
            newCanvas.height = canvas.height;
            context.clearRect(0, 0, canvas.width, canvas.height);
            //context.scale(0.8,0.8);
            context.drawImage(canvas, 0, 0);
            
           
           if(tipus=="captura"){ 
        	 
        	   jQuery('#dialg_captura').modal('show');		
        
           }else{
        	   
        	   window.open("/geocatweb/print.html", "Imprimir", "resizable=yes,status=yes,toolbar=yes,menubar=yes,location=no,scrollbars=yes")  
           }
        
        },
        proxy:paramUrl.proxy,
        useCORS:true
        //width: 300,
        //height: 300
        });
}

