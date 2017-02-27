L.Spinner = {
	spin: function (state, _options) {
    	if (!!state) {
            // start spinning !
    		if (!this._spinner) {
    			this._spinner = L.DomUtil.get(this.options.spinerDiv);
    			this._spinning = 0;
    		}
    		if (this._spinner) {
    			this._spinner.style.display = 'flex';
    		}
    		this._spinning++;
        }
        else {
            this._spinning--;
            if (this._spinning <= 0) {
                // end spinning !
            	if (this._spinner) {
            		this._spinner.style.display = 'none';
            		this._spinner = null;
            	}
            }
        }
    }
};

L.Map.include(L.Spinner);

L.Map.addInitHook(function () {
	this.on('layeradd',function(e){
		if( e.layer instanceof L.TileLayer ){
			if (e.layer.loading) this.spin(true);
			if (typeof e.layer.on != 'function') return;
	        e.layer.on('data:loading', function () { this.spin(true); }, this);
	        e.layer.on('data:loaded',  function () { this.spin(false); }, this);
		}
	});
	
	this.on('layerremove', function (e) {
        // Clean-up
        if (e.layer.loading) this.spin(false);
        if (typeof e.layer.on != 'function') return;
        e.layer.off('data:loaded');
        e.layer.off('data:loading');
    }, this);
});