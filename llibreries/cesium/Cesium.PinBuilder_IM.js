


    /**
     * A utility class for generating custom map pins as canvas elements.
     * <br /><br />
     * <div align='center'>
     * <img src='images/PinBuilder_IM.png' width='500'/><br />
     * Example pins generated using both the maki icon set, which ships with Cesium, and single character text.
     * </div>
     *
     * @alias PinBuilder_IM
     * @constructor
     *
     * @demo {@link http://cesiumjs.org/Cesium/Apps/Sandcastle/index.html?src=Map%20Pins.html|Cesium Sandcastle PinBuilder_IM Demo}
     */
    var PinBuilder_IM = function() {
        this._cache = {};
    };

    /**
     * Creates an empty pin of the specified color and size.
     *
     * @param {Color} color The color of the pin.
     * @param {Number} size The size of the pin, in pixels.
     * @returns {Canvas} The canvas element that represents the generated pin.
     */
    PinBuilder_IM.prototype.fromColor = function(color, size) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(color)) {
            throw new Cesium.DeveloperError('color is required');
        }
        if (!Cesium.defined(size)) {
            throw new Cesium.DeveloperError('size is required');
        }
        //>>includeEnd('debug');
        return createPin(undefined, undefined, color, size, this._cache);
    };

    /**
     * Creates a pin with the specified icon, color, and size.
     *
     * @param {String} url The url of the image to be stamped onto the pin.
     * @param {Color} color The color of the pin.
     * @param {Number} size The size of the pin, in pixels.
     * @returns {Canvas|Promise} The canvas element or a Promise to the canvas element that represents the generated pin.
     */
    PinBuilder_IM.prototype.fromUrl = function(url, color, size) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(url)) {
            throw new Cesium.DeveloperError('url is required');
        }
        if (!Cesium.defined(color)) {
            throw new Cesium.DeveloperError('color is required');
        }
        if (!Cesium.defined(size)) {
            throw new Cesium.DeveloperError('size is required');
        }
        //>>includeEnd('debug');
        return createPin(url, undefined, color, size, this._cache);
    };

    /**
     * Creates a pin with the specified {@link https://www.mapbox.com/maki/|maki} icon identifier, color, and size.
     *
     * @param {String} id The id of the maki icon to be stamped onto the pin.
     * @param {Color} color The color of the pin.
     * @param {Number} size The size of the pin, in pixels.
     * @returns {Canvas|Promise} The canvas element or a Promise to the canvas element that represents the generated pin.
     */
    PinBuilder_IM.prototype.fromMakiIconId = function(id, color, size) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(id)) {
            throw new Cesium.DeveloperError('id is required');
        }
        if (!Cesium.defined(color)) {
            throw new Cesium.DeveloperError('color is required');
        }
        if (!Cesium.defined(size)) {
            throw new Cesium.DeveloperError('size is required');
        }
        //>>includeEnd('debug');
        return createPin(Cesium.buildModuleUrl('Assets/Textures/maki/' + encodeURIComponent(id) + '.png'), undefined, color, size, this._cache);
    };

    /**
     * Creates a pin with the specified text, color, and size.  The text will be sized to be as large as possible
     * while still being contained completely within the pin.
     *
     * @param {String} text The text to be stamped onto the pin.
     * @param {Color} color The color of the pin.
     * @param {Number} size The size of the pin, in pixels.
     * @returns {Canvas} The canvas element that represents the generated pin.
     */
    PinBuilder_IM.prototype.fromText = function(text, color, size) {
        //>>includeStart('debug', pragmas.debug);
        if (!Cesium.defined(text)) {
            throw new Cesium.DeveloperError('text is required');
        }
        if (!Cesium.defined(color)) {
            throw new Cesium.DeveloperError('color is required');
        }
        if (!Cesium.defined(size)) {
            throw new Cesium.DeveloperError('size is required');
        }
        //>>includeEnd('debug');

        return createPin(undefined, text, color, size, this._cache);
    };

    var colorScratch = new Cesium.Color();

    //This function (except for the 3 commented lines) was auto-generated from an online tool,
    //http://www.professorcloud.com/svg-to-canvas/, using Assets/Textures/pin.svg as input.
    //The reason we simply can't load and draw the SVG directly to the canvas is because
    //it taints the canvas in Internet Explorer (and possibly some other browsers); making
    //it impossible to create a WebGL texture from the result.
    function drawPin_old(context2D, color, size) {
        context2D.save();
        context2D.scale(size / 24, size / 24); //Added to auto-generated code to scale up to desired size.
        context2D.fillStyle = color.toCssColorString(); //Modified from auto-generated code.
        context2D.strokeStyle = color.brighten(0.6, colorScratch).toCssColorString(); //Modified from auto-generated code.
        context2D.lineWidth = 0.846;
        context2D.beginPath();
        context2D.moveTo(6.72, 0.422);
        context2D.lineTo(17.28, 0.422);
        context2D.bezierCurveTo(18.553, 0.422, 19.577, 1.758, 19.577, 3.415);
        context2D.lineTo(19.577, 10.973);
        context2D.bezierCurveTo(19.577, 12.63, 18.553, 13.966, 17.282, 13.966);
        context2D.lineTo(14.386, 14.008);
        context2D.lineTo(11.826, 23.578);
        context2D.lineTo(9.614, 14.008);
        context2D.lineTo(6.719, 13.965);
        context2D.bezierCurveTo(5.446, 13.983, 4.422, 12.629, 4.422, 10.972);
        context2D.lineTo(4.422, 3.416);
        context2D.bezierCurveTo(4.423, 1.76, 5.447, 0.423, 6.718, 0.423);
        context2D.closePath();
        context2D.fill();
        context2D.stroke();
        context2D.restore();
    }
	
	
	function drawPin(ctx,color,size){
		
		ctx.save();
		ctx.scale(size / 27, size / 27); 
		
//Added to auto-generated code to scale up to desired size.
ctx.fillStyle = color.toCssColorString(); //Modified from auto-generated code.
ctx.strokeStyle = color.brighten(0.9, colorScratch).toCssColorString(); //Modified from auto-generated code.
 ctx.lineWidth = 0.846;
ctx.beginPath();
ctx.moveTo(0,0);
ctx.lineTo(17,0);
ctx.lineTo(17,26);
ctx.lineTo(0,26);
ctx.closePath();
ctx.clip();
//ctx.translate(0,0);
//ctx.translate(0,0);
//ctx.scale(1,1);
//ctx.translate(0,0);

ctx.lineCap = 'butt';
ctx.lineJoin = 'miter';
ctx.miterLimit = 4;
ctx.save();
ctx.restore();
ctx.save();
ctx.restore();
ctx.save();

ctx.beginPath();
ctx.moveTo(8.00038,25.720428);
ctx.bezierCurveTo(7.991779999999999,25.693127999999998,7.9646799999999995,25.771427999999997,7.94006,25.553027999999998);
ctx.bezierCurveTo(7.91544,25.334587999999997,7.8675,24.968207999999997,7.833528,24.738847999999997);
ctx.bezierCurveTo(7.799558,24.509487999999997,7.757208,24.214598,7.739428,24.083537999999997);
ctx.bezierCurveTo(7.721648,23.952477999999996,7.688568,23.764817999999998,7.6659180000000005,23.666517999999996);
ctx.bezierCurveTo(7.6432780000000005,23.568217999999998,7.5872280000000005,23.282267999999995,7.5413760000000005,23.031067999999998);
ctx.bezierCurveTo(7.440875,22.480487999999998,7.364883000000001,22.135717999999997,7.2393600000000005,21.660867999999997);
ctx.bezierCurveTo(7.012722,20.532217999999997,6.788524000000001,19.472137999999998,6.3259429,18.323597999999997);
ctx.bezierCurveTo(5.8166909,17.162297999999996,5.266939900000001,16.062267999999996,4.6605039,15.435127999999997);
ctx.bezierCurveTo(4.5032019000000005,15.272457999999997,4.0561309,14.891597999999997,3.6812569,14.600927999999996);
ctx.bezierCurveTo(3.5618389,14.508327999999997,3.1902259,14.157657999999996,2.8554509,13.821667999999995);
ctx.bezierCurveTo(2.1381359,13.101737999999996,1.7449989000000001,12.562447999999996,1.3499779,11.756517999999996);
ctx.bezierCurveTo(1.0873909,11.220767999999996,0.8135948700000001,10.478247999999997,0.76049087,10.157847999999996);
ctx.bezierCurveTo(0.74468087,10.062447999999996,0.71683087,9.955938099999996,0.69860087,9.921168099999996);
ctx.bezierCurveTo(0.62956087,9.789457699999996,0.54237987,8.833987699999996,0.54237987,8.209027899999995);
ctx.bezierCurveTo(0.54237987,7.178367899999995,0.66442687,6.435338099999996,0.98793387,5.496478099999996);
ctx.bezierCurveTo(1.3502649,4.444948099999996,2.0195799,3.4012980999999956,2.8821859,2.542808099999996);
ctx.bezierCurveTo(3.8486399000000002,1.5809680999999958,4.6962759,1.0558280999999958,6.0624719,0.5724980599999958);
ctx.bezierCurveTo(7.483858000000001,0.06963795999999578,9.606424,0.06963795999999578,11.027811,0.5724980599999958);
ctx.bezierCurveTo(12.264205,1.0099080999999959,13.049434,1.4638280999999957,13.879634,2.221058099999996);
ctx.bezierCurveTo(15.429172999999999,3.634418099999996,16.278393,5.241348099999996,16.513123,7.204267899999996);
ctx.bezierCurveTo(16.573323,7.707937899999996,16.534023,9.394547699999997,16.454823,9.706367699999996);
ctx.bezierCurveTo(16.421523,9.837428199999996,16.356723000000002,10.096577999999996,16.310783,10.282247999999996);
ctx.bezierCurveTo(16.264883,10.467917999999996,16.202523,10.682387999999996,16.172253,10.758837999999995);
ctx.bezierCurveTo(16.141953,10.835337999999995,16.044963000000003,11.079867999999996,15.956653000000001,11.302347999999995);
ctx.bezierCurveTo(15.784963000000001,11.734887999999994,15.497613000000001,12.277167999999994,15.228176000000001,12.677127999999994);
ctx.bezierCurveTo(14.801881000000002,13.309937999999994,14.024459000000002,14.140147999999995,13.457426000000002,14.568117999999995);
ctx.bezierCurveTo(12.680758,15.154307999999995,12.078473000000002,16.026127999999996,11.528173000000002,16.974387999999994);
ctx.bezierCurveTo(10.844298000000002,18.152817999999993,10.264388000000002,20.170147999999994,9.945105000000002,21.601287999999993);
ctx.bezierCurveTo(9.928045000000001,21.677787999999993,9.887315000000001,21.847527999999993,9.854575000000002,21.978597999999995);
ctx.bezierCurveTo(9.821835000000002,22.109657999999996,9.764315000000002,22.368797999999995,9.726753000000002,22.554477999999996);
ctx.bezierCurveTo(9.689183000000002,22.740147999999998,9.635473000000003,22.981417999999994,9.607391000000002,23.090637999999995);
ctx.bezierCurveTo(9.579311000000002,23.199857999999995,9.517751000000002,23.548367999999996,9.470597000000001,23.865097999999996);
ctx.bezierCurveTo(9.423447000000001,24.181837999999996,9.366136000000001,24.557147999999998,9.343248,24.699137999999998);
ctx.bezierCurveTo(9.320358,24.841117999999998,9.285968,25.109198,9.266818,25.294877999999997);
ctx.bezierCurveTo(9.223628000000001,25.500397999999997,9.260218,25.697787999999996,9.152204000000001,25.751447999999996);
ctx.lineTo(8.598433000000002,25.770047999999996);
ctx.bezierCurveTo(8.445701000000001,25.775047999999995,8.010526000000002,25.752747999999997,8.000389000000002,25.720447999999994);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.restore();
ctx.restore();
		
		
	}	
	
	
	

    //This function takes an image or canvas and uses it as a template
    //to "stamp" the pin with a white image outlined in black.  The color
    //values of the input image are ignored completely and only the alpha
    //values are used.
    function drawIcon(context2D, image, size) {
        //Size is the largest image that looks good inside of pin box.
        var imageSize = size / 3.2;
        var sizeX = imageSize;
        var sizeY = imageSize;

        if (image.width > image.height) {
            sizeY = imageSize * (image.height / image.width);
        } else if (image.width < image.height) {
            sizeX = imageSize * (image.width / image.height);
        }

        //x and y are the center of the pin box
        var x = (size - sizeX) / 4;
        var y = ((7 / 24) * size) - (sizeY / 2);

        context2D.globalCompositeOperation = 'destination-out';
        context2D.drawImage(image, x - 1, y, sizeX, sizeY);
        context2D.drawImage(image, x, y - 1, sizeX, sizeY);
        context2D.drawImage(image, x + 1, y, sizeX, sizeY);
        context2D.drawImage(image, x, y + 1, sizeX, sizeY);

        context2D.globalCompositeOperation = 'destination-over';
        context2D.fillStyle = Cesium.Color.WHITE.toCssColorString();
        context2D.fillRect(x - 1, y - 1, sizeX + 1, sizeY + 1);

        context2D.globalCompositeOperation = 'destination-out';
        context2D.drawImage(image, x, y, sizeX, sizeY);

        context2D.globalCompositeOperation = 'destination-over';
        context2D.fillStyle = Cesium.Color.BLACK.toCssColorString();
        context2D.fillRect(x, y, sizeX, sizeY);
    }

    var stringifyScratch = new Array(4);
    function createPin(url, label, color, size, cache) {
        //Use the parameters as a unique ID for caching.
        stringifyScratch[0] = url;
        stringifyScratch[1] = label;
        stringifyScratch[2] = color;
        stringifyScratch[3] = size;
        var id = JSON.stringify(stringifyScratch);

        var item = cache[id];
        if (Cesium.defined(item)) {
            return item;
        }

        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        var context2D = canvas.getContext("2d");
        drawPin(context2D, color, size);

        if (Cesium.defined(url)) {
            //If we have an image url, load it and then stamp the pin.
            var promise = Cesium.loadImage(url).then(function(image) {
                drawIcon(context2D, image, size);
                cache[id] = canvas;
                return canvas;
            });
            cache[id] = promise;
            return promise;
        } else if (Cesium.defined(label)) {
            //If we have a label, write it to a canvas and then stamp the pin.
            var image = Cesium.writeTextToCanvas(label, {
                font : 'bold ' + size + 'px sans-serif'
            });
            drawIcon(context2D, image, size);
        }

        cache[id] = canvas;
        return canvas;
    }

  