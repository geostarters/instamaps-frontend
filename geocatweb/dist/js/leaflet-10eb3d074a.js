/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade
*/
(function (window, document, undefined) {
var oldL = window.L,
    L = {};

L.version = '0.7.7';

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = L;

// define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
	define(L);
}

// define Leaflet as a global L variable, saving the original L to restore later if needed

L.noConflict = function () {
	window.L = oldL;
	return this;
};

window.L = L;


/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

L.Util = {
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0,
		    key = '_leaflet_id';
		return function (obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),

	invokeEach: function (obj, method, context) {
		var i, args;

		if (typeof obj === 'object') {
			args = Array.prototype.slice.call(arguments, 3);

			for (i in obj) {
				method.apply(context, [i, obj[i]].concat(args));
			}
			return true;
		}

		return false;
	},

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	falseFn: function () {
		return false;
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	splitWords: function (str) {
		return L.Util.trim(str).split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = L.extend({}, obj.options, options);
		return obj.options;
	},

	getParamString: function (obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	},
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},

	isArray: Array.isArray || function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	},

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

	// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	function getPrefixed(name) {
		var i, fn,
		    prefixes = ['webkit', 'moz', 'o', 'ms'];

		for (i = 0; i < prefixes.length && !fn; i++) {
			fn = window[prefixes[i] + name];
		}

		return fn;
	}

	var lastTime = 0;

	function timeoutDefer(fn) {
		var time = +new Date(),
		    timeToCall = Math.max(0, 16 - (time - lastTime));

		lastTime = time + timeToCall;
		return window.setTimeout(fn, timeToCall);
	}

	var requestFn = window.requestAnimationFrame ||
	        getPrefixed('RequestAnimationFrame') || timeoutDefer;

	var cancelFn = window.cancelAnimationFrame ||
	        getPrefixed('CancelAnimationFrame') ||
	        getPrefixed('CancelRequestAnimationFrame') ||
	        function (id) { window.clearTimeout(id); };


	L.Util.requestAnimFrame = function (fn, context, immediate, element) {
		fn = L.bind(fn, context);

		if (immediate && requestFn === timeoutDefer) {
			fn();
		} else {
			return requestFn.call(window, fn, element);
		}
	};

	L.Util.cancelAnimFrame = function (id) {
		if (id) {
			cancelFn.call(window, id);
		}
	};

}());

// shortcuts for most used utility functions
L.extend = L.Util.extend;
L.bind = L.Util.bind;
L.stamp = L.Util.stamp;
L.setOptions = L.Util.setOptions;


/*
 * L.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

L.Class = function () {};

L.Class.extend = function (props) {

	// extended class with the new prototype
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		L.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		L.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = L.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	L.extend(proto, props);

	proto._initHooks = [];

	var parent = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// method for adding properties to prototype
L.Class.include = function (props) {
	L.extend(this.prototype, props);
};

// merge new default options to the Class
L.Class.mergeOptions = function (options) {
	L.extend(this.prototype.options, options);
};

// add a constructor hook
L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};


/*
 * L.Mixin.Events is used to add custom events functionality to Leaflet classes.
 */

var eventsKey = '_leaflet_events';

L.Mixin = {};

L.Mixin.Events = {

	addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey] = this[eventsKey] || {},
		    contextId = context && context !== this && L.stamp(context),
		    i, len, event, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			event = {
				action: fn,
				context: context || this
			};
			type = types[i];

			if (contextId) {
				// store listeners of a particular context in a separate hash (if it has an id)
				// gives a major performance boost when removing thousands of map layers

				indexKey = type + '_idx';
				indexLenKey = indexKey + '_len';

				typeIndex = events[indexKey] = events[indexKey] || {};

				if (!typeIndex[contextId]) {
					typeIndex[contextId] = [];

					// keep track of the number of keys in the index to quickly check if it's empty
					events[indexLenKey] = (events[indexLenKey] || 0) + 1;
				}

				typeIndex[contextId].push(event);


			} else {
				events[type] = events[type] || [];
				events[type].push(event);
			}
		}

		return this;
	},

	hasEventListeners: function (type) { // (String) -> Boolean
		var events = this[eventsKey];
		return !!events && ((type in events && events[type].length > 0) ||
		                    (type + '_idx' in events && events[type + '_idx_len'] > 0));
	},

	removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

		if (!this[eventsKey]) {
			return this;
		}

		if (!types) {
			return this.clearAllEventListeners();
		}

		if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey],
		    contextId = context && context !== this && L.stamp(context),
		    i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_idx';
			indexLenKey = indexKey + '_len';

			typeIndex = events[indexKey];

			if (!fn) {
				// clear all listeners for a type if function isn't specified
				delete events[type];
				delete events[indexKey];
				delete events[indexLenKey];

			} else {
				listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

				if (listeners) {
					for (j = listeners.length - 1; j >= 0; j--) {
						if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
							removed = listeners.splice(j, 1);
							// set the old action to a no-op, because it is possible
							// that the listener is being iterated over as part of a dispatch
							removed[0].action = L.Util.falseFn;
						}
					}

					if (context && typeIndex && (listeners.length === 0)) {
						delete typeIndex[contextId];
						events[indexLenKey]--;
					}
				}
			}
		}

		return this;
	},

	clearAllEventListeners: function () {
		delete this[eventsKey];
		return this;
	},

	fireEvent: function (type, data) { // (String[, Object])
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = L.Util.extend({}, data, { type: type, target: this });

		var events = this[eventsKey],
		    listeners, i, len, typeIndex, contextId;

		if (events[type]) {
			// make sure adding/removing listeners inside other listeners won't cause infinite loop
			listeners = events[type].slice();

			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].action.call(listeners[i].context, event);
			}
		}

		// fire event for the context-indexed listeners as well
		typeIndex = events[type + '_idx'];

		for (contextId in typeIndex) {
			listeners = typeIndex[contextId].slice();

			if (listeners) {
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].action.call(listeners[i].context, event);
				}
			}
		}

		return this;
	},

	addOneTimeEventListener: function (types, fn, context) {

		if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

		var handler = L.bind(function () {
			this
			    .removeEventListener(types, fn, context)
			    .removeEventListener(types, handler, context);
		}, this);

		return this
		    .addEventListener(types, fn, context)
		    .addEventListener(types, handler, context);
	}
};

L.Mixin.Events.on = L.Mixin.Events.addEventListener;
L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
L.Mixin.Events.fire = L.Mixin.Events.fireEvent;


/*
 * L.Browser handles different browser and feature detections for internal Leaflet use.
 */

(function () {

	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !document.addEventListener,

	    // terrible browser detection to work around Safari / iOS / Android browser bugs
	    ua = navigator.userAgent.toLowerCase(),
	    webkit = ua.indexOf('webkit') !== -1,
	    chrome = ua.indexOf('chrome') !== -1,
	    phantomjs = ua.indexOf('phantom') !== -1,
	    android = ua.indexOf('android') !== -1,
	    android23 = ua.search('android [23]') !== -1,
		gecko = ua.indexOf('gecko') !== -1,

	    mobile = typeof orientation !== undefined + '',
	    msPointer = !window.PointerEvent && window.MSPointerEvent,
		pointer = (window.PointerEvent && window.navigator.pointerEnabled) ||
				  msPointer,
	    retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
	             ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
	              window.matchMedia('(min-resolution:144dpi)').matches),

	    doc = document.documentElement,
	    ie3d = ie && ('transition' in doc.style),
	    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
	    gecko3d = 'MozPerspective' in doc.style,
	    opera3d = 'OTransition' in doc.style,
	    any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;

	var touch = !window.L_NO_TOUCH && !phantomjs && (pointer || 'ontouchstart' in window ||
		(window.DocumentTouch && document instanceof window.DocumentTouch));

	L.Browser = {
		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

		android: android,
		android23: android23,

		chrome: chrome,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

		retina: retina
	};

}());


/*
 * L.Point represents a point with x and y coordinates.
 */

L.Point = function (/*Number*/ x, /*Number*/ y, /*Boolean*/ round) {
	this.x = (round ? Math.round(x) : x);
	this.y = (round ? Math.round(y) : y);
};

L.Point.prototype = {

	clone: function () {
		return new L.Point(this.x, this.y);
	},

	// non-destructive, returns a new point
	add: function (point) {
		return this.clone()._add(L.point(point));
	},

	// destructive, used directly for performance in situations where it's safe to modify existing point
	_add: function (point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	subtract: function (point) {
		return this.clone()._subtract(L.point(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	distanceTo: function (point) {
		point = L.point(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	equals: function (point) {
		point = L.point(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	contains: function (point) {
		point = L.point(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	toString: function () {
		return 'Point(' +
		        L.Util.formatNum(this.x) + ', ' +
		        L.Util.formatNum(this.y) + ')';
	}
};

L.point = function (x, y, round) {
	if (x instanceof L.Point) {
		return x;
	}
	if (L.Util.isArray(x)) {
		return new L.Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	return new L.Point(x, y, round);
};


/*
 * L.Bounds represents a rectangular area on the screen in pixel coordinates.
 */

L.Bounds = function (a, b) { //(Point, Point) or Point[]
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
};

L.Bounds.prototype = {
	// extend the bounds to contain the given point
	extend: function (point) { // (Point)
		point = L.point(point);

		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	getCenter: function (round) { // (Boolean) -> Point
		return new L.Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	getBottomLeft: function () { // -> Point
		return new L.Point(this.min.x, this.max.y);
	},

	getTopRight: function () { // -> Point
		return new L.Point(this.max.x, this.min.y);
	},

	getSize: function () {
		return this.max.subtract(this.min);
	},

	contains: function (obj) { // (Bounds) or (Point) -> Boolean
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof L.Point) {
			obj = L.point(obj);
		} else {
			obj = L.bounds(obj);
		}

		if (obj instanceof L.Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = L.bounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};

L.bounds = function (a, b) { // (Bounds) or (Point, Point) or (Point[])
	if (!a || a instanceof L.Bounds) {
		return a;
	}
	return new L.Bounds(a, b);
};


/*
 * L.Transformation is an utility class to perform simple point transformations through a 2d-matrix.
 */

L.Transformation = function (a, b, c, d) {
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
};

L.Transformation.prototype = {
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	untransform: function (point, scale) {
		scale = scale || 1;
		return new L.Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};


/*
 * L.DomUtil contains various utility functions for working with DOM.
 */

L.DomUtil = {
	get: function (id) {
		return (typeof id === 'string' ? document.getElementById(id) : id);
	},

	getStyle: function (el, style) {

		var value = el.style[style];

		if (!value && el.currentStyle) {
			value = el.currentStyle[style];
		}

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}

		return value === 'auto' ? null : value;
	},

	getViewportOffset: function (element) {

		var top = 0,
		    left = 0,
		    el = element,
		    docBody = document.body,
		    docEl = document.documentElement,
		    pos;

		do {
			top  += el.offsetTop  || 0;
			left += el.offsetLeft || 0;

			//add borders
			top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
			left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;

			pos = L.DomUtil.getStyle(el, 'position');

			if (el.offsetParent === docBody && pos === 'absolute') { break; }

			if (pos === 'fixed') {
				top  += docBody.scrollTop  || docEl.scrollTop  || 0;
				left += docBody.scrollLeft || docEl.scrollLeft || 0;
				break;
			}

			if (pos === 'relative' && !el.offsetLeft) {
				var width = L.DomUtil.getStyle(el, 'width'),
				    maxWidth = L.DomUtil.getStyle(el, 'max-width'),
				    r = el.getBoundingClientRect();

				if (width !== 'none' || maxWidth !== 'none') {
					left += r.left + el.clientLeft;
				}

				//calculate full y offset since we're breaking out of the loop
				top += r.top + (docBody.scrollTop  || docEl.scrollTop  || 0);

				break;
			}

			el = el.offsetParent;

		} while (el);

		el = element;

		do {
			if (el === docBody) { break; }

			top  -= el.scrollTop  || 0;
			left -= el.scrollLeft || 0;

			el = el.parentNode;
		} while (el);

		return new L.Point(left, top);
	},

	documentIsLtr: function () {
		if (!L.DomUtil._docIsLtrCached) {
			L.DomUtil._docIsLtrCached = true;
			L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
		}
		return L.DomUtil._docIsLtr;
	},

	create: function (tagName, className, container) {

		var el = document.createElement(tagName);
		el.className = className;

		if (container) {
			container.appendChild(el);
		}

		return el;
	},

	hasClass: function (el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = L.DomUtil._getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	},

	addClass: function (el, name) {
		if (el.classList !== undefined) {
			var classes = L.Util.splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!L.DomUtil.hasClass(el, name)) {
			var className = L.DomUtil._getClass(el);
			L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
		}
	},

	removeClass: function (el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	},

	_setClass: function (el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	},

	_getClass: function (el) {
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	},

	setOpacity: function (el, value) {

		if ('opacity' in el.style) {
			el.style.opacity = value;

		} else if ('filter' in el.style) {

			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';

			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}

			value = Math.round(value * 100);

			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		}
	},

	testProp: function (props) {

		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	},

	getTranslateString: function (point) {
		// on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
		// makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
		// (same speed either way), Opera 12 doesn't support translate3d

		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	},

	getScaleString: function (scale, origin) {

		var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
		    scaleStr = ' scale(' + scale + ') ';

		return preTranslateStr + scaleStr;
	},

	setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] =  L.DomUtil.getTranslateString(point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	},

	getPosition: function (el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		// jshint camelcase: false
		return el._leaflet_pos;
	}
};


// prefix style property names

L.DomUtil.TRANSFORM = L.DomUtil.testProp(
        ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

L.DomUtil.TRANSITION = L.DomUtil.testProp(
        ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

L.DomUtil.TRANSITION_END =
        L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ?
        L.DomUtil.TRANSITION + 'End' : 'transitionend';

(function () {
    if ('onselectstart' in document) {
        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
            },

            enableTextSelection: function () {
                L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
            }
        });
    } else {
        var userSelectProperty = L.DomUtil.testProp(
            ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                if (userSelectProperty) {
                    var style = document.documentElement.style;
                    this._userSelect = style[userSelectProperty];
                    style[userSelectProperty] = 'none';
                }
            },

            enableTextSelection: function () {
                if (userSelectProperty) {
                    document.documentElement.style[userSelectProperty] = this._userSelect;
                    delete this._userSelect;
                }
            }
        });
    }

	L.extend(L.DomUtil, {
		disableImageDrag: function () {
			L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
		},

		enableImageDrag: function () {
			L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
		}
	});
})();


/*
 * L.LatLng represents a geographical point with latitude and longitude coordinates.
 */

L.LatLng = function (lat, lng, alt) { // (Number, Number, Number)
	lat = parseFloat(lat);
	lng = parseFloat(lng);

	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	this.lat = lat;
	this.lng = lng;

	if (alt !== undefined) {
		this.alt = parseFloat(alt);
	}
};

L.extend(L.LatLng, {
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

L.LatLng.prototype = {
	equals: function (obj) { // (LatLng) -> Boolean
		if (!obj) { return false; }

		obj = L.latLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= L.LatLng.MAX_MARGIN;
	},

	toString: function (precision) { // (Number) -> String
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ')';
	},

	// Haversine distance formula, see http://en.wikipedia.org/wiki/Haversine_formula
	// TODO move to projection code, LatLng shouldn't know about Earth
	distanceTo: function (other) { // (LatLng) -> Number
		other = L.latLng(other);

		var R = 6378137, // earth radius in meters
		    d2r = L.LatLng.DEG_TO_RAD,
		    dLat = (other.lat - this.lat) * d2r,
		    dLon = (other.lng - this.lng) * d2r,
		    lat1 = this.lat * d2r,
		    lat2 = other.lat * d2r,
		    sin1 = Math.sin(dLat / 2),
		    sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	},

	wrap: function (a, b) { // (Number, Number) -> LatLng
		var lng = this.lng;

		a = a || -180;
		b = b ||  180;

		lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);

		return new L.LatLng(this.lat, lng);
	}
};

L.latLng = function (a, b) { // (LatLng) or ([Number, Number]) or (Number, Number)
	if (a instanceof L.LatLng) {
		return a;
	}
	if (L.Util.isArray(a)) {
		if (typeof a[0] === 'number' || typeof a[0] === 'string') {
			return new L.LatLng(a[0], a[1], a[2]);
		} else {
			return null;
		}
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
	}
	if (b === undefined) {
		return null;
	}
	return new L.LatLng(a, b);
};



/*
 * L.LatLngBounds represents a rectangular area on the map in geographical coordinates.
 */

L.LatLngBounds = function (southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
	if (!southWest) { return; }

	var latlngs = northEast ? [southWest, northEast] : southWest;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
};

L.LatLngBounds.prototype = {
	// extend the bounds to contain the given point or bounds
	extend: function (obj) { // (LatLng) or (LatLngBounds)
		if (!obj) { return this; }

		var latLng = L.latLng(obj);
		if (latLng !== null) {
			obj = latLng;
		} else {
			obj = L.latLngBounds(obj);
		}

		if (obj instanceof L.LatLng) {
			if (!this._southWest && !this._northEast) {
				this._southWest = new L.LatLng(obj.lat, obj.lng);
				this._northEast = new L.LatLng(obj.lat, obj.lng);
			} else {
				this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
				this._southWest.lng = Math.min(obj.lng, this._southWest.lng);

				this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
				this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
			}
		} else if (obj instanceof L.LatLngBounds) {
			this.extend(obj._southWest);
			this.extend(obj._northEast);
		}
		return this;
	},

	// extend the bounds by a percentage
	pad: function (bufferRatio) { // (Number) -> LatLngBounds
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new L.LatLngBounds(
		        new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	getCenter: function () { // -> LatLng
		return new L.LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	getSouthWest: function () {
		return this._southWest;
	},

	getNorthEast: function () {
		return this._northEast;
	},

	getNorthWest: function () {
		return new L.LatLng(this.getNorth(), this.getWest());
	},

	getSouthEast: function () {
		return new L.LatLng(this.getSouth(), this.getEast());
	},

	getWest: function () {
		return this._southWest.lng;
	},

	getSouth: function () {
		return this._southWest.lat;
	},

	getEast: function () {
		return this._northEast.lng;
	},

	getNorth: function () {
		return this._northEast.lat;
	},

	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
			obj = L.latLng(obj);
		} else {
			obj = L.latLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof L.LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	intersects: function (bounds) { // (LatLngBounds)
		bounds = L.latLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	equals: function (bounds) { // (LatLngBounds)
		if (!bounds) { return false; }

		bounds = L.latLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest()) &&
		       this._northEast.equals(bounds.getNorthEast());
	},

	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

//TODO International date line?

L.latLngBounds = function (a, b) { // (LatLngBounds) or (LatLng, LatLng)
	if (!a || a instanceof L.LatLngBounds) {
		return a;
	}
	return new L.LatLngBounds(a, b);
};


/*
 * L.Projection contains various geographical projections used by CRS classes.
 */

L.Projection = {};


/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

L.Projection.SphericalMercator = {
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    x = latlng.lng * d,
		    y = lat * d;

		y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    lng = point.x * d,
		    lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

		return new L.LatLng(lat, lng);
	}
};


/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

L.Projection.LonLat = {
	project: function (latlng) {
		return new L.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new L.LatLng(point.y, point.x);
	}
};


/*
 * L.CRS is a base object for all defined CRS (Coordinate Reference Systems) in Leaflet.
 */

L.CRS = {
	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	project: function (latlng) {
		return this.projection.project(latlng);
	},

	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	getSize: function (zoom) {
		var s = this.scale(zoom);
		return L.point(s, s);
	}
};


/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */

L.CRS.Simple = L.extend({}, L.CRS, {
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	}
});


/*
 * L.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping
 * and is used by Leaflet by default.
 */

L.CRS.EPSG3857 = L.extend({}, L.CRS, {
	code: 'EPSG:3857',

	projection: L.Projection.SphericalMercator,
	transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

	project: function (latlng) { // (LatLng) -> Point
		var projectedPoint = this.projection.project(latlng),
		    earthRadius = 6378137;
		return projectedPoint.multiplyBy(earthRadius);
	}
});

L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {
	code: 'EPSG:900913'
});


/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

L.CRS.EPSG4326 = L.extend({}, L.CRS, {
	code: 'EPSG:4326',

	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
});


/*
 * L.Map is the central class of the API - it is used to create a map.
 */

L.Map = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		crs: L.CRS.EPSG3857,

		/*
		center: LatLng,
		zoom: Number,
		layers: Array,
		*/

		fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
		trackResize: true,
		markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = L.setOptions(this, options);


		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = L.bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(L.latLng(options.center), options.zoom, {reset: true});
		}

		this._handlers = [];

		this._layers = {};
		this._zoomBoundLayers = {};
		this._tileLayersNum = 0;

		this.callInitHooks();

		this._addLayers(options.layers);
	},


	// public methods that modify map state

	// replaced by animation-powered implementation in Map.PanAnimation.js
	setView: function (center, zoom) {
		zoom = zoom === undefined ? this.getZoom() : zoom;
		this._resetView(L.latLng(center), this._limitZoom(zoom));
		return this;
	},

	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = this._limitZoom(zoom);
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	zoomIn: function (delta, options) {
		return this.setZoom(this._zoom + (delta || 1), options);
	},

	zoomOut: function (delta, options) {
		return this.setZoom(this._zoom - (delta || 1), options);
	},

	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	fitBounds: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

		var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

		zoom = (options.maxZoom) ? Math.min(options.maxZoom, zoom) : zoom;

		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		return this.setView(center, zoom, options);
	},

	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	panBy: function (offset) { // (Point)
		// replaced with animated panBy in Map.PanAnimation.js
		this.fire('movestart');

		this._rawPanBy(L.point(offset));

		this.fire('move');
		return this.fire('moveend');
	},

	setMaxBounds: function (bounds) {
		bounds = L.latLngBounds(bounds);

		this.options.maxBounds = bounds;

		if (!bounds) {
			return this.off('moveend', this._panInsideMaxBounds, this);
		}

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds, this);
	},

	panInsideBounds: function (bounds, options) {
		var center = this.getCenter(),
			newCenter = this._limitCenter(center, this._zoom, bounds);

		if (center.equals(newCenter)) { return this; }

		return this.panTo(newCenter, options);
	},

	addLayer: function (layer) {
		// TODO method is too big, refactor

		var id = L.stamp(layer);

		if (this._layers[id]) { return this; }

		this._layers[id] = layer;

		// TODO getMaxZoom, getMinZoom in ILayer (instead of options)
		if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
			this._zoomBoundLayers[id] = layer;
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor!!!
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum++;
			this._tileLayersToLoad++;
			layer.on('load', this._onTileLayerLoad, this);
		}

		if (this._loaded) {
			this._layerAdd(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
		}

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum--;
			this._tileLayersToLoad--;
			layer.off('load', this._onTileLayerLoad, this);
		}

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (L.stamp(layer) in this._layers);
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = L.extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._initialCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// TODO handler.addTo
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	remove: function () {
		if (this._loaded) {
			this.fire('unload');
		}

		this._initEvents('off');

		try {
			// throws error in IE6-8
			delete this._container._leaflet;
		} catch (e) {
			this._container._leaflet = undefined;
		}

		this._clearPanes();
		if (this._clearControlPos) {
			this._clearControlPos();
		}

		this._clearHandlers();

		return this;
	},


	// public methods for getting map state

	getCenter: function () { // (Boolean) -> LatLng
		this._checkIfLoaded();

		if (this._initialCenter && !this._moved()) {
			return this._initialCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	getZoom: function () {
		return this._zoom;
	},

	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new L.LatLngBounds(sw, ne);
	},

	getMinZoom: function () {
		return this.options.minZoom === undefined ?
			(this._layersMinZoom === undefined ? 0 : this._layersMinZoom) :
			this.options.minZoom;
	},

	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = L.latLngBounds(bounds);

		var zoom = this.getMinZoom() - (inside ? 1 : 0),
		    maxZoom = this.getMaxZoom(),
		    size = this.getSize(),

		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),

		    zoomNotFound = true,
		    boundsSize;

		padding = L.point(padding || [0, 0]);

		do {
			zoom++;
			boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
			zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;

		} while (zoomNotFound && zoom <= maxZoom);

		if (zoomNotFound && inside) {
			return null;
		}

		return inside ? zoom : zoom - 1;
	},

	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new L.Point(
				this._container.clientWidth,
				this._container.clientHeight);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	getPixelBounds: function () {
		var topLeftPoint = this._getTopLeftPoint();
		return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._initialTopLeftPoint;
	},

	getPanes: function () {
		return this._panes;
	},

	getContainer: function () {
		return this._container;
	},


	// TODO replace with universal implementation after refactoring projections

	getZoomScale: function (toZoom) {
		var crs = this.options.crs;
		return crs.scale(toZoom) / crs.scale(this._zoom);
	},

	getScaleZoom: function (scale) {
		return this._zoom + (Math.log(scale) / Math.LN2);
	},


	// conversion methods

	project: function (latlng, zoom) { // (LatLng[, Number]) -> Point
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
	},

	unproject: function (point, zoom) { // (Point[, Number]) -> LatLng
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(L.point(point), zoom);
	},

	layerPointToLatLng: function (point) { // (Point)
		var projectedPoint = L.point(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	latLngToLayerPoint: function (latlng) { // (LatLng)
		var projectedPoint = this.project(L.latLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	containerPointToLayerPoint: function (point) { // (Point)
		return L.point(point).subtract(this._getMapPanePos());
	},

	layerPointToContainerPoint: function (point) { // (Point)
		return L.point(point).add(this._getMapPanePos());
	},

	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(L.point(point));
		return this.layerPointToLatLng(layerPoint);
	},

	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
	},

	mouseEventToContainerPoint: function (e) { // (MouseEvent)
		return L.DomEvent.getMousePosition(e, this._container);
	},

	mouseEventToLayerPoint: function (e) { // (MouseEvent)
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = L.DomUtil.get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet) {
			throw new Error('Map container is already initialized.');
		}

		container._leaflet = true;
	},

	_initLayout: function () {
		var container = this._container;

		L.DomUtil.addClass(container, 'leaflet-container' +
			(L.Browser.touch ? ' leaflet-touch' : '') +
			(L.Browser.retina ? ' leaflet-retina' : '') +
			(L.Browser.ielt9 ? ' leaflet-oldie' : '') +
			(this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));

		var position = L.DomUtil.getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};

		this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

		this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
		panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
		panes.shadowPane = this._createPane('leaflet-shadow-pane');
		panes.overlayPane = this._createPane('leaflet-overlay-pane');
		panes.markerPane = this._createPane('leaflet-marker-pane');
		panes.popupPane = this._createPane('leaflet-popup-pane');

		var zoomHide = ' leaflet-zoom-hide';

		if (!this.options.markerZoomAnimation) {
			L.DomUtil.addClass(panes.markerPane, zoomHide);
			L.DomUtil.addClass(panes.shadowPane, zoomHide);
			L.DomUtil.addClass(panes.popupPane, zoomHide);
		}
	},

	_createPane: function (className, container) {
		return L.DomUtil.create('div', className, container || this._panes.objectsPane);
	},

	_clearPanes: function () {
		this._container.removeChild(this._mapPane);
	},

	_addLayers: function (layers) {
		layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},


	// private methods that modify map state

	_resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {

		var zoomChanged = (this._zoom !== zoom);

		if (!afterZoomAnim) {
			this.fire('movestart');

			if (zoomChanged) {
				this.fire('zoomstart');
			}
		}

		this._zoom = zoom;
		this._initialCenter = center;

		this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

		if (!preserveMapOffset) {
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
		} else {
			this._initialTopLeftPoint._add(this._getMapPanePos());
		}

		this._tileLayersToLoad = this._tileLayersNum;

		var loading = !this._loaded;
		this._loaded = true;

		this.fire('viewreset', {hard: !preserveMapOffset});

		if (loading) {
			this.fire('load');
			this.eachLayer(this._layerAdd, this);
		}

		this.fire('move');

		if (zoomChanged || afterZoomAnim) {
			this.fire('zoomend');
		}

		this.fire('moveend', {hard: !preserveMapOffset});
	},

	_rawPanBy: function (offset) {
		L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_updateZoomLevels: function () {
		var i,
			minZoom = Infinity,
			maxZoom = -Infinity,
			oldZoomSpan = this._getZoomSpan();

		for (i in this._zoomBoundLayers) {
			var layer = this._zoomBoundLayers[i];
			if (!isNaN(layer.options.minZoom)) {
				minZoom = Math.min(minZoom, layer.options.minZoom);
			}
			if (!isNaN(layer.options.maxZoom)) {
				maxZoom = Math.max(maxZoom, layer.options.maxZoom);
			}
		}

		if (i === undefined) { // we have no tilelayers
			this._layersMaxZoom = this._layersMinZoom = undefined;
		} else {
			this._layersMaxZoom = maxZoom;
			this._layersMinZoom = minZoom;
		}

		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}
	},

	_panInsideMaxBounds: function () {
		this.panInsideBounds(this.options.maxBounds);
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// map events

	_initEvents: function (onOff) {
		if (!L.DomEvent) { return; }

		onOff = onOff || 'on';

		L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);

		var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter',
		              'mouseleave', 'mousemove', 'contextmenu'],
		    i, len;

		for (i = 0, len = events.length; i < len; i++) {
			L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
		}

		if (this.options.trackResize) {
			L.DomEvent[onOff](window, 'resize', this._onResize, this);
		}
	},

	_onResize: function () {
		L.Util.cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = L.Util.requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this, false, this._container);
	},

	_onMouseClick: function (e) {
		if (!this._loaded || (!e._simulated &&
		        ((this.dragging && this.dragging.moved()) ||
		         (this.boxZoom  && this.boxZoom.moved()))) ||
		            L.DomEvent._skipped(e)) { return; }

		this.fire('preclick');
		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this._loaded || L.DomEvent._skipped(e)) { return; }

		var type = e.type;

		type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

		if (!this.hasEventListeners(type)) { return; }

		if (type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}

		var containerPoint = this.mouseEventToContainerPoint(e),
		    layerPoint = this.containerPointToLayerPoint(containerPoint),
		    latlng = this.layerPointToLatLng(layerPoint);

		this.fire(type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});
	},

	_onTileLayerLoad: function () {
		this._tileLayersToLoad--;
		if (this._tileLayersNum && !this._tileLayersToLoad) {
			this.fire('tilelayersload');
		}
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, this);
		} else {
			this.on('load', callback, context);
		}
		return this;
	},

	_layerAdd: function (layer) {
		layer.onAdd(this);
		this.fire('layeradd', {layer: layer});
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return L.DomUtil.getPosition(this._mapPane);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function () {
		return this.getPixelOrigin().subtract(this._getMapPanePos());
	},

	_getNewTopLeftPoint: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		// TODO round on display, not calculation to increase precision?
		return this.project(center, zoom)._subtract(viewHalf)._round();
	},

	_latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
		var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
		return this.project(latlng, newZoom)._subtract(topLeft);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
		    seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),

		    dx = this._rebound(nwOffset.x, -seOffset.x),
		    dy = this._rebound(nwOffset.y, -seOffset.y);

		return new L.Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom();

		return Math.max(min, Math.min(max, zoom));
	}
});

L.map = function (id, options) {
	return new L.Map(id, options);
};


/*
 * Mercator projection that takes into account that the Earth is not a perfect sphere.
 * Less popular than spherical mercator; used by projections like EPSG:3395.
 */

L.Projection.Mercator = {
	MAX_LATITUDE: 85.0840591556,

	R_MINOR: 6356752.314245179,
	R_MAJOR: 6378137,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    x = latlng.lng * d * r,
		    y = lat * d,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1.0 - tmp * tmp),
		    con = eccent * Math.sin(y);

		con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

		var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
		y = -r * Math.log(ts);

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    lng = point.x * d / r,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1 - (tmp * tmp)),
		    ts = Math.exp(- point.y / r),
		    phi = (Math.PI / 2) - 2 * Math.atan(ts),
		    numIter = 15,
		    tol = 1e-7,
		    i = numIter,
		    dphi = 0.1,
		    con;

		while ((Math.abs(dphi) > tol) && (--i > 0)) {
			con = eccent * Math.sin(phi);
			dphi = (Math.PI / 2) - 2 * Math.atan(ts *
			            Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
			phi += dphi;
		}

		return new L.LatLng(phi * d, lng);
	}
};



L.CRS.EPSG3395 = L.extend({}, L.CRS, {
	code: 'EPSG:3395',

	projection: L.Projection.Mercator,

	transformation: (function () {
		var m = L.Projection.Mercator,
		    r = m.R_MAJOR,
		    scale = 0.5 / (Math.PI * r);

		return new L.Transformation(scale, 0.5, -scale, 0.5);
	}())
});


/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

L.TileLayer = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		zoomOffset: 0,
		opacity: 1,
		/*
		maxNativeZoom: null,
		zIndex: null,
		tms: false,
		continuousWorld: false,
		noWrap: false,
		zoomReverse: false,
		detectRetina: false,
		reuseTiles: false,
		bounds: false,
		*/
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		if (options.bounds) {
			options.bounds = L.latLngBounds(options.bounds);
		}

		this._url = url;

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
	},

	onAdd: function (map) {
		this._map = map;
		this._animated = map._zoomAnimated;

		// create a container div for tiles
		this._initContainer();

		// set up events
		map.on({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.on({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
			map.on('move', this._limitedUpdate, this);
		}

		this._reset();
		this._update();
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		this._container.parentNode.removeChild(this._container);

		map.off({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.off({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			map.off('move', this._limitedUpdate, this);
		}

		this._container = null;
		this._map = null;
	},

	bringToFront: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.appendChild(this._container);
			this._setAutoZIndex(pane, Math.max);
		}

		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.insertBefore(this._container, pane.firstChild);
			this._setAutoZIndex(pane, Math.min);
		}

		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getContainer: function () {
		return this._container;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	setUrl: function (url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}
		return this;
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (pane, compare) {

		var layers = pane.children,
		    edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
		    zIndex, i, len;

		for (i = 0, len = layers.length; i < len; i++) {

			if (layers[i] !== this._container) {
				zIndex = parseInt(layers[i].style.zIndex, 10);

				if (!isNaN(zIndex)) {
					edgeZIndex = compare(edgeZIndex, zIndex);
				}
			}
		}

		this.options.zIndex = this._container.style.zIndex =
		        (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
	},

	_updateOpacity: function () {
		var i,
		    tiles = this._tiles;

		if (L.Browser.ielt9) {
			for (i in tiles) {
				L.DomUtil.setOpacity(tiles[i], this.options.opacity);
			}
		} else {
			L.DomUtil.setOpacity(this._container, this.options.opacity);
		}
	},

	_initContainer: function () {
		var tilePane = this._map._panes.tilePane;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-layer');

			this._updateZIndex();

			if (this._animated) {
				var className = 'leaflet-tile-container';

				this._bgBuffer = L.DomUtil.create('div', className, this._container);
				this._tileContainer = L.DomUtil.create('div', className, this._container);

			} else {
				this._tileContainer = this._container;
			}

			tilePane.appendChild(this._container);

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}
	},

	_reset: function (e) {
		for (var key in this._tiles) {
			this.fire('tileunload', {tile: this._tiles[key]});
		}

		this._tiles = {};
		this._tilesToLoad = 0;

		if (this.options.reuseTiles) {
			this._unusedTiles = [];
		}

		this._tileContainer.innerHTML = '';

		if (this._animated && e && e.hard) {
			this._clearBgBuffer();
		}

		this._initContainer();
	},

	_getTileSize: function () {
		var map = this._map,
		    zoom = map.getZoom() + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom,
		    tileSize = this.options.tileSize;

		if (zoomN && zoom > zoomN) {
			tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
		}

		return tileSize;
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_addTilesFromCenterOut: function (bounds) {
		var queue = [],
		    center = bounds.getCenter();

		var j, i, point;

		for (j = bounds.min.y; j <= bounds.max.y; j++) {
			for (i = bounds.min.x; i <= bounds.max.x; i++) {
				point = new L.Point(i, j);

				if (this._tileShouldBeLoaded(point)) {
					queue.push(point);
				}
			}
		}

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		// load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(center) - b.distanceTo(center);
		});

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._tilesToLoad) {
			this.fire('loading');
		}

		this._tilesToLoad += tilesToLoad;

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		this._tileContainer.appendChild(fragment);
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
		}

		if (options.bounds) {
			var tileSize = this._getTileSize(),
			    nwPoint = tilePoint.multiplyBy(tileSize),
			    sePoint = nwPoint.add([tileSize, tileSize]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},

	_removeOtherTiles: function (bounds) {
		var kArr, x, y, key;

		for (key in this._tiles) {
			kArr = key.split(':');
			x = parseInt(kArr[0], 10);
			y = parseInt(kArr[1], 10);

			// remove tile if it's out of bounds
			if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
				this._removeTile(key);
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];

		this.fire('tileunload', {tile: tile, url: tile.src});

		if (this.options.reuseTiles) {
			L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
			this._unusedTiles.push(tile);

		} else if (tile.parentNode === this._tileContainer) {
			this._tileContainer.removeChild(tile);
		}

		// for https://github.com/CloudMade/Leaflet/issues/137
		if (!L.Browser.android) {
			tile.onload = null;
			tile.src = L.Util.emptyImageUrl;
		}

		delete this._tiles[key];
	},

	_addTile: function (tilePoint, container) {
		var tilePos = this._getTilePos(tilePoint);

		// get unused tile - or create a new tile
		var tile = this._getTile();

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint);

		if (tile.parentNode !== this._tileContainer) {
			container.appendChild(tile);
		}
	},

	_getZoomForUrl: function () {

		var options = this.options,
		    zoom = this._map.getZoom();

		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom;
		}

		zoom += options.zoomOffset;

		return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
	},

	_getTilePos: function (tilePoint) {
		var origin = this._map.getPixelOrigin(),
		    tileSize = this._getTileSize();

		return tilePoint.multiplyBy(tileSize).subtract(origin);
	},

	// image-specific code (override to implement e.g. Canvas or SVG tile layer)

	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
	},

	_getWrapTileNum: function () {
		var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_adjustTilePoint: function (tilePoint) {

		var limit = this._getWrapTileNum();

		// wrap tile coordinates
		if (!this.options.continuousWorld && !this.options.noWrap) {
			tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
		}

		if (this.options.tms) {
			tilePoint.y = limit.y - tilePoint.y - 1;
		}

		tilePoint.z = this._getZoomForUrl();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getTile: function () {
		if (this.options.reuseTiles && this._unusedTiles.length > 0) {
			var tile = this._unusedTiles.pop();
			this._resetTile(tile);
			return tile;
		}
		return this._createTile();
	},

	// Override if data stored on a tile needs to be cleaned up before reuse
	_resetTile: function (/*tile*/) {},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		tile.style.width = tile.style.height = this._getTileSize() + 'px';
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		this._adjustTilePoint(tilePoint);
		tile.src     = this.getTileUrl(tilePoint);

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	},

	_tileLoaded: function () {
		this._tilesToLoad--;

		if (this._animated) {
			L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
		}

		if (!this._tilesToLoad) {
			this.fire('load');

			if (this._animated) {
				// clear scaled tiles after all new tiles are loaded (for performance)
				clearTimeout(this._clearBgBufferTimer);
				this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
			}
		}
	},

	_tileOnLoad: function () {
		var layer = this._layer;

		//Only if we are loading an actual image
		if (this.src !== L.Util.emptyImageUrl) {
			L.DomUtil.addClass(this, 'leaflet-tile-loaded');

			layer.fire('tileload', {
				tile: this,
				url: this.src
			});
		}

		layer._tileLoaded();
	},

	_tileOnError: function () {
		var layer = this._layer;

		layer.fire('tileerror', {
			tile: this,
			url: this.src
		});

		var newUrl = layer.options.errorTileUrl;
		if (newUrl) {
			this.src = newUrl;
		}

		layer._tileLoaded();
	}
});

L.tileLayer = function (url, options) {
	return new L.TileLayer(url, options);
};


/*
 * L.TileLayer.WMS is used for putting WMS tile layers on the map.
 */

L.TileLayer.WMS = L.TileLayer.extend({

	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/jpeg',
		transparent: false
	},

	initialize: function (url, options) { // (String, Object)

		this._url = url;

		var wmsParams = L.extend({}, this.defaultWmsParams),
		    tileSize = options.tileSize || this.options.tileSize;

		if (options.detectRetina && L.Browser.retina) {
			wmsParams.width = wmsParams.height = tileSize * 2;
		} else {
			wmsParams.width = wmsParams.height = tileSize;
		}

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i) && i !== 'crs') {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.setOptions(this, options);
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;

		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		L.TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (tilePoint) { // (Point, Number) -> String

		var map = this._map,
		    tileSize = this.options.tileSize,

		    nwPoint = tilePoint.multiplyBy(tileSize),
		    sePoint = nwPoint.add([tileSize, tileSize]),

		    nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
		    se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
		    bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
		        [se.y, nw.x, nw.y, se.x].join(',') :
		        [nw.x, se.y, se.x, nw.y].join(','),

		    url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

		return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
	},

	setParams: function (params, noRedraw) {

		L.extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});

L.tileLayer.wms = function (url, options) {
	return new L.TileLayer.WMS(url, options);
};


/*
 * L.TileLayer.Canvas is a class that you can use as a base for creating
 * dynamically drawn Canvas-based tile layers.
 */

L.TileLayer.Canvas = L.TileLayer.extend({
	options: {
		async: false
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}

		for (var i in this._tiles) {
			this._redrawTile(this._tiles[i]);
		}
		return this;
	},

	_redrawTile: function (tile) {
		this.drawTile(tile, tile._tilePoint, this._map._zoom);
	},

	_createTile: function () {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		tile.width = tile.height = this.options.tileSize;
		tile.onselectstart = tile.onmousemove = L.Util.falseFn;
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer = this;
		tile._tilePoint = tilePoint;

		this._redrawTile(tile);

		if (!this.options.async) {
			this.tileDrawn(tile);
		}
	},

	drawTile: function (/*tile, tilePoint*/) {
		// override with rendering code
	},

	tileDrawn: function (tile) {
		this._tileOnLoad.call(tile);
	}
});


L.tileLayer.canvas = function (options) {
	return new L.TileLayer.Canvas(options);
};


/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.ImageOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._image) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._image);

		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._image) {
			this._map._panes.overlayPane.appendChild(this._image);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._image) {
			pane.insertBefore(this._image, pane.firstChild);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this._image.src = this._url;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	_initImage: function () {
		this._image = L.DomUtil.create('img', 'leaflet-image-layer');

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._image, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			src: this._url
		});
	},

	_animateZoom: function (e) {
		var map = this._map,
		    image = this._image,
		    scale = map.getZoomScale(e.zoom),
		    nw = this._bounds.getNorthWest(),
		    se = this._bounds.getSouthEast(),

		    topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
		    size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
		    origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

		image.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
	},

	_reset: function () {
		var image   = this._image,
		    topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		    size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

		L.DomUtil.setPosition(image, topLeft);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_onImageLoad: function () {
		this.fire('load');
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});

L.imageOverlay = function (url, bounds, options) {
	return new L.ImageOverlay(url, bounds, options);
};


/*
 * L.Icon is an image-based icon class that you can use with L.Marker for custom markers.
 */

L.Icon = L.Class.extend({
	options: {
		/*
		iconUrl: (String) (required)
		iconRetinaUrl: (String) (optional, used for retina devices if detected)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (String) (no shadow by default)
		shadowRetinaUrl: (String) (optional, used for retina devices if detected)
		shadowSize: (Point)
		shadowAnchor: (Point)
		*/
		className: ''
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img;
		if (!oldIcon || oldIcon.tagName !== 'IMG') {
			img = this._createImg(src);
		} else {
			img = this._createImg(src, oldIcon);
		}
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options,
		    size = L.point(options[name + 'Size']),
		    anchor;

		if (name === 'shadow') {
			anchor = L.point(options.shadowAnchor || options.iconAnchor);
		} else {
			anchor = L.point(options.iconAnchor);
		}

		if (!anchor && size) {
			anchor = size.divideBy(2, true);
		}

		img.className = 'leaflet-marker-' + name + ' ' + options.className;

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
			return this.options[name + 'RetinaUrl'];
		}
		return this.options[name + 'Url'];
	}
});

L.icon = function (options) {
	return new L.Icon(options);
};


/*
 * L.Icon.Default is the blue marker icon used by default in Leaflet.
 */

L.Icon.Default = L.Icon.extend({

	options: {
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],

		shadowSize: [41, 41]
	},

	_getIconUrl: function (name) {
		var key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		if (L.Browser.retina && name === 'icon') {
			name += '-2x';
		}

		var path = L.Icon.Default.imagePath;

		if (!path) {
			throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
		}

		return path + '/marker-' + name + '.png';
	}
});

L.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, matches, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src;
		matches = src.match(leafletRe);

		if (matches) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());


/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		icon: new L.Icon.Default(),
		title: '',
		alt: '',
		clickable: true,
		draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		riseOnHover: false,
		riseOffset: 250
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	onAdd: function (map) {
		this._map = map;

		map.on('viewreset', this.update, this);

		this._initIcon();
		this.update();
		this.fire('add');

		if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
			map.on('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		if (this.dragging) {
			this.dragging.disable();
		}

		this._removeIcon();
		this._removeShadow();

		this.fire('remove');

		map.off({
			'viewreset': this.update,
			'zoomanim': this._animateZoom
		}, this);

		this._map = null;
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);

		this.update();

		return this.fire('move', { latlng: this._latlng });
	},

	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		this.update();

		return this;
	},

	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup);
		}

		return this;
	},

	update: function () {
		if (this._icon) {
			this._setPos(this._map.latLngToLayerPoint(this._latlng).round());
		}
		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    map = this._map,
		    animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
		    classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

		var icon = options.icon.createIcon(this._icon),
			addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}

			if (options.alt) {
				icon.alt = options.alt;
			}
		}

		L.DomUtil.addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		this._initInteraction();

		if (options.riseOnHover) {
			L.DomEvent
				.on(icon, 'mouseover', this._bringToFront, this)
				.on(icon, 'mouseout', this._resetZIndex, this);
		}

		var newShadow = options.icon.createShadow(this._shadow),
			addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			L.DomUtil.addClass(newShadow, classToAdd);
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		var panes = this._map._panes;

		if (addIcon) {
			panes.markerPane.appendChild(this._icon);
		}

		if (newShadow && addShadow) {
			panes.shadowPane.appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			L.DomEvent
			    .off(this._icon, 'mouseover', this._bringToFront)
			    .off(this._icon, 'mouseout', this._resetZIndex);
		}

		this._map._panes.markerPane.removeChild(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			this._map._panes.shadowPane.removeChild(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		L.DomUtil.setPosition(this._icon, pos);

		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.clickable) { return; }

		// TODO refactor into something shared with Map/Path/etc. to DRY it up

		var icon = this._icon,
		    events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(icon, 'leaflet-clickable');
		L.DomEvent.on(icon, 'click', this._onMouseClick, this);
		L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
		}

		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},

	_onMouseClick: function (e) {
		var wasDragged = this.dragging && this.dragging.moved();

		if (this.hasEventListeners(e.type) || wasDragged) {
			L.DomEvent.stopPropagation(e);
		}

		if (wasDragged) { return; }

		if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});
	},

	_onKeyPress: function (e) {
		if (e.keyCode === 13) {
			this.fire('click', {
				originalEvent: e,
				latlng: this._latlng
			});
		}
	},

	_fireMouseEvent: function (e) {

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._icon, this.options.opacity);
		if (this._shadow) {
			L.DomUtil.setOpacity(this._shadow, this.options.opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	}
});

L.marker = function (latlng, options) {
	return new L.Marker(latlng, options);
};


/*
 * L.DivIcon is a lightweight HTML-based icon class (as opposed to the image-based L.Icon)
 * to use with L.Marker.
 */

L.DivIcon = L.Icon.extend({
	options: {
		iconSize: [12, 12], // also can be set through CSS
		/*
		iconAnchor: (Point)
		popupAnchor: (Point)
		html: (String)
		bgPos: (Point)
		*/
		className: 'leaflet-div-icon',
		html: false
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		if (options.html !== false) {
			div.innerHTML = options.html;
		} else {
			div.innerHTML = '';
		}

		if (options.bgPos) {
			div.style.backgroundPosition =
			        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}

		this._setIconStyles(div, 'icon');
		return div;
	},

	createShadow: function () {
		return null;
	}
});

L.divIcon = function (options) {
	return new L.DivIcon(options);
};


/*
 * L.Popup is used for displaying popups on the map.
 */

L.Map.mergeOptions({
	closePopupOnClick: true
});

L.Popup = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minWidth: 50,
		maxWidth: 300,
		// maxHeight: null,
		autoPan: true,
		closeButton: true,
		offset: [0, 7],
		autoPanPadding: [5, 5],
		// autoPanPaddingTopLeft: null,
		// autoPanPaddingBottomRight: null,
		keepInView: false,
		className: '',
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initLayout();
		}

		var animFade = map.options.fadeAnimation;

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 0);
		}
		map._panes.popupPane.appendChild(this._container);

		map.on(this._getEvents(), this);

		this.update();

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 1);
		}

		this.fire('open');

		map.fire('popupopen', {popup: this});

		if (this._source) {
			this._source.fire('popupopen', {popup: this});
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onRemove: function (map) {
		map._panes.popupPane.removeChild(this._container);

		L.Util.falseFn(this._container.offsetWidth); // force reflow

		map.off(this._getEvents(), this);

		if (map.options.fadeAnimation) {
			L.DomUtil.setOpacity(this._container, 0);
		}

		this._map = null;

		this.fire('close');

		map.fire('popupclose', {popup: this});

		if (this._source) {
			this._source.fire('popupclose', {popup: this});
		}
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	_getEvents: function () {
		var events = {
			viewreset: this._updatePosition
		};

		if (this._animated) {
			events.zoomanim = this._zoomAnimation;
		}
		if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}
		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
			containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' +
			        (this._animated ? 'animated' : 'hide'),
			container = this._container = L.DomUtil.create('div', containerClass),
			closeButton;

		if (this.options.closeButton) {
			closeButton = this._closeButton =
			        L.DomUtil.create('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';
			L.DomEvent.disableClickPropagation(closeButton);

			L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
		}

		var wrapper = this._wrapper =
		        L.DomUtil.create('div', prefix + '-content-wrapper', container);
		L.DomEvent.disableClickPropagation(wrapper);

		this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

		L.DomEvent.disableScrollPropagation(this._contentNode);
		L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

		this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
		this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
	},

	_updateContent: function () {
		if (!this._content) { return; }

		if (typeof this._content === 'string') {
			this._contentNode.innerHTML = this._content;
		} else {
			while (this._contentNode.hasChildNodes()) {
				this._contentNode.removeChild(this._contentNode.firstChild);
			}
			this._contentNode.appendChild(this._content);
		}
		this.fire('contentupdate');
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			L.DomUtil.addClass(container, scrolledClass);
		} else {
			L.DomUtil.removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    animated = this._animated,
		    offset = L.point(this.options.offset);

		if (animated) {
			L.DomUtil.setPosition(this._container, pos);
		}

		this._containerBottom = -offset.y - (animated ? 0 : pos.y);
		this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = this._containerBottom + 'px';
		this._container.style.left = this._containerLeft + 'px';
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);

		L.DomUtil.setPosition(this._container, pos);
	},

	_adjustPan: function () {
		if (!this.options.autoPan) { return; }

		var map = this._map,
		    containerHeight = this._container.offsetHeight,
		    containerWidth = this._containerWidth,

		    layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

		if (this._animated) {
			layerPos._add(L.DomUtil.getPosition(this._container));
		}

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = L.point(this.options.autoPanPadding),
		    paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		L.DomEvent.stop(e);
	}
});

L.popup = function (options, source) {
	return new L.Popup(options, source);
};


L.Map.include({
	openPopup: function (popup, latlng, options) { // (Popup) or (String || HTMLElement, LatLng[, Object])
		this.closePopup();

		if (!(popup instanceof L.Popup)) {
			var content = popup;

			popup = new L.Popup(options)
			    .setLatLng(latlng)
			    .setContent(content);
		}
		popup._isOpen = true;

		this._popup = popup;
		return this.addLayer(popup);
	},

	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
			popup._isOpen = false;
		}
		return this;
	}
});


/*
 * Popup extension to L.Marker, adding popup-related methods.
 */

L.Marker.include({
	openPopup: function () {
		if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
			this._popup.setLatLng(this._latlng);
			this._map.openPopup(this._popup);
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	togglePopup: function () {
		if (this._popup) {
			if (this._popup._isOpen) {
				this.closePopup();
			} else {
				this.openPopup();
			}
		}
		return this;
	},

	bindPopup: function (content, options) {
		var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

		anchor = anchor.add(L.Popup.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.extend({offset: anchor}, options);

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this.togglePopup, this)
			    .on('remove', this.closePopup, this)
			    .on('move', this._movePopup, this);
			this._popupHandlersAdded = true;
		}

		if (content instanceof L.Popup) {
			L.setOptions(content, options);
			this._popup = content;
			content._source = this;
		} else {
			this._popup = new L.Popup(options, this)
				.setContent(content);
		}

		return this;
	},

	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this.togglePopup, this)
			    .off('remove', this.closePopup, this)
			    .off('move', this._movePopup, this);
			this._popupHandlersAdded = false;
		}
		return this;
	},

	getPopup: function () {
		return this._popup;
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	}
});


/*
 * L.LayerGroup is a class to combine several layers into one so that
 * you can manipulate the group (e.g. add/remove it) as one layer.
 */

L.LayerGroup = L.Class.extend({
	initialize: function (layers) {
		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	clearLayers: function () {
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this._map = map;
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
		this._map = null;
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	getLayer: function (id) {
		return this._layers[id];
	},

	getLayers: function () {
		var layers = [];

		for (var i in this._layers) {
			layers.push(this._layers[i]);
		}
		return layers;
	},

	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	getLayerId: function (layer) {
		return L.stamp(layer);
	}
});

L.layerGroup = function (layers) {
	return new L.LayerGroup(layers);
};


/*
 * L.FeatureGroup extends L.LayerGroup by introducing mouse events and additional methods
 * shared between a group of interactive layers (like vectors or markers).
 */

L.FeatureGroup = L.LayerGroup.extend({
	includes: L.Mixin.Events,

	statics: {
		EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'
	},

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		if ('on' in layer) {
			layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
		}

		L.LayerGroup.prototype.addLayer.call(this, layer);

		if (this._popupContent && layer.bindPopup) {
			layer.bindPopup(this._popupContent, this._popupOptions);
		}

		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		if ('off' in layer) {
			layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);
		}

		L.LayerGroup.prototype.removeLayer.call(this, layer);

		if (this._popupContent) {
			this.invoke('unbindPopup');
		}

		return this.fire('layerremove', {layer: layer});
	},

	bindPopup: function (content, options) {
		this._popupContent = content;
		this._popupOptions = options;
		return this.invoke('bindPopup', content, options);
	},

	openPopup: function (latlng) {
		// open popup on the first layer
		for (var id in this._layers) {
			this._layers[id].openPopup(latlng);
			break;
		}
		return this;
	},

	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	getBounds: function () {
		var bounds = new L.LatLngBounds();

		this.eachLayer(function (layer) {
			bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
		});

		return bounds;
	},

	_propagateEvent: function (e) {
		e = L.extend({
			layer: e.target,
			target: this
		}, e);
		this.fire(e.type, e);
	}
});

L.featureGroup = function (layers) {
	return new L.FeatureGroup(layers);
};


/*
 * L.Path is a base class for rendering vector paths on a map. Inherited by Polyline, Circle, etc.
 */

L.Path = L.Class.extend({
	includes: [L.Mixin.Events],

	statics: {
		// how much to extend the clip area around the map view
		// (relative to its size, e.g. 0.5 is half the screen in each direction)
		// set it so that SVG element doesn't exceed 1280px (vectors flicker on dragend if it is)
		CLIP_PADDING: (function () {
			var max = L.Browser.mobile ? 1280 : 2000,
			    target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
			return Math.max(0, Math.min(0.5, target));
		})()
	},

	options: {
		stroke: true,
		color: '#0033ff',
		dashArray: null,
		lineCap: null,
		lineJoin: null,
		weight: 5,
		opacity: 0.5,

		fill: false,
		fillColor: null, //same as color by default
		fillOpacity: 0.2,

		clickable: true
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initElements();
			this._initEvents();
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		map._pathRoot.removeChild(this._container);

		// Need to fire remove event before we set _map to null as the event hooks might need the object
		this.fire('remove');
		this._map = null;

		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}

		map.off({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	projectLatlngs: function () {
		// do all projection stuff here
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._updatePath();
		}
		return this;
	}
});

L.Map.include({
	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this.getSize(),
		    panePos = L.DomUtil.getPosition(this._mapPane),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	}
});


/*
 * Extends L.Path with SVG-specific rendering code.
 */

L.Path.SVG_NS = 'http://www.w3.org/2000/svg';

L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);

L.Path = L.Path.extend({
	statics: {
		SVG: L.Browser.svg
	},

	bringToFront: function () {
		var root = this._map._pathRoot,
		    path = this._container;

		if (path && root.lastChild !== path) {
			root.appendChild(path);
		}
		return this;
	},

	bringToBack: function () {
		var root = this._map._pathRoot,
		    path = this._container,
		    first = root.firstChild;

		if (path && first !== path) {
			root.insertBefore(path, first);
		}
		return this;
	},

	getPathString: function () {
		// form path string here
	},

	_createElement: function (name) {
		return document.createElementNS(L.Path.SVG_NS, name);
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	_initPath: function () {
		this._container = this._createElement('g');

		this._path = this._createElement('path');

		if (this.options.className) {
			L.DomUtil.addClass(this._path, this.options.className);
		}

		this._container.appendChild(this._path);
	},

	_initStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke-linejoin', 'round');
			this._path.setAttribute('stroke-linecap', 'round');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill-rule', 'evenodd');
		}
		if (this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', this.options.pointerEvents);
		}
		if (!this.options.clickable && !this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', 'none');
		}
		this._updateStyle();
	},

	_updateStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke', this.options.color);
			this._path.setAttribute('stroke-opacity', this.options.opacity);
			this._path.setAttribute('stroke-width', this.options.weight);
			if (this.options.dashArray) {
				this._path.setAttribute('stroke-dasharray', this.options.dashArray);
			} else {
				this._path.removeAttribute('stroke-dasharray');
			}
			if (this.options.lineCap) {
				this._path.setAttribute('stroke-linecap', this.options.lineCap);
			}
			if (this.options.lineJoin) {
				this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
			}
		} else {
			this._path.setAttribute('stroke', 'none');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill', this.options.fillColor || this.options.color);
			this._path.setAttribute('fill-opacity', this.options.fillOpacity);
		} else {
			this._path.setAttribute('fill', 'none');
		}
	},

	_updatePath: function () {
		var str = this.getPathString();
		if (!str) {
			// fix webkit empty string parsing bug
			str = 'M0 0';
		}
		this._path.setAttribute('d', str);
	},

	// TODO remove duplication with L.Map
	_initEvents: function () {
		if (this.options.clickable) {
			if (L.Browser.svg || !L.Browser.vml) {
				L.DomUtil.addClass(this._path, 'leaflet-clickable');
			}

			L.DomEvent.on(this._container, 'click', this._onMouseClick, this);

			var events = ['dblclick', 'mousedown', 'mouseover',
			              'mouseout', 'mousemove', 'contextmenu'];
			for (var i = 0; i < events.length; i++) {
				L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
			}
		}
	},

	_onMouseClick: function (e) {
		if (this._map.dragging && this._map.dragging.moved()) { return; }

		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this._map || !this.hasEventListeners(e.type)) { return; }

		var map = this._map,
		    containerPoint = map.mouseEventToContainerPoint(e),
		    layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this.fire(e.type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});

		if (e.type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousemove') {
			L.DomEvent.stopPropagation(e);
		}
	}
});

L.Map.include({
	_initPathRoot: function () {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._panes.overlayPane.appendChild(this._pathRoot);

			if (this.options.zoomAnimation && L.Browser.any3d) {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');

				this.on({
					'zoomanim': this._animatePathZoom,
					'zoomend': this._endPathZoom
				});
			} else {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
			}

			this.on('moveend', this._updateSvgViewport);
			this._updateSvgViewport();
		}
	},

	_animatePathZoom: function (e) {
		var scale = this.getZoomScale(e.zoom),
		    offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

		this._pathRoot.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';

		this._pathZooming = true;
	},

	_endPathZoom: function () {
		this._pathZooming = false;
	},

	_updateSvgViewport: function () {

		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._pathRoot,
		    pane = this._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(root);
		}

		L.DomUtil.setPosition(root, min);
		root.setAttribute('width', width);
		root.setAttribute('height', height);
		root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(root);
		}
	}
});


/*
 * Popup extension to L.Path (polylines, polygons, circles), adding popup-related methods.
 */

L.Path.include({

	bindPopup: function (content, options) {

		if (content instanceof L.Popup) {
			this._popup = content;
		} else {
			if (!this._popup || options) {
				this._popup = new L.Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this._openPopup, this)
			    .on('remove', this.closePopup, this);

			this._popupHandlersAdded = true;
		}

		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this._openPopup)
			    .off('remove', this.closePopup);

			this._popupHandlersAdded = false;
		}
		return this;
	},

	openPopup: function (latlng) {

		if (this._popup) {
			// open the popup from one of the path's points if not specified
			latlng = latlng || this._latlng ||
			         this._latlngs[Math.floor(this._latlngs.length / 2)];

			this._openPopup({latlng: latlng});
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	_openPopup: function (e) {
		this._popup.setLatLng(e.latlng);
		this._map.openPopup(this._popup);
	}
});


/*
 * Vector rendering for IE6-8 through VML.
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */

L.Browser.vml = !L.Browser.svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());

L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
	statics: {
		VML: true,
		CLIP_PADDING: 0.02
	},

	_createElement: (function () {
		try {
			document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
			return function (name) {
				return document.createElement('<lvml:' + name + ' class="lvml">');
			};
		} catch (e) {
			return function (name) {
				return document.createElement(
				        '<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
			};
		}
	}()),

	_initPath: function () {
		var container = this._container = this._createElement('shape');

		L.DomUtil.addClass(container, 'leaflet-vml-shape' +
			(this.options.className ? ' ' + this.options.className : ''));

		if (this.options.clickable) {
			L.DomUtil.addClass(container, 'leaflet-clickable');
		}

		container.coordsize = '1 1';

		this._path = this._createElement('path');
		container.appendChild(this._path);

		this._map._pathRoot.appendChild(container);
	},

	_initStyle: function () {
		this._updateStyle();
	},

	_updateStyle: function () {
		var stroke = this._stroke,
		    fill = this._fill,
		    options = this.options,
		    container = this._container;

		container.stroked = options.stroke;
		container.filled = options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = this._stroke = this._createElement('stroke');
				stroke.endcap = 'round';
				container.appendChild(stroke);
			}
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = L.Util.isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			if (options.lineCap) {
				stroke.endcap = options.lineCap.replace('butt', 'flat');
			}
			if (options.lineJoin) {
				stroke.joinstyle = options.lineJoin;
			}

		} else if (stroke) {
			container.removeChild(stroke);
			this._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = this._fill = this._createElement('fill');
				container.appendChild(fill);
			}
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			this._fill = null;
		}
	},

	_updatePath: function () {
		var style = this._container.style;

		style.display = 'none';
		this._path.v = this.getPathString() + ' '; // the space fixes IE empty path string bug
		style.display = '';
	}
});

L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {
	_initPathRoot: function () {
		if (this._pathRoot) { return; }

		var root = this._pathRoot = document.createElement('div');
		root.className = 'leaflet-vml-container';
		this._panes.overlayPane.appendChild(root);

		this.on('moveend', this._updatePathViewport);
		this._updatePathViewport();
	}
});


/*
 * Vector rendering for all browsers that support canvas.
 */

L.Browser.canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
	statics: {
		//CLIP_PADDING: 0.02, // not sure if there's a need to set it to a small value
		CANVAS: true,
		SVG: false
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._requestUpdate();
		}
		return this;
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._map) {
			this._updateStyle();
			this._requestUpdate();
		}
		return this;
	},

	onRemove: function (map) {
		map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

		if (this.options.clickable) {
			this._map.off('click', this._onClick, this);
			this._map.off('mousemove', this._onMouseMove, this);
		}

		this._requestUpdate();
		
		this.fire('remove');
		this._map = null;
	},

	_requestUpdate: function () {
		if (this._map && !L.Path._updateRequest) {
			L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
		}
	},

	_fireMapMoveEnd: function () {
		L.Path._updateRequest = null;
		this.fire('moveend');
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._ctx = this._map._canvasCtx;
	},

	_updateStyle: function () {
		var options = this.options;

		if (options.stroke) {
			this._ctx.lineWidth = options.weight;
			this._ctx.strokeStyle = options.color;
		}
		if (options.fill) {
			this._ctx.fillStyle = options.fillColor || options.color;
		}

		if (options.lineCap) {
			this._ctx.lineCap = options.lineCap;
		}
		if (options.lineJoin) {
			this._ctx.lineJoin = options.lineJoin;
		}
	},

	_drawPath: function () {
		var i, j, len, len2, point, drawMethod;

		this._ctx.beginPath();

		for (i = 0, len = this._parts.length; i < len; i++) {
			for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
				point = this._parts[i][j];
				drawMethod = (j === 0 ? 'move' : 'line') + 'To';

				this._ctx[drawMethod](point.x, point.y);
			}
			// TODO refactor ugly hack
			if (this instanceof L.Polygon) {
				this._ctx.closePath();
			}
		}
	},

	_checkIfEmpty: function () {
		return !this._parts.length;
	},

	_updatePath: function () {
		if (this._checkIfEmpty()) { return; }

		var ctx = this._ctx,
		    options = this.options;

		this._drawPath();
		ctx.save();
		this._updateStyle();

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fill(options.fillRule || 'evenodd');
		}

		if (options.stroke) {
			ctx.globalAlpha = options.opacity;
			ctx.stroke();
		}

		ctx.restore();

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_initEvents: function () {
		if (this.options.clickable) {
			this._map.on('mousemove', this._onMouseMove, this);
			this._map.on('click', this._onClick, this);
			this._map.on('dblclick contextmenu', this._fireMouseEvent, this);
		}
	},

	_onClick: function (e) {
		if (this._containsPoint(e.layerPoint)) {
			this.fire('click', e);
		}
	},
	
	_fireMouseEvent: function (e) {
		if (this._containsPoint(e.layerPoint)) {
			this.fire(e.type, e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map._animatingZoom) { return; }

		// TODO don't do on each move
		if (this._containsPoint(e.layerPoint)) {
			this._ctx.canvas.style.cursor = 'pointer';
			this._mouseInside = true;
			this.fire('mouseover', e);

		} else if (this._mouseInside) {
			this._ctx.canvas.style.cursor = '';
			this._mouseInside = false;
			this.fire('mouseout', e);
		}
	}
});

L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
	_initPathRoot: function () {
		var root = this._pathRoot,
		    ctx;

		if (!root) {
			root = this._pathRoot = document.createElement('canvas');
			root.style.position = 'absolute';
			ctx = this._canvasCtx = root.getContext('2d');

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			this._panes.overlayPane.appendChild(root);

			if (this.options.zoomAnimation) {
				this._pathRoot.className = 'leaflet-zoom-animated';
				this.on('zoomanim', this._animatePathZoom);
				this.on('zoomend', this._endPathZoom);
			}
			this.on('moveend', this._updateCanvasViewport);
			this._updateCanvasViewport();
		}
	},

	_updateCanvasViewport: function () {
		// don't redraw while zooming. See _updateSvgViewport for more details
		if (this._pathZooming) { return; }
		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    size = vp.max.subtract(min),
		    root = this._pathRoot;

		//TODO check if this works properly on mobile webkit
		L.DomUtil.setPosition(root, min);
		root.width = size.x;
		root.height = size.y;
		root.getContext('2d').translate(-min.x, -min.y);
	}
});


/*
 * L.LineUtil contains different utility functions for line segments
 * and polylines (clipping, simplification, distances, etc.)
 */

/*jshint bitwise:false */ // allow bitwise operations for this file

L.LineUtil = {

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	simplify: function (/*Point[]*/ points, /*Number*/ tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		// stage 1: vertex reduction
		points = this._reducePoints(points, sqTolerance);

		// stage 2: Douglas-Peucker simplification
		points = this._simplifyDP(points, sqTolerance);

		return points;
	},

	// distance from a point to a segment between two points
	pointToSegmentDistance:  function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
	},

	closestPointOnSegment: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return this._sqClosestPointOnSegment(p, p1, p2);
	},

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	_simplifyDP: function (points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len);

		markers[0] = markers[len - 1] = 1;

		this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
		    newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	},

	_simplifyDPStep: function (points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		    index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			this._simplifyDPStep(points, markers, sqTolerance, first, index);
			this._simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	},

	// reduce points that are too close to each other to a single point
	_reducePoints: function (points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	},

	// Cohen-Sutherland line clipping algorithm.
	// Used to avoid rendering parts of a polyline that are not currently visible.

	clipSegment: function (a, b, bounds, useLastCode) {
		var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
		    codeB = this._getBitCode(b, bounds),

		    codeOut, p, newCode;

		// save 2nd code to avoid calculating it on the next segment
		this._lastCode = codeB;

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) {
				return [a, b];
			// if a,b is outside the clip window (trivial reject)
			} else if (codeA & codeB) {
				return false;
			// other cases
			} else {
				codeOut = codeA || codeB;
				p = this._getEdgeIntersection(a, b, codeOut, bounds);
				newCode = this._getBitCode(p, bounds);

				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		}
	},

	_getEdgeIntersection: function (a, b, code, bounds) {
		var dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max;

		if (code & 8) { // top
			return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
		} else if (code & 4) { // bottom
			return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
		} else if (code & 2) { // right
			return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
		} else if (code & 1) { // left
			return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
		}
	},

	_getBitCode: function (/*Point*/ p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}
		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	},

	// square distance (to avoid unnecessary Math.sqrt calls)
	_sqDist: function (p1, p2) {
		var dx = p2.x - p1.x,
		    dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	},

	// return closest point on segment or distance to that point
	_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
		var x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
	}
};


/*
 * L.Polyline is used to display polylines on a map.
 */

L.Polyline = L.Path.extend({
	initialize: function (latlngs, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlngs = this._convertLatLngs(latlngs);
	},

	options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0,
		noClip: false
	},

	projectLatlngs: function () {
		this._originalPoints = [];

		for (var i = 0, len = this._latlngs.length; i < len; i++) {
			this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
		}
	},

	getPathString: function () {
		for (var i = 0, len = this._parts.length, str = ''; i < len; i++) {
			str += this._getPathPartStr(this._parts[i]);
		}
		return str;
	},

	getLatLngs: function () {
		return this._latlngs;
	},

	setLatLngs: function (latlngs) {
		this._latlngs = this._convertLatLngs(latlngs);
		return this.redraw();
	},

	addLatLng: function (latlng) {
		this._latlngs.push(L.latLng(latlng));
		return this.redraw();
	},

	spliceLatLngs: function () { // (Number index, Number howMany)
		var removed = [].splice.apply(this._latlngs, arguments);
		this._convertLatLngs(this._latlngs, true);
		this.redraw();
		return removed;
	},

	closestLayerPoint: function (p) {
		var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

		for (var j = 0, jLen = parts.length; j < jLen; j++) {
			var points = parts[j];
			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];
				var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	getBounds: function () {
		return new L.LatLngBounds(this.getLatLngs());
	},

	_convertLatLngs: function (latlngs, overwrite) {
		var i, len, target = overwrite ? latlngs : [];

		for (i = 0, len = latlngs.length; i < len; i++) {
			if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
				return;
			}
			target[i] = L.latLng(latlngs[i]);
		}
		return target;
	},

	_initEvents: function () {
		L.Path.prototype._initEvents.call(this);
	},

	_getPathPartStr: function (points) {
		var round = L.Path.VML;

		for (var j = 0, len2 = points.length, str = '', p; j < len2; j++) {
			p = points[j];
			if (round) {
				p._round();
			}
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}
		return str;
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._map._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},

	// simplify each clipped part of the polyline
	_simplifyPoints: function () {
		var parts = this._parts,
		    lu = L.LineUtil;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
		}
	},

	_updatePath: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();

		L.Path.prototype._updatePath.call(this);
	}
});

L.polyline = function (latlngs, options) {
	return new L.Polyline(latlngs, options);
};


/*
 * L.PolyUtil contains utility functions for polygons (clipping, etc.).
 */

/*jshint bitwise:false */ // allow bitwise operations here

L.PolyUtil = {};

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
L.PolyUtil.clipPolygon = function (points, bounds) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p,
	    lu = L.LineUtil;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = lu._getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = lu._getEdgeIntersection(b, a, edge, bounds);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = lu._getEdgeIntersection(b, a, edge, bounds);
				p._code = lu._getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
};


/*
 * L.Polygon is used to display polygons on a map.
 */

L.Polygon = L.Polyline.extend({
	options: {
		fill: true
	},

	initialize: function (latlngs, options) {
		L.Polyline.prototype.initialize.call(this, latlngs, options);
		this._initWithHoles(latlngs);
	},

	_initWithHoles: function (latlngs) {
		var i, len, hole;
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._latlngs = this._convertLatLngs(latlngs[0]);
			this._holes = latlngs.slice(1);

			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
				if (hole[0].equals(hole[hole.length - 1])) {
					hole.pop();
				}
			}
		}

		// filter out last point if its equal to the first one
		latlngs = this._latlngs;

		if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
			latlngs.pop();
		}
	},

	projectLatlngs: function () {
		L.Polyline.prototype.projectLatlngs.call(this);

		// project polygon holes points
		// TODO move this logic to Polyline to get rid of duplication
		this._holePoints = [];

		if (!this._holes) { return; }

		var i, j, len, len2;

		for (i = 0, len = this._holes.length; i < len; i++) {
			this._holePoints[i] = [];

			for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
				this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
			}
		}
	},

	setLatLngs: function (latlngs) {
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._initWithHoles(latlngs);
			return this.redraw();
		} else {
			return L.Polyline.prototype.setLatLngs.call(this, latlngs);
		}
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    newParts = [];

		this._parts = [points].concat(this._holePoints);

		if (this.options.noClip) { return; }

		for (var i = 0, len = this._parts.length; i < len; i++) {
			var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
			if (clipped.length) {
				newParts.push(clipped);
			}
		}

		this._parts = newParts;
	},

	_getPathPartStr: function (points) {
		var str = L.Polyline.prototype._getPathPartStr.call(this, points);
		return str + (L.Browser.svg ? 'z' : 'x');
	}
});

L.polygon = function (latlngs, options) {
	return new L.Polygon(latlngs, options);
};


/*
 * Contains L.MultiPolyline and L.MultiPolygon layers.
 */

(function () {
	function createMulti(Klass) {

		return L.FeatureGroup.extend({

			initialize: function (latlngs, options) {
				this._layers = {};
				this._options = options;
				this.setLatLngs(latlngs);
			},

			setLatLngs: function (latlngs) {
				var i = 0,
				    len = latlngs.length;

				this.eachLayer(function (layer) {
					if (i < len) {
						layer.setLatLngs(latlngs[i++]);
					} else {
						this.removeLayer(layer);
					}
				}, this);

				while (i < len) {
					this.addLayer(new Klass(latlngs[i++], this._options));
				}

				return this;
			},

			getLatLngs: function () {
				var latlngs = [];

				this.eachLayer(function (layer) {
					latlngs.push(layer.getLatLngs());
				});

				return latlngs;
			}
		});
	}

	L.MultiPolyline = createMulti(L.Polyline);
	L.MultiPolygon = createMulti(L.Polygon);

	L.multiPolyline = function (latlngs, options) {
		return new L.MultiPolyline(latlngs, options);
	};

	L.multiPolygon = function (latlngs, options) {
		return new L.MultiPolygon(latlngs, options);
	};
}());


/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

L.Rectangle = L.Polygon.extend({
	initialize: function (latLngBounds, options) {
		L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = L.latLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});

L.rectangle = function (latLngBounds, options) {
	return new L.Rectangle(latLngBounds, options);
};


/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 */

L.Circle = L.Path.extend({
	initialize: function (latlng, radius, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlng = L.latLng(latlng);
		this._mRadius = radius;
	},

	options: {
		fill: true
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		return this.redraw();
	},

	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	projectLatlngs: function () {
		var lngRadius = this._getLngRadius(),
		    latlng = this._latlng,
		    pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);

		this._point = this._map.latLngToLayerPoint(latlng);
		this._radius = Math.max(this._point.x - pointLeft.x, 1);
	},

	getBounds: function () {
		var lngRadius = this._getLngRadius(),
		    latRadius = (this._mRadius / 40075017) * 360,
		    latlng = this._latlng;

		return new L.LatLngBounds(
		        [latlng.lat - latRadius, latlng.lng - lngRadius],
		        [latlng.lat + latRadius, latlng.lng + lngRadius]);
	},

	getLatLng: function () {
		return this._latlng;
	},

	getPathString: function () {
		var p = this._point,
		    r = this._radius;

		if (this._checkIfEmpty()) {
			return '';
		}

		if (L.Browser.svg) {
			return 'M' + p.x + ',' + (p.y - r) +
			       'A' + r + ',' + r + ',0,1,1,' +
			       (p.x - 0.1) + ',' + (p.y - r) + ' z';
		} else {
			p._round();
			r = Math.round(r);
			return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
		}
	},

	getRadius: function () {
		return this._mRadius;
	},

	// TODO Earth hardcoded, move into projection code!

	_getLatRadius: function () {
		return (this._mRadius / 40075017) * 360;
	},

	_getLngRadius: function () {
		return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
	},

	_checkIfEmpty: function () {
		if (!this._map) {
			return false;
		}
		var vp = this._map._pathViewport,
		    r = this._radius,
		    p = this._point;

		return p.x - r > vp.max.x || p.y - r > vp.max.y ||
		       p.x + r < vp.min.x || p.y + r < vp.min.y;
	}
});

L.circle = function (latlng, radius, options) {
	return new L.Circle(latlng, radius, options);
};


/*
 * L.CircleMarker is a circle overlay with a permanent pixel radius.
 */

L.CircleMarker = L.Circle.extend({
	options: {
		radius: 10,
		weight: 2
	},

	initialize: function (latlng, options) {
		L.Circle.prototype.initialize.call(this, latlng, null, options);
		this._radius = this.options.radius;
	},

	projectLatlngs: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
	},

	_updateStyle : function () {
		L.Circle.prototype._updateStyle.call(this);
		this.setRadius(this.options.radius);
	},

	setLatLng: function (latlng) {
		L.Circle.prototype.setLatLng.call(this, latlng);
		if (this._popup && this._popup._isOpen) {
			this._popup.setLatLng(latlng);
		}
		return this;
	},

	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	getRadius: function () {
		return this._radius;
	}
});

L.circleMarker = function (latlng, options) {
	return new L.CircleMarker(latlng, options);
};


/*
 * Extends L.Polyline to be able to manually detect clicks on Canvas-rendered polylines.
 */

L.Polyline.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, dist, part,
		    w = this.options.weight / 2;

		if (L.Browser.touch) {
			w += 10; // polyline click tolerance on touch devices
		}

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) {
					continue;
				}

				dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);

				if (dist <= w) {
					return true;
				}
			}
		}
		return false;
	}
});


/*
 * Extends L.Polygon to be able to manually detect clicks on Canvas-rendered polygons.
 */

L.Polygon.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2,
		    i, j, k,
		    len, len2;

		// TODO optimization: check if within bounds first

		if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
			// click on polygon border
			return true;
		}

		// ray casting algorithm for detecting if point is in polygon

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) &&
						(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		return inside;
	}
});


/*
 * Extends L.Circle with Canvas-specific code.
 */

L.Circle.include(!L.Path.CANVAS ? {} : {
	_drawPath: function () {
		var p = this._point;
		this._ctx.beginPath();
		this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
	},

	_containsPoint: function (p) {
		var center = this._point,
		    w2 = this.options.stroke ? this.options.weight / 2 : 0;

		return (p.distanceTo(center) <= this._radius + w2);
	}
});


/*
 * CircleMarker canvas specific drawing parts.
 */

L.CircleMarker.include(!L.Path.CANVAS ? {} : {
	_updateStyle: function () {
		L.Path.prototype._updateStyle.call(this);
	}
});


/*
 * L.GeoJSON turns any GeoJSON data into a Leaflet layer.
 */

L.GeoJSON = L.FeatureGroup.extend({

	initialize: function (geojson, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	addData: function (geojson) {
		var features = L.Util.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// Only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(features[i]);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return; }

		var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = L.GeoJSON.asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	resetStyle: function (layer) {
		var style = this.options.style;
		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			this._setLayerStyle(layer, style);
		}
	},

	setStyle: function (style) {
		this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

L.extend(L.GeoJSON, {
	geometryToLayer: function (geojson, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry.coordinates,
		    layers = [],
		    latlng, latlngs, i, len;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords);
			return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i]);
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
			}
			return new L.FeatureGroup(layers);

		case 'LineString':
			latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'Polygon':
			if (coords.length === 2 && !coords[1].length) {
				throw new Error('Invalid GeoJSON object.');
			}
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);

		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {

				layers.push(this.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, pointToLayer, coordsToLatLng, vectorOptions));
			}
			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	},

	coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
		return new L.LatLng(coords[1], coords[0], coords[2]);
	},

	coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
		var latlng, i, len,
		    latlngs = [];

		for (i = 0, len = coords.length; i < len; i++) {
			latlng = levelsDeep ?
			        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || this.coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	},

	latLngToCoords: function (latlng) {
		var coords = [latlng.lng, latlng.lat];

		if (latlng.alt !== undefined) {
			coords.push(latlng.alt);
		}
		return coords;
	},

	latLngsToCoords: function (latLngs) {
		var coords = [];

		for (var i = 0, len = latLngs.length; i < len; i++) {
			coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
		}

		return coords;
	},

	getFeature: function (layer, newGeometry) {
		return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
	},

	asFeature: function (geoJSON) {
		if (geoJSON.type === 'Feature') {
			return geoJSON;
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geoJSON
		};
	}
});

var PointToGeoJSON = {
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
		});
	}
};

L.Marker.include(PointToGeoJSON);
L.Circle.include(PointToGeoJSON);
L.CircleMarker.include(PointToGeoJSON);

L.Polyline.include({
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'LineString',
			coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
		});
	}
});

L.Polygon.include({
	toGeoJSON: function () {
		var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
		    i, len, hole;

		coords[0].push(coords[0][0]);

		if (this._holes) {
			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
				hole.push(hole[0]);
				coords.push(hole);
			}
		}

		return L.GeoJSON.getFeature(this, {
			type: 'Polygon',
			coordinates: coords
		});
	}
});

(function () {
	function multiToGeoJSON(type) {
		return function () {
			var coords = [];

			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON().geometry.coordinates);
			});

			return L.GeoJSON.getFeature(this, {
				type: type,
				coordinates: coords
			});
		};
	}

	L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
	L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});

	L.LayerGroup.include({
		toGeoJSON: function () {

			var geometry = this.feature && this.feature.geometry,
				jsons = [],
				json;

			if (geometry && geometry.type === 'MultiPoint') {
				return multiToGeoJSON('MultiPoint').call(this);
			}

			var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					json = layer.toGeoJSON();
					jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
				}
			});

			if (isGeometryCollection) {
				return L.GeoJSON.getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}

			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});
}());

L.geoJson = function (geojson, options) {
	return new L.GeoJSON(geojson, options);
};


/*
 * L.DomEvent contains functions for working with DOM events.
 */

L.DomEvent = {
	/* inspired by John Resig, Dean Edwards and YUI addEvent implementations */
	addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler, originalHandler, newType;

		if (obj[key]) { return this; }

		handler = function (e) {
			return fn.call(context || obj, e || L.DomEvent._getEvent());
		};

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			return this.addPointerListener(obj, type, handler, id);
		}
		if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id);
		}

		if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('DOMMouseScroll', handler, false);
				obj.addEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {

				originalHandler = handler;
				newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

				handler = function (e) {
					if (!L.DomEvent._checkMouse(obj, e)) { return; }
					return originalHandler(e);
				};

				obj.addEventListener(newType, handler, false);

			} else if (type === 'click' && L.Browser.android) {
				originalHandler = handler;
				handler = function (e) {
					return L.DomEvent._filterClick(e, originalHandler);
				};

				obj.addEventListener(type, handler, false);
			} else {
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[key] = handler;

		return this;
	},

	removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler = obj[key];

		if (!handler) { return this; }

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id);
		} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
			} else {
				obj.removeEventListener(type, handler, false);
			}
		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[key] = null;

		return this;
	},

	stopPropagation: function (e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		L.DomEvent._skipped(e);

		return this;
	},

	disableScrollPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		return L.DomEvent
			.on(el, 'mousewheel', stop)
			.on(el, 'MozMousePixelScroll', stop);
	},

	disableClickPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(el, L.Draggable.START[i], stop);
		}

		return L.DomEvent
			.on(el, 'click', L.DomEvent._fakeStop)
			.on(el, 'dblclick', stop);
	},

	preventDefault: function (e) {

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	},

	stop: function (e) {
		return L.DomEvent
			.preventDefault(e)
			.stopPropagation(e);
	},

	getMousePosition: function (e, container) {
		if (!container) {
			return new L.Point(e.clientX, e.clientY);
		}

		var rect = container.getBoundingClientRect();

		return new L.Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop);
	},

	getWheelDelta: function (e) {

		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	},

	_skipEvents: {},

	_fakeStop: function (e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
		L.DomEvent._skipEvents[e.type] = true;
	},

	_skipped: function (e) {
		var skipped = this._skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false;
		return skipped;
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_checkMouse: function (el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	},

	_getEvent: function () { // evil magic for IE
		/*jshint noarg:false */
		var e = window.event;
		if (!e) {
			var caller = arguments.callee.caller;
			while (caller) {
				e = caller['arguments'][0];
				if (e && window.Event === e.constructor) {
					break;
				}
				caller = caller.caller;
			}
		}
		return e;
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function (e, handler) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			L.DomEvent.stop(e);
			return;
		}
		L.DomEvent._lastClick = timeStamp;

		return handler(e);
	}
};

L.DomEvent.on = L.DomEvent.addListener;
L.DomEvent.off = L.DomEvent.removeListener;


/*
 * L.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

L.Draggable = L.Class.extend({
	includes: L.Mixin.Events,

	statics: {
		START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	},

	initialize: function (element, dragStartTarget) {
		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
	},

	enable: function () {
		if (this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = true;
	},

	disable: function () {
		if (!this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		this._moved = false;

		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

		L.DomEvent.stopPropagation(e);

		if (L.Draggable._disabled) { return; }

		L.DomUtil.disableImageDrag();
		L.DomUtil.disableTextSelection();

		if (this._moving) { return; }

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new L.Point(first.clientX, first.clientY);
		this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

		L.DomEvent
		    .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, L.Draggable.END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new L.Point(first.clientX, first.clientY),
		    offset = newPoint.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (L.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

		L.DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);

			L.DomUtil.addClass(document.body, 'leaflet-dragging');
			this._lastTarget = e.target || e.srcElement;
			L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
	},

	_updatePosition: function () {
		this.fire('predrag');
		L.DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag');
	},

	_onUp: function () {
		L.DomUtil.removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in L.Draggable.MOVE) {
			L.DomEvent
			    .off(document, L.Draggable.MOVE[i], this._onMove)
			    .off(document, L.Draggable.END[i], this._onUp);
		}

		L.DomUtil.enableImageDrag();
		L.DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			L.Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
	}
});


/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

L.Handler = L.Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	enable: function () {
		if (this._enabled) { return; }

		this._enabled = true;
		this.addHooks();
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._enabled = false;
		this.removeHooks();
	},

	enabled: function () {
		return !!this._enabled;
	}
});


/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

L.Map.mergeOptions({
	dragging: true,

	inertia: !L.Browser.android23,
	inertiaDeceleration: 3400, // px/s^2
	inertiaMaxSpeed: Infinity, // px/s
	inertiaThreshold: L.Browser.touch ? 32 : 18, // ms
	easeLinearity: 0.25,

	// TODO refactor, move to CRS
	worldCopyJump: false
});

L.Map.Drag = L.Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new L.Draggable(map._mapPane, map._container);

			this._draggable.on({
				'dragstart': this._onDragStart,
				'drag': this._onDrag,
				'dragend': this._onDragEnd
			}, this);

			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDrag, this);
				map.on('viewreset', this._onViewReset, this);

				map.whenReady(this._onViewReset, this);
			}
		}
		this._draggable.enable();
	},

	removeHooks: function () {
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		var map = this._map;

		if (map._panAnim) {
			map._panAnim.stop();
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function () {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			if (time - this._times[0] > 200) {
				this._positions.shift();
				this._times.shift();
			}
		}

		this._map
		    .fire('move')
		    .fire('drag');
	},

	_onViewReset: function () {
		// TODO fix hardcoded Earth values
		var pxCenter = this._map.getSize()._divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.project([0, 180]).x;
	},

	_onPreDrag: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,
		    delay = +new Date() - this._lastTime,

		    noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime + delay - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x || !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				L.Util.requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true
					});
				});
			}
		}
	}
});

L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);


/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

L.Map.mergeOptions({
	doubleClickZoom: true
});

L.Map.DoubleClickZoom = L.Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);


/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

L.Map.mergeOptions({
	scrollWheelZoom: true
});

L.Map.ScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
		L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
		L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
	},

	_onWheelScroll: function (e) {
		var delta = L.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.preventDefault(e);
		L.DomEvent.stopPropagation(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);


/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

L.extend(L.DomEvent, {

	_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
	_touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',

	// inspired by Zepto touch code by Thomas Fuchs
	addDoubleTapListener: function (obj, handler, id) {
		var last,
		    doubleTap = false,
		    delay = 250,
		    touch,
		    pre = '_leaflet_',
		    touchstart = this._touchstart,
		    touchend = this._touchend,
		    trackedTouches = [];

		function onTouchStart(e) {
			var count;

			if (L.Browser.pointer) {
				trackedTouches.push(e.pointerId);
				count = trackedTouches.length;
			} else {
				count = e.touches.length;
			}
			if (count > 1) {
				return;
			}

			var now = Date.now(),
				delta = now - (last || now);

			touch = e.touches ? e.touches[0] : e;
			doubleTap = (delta > 0 && delta <= delay);
			last = now;
		}

		function onTouchEnd(e) {
			if (L.Browser.pointer) {
				var idx = trackedTouches.indexOf(e.pointerId);
				if (idx === -1) {
					return;
				}
				trackedTouches.splice(idx, 1);
			}

			if (doubleTap) {
				if (L.Browser.pointer) {
					// work around .type being readonly with MSPointer* events
					var newTouch = { },
						prop;

					// jshint forin:false
					for (var i in touch) {
						prop = touch[i];
						if (typeof prop === 'function') {
							newTouch[i] = prop.bind(touch);
						} else {
							newTouch[i] = prop;
						}
					}
					touch = newTouch;
				}
				touch.type = 'dblclick';
				handler(touch);
				last = null;
			}
		}
		obj[pre + touchstart + id] = onTouchStart;
		obj[pre + touchend + id] = onTouchEnd;

		// on pointer we need to listen on the document, otherwise a drag starting on the map and moving off screen
		// will not come through to us, so we will lose track of how many touches are ongoing
		var endElement = L.Browser.pointer ? document.documentElement : obj;

		obj.addEventListener(touchstart, onTouchStart, false);
		endElement.addEventListener(touchend, onTouchEnd, false);

		if (L.Browser.pointer) {
			endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
		}

		return this;
	},

	removeDoubleTapListener: function (obj, id) {
		var pre = '_leaflet_';

		obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
		(L.Browser.pointer ? document.documentElement : obj).removeEventListener(
		        this._touchend, obj[pre + this._touchend + id], false);

		if (L.Browser.pointer) {
			document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id],
				false);
		}

		return this;
	}
});


/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */

L.extend(L.DomEvent, {

	//static
	POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
	POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
	POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
	POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',

	_pointers: [],
	_pointerDocumentListener: false,

	// Provides a touch events wrapper for (ms)pointer events.
	// Based on changes by veproza https://github.com/CloudMade/Leaflet/pull/1019
	//ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	addPointerListener: function (obj, type, handler, id) {

		switch (type) {
		case 'touchstart':
			return this.addPointerListenerStart(obj, type, handler, id);
		case 'touchend':
			return this.addPointerListenerEnd(obj, type, handler, id);
		case 'touchmove':
			return this.addPointerListenerMove(obj, type, handler, id);
		default:
			throw 'Unknown touch event type';
		}
	},

	addPointerListenerStart: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    pointers = this._pointers;

		var cb = function (e) {
			if (e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
				L.DomEvent.preventDefault(e);
			}

			var alreadyInArray = false;
			for (var i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId === e.pointerId) {
					alreadyInArray = true;
					break;
				}
			}
			if (!alreadyInArray) {
				pointers.push(e);
			}

			e.touches = pointers.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchstart' + id] = cb;
		obj.addEventListener(this.POINTER_DOWN, cb, false);

		// need to also listen for end events to keep the _pointers list accurate
		// this needs to be on the body and never go away
		if (!this._pointerDocumentListener) {
			var internalCb = function (e) {
				for (var i = 0; i < pointers.length; i++) {
					if (pointers[i].pointerId === e.pointerId) {
						pointers.splice(i, 1);
						break;
					}
				}
			};
			//We listen on the documentElement as any drags that end by moving the touch off the screen get fired there
			document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
			document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);

			this._pointerDocumentListener = true;
		}

		return this;
	},

	addPointerListenerMove: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		function cb(e) {

			// don't fire touch moves when mouse isn't down
			if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches[i] = e;
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		}

		obj[pre + 'touchmove' + id] = cb;
		obj.addEventListener(this.POINTER_MOVE, cb, false);

		return this;
	},

	addPointerListenerEnd: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		var cb = function (e) {
			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches.splice(i, 1);
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchend' + id] = cb;
		obj.addEventListener(this.POINTER_UP, cb, false);
		obj.addEventListener(this.POINTER_CANCEL, cb, false);

		return this;
	},

	removePointerListener: function (obj, type, id) {
		var pre = '_leaflet_',
		    cb = obj[pre + type + id];

		switch (type) {
		case 'touchstart':
			obj.removeEventListener(this.POINTER_DOWN, cb, false);
			break;
		case 'touchmove':
			obj.removeEventListener(this.POINTER_MOVE, cb, false);
			break;
		case 'touchend':
			obj.removeEventListener(this.POINTER_UP, cb, false);
			obj.removeEventListener(this.POINTER_CANCEL, cb, false);
			break;
		}

		return this;
	}
});


/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

L.Map.mergeOptions({
	touchZoom: L.Browser.touch && !L.Browser.android23,
	bounceAtZoomLimits: true
});

L.Map.TouchZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]),
		    viewCenter = map._getCenterLayerPoint();

		this._startCenter = p1.add(p2)._divideBy(2);
		this._startDist = p1.distanceTo(p2);

		this._moved = false;
		this._zooming = true;

		this._centerOffset = viewCenter.subtract(this._startCenter);

		if (map._panAnim) {
			map._panAnim.stop();
		}

		L.DomEvent
		    .on(document, 'touchmove', this._onTouchMove, this)
		    .on(document, 'touchend', this._onTouchEnd, this);

		L.DomEvent.preventDefault(e);
	},

	_onTouchMove: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]);

		this._scale = p1.distanceTo(p2) / this._startDist;
		this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);

		if (this._scale === 1) { return; }

		if (!map.options.bounceAtZoomLimits) {
			if ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
			    (map.getZoom() === map.getMaxZoom() && this._scale > 1)) { return; }
		}

		if (!this._moved) {
			L.DomUtil.addClass(map._mapPane, 'leaflet-touching');

			map
			    .fire('movestart')
			    .fire('zoomstart');

			this._moved = true;
		}

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(
		        this._updateOnMove, this, true, this._map._container);

		L.DomEvent.preventDefault(e);
	},

	_updateOnMove: function () {
		var map = this._map,
		    origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),
		    zoom = map.getScaleZoom(this._scale);

		map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		var map = this._map;

		this._zooming = false;
		L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
		L.Util.cancelAnimFrame(this._animRequest);

		L.DomEvent
		    .off(document, 'touchmove', this._onTouchMove)
		    .off(document, 'touchend', this._onTouchEnd);

		var origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),

		    oldZoom = map.getZoom(),
		    floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
		    roundZoomDelta = (floatZoomDelta > 0 ?
		            Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),

		    zoom = map._limitZoom(oldZoom + roundZoomDelta),
		    scale = map.getZoomScale(zoom) / this._scale;

		map._animateZoom(center, zoom, origin, scale);
	},

	_getScaleOrigin: function () {
		var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
		return this._startCenter.add(centerOffset);
	}
});

L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);


/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

L.Map.mergeOptions({
	tap: true,
	tapTolerance: 15
});

L.Map.Tap = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		L.DomEvent.preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			L.DomUtil.addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(L.bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		L.DomEvent
			.on(document, 'touchmove', this._onMove, this)
			.on(document, 'touchend', this._onUp, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		L.DomEvent
			.off(document, 'touchmove', this._onMove, this)
			.off(document, 'touchend', this._onUp, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				L.DomUtil.removeClass(el, 'leaflet-active');
			}

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new L.Point(first.clientX, first.clientY);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

if (L.Browser.touch && !L.Browser.pointer) {
	L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
}


/*
 * L.Handler.ShiftDragZoom is used to add shift-drag zoom interaction to the map
  * (zoom to a selected bounding box), enabled by default.
 */

L.Map.mergeOptions({
	boxZoom: true
});

L.Map.BoxZoom = L.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._moved = false;
	},

	addHooks: function () {
		L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
		this._moved = false;
	},

	moved: function () {
		return this._moved;
	},

	_onMouseDown: function (e) {
		this._moved = false;

		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		L.DomUtil.disableTextSelection();
		L.DomUtil.disableImageDrag();

		this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

		L.DomEvent
		    .on(document, 'mousemove', this._onMouseMove, this)
		    .on(document, 'mouseup', this._onMouseUp, this)
		    .on(document, 'keydown', this._onKeyDown, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
			L.DomUtil.setPosition(this._box, this._startLayerPoint);

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';
			this._map.fire('boxzoomstart');
		}

		var startPoint = this._startLayerPoint,
		    box = this._box,

		    layerPoint = this._map.mouseEventToLayerPoint(e),
		    offset = layerPoint.subtract(startPoint),

		    newPos = new L.Point(
		        Math.min(layerPoint.x, startPoint.x),
		        Math.min(layerPoint.y, startPoint.y));

		L.DomUtil.setPosition(box, newPos);

		this._moved = true;

		// TODO refactor: remove hardcoded 4 pixels
		box.style.width  = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
		box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
	},

	_finish: function () {
		if (this._moved) {
			this._pane.removeChild(this._box);
			this._container.style.cursor = '';
		}

		L.DomUtil.enableTextSelection();
		L.DomUtil.enableImageDrag();

		L.DomEvent
		    .off(document, 'mousemove', this._onMouseMove)
		    .off(document, 'mouseup', this._onMouseUp)
		    .off(document, 'keydown', this._onKeyDown);
	},

	_onMouseUp: function (e) {

		this._finish();

		var map = this._map,
		    layerPoint = map.mouseEventToLayerPoint(e);

		if (this._startLayerPoint.equals(layerPoint)) { return; }

		var bounds = new L.LatLngBounds(
		        map.layerPointToLatLng(this._startLayerPoint),
		        map.layerPointToLatLng(layerPoint));

		map.fitBounds(bounds);

		map.fire('boxzoomend', {
			boxZoomBounds: bounds
		});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);


/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

L.Map.mergeOptions({
	keyboard: true,
	keyboardPanOffset: 80,
	keyboardZoomOffset: 1
});

L.Map.Keyboard = L.Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanOffset(map.options.keyboardPanOffset);
		this._setZoomOffset(map.options.keyboardZoomOffset);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex === -1) {
			container.tabIndex = '0';
		}

		L.DomEvent
		    .on(container, 'focus', this._onFocus, this)
		    .on(container, 'blur', this._onBlur, this)
		    .on(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .on('focus', this._addHooks, this)
		    .on('blur', this._removeHooks, this);
	},

	removeHooks: function () {
		this._removeHooks();

		var container = this._map._container;

		L.DomEvent
		    .off(container, 'focus', this._onFocus, this)
		    .off(container, 'blur', this._onBlur, this)
		    .off(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .off('focus', this._addHooks, this)
		    .off('blur', this._removeHooks, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanOffset: function (pan) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * pan, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [pan, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, pan];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * pan];
		}
	},

	_setZoomOffset: function (zoom) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoom;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoom;
		}
	},

	_addHooks: function () {
		L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		var key = e.keyCode,
		    map = this._map;

		if (key in this._panKeys) {

			if (map._panAnim && map._panAnim._inProgress) { return; }

			map.panBy(this._panKeys[key]);

			if (map.options.maxBounds) {
				map.panInsideBounds(map.options.maxBounds);
			}

		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + this._zoomKeys[key]);

		} else {
			return;
		}

		L.DomEvent.stop(e);
	}
});

L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);


/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;
		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon);
		}

		this._draggable
			.on('dragstart', this._onDragStart, this)
			.on('drag', this._onDrag, this)
			.on('dragend', this._onDragEnd, this);
		this._draggable.enable();
		L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable
			.off('dragstart', this._onDragStart, this)
			.off('drag', this._onDrag, this)
			.off('dragend', this._onDragEnd, this);

		this._draggable.disable();
		L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onDrag: function () {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			L.DomUtil.setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;

		marker
		    .fire('move', {latlng: latlng})
		    .fire('drag');
	},

	_onDragEnd: function (e) {
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});


/*
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

L.Control = L.Class.extend({
	options: {
		position: 'topright'
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	getPosition: function () {
		return this.options.position;
	},

	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	getContainer: function () {
		return this._container;
	},

	addTo: function (map) {
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		L.DomUtil.addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		return this;
	},

	removeFrom: function (map) {
		var pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		corner.removeChild(this._container);
		this._map = null;

		if (this.onRemove) {
			this.onRemove(map);
		}

		return this;
	},

	_refocusOnMap: function () {
		if (this._map) {
			this._map.getContainer().focus();
		}
	}
});

L.control = function (options) {
	return new L.Control(options);
};


// adds control-related methods to L.Map

L.Map.include({
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	removeControl: function (control) {
		control.removeFrom(this);
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            L.DomUtil.create('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = L.DomUtil.create('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		this._container.removeChild(this._controlContainer);
	}
});


/*
 * L.Control.Zoom is used for the default zoom buttons on the map.
 */

L.Control.Zoom = L.Control.extend({
	options: {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

		this._map = map;

		this._zoomInButton  = this._createButton(
		        this.options.zoomInText, this.options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn,  this);
		this._zoomOutButton = this._createButton(
		        this.options.zoomOutText, this.options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut, this);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context)
		    .on(link, 'click', this._refocusOnMap, context);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'leaflet-disabled';

		L.DomUtil.removeClass(this._zoomInButton, className);
		L.DomUtil.removeClass(this._zoomOutButton, className);

		if (map._zoom === map.getMinZoom()) {
			L.DomUtil.addClass(this._zoomOutButton, className);
		}
		if (map._zoom === map.getMaxZoom()) {
			L.DomUtil.addClass(this._zoomInButton, className);
		}
	}
});

L.Map.mergeOptions({
	zoomControl: true
});

L.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new L.Control.Zoom();
		this.addControl(this.zoomControl);
	}
});

L.control.zoom = function (options) {
	return new L.Control.Zoom(options);
};



/*
 * L.Control.Attribution is used for displaying attribution on the map (added by default).
 */

L.Control.Attribution = L.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
		L.DomEvent.disableClickPropagation(this._container);

		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}
		
		map
		    .on('layeradd', this._onLayerAdd, this)
		    .on('layerremove', this._onLayerRemove, this);

		this._update();

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerAdd)
		    .off('layerremove', this._onLayerRemove);

	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	},

	_onLayerAdd: function (e) {
		if (e.layer.getAttribution) {
			this.addAttribution(e.layer.getAttribution());
		}
	},

	_onLayerRemove: function (e) {
		if (e.layer.getAttribution) {
			this.removeAttribution(e.layer.getAttribution());
		}
	}
});

L.Map.mergeOptions({
	attributionControl: true
});

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new L.Control.Attribution()).addTo(this);
	}
});

L.control.attribution = function (options) {
	return new L.Control.Attribution(options);
};


/*
 * L.Control.Scale is used for displaying metric/imperial scale on the map.
 */

L.Control.Scale = L.Control.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 100,
		metric: true,
		imperial: true,
		updateWhenIdle: false
	},

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

		this._addScales(options, className, container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
	},

	_update: function () {
		var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,

		    size = this._map.getSize(),
		    options = this.options,
		    maxMeters = 0;

		if (size.x > 0) {
			maxMeters = dist * (options.maxWidth / size.x);
		}

		this._updateScales(options, maxMeters);
	},

	_updateScales: function (options, maxMeters) {
		if (options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}

		if (options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters);

		this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
		this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);

			scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
			scale.innerHTML = miles + ' mi';

		} else {
			feet = this._getRoundNum(maxFeet);

			scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
			scale.innerHTML = feet + ' ft';
		}
	},

	_getScaleWidth: function (ratio) {
		return Math.round(this.options.maxWidth * ratio) - 10;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});

L.control.scale = function (options) {
	return new L.Control.Scale(options);
};


/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

L.Control.Layers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange, this)
		    .off('layerremove', this._onLayerChange, this);
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		this._update();
		return this;
	},

	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		this._update();
		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);
		delete this._layers[id];
		this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}
			//Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay) {
		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_onLayerChange: function (e) {
		var obj = this._layers[L.stamp(e.layer)];

		if (!obj) { return; }

		if (!this._handlingClick) {
			this._update();
		}

		var type = obj.overlay ?
			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'layeradd' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});

L.control.layers = function (baseLayers, overlays, options) {
	return new L.Control.Layers(baseLayers, overlays, options);
};


/*
 * L.PosAnimation is used by Leaflet internally for pan animations.
 */

L.PosAnimation = L.Class.extend({
	includes: L.Mixin.Events,

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._newPos = newPos;

		this.fire('start');

		el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) +
		        's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';

		L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
		L.DomUtil.setPosition(el, newPos);

		// toggle reflow, Chrome flickers for some reason if you don't do this
		L.Util.falseFn(el.offsetWidth);

		// there's no native way to track value updates of transitioned properties, so we imitate this
		this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
	},

	stop: function () {
		if (!this._inProgress) { return; }

		// if we just removed the transition property, the element would jump to its final position,
		// so we need to make it stay at the current position

		L.DomUtil.setPosition(this._el, this._getPos());
		this._onTransitionEnd();
		L.Util.falseFn(this._el.offsetWidth); // force reflow in case we are about to start a new animation
	},

	_onStep: function () {
		var stepPos = this._getPos();
		if (!stepPos) {
			this._onTransitionEnd();
			return;
		}
		// jshint camelcase: false
		// make L.DomUtil.getPosition return intermediate position value during animation
		this._el._leaflet_pos = stepPos;

		this.fire('step');
	},

	// you can't easily get intermediate values of properties animated with CSS3 Transitions,
	// we need to parse computed style (in case of transform it returns matrix string)

	_transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,

	_getPos: function () {
		var left, top, matches,
		    el = this._el,
		    style = window.getComputedStyle(el);

		if (L.Browser.any3d) {
			matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
			if (!matches) { return; }
			left = parseFloat(matches[1]);
			top  = parseFloat(matches[2]);
		} else {
			left = parseFloat(style.left);
			top  = parseFloat(style.top);
		}

		return new L.Point(left, top, true);
	},

	_onTransitionEnd: function () {
		L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);

		if (!this._inProgress) { return; }
		this._inProgress = false;

		this._el.style[L.DomUtil.TRANSITION] = '';

		// jshint camelcase: false
		// make sure L.DomUtil.getPosition returns the final position value after animation
		this._el._leaflet_pos = this._newPos;

		clearInterval(this._stepTimer);

		this.fire('step').fire('end');
	}

});


/*
 * Extends L.Map to handle panning animations.
 */

L.Map.include({

	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
		options = options || {};

		if (this._panAnim) {
			this._panAnim.stop();
		}

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = L.extend({animate: options.animate}, options.zoom);
				options.pan = L.extend({animate: options.animate}, options.pan);
			}

			// try animating pan or zoom
			var animated = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (animated) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	panBy: function (offset, options) {
		offset = L.point(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new L.PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset);
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._floor();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	}
});


/*
 * L.PosAnimation fallback implementation that powers Leaflet pan animations
 * in browsers that don't support CSS3 Transitions.
 */

L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = L.DomUtil.getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		this.fire('start');

		this._animate();
	},

	stop: function () {
		if (!this._inProgress) { return; }

		this._step();
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = L.Util.requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function () {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration));
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		L.DomUtil.setPosition(this._el, pos);

		this.fire('step');
	},

	_complete: function () {
		L.Util.cancelAnimFrame(this._animId);

		this._inProgress = false;
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});


/*
 * Extends L.Map to handle zoom animations.
 */

L.Map.mergeOptions({
	zoomAnimation: true,
	zoomAnimationThreshold: 4
});

if (L.DomUtil.TRANSITION) {

	L.Map.addInitHook(function () {
		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION &&
				L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
		}
	});
}

L.Map.include(!L.DomUtil.TRANSITION ? {} : {

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
			origin = this._getCenterLayerPoint()._add(offset);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		this
		    .fire('movestart')
		    .fire('zoomstart');

		this._animateZoom(center, zoom, origin, scale, null, true);

		return true;
	},

	_animateZoom: function (center, zoom, origin, scale, delta, backwards, forTouchZoom) {

		if (!forTouchZoom) {
			this._animatingZoom = true;
		}

		// put transform transition on all layers with leaflet-zoom-animated class
		L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');

		// remember what center/zoom to set after animation
		this._animateToCenter = center;
		this._animateToZoom = zoom;

		// disable any dragging during animation
		if (L.Draggable) {
			L.Draggable._disabled = true;
		}

		L.Util.requestAnimFrame(function () {
			this.fire('zoomanim', {
				center: center,
				zoom: zoom,
				origin: origin,
				scale: scale,
				delta: delta,
				backwards: backwards
			});
			// horrible hack to work around a Chrome bug https://github.com/Leaflet/Leaflet/issues/3689
			setTimeout(L.bind(this._onZoomTransitionEnd, this), 250);
		}, this);
	},

	_onZoomTransitionEnd: function () {
		if (!this._animatingZoom) { return; }

		this._animatingZoom = false;

		L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');

		L.Util.requestAnimFrame(function () {
			this._resetView(this._animateToCenter, this._animateToZoom, true, true);

			if (L.Draggable) {
				L.Draggable._disabled = false;
			}
		}, this);
	}
});


/*
	Zoom animation logic for L.TileLayer.
*/

L.TileLayer.include({
	_animateZoom: function (e) {
		if (!this._animating) {
			this._animating = true;
			this._prepareBgBuffer();
		}

		var bg = this._bgBuffer,
		    transform = L.DomUtil.TRANSFORM,
		    initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
		    scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);

		bg.style[transform] = e.backwards ?
				scaleStr + ' ' + initialTransform :
				initialTransform + ' ' + scaleStr;
	},

	_endZoomAnim: function () {
		var front = this._tileContainer,
		    bg = this._bgBuffer;

		front.style.visibility = '';
		front.parentNode.appendChild(front); // Bring to fore

		// force reflow
		L.Util.falseFn(bg.offsetWidth);

		var zoom = this._map.getZoom();
		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			this._clearBgBuffer();
		}

		this._animating = false;
	},

	_clearBgBuffer: function () {
		var map = this._map;

		if (map && !map._animatingZoom && !map.touchZoom._zooming) {
			this._bgBuffer.innerHTML = '';
			this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
		}
	},

	_prepareBgBuffer: function () {

		var front = this._tileContainer,
		    bg = this._bgBuffer;

		// if foreground layer doesn't have many tiles but bg layer does,
		// keep the existing bg layer and just zoom it some more

		var bgLoaded = this._getLoadedTilesPercentage(bg),
		    frontLoaded = this._getLoadedTilesPercentage(front);

		if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {

			front.style.visibility = 'hidden';
			this._stopLoadingImages(front);
			return;
		}

		// prepare the buffer to become the front tile pane
		bg.style.visibility = 'hidden';
		bg.style[L.DomUtil.TRANSFORM] = '';

		// switch out the current layer to be the new bg layer (and vice-versa)
		this._tileContainer = bg;
		bg = this._bgBuffer = front;

		this._stopLoadingImages(bg);

		//prevent bg buffer from clearing right after zoom
		clearTimeout(this._clearBgBufferTimer);
	},

	_getLoadedTilesPercentage: function (container) {
		var tiles = container.getElementsByTagName('img'),
		    i, len, count = 0;

		for (i = 0, len = tiles.length; i < len; i++) {
			if (tiles[i].complete) {
				count++;
			}
		}
		return count / len;
	},

	// stops loading all tiles in the background layer
	_stopLoadingImages: function (container) {
		var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
		    i, len, tile;

		for (i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];

			if (!tile.complete) {
				tile.onload = L.Util.falseFn;
				tile.onerror = L.Util.falseFn;
				tile.src = L.Util.emptyImageUrl;

				tile.parentNode.removeChild(tile);
			}
		}
	}
});


/*
 * Provides L.Map with convenient shortcuts for using browser geolocation features.
 */

L.Map.include({
	_defaultLocateOptions: {
		watch: false,
		setView: false,
		maxZoom: Infinity,
		timeout: 10000,
		maximumAge: 0,
		enableHighAccuracy: false
	},

	locate: function (/*Object*/ options) {

		options = this._locateOptions = L.extend(this._defaultLocateOptions, options);

		if (!navigator.geolocation) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = L.bind(this._handleGeolocationResponse, this),
			onError = L.bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	stopLocate: function () {
		if (navigator.geolocation) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new L.LatLng(lat, lng),

		    latAccuracy = 180 * pos.coords.accuracy / 40075017,
		    lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

		    bounds = L.latLngBounds(
		            [lat - latAccuracy, lng - lngAccuracy],
		            [lat + latAccuracy, lng + lngAccuracy]),

		    options = this._locateOptions;

		if (options.setView) {
			var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
			this.setView(latlng, zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		this.fire('locationfound', data);
	}
});


}(window, document));
/**
 * 
 */
L.LayerGroup.include({
    toGeoJSONcustom: function () {
      var geometry = this.feature && this.feature.geometry,
        jsons = [],
        json;

      if (geometry && geometry.type === 'MultiPoint') {
        return multiToGeoJSON('MultiPoint').call(this);
      }
      
     /*
      if (geometry && geometry.type === 'MultiPolygon') {
          return multiToGeoJSON('MultiPolygon').call(this);
        }
*/
      var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

      this.eachLayer(function (layer) {
        if (layer.toGeoJSON) {
         json = layer.toGeoJSON();
         //Custom: que no es perdin les propietats del feature
        
         
         var tipus=json.geometry.type;
        
         
         
         if(jQuery.isEmptyObject(json.properties)){
           if(layer.properties.nom) json.properties.name = layer.properties.nom;
           
           
           if(layer.properties.data){
          
        	   
        	   jQuery.each(layer.properties.data, function(key, value){
               if(key.indexOf("businessId")==-1){
                     json.properties[''+key+''] = value;
               }
             });
           }
         }
         
         
         if(jQuery.isEmptyObject(json.styles)){
        	
        	 
        	if(!jQuery.isEmptyObject(layer.options)){
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options.style)){       		
        		 json.styles=layer._options.style;
        	 }
        	
        	
        	
 if(tipus.indexOf("Multi")!=-1){
	   		 if (layer.properties){		 
	        		 json.styles.fillColor=layer.properties.estil.color;
	        		 json.styles.borderColor=layer.properties.estil.borderColor;
	        		 json.styles.color=layer.properties.estil.borderColor;
	        		 json.styles.weight=layer.properties.estil.borderWidth;
	        		 json.styles.borderWidth=layer.properties.estil.borderWidth;
        		 }
        		 else if (layer._options.style){
        			 json.styles.fillColor=layer._options.style.color;
	        		 json.styles.borderColor=layer._options.style.borderColor;
	        		 json.styles.color=layer._options.style.borderColor;
	        		 json.styles.weight=layer._options.style.borderWidth;
	        		 json.styles.borderWidth=layer._options.style.borderWidth;
        		 }
             	
              }
        
         
         } 
         
         //assegurem que s'han guardat estils correctament...
         var count = Object.keys(json.styles).length;
         
         if(count <=1){
        	 if(!jQuery.isEmptyObject(layer.options) && Object.keys(layer.options).length>1){
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options) && Object.keys(layer._options).length>1){
        		 json.styles=layer._options;
        	 }
         }         
         
         /*
         if(json.geometry.type != 'Point'){
	         try{
	          _newJson = turf.simplify(json, 0.00001, false);
	
	          json.geometry=_newJson.geometry;
	          
	         }catch(err){
	         	console.debug(err);
	
	         }
     }
         */
         
         jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
       
       
        
        
        }
        
       
      });

      if (isGeometryCollection) {
        return L.GeoJSON.getFeature(this, {
             geometries: jsons,
             type: 'GeometryCollection'
        });
      }

      return {
        type: 'FeatureCollection',
            features: jsons
      };

    }
});

//nou metode per 3D afegir els styles dins dels properties

L.LayerGroup.include({
    toGeoJSONStyles2ToProperties: function () {
      var geometry = this.feature && this.feature.geometry,
        jsons = [],
        json;

      if (geometry && geometry.type === 'MultiPoint') {
        return multiToGeoJSON('MultiPoint').call(this);
      }

      var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

      this.eachLayer(function (layer) {
        if (layer.toGeoJSON) {
         json = layer.toGeoJSON();
         //Custom: que no es perdin les propietats del feature
         if(jQuery.isEmptyObject(json.properties)){
        	 
			if(layer.properties && layer.properties.nom){ json.properties.name = layer.properties.nom;}
					   
			

			/*
        	 try{
        		 
        		 if(layer.properties && layer.properties.nom) { 
					json.properties.name = layer.properties.nom; 
        		 }else{
        			 json.properties=layer.options; 
        			 
        		 }
        		
        	 }catch(err){
				 
				 console.info(err);	
        		 json.properties=layer.options; 
        		
        	 }
        	 
          */
		  
		  
		  
           if(layer.properties && layer.properties.data){
             jQuery.each(layer.properties.data, function(key, value){
               if(key.indexOf("slot")==-1 && key.indexOf("businessId")==-1){
                     json.properties[''+key+''] = value;
               }
             });
           }
         }
         if(jQuery.isEmptyObject(json.styles)){
        	 if(!jQuery.isEmptyObject(layer.options)){
        		 json.properties.styles=layer.options;
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options.style)){
        		 json.properties.styles=layer._options.style;
        		 json.styles=layer._options.style;
        	 }
         }

         //assegurem que s'han guardat estils correctament...
         var count = Object.keys(json.styles).length;
         if(count <=1){
        	 if(!jQuery.isEmptyObject(layer.options) && Object.keys(layer.options).length>1){
        		 json.properties.styles=layer.options;
        		 json.styles=layer.options;
        	 }else if(!jQuery.isEmptyObject(layer._options) && Object.keys(layer._options).length>1){
        		 json.properties.styles=layer._options;
        		 json.styles=layer._options;
        	 }
         }

         /*
        
         if(json.geometry.type != 'Point'){
		         try{
		          _newJson = turf.simplify(json, 0.000001, false);
		
		          json.geometry=_newJson.geometry;
		          
		         }catch(err){
		         	console.debug(err);
		
		         }
         }
         
         */
		
		 
         jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
        }
      });

      if (isGeometryCollection) {
        return L.GeoJSON.getFeature(this, {
             geometries: jsons,
             type: 'GeometryCollection'
        });
      }

      return {
        type: 'FeatureCollection',
            features: jsons
      };

    }
});
L.TileLayer.BoundaryCanvas = L.TileLayer.Canvas.extend({
	options: {
        // all rings of boundary should be without self-intersections or intersections with other rings
        // zero-winding fill algorithm is used in canvas, so holes should have opposite direction to exterior ring
        // boundary can be
        // LatLng[] - simple polygon
        // LatLng[][] - polygon with holes
        // LatLng[][][] - multipolygon
        boundary: null
	},

	initialize: function (url, options) {
		L.Util.setOptions(this, options);
        this._url = url;
        this._boundaryCache = {}; //cache index "x:y:z"
        this._mercBoundary = null;
        this._mercBbox = null;
	},
    
    //lazy calculation of layer's boundary in map's projection. Bounding box is also calculated
    _getOriginalMercBoundary: function () {

        if (this._mercBoundary) {
            return this._mercBoundary;
        }

        this._mercBoundary = [];
        var b = this.options.boundary,
            c, r, p,
            mercComponent,
            mercRing,
            compomentBbox;

        
        if (!(b[0] instanceof Array)) {
            b = [[b]];
        } else if (!(b[0][0] instanceof Array)) {
            b = [b];
        }
          
        for (c = 0; c < b.length; c++) {
            mercComponent = [];
            for (r = 0; r < b[c].length; r++) {
                mercRing = [];
                for (p = 0; p < b[c][r].length; p++) {
                    if (this._map!=null) mercRing.push(this._map.project(b[c][r][p], 0));
                }
                mercComponent.push(mercRing);
            }
            this._mercBoundary.push(mercComponent);
        }

        this._mercBbox = new L.Bounds();
        for (c = 0; c < this._mercBoundary.length; c++) {
            compomentBbox = new L.Bounds(this._mercBoundary[c][0]);
            this._mercBbox.extend(compomentBbox.min);
            this._mercBbox.extend(compomentBbox.max);
        }

        return this._mercBoundary;
    },

    // Calculates intersection of original boundary geometry and tile boundary.
    // Uses quadtree as cache to speed-up intersection.
    // Return 
    //   {isOut: true} if no intersection,  
    //   {isIn: true} if tile is fully inside layer's boundary
    //   {geometry: <LatLng[][][]>} otherwise
    _getTileGeometry: function (x, y, z, skipIntersectionCheck) {
        if ( !this.options.boundary) {
            return {isOut: true};
        }
    
        var cacheID = x + ":" + y + ":" + z,
            zCoeff = Math.pow(2, z),
            parentState,
            clippedGeom = [],
            iC, iR,
            clippedComponent,
            clippedExternalRing,
            clippedHoleRing,
            isRingBbox = function (ring, bbox) {
                if (ring.length !== 4) {
                    return false;
                }

                var p;
                for (p = 0; p < 4; p++) {
                    if ((ring[p].x !== bbox.min.x && ring[p].x !== bbox.max.x) ||
                        (ring[p].y !== bbox.min.y && ring[p].y !== bbox.max.y)) {
                        return false;
                    }
                }
                return true;
            };

        if (this._boundaryCache[cacheID]) {
            return this._boundaryCache[cacheID];
        }

        var mercBoundary = this._getOriginalMercBoundary(),
            ts = this.options.tileSize,
            tileBbox = new L.Bounds(new L.Point(x * ts / zCoeff, y * ts / zCoeff), new L.Point((x + 1) * ts / zCoeff, (y + 1) * ts / zCoeff));

        //fast check intersection
        if (!skipIntersectionCheck && !tileBbox.intersects(this._mercBbox)) {
            return {isOut: true};
        }

        if (z === 0) {
            this._boundaryCache[cacheID] = {geometry: mercBoundary};
            return this._boundaryCache[cacheID];
        }

        parentState = this._getTileGeometry(Math.floor(x / 2), Math.floor(y / 2), z - 1, true);

        if (parentState.isOut || parentState.isIn) {
            return parentState;
        }

        for (iC = 0; iC < parentState.geometry.length; iC++) {
            clippedComponent = [];
            clippedExternalRing = L.PolyUtil.clipPolygon(parentState.geometry[iC][0], tileBbox);
            if (clippedExternalRing.length === 0) {
                continue;
            }

            clippedComponent.push(clippedExternalRing);

            for (iR = 1; iR < parentState.geometry[iC].length; iR++) {
                clippedHoleRing = L.PolyUtil.clipPolygon(parentState.geometry[iC][iR], tileBbox);
                if (clippedHoleRing.length > 0) {
                    clippedComponent.push(clippedHoleRing);
                }
            }
            clippedGeom.push(clippedComponent);
        }

        if (clippedGeom.length === 0) { //we are outside of all multipolygon components
            this._boundaryCache[cacheID] = {isOut: true};
            return this._boundaryCache[cacheID];
        }

        for (iC = 0; iC < clippedGeom.length; iC++) {
            if (isRingBbox(clippedGeom[iC][0], tileBbox)) {
                //inside exterior rings and no holes
                if (clippedGeom[iC].length === 1) {
                    this._boundaryCache[cacheID] = {isIn: true};
                    return this._boundaryCache[cacheID];
                }
            } else { //intersect exterior ring
                this._boundaryCache[cacheID] = {geometry: clippedGeom};
                return this._boundaryCache[cacheID];
            }

            for (iR = 1; iR < clippedGeom[iC].length; iR++) {
                if (!isRingBbox(clippedGeom[iC][iR], tileBbox)) { //inside exterior ring, but have intersection with hole
                    this._boundaryCache[cacheID] = {geometry: clippedGeom};
                    return this._boundaryCache[cacheID];
                }
            }
        }

        //we are inside all holes in geometry
        this._boundaryCache[cacheID] = {isOut: true};
        return this._boundaryCache[cacheID];
    },

	drawTile: function (canvas, tilePoint) {
        var ts = this.options.tileSize,
            tileX = ts * tilePoint.x,
            tileY = ts * tilePoint.y,
            zoom = this._getZoomForUrl(),
            zCoeff = Math.pow(2, zoom),
            ctx = canvas.getContext('2d'),
            imageObj = new Image(),
            _this = this,
            setPattern = function () {
            
            var state = _this._getTileGeometry(tilePoint.x, tilePoint.y, zoom),
                c, r, p,
                pattern,
                geom;

            if (state.isOut) {
                return;
            }

            if (!state.isIn) {
                geom = state.geometry;
                ctx.beginPath();

                for (c = 0; c < geom.length; c++) {
                    for (r = 0; r < geom[c].length; r++) {
                        if (geom[c][r].length === 0) {
                            continue;
                        }

                        ctx.moveTo(geom[c][r][0].x * zCoeff - tileX, geom[c][r][0].y * zCoeff - tileY);
                        for (p = 1; p < geom[c][r].length; p++) {
                            ctx.lineTo(geom[c][r][p].x * zCoeff - tileX, geom[c][r][p].y * zCoeff - tileY);
                        }
                    }
                }
                ctx.clip();
            }

            pattern = ctx.createPattern(imageObj, "repeat");
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = pattern;
            ctx.fill();
        };
        
        imageObj.onload = function () {
            setTimeout(setPattern, 0); //IE9 bug - black tiles appear randomly if call setPattern() without timeout
        }
		this._adjustTilePoint(tilePoint);
        imageObj.src = this.getTileUrl(tilePoint);
	}
});

L.TileLayer.boundaryCanvas = function (url, options) {
	return new L.TileLayer.BoundaryCanvas(url, options);
};
/*
  proj4js.js -- Javascript reprojection library. 
  
  Authors:      Mike Adair madairATdmsolutions.ca
                Richard Greenwood richATgreenwoodmap.com
                Didier Richard didier.richardATign.fr
                Stephen Irons
  License:      LGPL as per: http://www.gnu.org/copyleft/lesser.html 
                Note: This program is an almost direct port of the C library
                Proj4.
*/
Proj4js={defaultDatum:'WGS84',transform:function(source,dest,point){if(!source.readyToUse){this.reportError("Proj4js initialization for:"+source.srsCode+" not yet complete");return point;}
if(!dest.readyToUse){this.reportError("Proj4js initialization for:"+dest.srsCode+" not yet complete");return point;}
if((source.srsProjNumber=="900913"&&dest.datumCode!="WGS84"&&!dest.datum_params)||(dest.srsProjNumber=="900913"&&source.datumCode!="WGS84"&&!source.datum_params)){var wgs84=Proj4js.WGS84;this.transform(source,wgs84,point);source=wgs84;}
if(source.axis!="enu"){this.adjust_axis(source,false,point);}
if(source.projName=="longlat"){point.x*=Proj4js.common.D2R;point.y*=Proj4js.common.D2R;}else{if(source.to_meter){point.x*=source.to_meter;point.y*=source.to_meter;}
source.inverse(point);}
if(source.from_greenwich){point.x+=source.from_greenwich;}
point=this.datum_transform(source.datum,dest.datum,point);if(dest.from_greenwich){point.x-=dest.from_greenwich;}
if(dest.projName=="longlat"){point.x*=Proj4js.common.R2D;point.y*=Proj4js.common.R2D;}else{dest.forward(point);if(dest.to_meter){point.x/=dest.to_meter;point.y/=dest.to_meter;}}
if(dest.axis!="enu"){this.adjust_axis(dest,true,point);}
return point;},datum_transform:function(source,dest,point){if(source.compare_datums(dest)){return point;}
if(source.datum_type==Proj4js.common.PJD_NODATUM||dest.datum_type==Proj4js.common.PJD_NODATUM){return point;}
if(source.datum_type==Proj4js.common.PJD_GRIDSHIFT)
{alert("ERROR: Grid shift transformations are not implemented yet.");}
if(dest.datum_type==Proj4js.common.PJD_GRIDSHIFT)
{alert("ERROR: Grid shift transformations are not implemented yet.");}
if(source.es!=dest.es||source.a!=dest.a||source.datum_type==Proj4js.common.PJD_3PARAM||source.datum_type==Proj4js.common.PJD_7PARAM||dest.datum_type==Proj4js.common.PJD_3PARAM||dest.datum_type==Proj4js.common.PJD_7PARAM)
{source.geodetic_to_geocentric(point);if(source.datum_type==Proj4js.common.PJD_3PARAM||source.datum_type==Proj4js.common.PJD_7PARAM){source.geocentric_to_wgs84(point);}
if(dest.datum_type==Proj4js.common.PJD_3PARAM||dest.datum_type==Proj4js.common.PJD_7PARAM){dest.geocentric_from_wgs84(point);}
dest.geocentric_to_geodetic(point);}
if(dest.datum_type==Proj4js.common.PJD_GRIDSHIFT)
{alert("ERROR: Grid shift transformations are not implemented yet.");}
return point;},adjust_axis:function(crs,denorm,point){var xin=point.x,yin=point.y,zin=point.z||0.0;var v,t;for(var i=0;i<3;i++){if(denorm&&i==2&&point.z===undefined){continue;}
if(i==0){v=xin;t='x';}
else if(i==1){v=yin;t='y';}
else{v=zin;t='z';}
switch(crs.axis[i]){case'e':point[t]=v;break;case'w':point[t]=-v;break;case'n':point[t]=v;break;case's':point[t]=-v;break;case'u':if(point[t]!==undefined){point.z=v;}
break;case'd':if(point[t]!==undefined){point.z=-v;}
break;default:alert("ERROR: unknow axis ("+crs.axis[i]+") - check definition of "+src.projName);return null;}}
return point;},reportError:function(msg){},extend:function(destination,source){destination=destination||{};if(source){for(var property in source){var value=source[property];if(value!==undefined){destination[property]=value;}}}
return destination;},Class:function(){var Class=function(){this.initialize.apply(this,arguments);};var extended={};var parent;for(var i=0;i<arguments.length;++i){if(typeof arguments[i]=="function"){parent=arguments[i].prototype;}else{parent=arguments[i];}
Proj4js.extend(extended,parent);}
Class.prototype=extended;return Class;},bind:function(func,object){var args=Array.prototype.slice.apply(arguments,[2]);return function(){var newArgs=args.concat(Array.prototype.slice.apply(arguments,[0]));return func.apply(object,newArgs);};},scriptName:"proj4js-compressed.js",defsLookupService:'http://spatialreference.org/ref',libPath:null,getScriptLocation:function(){if(this.libPath)return this.libPath;var scriptName=this.scriptName;var scriptNameLen=scriptName.length;var scripts=document.getElementsByTagName('script');for(var i=0;i<scripts.length;i++){var src=scripts[i].getAttribute('src');if(src){var index=src.lastIndexOf(scriptName);if((index>-1)&&(index+scriptNameLen==src.length)){this.libPath=src.slice(0,-scriptNameLen);break;}}}
return this.libPath||"";},loadScript:function(url,onload,onfail,loadCheck){var script=document.createElement('script');script.defer=false;script.type="text/javascript";script.id=url;script.src=url;script.onload=onload;script.onerror=onfail;script.loadCheck=loadCheck;if(/MSIE/.test(navigator.userAgent)){script.onreadystatechange=this.checkReadyState;}
document.getElementsByTagName('head')[0].appendChild(script);},checkReadyState:function(){if(this.readyState=='loaded'){if(!this.loadCheck()){this.onerror();}else{this.onload();}}}};Proj4js.Proj=Proj4js.Class({readyToUse:false,title:null,projName:null,units:null,datum:null,x0:0,y0:0,localCS:false,queue:null,initialize:function(srsCode,callback){this.srsCodeInput=srsCode;this.queue=[];if(callback){this.queue.push(callback);}
if((srsCode.indexOf('GEOGCS')>=0)||(srsCode.indexOf('GEOCCS')>=0)||(srsCode.indexOf('PROJCS')>=0)||(srsCode.indexOf('LOCAL_CS')>=0)){this.parseWKT(srsCode);this.deriveConstants();this.loadProjCode(this.projName);return;}
if(srsCode.indexOf('urn:')==0){var urn=srsCode.split(':');if((urn[1]=='ogc'||urn[1]=='x-ogc')&&(urn[2]=='def')&&(urn[3]=='crs')){srsCode=urn[4]+':'+urn[urn.length-1];}}else if(srsCode.indexOf('http://')==0){var url=srsCode.split('#');if(url[0].match(/epsg.org/)){srsCode='EPSG:'+url[1];}else if(url[0].match(/RIG.xml/)){srsCode='IGNF:'+url[1];}}
this.srsCode=srsCode.toUpperCase();if(this.srsCode.indexOf("EPSG")==0){this.srsCode=this.srsCode;this.srsAuth='epsg';this.srsProjNumber=this.srsCode.substring(5);}else if(this.srsCode.indexOf("IGNF")==0){this.srsCode=this.srsCode;this.srsAuth='IGNF';this.srsProjNumber=this.srsCode.substring(5);}else if(this.srsCode.indexOf("CRS")==0){this.srsCode=this.srsCode;this.srsAuth='CRS';this.srsProjNumber=this.srsCode.substring(4);}else{this.srsAuth='';this.srsProjNumber=this.srsCode;}
this.loadProjDefinition();},loadProjDefinition:function(){if(Proj4js.defs[this.srsCode]){this.defsLoaded();return;}
var url=Proj4js.getScriptLocation()+'defs/'+this.srsAuth.toUpperCase()+this.srsProjNumber+'.js';Proj4js.loadScript(url,Proj4js.bind(this.defsLoaded,this),Proj4js.bind(this.loadFromService,this),Proj4js.bind(this.checkDefsLoaded,this));},loadFromService:function(){var url=Proj4js.defsLookupService+'/'+this.srsAuth+'/'+this.srsProjNumber+'/proj4js/';Proj4js.loadScript(url,Proj4js.bind(this.defsLoaded,this),Proj4js.bind(this.defsFailed,this),Proj4js.bind(this.checkDefsLoaded,this));},defsLoaded:function(){this.parseDefs();this.loadProjCode(this.projName);},checkDefsLoaded:function(){if(Proj4js.defs[this.srsCode]){return true;}else{return false;}},defsFailed:function(){Proj4js.reportError('failed to load projection definition for: '+this.srsCode);Proj4js.defs[this.srsCode]=Proj4js.defs['WGS84'];this.defsLoaded();},loadProjCode:function(projName){if(Proj4js.Proj[projName]){this.initTransforms();return;}
var url=Proj4js.getScriptLocation()+'projCode/'+projName+'.js';Proj4js.loadScript(url,Proj4js.bind(this.loadProjCodeSuccess,this,projName),Proj4js.bind(this.loadProjCodeFailure,this,projName),Proj4js.bind(this.checkCodeLoaded,this,projName));},loadProjCodeSuccess:function(projName){if(Proj4js.Proj[projName].dependsOn){this.loadProjCode(Proj4js.Proj[projName].dependsOn);}else{this.initTransforms();}},loadProjCodeFailure:function(projName){Proj4js.reportError("failed to find projection file for: "+projName);},checkCodeLoaded:function(projName){if(Proj4js.Proj[projName]){return true;}else{return false;}},initTransforms:function(){Proj4js.extend(this,Proj4js.Proj[this.projName]);this.init();this.readyToUse=true;if(this.queue){var item;while((item=this.queue.shift())){item.call(this,this);}}},wktRE:/^(\w+)\[(.*)\]$/,parseWKT:function(wkt){var wktMatch=wkt.match(this.wktRE);if(!wktMatch)return;var wktObject=wktMatch[1];var wktContent=wktMatch[2];var wktTemp=wktContent.split(",");var wktName;if(wktObject.toUpperCase()=="TOWGS84"){wktName=wktObject;}else{wktName=wktTemp.shift();}
wktName=wktName.replace(/^\"/,"");wktName=wktName.replace(/\"$/,"");var wktArray=new Array();var bkCount=0;var obj="";for(var i=0;i<wktTemp.length;++i){var token=wktTemp[i];for(var j=0;j<token.length;++j){if(token.charAt(j)=="[")++bkCount;if(token.charAt(j)=="]")--bkCount;}
obj+=token;if(bkCount===0){wktArray.push(obj);obj="";}else{obj+=",";}}
switch(wktObject){case'LOCAL_CS':this.projName='identity'
this.localCS=true;this.srsCode=wktName;break;case'GEOGCS':this.projName='longlat'
this.geocsCode=wktName;if(!this.srsCode)this.srsCode=wktName;break;case'PROJCS':this.srsCode=wktName;break;case'GEOCCS':break;case'PROJECTION':this.projName=Proj4js.wktProjections[wktName]
break;case'DATUM':this.datumName=wktName;break;case'LOCAL_DATUM':this.datumCode='none';break;case'SPHEROID':this.ellps=wktName;this.a=parseFloat(wktArray.shift());this.rf=parseFloat(wktArray.shift());break;case'PRIMEM':this.from_greenwich=parseFloat(wktArray.shift());break;case'UNIT':this.units=wktName;this.unitsPerMeter=parseFloat(wktArray.shift());break;case'PARAMETER':var name=wktName.toLowerCase();var value=parseFloat(wktArray.shift());switch(name){case'false_easting':this.x0=value;break;case'false_northing':this.y0=value;break;case'scale_factor':this.k0=value;break;case'central_meridian':this.long0=value*Proj4js.common.D2R;break;case'latitude_of_origin':this.lat0=value*Proj4js.common.D2R;break;case'more_here':break;default:break;}
break;case'TOWGS84':this.datum_params=wktArray;break;case'AXIS':var name=wktName.toLowerCase();var value=wktArray.shift();switch(value){case'EAST':value='e';break;case'WEST':value='w';break;case'NORTH':value='n';break;case'SOUTH':value='s';break;case'UP':value='u';break;case'DOWN':value='d';break;case'OTHER':default:value=' ';break;}
if(!this.axis){this.axis="enu";}
switch(name){case'X':this.axis=value+this.axis.substr(1,2);break;case'Y':this.axis=this.axis.substr(0,1)+value+this.axis.substr(2,1);break;case'Z':this.axis=this.axis.substr(0,2)+value;break;default:break;}
case'MORE_HERE':break;default:break;}
for(var i=0;i<wktArray.length;++i){this.parseWKT(wktArray[i]);}},parseDefs:function(){this.defData=Proj4js.defs[this.srsCode];var paramName,paramVal;if(!this.defData){return;}
var paramArray=this.defData.split("+");for(var prop=0;prop<paramArray.length;prop++){var property=paramArray[prop].split("=");paramName=property[0].toLowerCase();paramVal=property[1];switch(paramName.replace(/\s/gi,"")){case"":break;case"title":this.title=paramVal;break;case"proj":this.projName=paramVal.replace(/\s/gi,"");break;case"units":this.units=paramVal.replace(/\s/gi,"");break;case"datum":this.datumCode=paramVal.replace(/\s/gi,"");break;case"nadgrids":this.nagrids=paramVal.replace(/\s/gi,"");break;case"ellps":this.ellps=paramVal.replace(/\s/gi,"");break;case"a":this.a=parseFloat(paramVal);break;case"b":this.b=parseFloat(paramVal);break;case"rf":this.rf=parseFloat(paramVal);break;case"lat_0":this.lat0=paramVal*Proj4js.common.D2R;break;case"lat_1":this.lat1=paramVal*Proj4js.common.D2R;break;case"lat_2":this.lat2=paramVal*Proj4js.common.D2R;break;case"lat_ts":this.lat_ts=paramVal*Proj4js.common.D2R;break;case"lon_0":this.long0=paramVal*Proj4js.common.D2R;break;case"alpha":this.alpha=parseFloat(paramVal)*Proj4js.common.D2R;break;case"lonc":this.longc=paramVal*Proj4js.common.D2R;break;case"x_0":this.x0=parseFloat(paramVal);break;case"y_0":this.y0=parseFloat(paramVal);break;case"k_0":this.k0=parseFloat(paramVal);break;case"k":this.k0=parseFloat(paramVal);break;case"r_a":this.R_A=true;break;case"zone":this.zone=parseInt(paramVal);break;case"south":this.utmSouth=true;break;case"towgs84":this.datum_params=paramVal.split(",");break;case"to_meter":this.to_meter=parseFloat(paramVal);break;case"from_greenwich":this.from_greenwich=paramVal*Proj4js.common.D2R;break;case"pm":paramVal=paramVal.replace(/\s/gi,"");this.from_greenwich=Proj4js.PrimeMeridian[paramVal]?Proj4js.PrimeMeridian[paramVal]:parseFloat(paramVal);this.from_greenwich*=Proj4js.common.D2R;break;case"axis":paramVal=paramVal.replace(/\s/gi,"");var legalAxis="ewnsud";if(paramVal.length==3&&legalAxis.indexOf(paramVal.substr(0,1))!=-1&&legalAxis.indexOf(paramVal.substr(1,1))!=-1&&legalAxis.indexOf(paramVal.substr(2,1))!=-1){this.axis=paramVal;}
break
case"no_defs":break;default:}}
this.deriveConstants();},deriveConstants:function(){if(this.nagrids=='@null')this.datumCode='none';if(this.datumCode&&this.datumCode!='none'){var datumDef=Proj4js.Datum[this.datumCode];if(datumDef){this.datum_params=datumDef.towgs84?datumDef.towgs84.split(','):null;this.ellps=datumDef.ellipse;this.datumName=datumDef.datumName?datumDef.datumName:this.datumCode;}}
if(!this.a){var ellipse=Proj4js.Ellipsoid[this.ellps]?Proj4js.Ellipsoid[this.ellps]:Proj4js.Ellipsoid['WGS84'];Proj4js.extend(this,ellipse);}
if(this.rf&&!this.b)this.b=(1.0-1.0/this.rf)*this.a;if(Math.abs(this.a-this.b)<Proj4js.common.EPSLN){this.sphere=true;this.b=this.a;}
this.a2=this.a*this.a;this.b2=this.b*this.b;this.es=(this.a2-this.b2)/this.a2;this.e=Math.sqrt(this.es);if(this.R_A){this.a*=1.-this.es*(Proj4js.common.SIXTH+this.es*(Proj4js.common.RA4+this.es*Proj4js.common.RA6));this.a2=this.a*this.a;this.b2=this.b*this.b;this.es=0.;}
this.ep2=(this.a2-this.b2)/this.b2;if(!this.k0)this.k0=1.0;if(!this.axis){this.axis="enu";}
this.datum=new Proj4js.datum(this);}});Proj4js.Proj.longlat={init:function(){},forward:function(pt){return pt;},inverse:function(pt){return pt;}};Proj4js.Proj.identity=Proj4js.Proj.longlat;Proj4js.defs={'WGS84':"+title=long/lat:WGS84 +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",'EPSG:4326':"+title=long/lat:WGS84 +proj=longlat +a=6378137.0 +b=6356752.31424518 +ellps=WGS84 +datum=WGS84 +units=degrees",'EPSG:4269':"+title=long/lat:NAD83 +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees",'EPSG:3785':"+title= Google Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"};Proj4js.defs['GOOGLE']=Proj4js.defs['EPSG:3785'];Proj4js.defs['EPSG:900913']=Proj4js.defs['EPSG:3785'];Proj4js.defs['EPSG:102113']=Proj4js.defs['EPSG:3785'];Proj4js.common={PI:3.141592653589793238,HALF_PI:1.570796326794896619,TWO_PI:6.283185307179586477,FORTPI:0.78539816339744833,R2D:57.29577951308232088,D2R:0.01745329251994329577,SEC_TO_RAD:4.84813681109535993589914102357e-6,EPSLN:1.0e-10,MAX_ITER:20,COS_67P5:0.38268343236508977,AD_C:1.0026000,PJD_UNKNOWN:0,PJD_3PARAM:1,PJD_7PARAM:2,PJD_GRIDSHIFT:3,PJD_WGS84:4,PJD_NODATUM:5,SRS_WGS84_SEMIMAJOR:6378137.0,SIXTH:.1666666666666666667,RA4:.04722222222222222222,RA6:.02215608465608465608,RV4:.06944444444444444444,RV6:.04243827160493827160,msfnz:function(eccent,sinphi,cosphi){var con=eccent*sinphi;return cosphi/(Math.sqrt(1.0-con*con));},tsfnz:function(eccent,phi,sinphi){var con=eccent*sinphi;var com=.5*eccent;con=Math.pow(((1.0-con)/(1.0+con)),com);return(Math.tan(.5*(this.HALF_PI-phi))/con);},phi2z:function(eccent,ts){var eccnth=.5*eccent;var con,dphi;var phi=this.HALF_PI-2*Math.atan(ts);for(var i=0;i<=15;i++){con=eccent*Math.sin(phi);dphi=this.HALF_PI-2*Math.atan(ts*(Math.pow(((1.0-con)/(1.0+con)),eccnth)))-phi;phi+=dphi;if(Math.abs(dphi)<=.0000000001)return phi;}
alert("phi2z has NoConvergence");return(-9999);},qsfnz:function(eccent,sinphi){var con;if(eccent>1.0e-7){con=eccent*sinphi;return((1.0-eccent*eccent)*(sinphi/(1.0-con*con)-(.5/eccent)*Math.log((1.0-con)/(1.0+con))));}else{return(2.0*sinphi);}},asinz:function(x){if(Math.abs(x)>1.0){x=(x>1.0)?1.0:-1.0;}
return Math.asin(x);},e0fn:function(x){return(1.0-0.25*x*(1.0+x/16.0*(3.0+1.25*x)));},e1fn:function(x){return(0.375*x*(1.0+0.25*x*(1.0+0.46875*x)));},e2fn:function(x){return(0.05859375*x*x*(1.0+0.75*x));},e3fn:function(x){return(x*x*x*(35.0/3072.0));},mlfn:function(e0,e1,e2,e3,phi){return(e0*phi-e1*Math.sin(2.0*phi)+e2*Math.sin(4.0*phi)-e3*Math.sin(6.0*phi));},srat:function(esinp,exp){return(Math.pow((1.0-esinp)/(1.0+esinp),exp));},sign:function(x){if(x<0.0)return(-1);else return(1);},adjust_lon:function(x){x=(Math.abs(x)<this.PI)?x:(x-(this.sign(x)*this.TWO_PI));return x;},adjust_lat:function(x){x=(Math.abs(x)<this.HALF_PI)?x:(x-(this.sign(x)*this.PI));return x;},latiso:function(eccent,phi,sinphi){if(Math.abs(phi)>this.HALF_PI)return+Number.NaN;if(phi==this.HALF_PI)return Number.POSITIVE_INFINITY;if(phi==-1.0*this.HALF_PI)return-1.0*Number.POSITIVE_INFINITY;var con=eccent*sinphi;return Math.log(Math.tan((this.HALF_PI+phi)/2.0))+eccent*Math.log((1.0-con)/(1.0+con))/2.0;},fL:function(x,L){return 2.0*Math.atan(x*Math.exp(L))-this.HALF_PI;},invlatiso:function(eccent,ts){var phi=this.fL(1.0,ts);var Iphi=0.0;var con=0.0;do{Iphi=phi;con=eccent*Math.sin(Iphi);phi=this.fL(Math.exp(eccent*Math.log((1.0+con)/(1.0-con))/2.0),ts)}while(Math.abs(phi-Iphi)>1.0e-12);return phi;},sinh:function(x)
{var r=Math.exp(x);r=(r-1.0/r)/2.0;return r;},cosh:function(x)
{var r=Math.exp(x);r=(r+1.0/r)/2.0;return r;},tanh:function(x)
{var r=Math.exp(x);r=(r-1.0/r)/(r+1.0/r);return r;},asinh:function(x)
{var s=(x>=0?1.0:-1.0);return s*(Math.log(Math.abs(x)+Math.sqrt(x*x+1.0)));},acosh:function(x)
{return 2.0*Math.log(Math.sqrt((x+1.0)/2.0)+Math.sqrt((x-1.0)/2.0));},atanh:function(x)
{return Math.log((x-1.0)/(x+1.0))/2.0;},gN:function(a,e,sinphi)
{var temp=e*sinphi;return a/Math.sqrt(1.0-temp*temp);}};Proj4js.datum=Proj4js.Class({initialize:function(proj){this.datum_type=Proj4js.common.PJD_WGS84;if(proj.datumCode&&proj.datumCode=='none'){this.datum_type=Proj4js.common.PJD_NODATUM;}
if(proj&&proj.datum_params){for(var i=0;i<proj.datum_params.length;i++){proj.datum_params[i]=parseFloat(proj.datum_params[i]);}
if(proj.datum_params[0]!=0||proj.datum_params[1]!=0||proj.datum_params[2]!=0){this.datum_type=Proj4js.common.PJD_3PARAM;}
if(proj.datum_params.length>3){if(proj.datum_params[3]!=0||proj.datum_params[4]!=0||proj.datum_params[5]!=0||proj.datum_params[6]!=0){this.datum_type=Proj4js.common.PJD_7PARAM;proj.datum_params[3]*=Proj4js.common.SEC_TO_RAD;proj.datum_params[4]*=Proj4js.common.SEC_TO_RAD;proj.datum_params[5]*=Proj4js.common.SEC_TO_RAD;proj.datum_params[6]=(proj.datum_params[6]/1000000.0)+1.0;}}}
if(proj){this.a=proj.a;this.b=proj.b;this.es=proj.es;this.ep2=proj.ep2;this.datum_params=proj.datum_params;}},compare_datums:function(dest){if(this.datum_type!=dest.datum_type){return false;}else if(this.a!=dest.a||Math.abs(this.es-dest.es)>0.000000000050){return false;}else if(this.datum_type==Proj4js.common.PJD_3PARAM){return(this.datum_params[0]==dest.datum_params[0]&&this.datum_params[1]==dest.datum_params[1]&&this.datum_params[2]==dest.datum_params[2]);}else if(this.datum_type==Proj4js.common.PJD_7PARAM){return(this.datum_params[0]==dest.datum_params[0]&&this.datum_params[1]==dest.datum_params[1]&&this.datum_params[2]==dest.datum_params[2]&&this.datum_params[3]==dest.datum_params[3]&&this.datum_params[4]==dest.datum_params[4]&&this.datum_params[5]==dest.datum_params[5]&&this.datum_params[6]==dest.datum_params[6]);}else if(this.datum_type==Proj4js.common.PJD_GRIDSHIFT){return strcmp(pj_param(this.params,"snadgrids").s,pj_param(dest.params,"snadgrids").s)==0;}else{return true;}},geodetic_to_geocentric:function(p){var Longitude=p.x;var Latitude=p.y;var Height=p.z?p.z:0;var X;var Y;var Z;var Error_Code=0;var Rn;var Sin_Lat;var Sin2_Lat;var Cos_Lat;if(Latitude<-Proj4js.common.HALF_PI&&Latitude>-1.001*Proj4js.common.HALF_PI){Latitude=-Proj4js.common.HALF_PI;}else if(Latitude>Proj4js.common.HALF_PI&&Latitude<1.001*Proj4js.common.HALF_PI){Latitude=Proj4js.common.HALF_PI;}else if((Latitude<-Proj4js.common.HALF_PI)||(Latitude>Proj4js.common.HALF_PI)){Proj4js.reportError('geocent:lat out of range:'+Latitude);return null;}
if(Longitude>Proj4js.common.PI)Longitude-=(2*Proj4js.common.PI);Sin_Lat=Math.sin(Latitude);Cos_Lat=Math.cos(Latitude);Sin2_Lat=Sin_Lat*Sin_Lat;Rn=this.a/(Math.sqrt(1.0e0-this.es*Sin2_Lat));X=(Rn+Height)*Cos_Lat*Math.cos(Longitude);Y=(Rn+Height)*Cos_Lat*Math.sin(Longitude);Z=((Rn*(1-this.es))+Height)*Sin_Lat;p.x=X;p.y=Y;p.z=Z;return Error_Code;},geocentric_to_geodetic:function(p){var genau=1.E-12;var genau2=(genau*genau);var maxiter=30;var P;var RR;var CT;var ST;var RX;var RK;var RN;var CPHI0;var SPHI0;var CPHI;var SPHI;var SDPHI;var At_Pole;var iter;var X=p.x;var Y=p.y;var Z=p.z?p.z:0.0;var Longitude;var Latitude;var Height;At_Pole=false;P=Math.sqrt(X*X+Y*Y);RR=Math.sqrt(X*X+Y*Y+Z*Z);if(P/this.a<genau){At_Pole=true;Longitude=0.0;if(RR/this.a<genau){Latitude=Proj4js.common.HALF_PI;Height=-this.b;return;}}else{Longitude=Math.atan2(Y,X);}
CT=Z/RR;ST=P/RR;RX=1.0/Math.sqrt(1.0-this.es*(2.0-this.es)*ST*ST);CPHI0=ST*(1.0-this.es)*RX;SPHI0=CT*RX;iter=0;do
{iter++;RN=this.a/Math.sqrt(1.0-this.es*SPHI0*SPHI0);Height=P*CPHI0+Z*SPHI0-RN*(1.0-this.es*SPHI0*SPHI0);RK=this.es*RN/(RN+Height);RX=1.0/Math.sqrt(1.0-RK*(2.0-RK)*ST*ST);CPHI=ST*(1.0-RK)*RX;SPHI=CT*RX;SDPHI=SPHI*CPHI0-CPHI*SPHI0;CPHI0=CPHI;SPHI0=SPHI;}
while(SDPHI*SDPHI>genau2&&iter<maxiter);Latitude=Math.atan(SPHI/Math.abs(CPHI));p.x=Longitude;p.y=Latitude;p.z=Height;return p;},geocentric_to_geodetic_noniter:function(p){var X=p.x;var Y=p.y;var Z=p.z?p.z:0;var Longitude;var Latitude;var Height;var W;var W2;var T0;var T1;var S0;var S1;var Sin_B0;var Sin3_B0;var Cos_B0;var Sin_p1;var Cos_p1;var Rn;var Sum;var At_Pole;X=parseFloat(X);Y=parseFloat(Y);Z=parseFloat(Z);At_Pole=false;if(X!=0.0)
{Longitude=Math.atan2(Y,X);}
else
{if(Y>0)
{Longitude=Proj4js.common.HALF_PI;}
else if(Y<0)
{Longitude=-Proj4js.common.HALF_PI;}
else
{At_Pole=true;Longitude=0.0;if(Z>0.0)
{Latitude=Proj4js.common.HALF_PI;}
else if(Z<0.0)
{Latitude=-Proj4js.common.HALF_PI;}
else
{Latitude=Proj4js.common.HALF_PI;Height=-this.b;return;}}}
W2=X*X+Y*Y;W=Math.sqrt(W2);T0=Z*Proj4js.common.AD_C;S0=Math.sqrt(T0*T0+W2);Sin_B0=T0/S0;Cos_B0=W/S0;Sin3_B0=Sin_B0*Sin_B0*Sin_B0;T1=Z+this.b*this.ep2*Sin3_B0;Sum=W-this.a*this.es*Cos_B0*Cos_B0*Cos_B0;S1=Math.sqrt(T1*T1+Sum*Sum);Sin_p1=T1/S1;Cos_p1=Sum/S1;Rn=this.a/Math.sqrt(1.0-this.es*Sin_p1*Sin_p1);if(Cos_p1>=Proj4js.common.COS_67P5)
{Height=W/Cos_p1-Rn;}
else if(Cos_p1<=-Proj4js.common.COS_67P5)
{Height=W/-Cos_p1-Rn;}
else
{Height=Z/Sin_p1+Rn*(this.es-1.0);}
if(At_Pole==false)
{Latitude=Math.atan(Sin_p1/Cos_p1);}
p.x=Longitude;p.y=Latitude;p.z=Height;return p;},geocentric_to_wgs84:function(p){if(this.datum_type==Proj4js.common.PJD_3PARAM)
{p.x+=this.datum_params[0];p.y+=this.datum_params[1];p.z+=this.datum_params[2];}
else if(this.datum_type==Proj4js.common.PJD_7PARAM)
{var Dx_BF=this.datum_params[0];var Dy_BF=this.datum_params[1];var Dz_BF=this.datum_params[2];var Rx_BF=this.datum_params[3];var Ry_BF=this.datum_params[4];var Rz_BF=this.datum_params[5];var M_BF=this.datum_params[6];var x_out=M_BF*(p.x-Rz_BF*p.y+Ry_BF*p.z)+Dx_BF;var y_out=M_BF*(Rz_BF*p.x+p.y-Rx_BF*p.z)+Dy_BF;var z_out=M_BF*(-Ry_BF*p.x+Rx_BF*p.y+p.z)+Dz_BF;p.x=x_out;p.y=y_out;p.z=z_out;}},geocentric_from_wgs84:function(p){if(this.datum_type==Proj4js.common.PJD_3PARAM)
{p.x-=this.datum_params[0];p.y-=this.datum_params[1];p.z-=this.datum_params[2];}
else if(this.datum_type==Proj4js.common.PJD_7PARAM)
{var Dx_BF=this.datum_params[0];var Dy_BF=this.datum_params[1];var Dz_BF=this.datum_params[2];var Rx_BF=this.datum_params[3];var Ry_BF=this.datum_params[4];var Rz_BF=this.datum_params[5];var M_BF=this.datum_params[6];var x_tmp=(p.x-Dx_BF)/M_BF;var y_tmp=(p.y-Dy_BF)/M_BF;var z_tmp=(p.z-Dz_BF)/M_BF;p.x=x_tmp+Rz_BF*y_tmp-Ry_BF*z_tmp;p.y=-Rz_BF*x_tmp+y_tmp+Rx_BF*z_tmp;p.z=Ry_BF*x_tmp-Rx_BF*y_tmp+z_tmp;}}});Proj4js.Point=Proj4js.Class({initialize:function(x,y,z){if(typeof x=='object'){this.x=x[0];this.y=x[1];this.z=x[2]||0.0;}else if(typeof x=='string'&&typeof y=='undefined'){var coords=x.split(',');this.x=parseFloat(coords[0]);this.y=parseFloat(coords[1]);this.z=parseFloat(coords[2])||0.0;}else{this.x=x;this.y=y;this.z=z||0.0;}},clone:function(){return new Proj4js.Point(this.x,this.y,this.z);},toString:function(){return("x="+this.x+",y="+this.y);},toShortString:function(){return(this.x+", "+this.y);}});Proj4js.PrimeMeridian={"greenwich":0.0,"lisbon":-9.131906111111,"paris":2.337229166667,"bogota":-74.080916666667,"madrid":-3.687938888889,"rome":12.452333333333,"bern":7.439583333333,"jakarta":106.807719444444,"ferro":-17.666666666667,"brussels":4.367975,"stockholm":18.058277777778,"athens":23.7163375,"oslo":10.722916666667};Proj4js.Ellipsoid={"MERIT":{a:6378137.0,rf:298.257,ellipseName:"MERIT 1983"},"SGS85":{a:6378136.0,rf:298.257,ellipseName:"Soviet Geodetic System 85"},"GRS80":{a:6378137.0,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},"IAU76":{a:6378140.0,rf:298.257,ellipseName:"IAU 1976"},"airy":{a:6377563.396,b:6356256.910,ellipseName:"Airy 1830"},"APL4.":{a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},"NWL9D":{a:6378145.0,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},"mod_airy":{a:6377340.189,b:6356034.446,ellipseName:"Modified Airy"},"andrae":{a:6377104.43,rf:300.0,ellipseName:"Andrae 1876 (Den., Iclnd.)"},"aust_SA":{a:6378160.0,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},"GRS67":{a:6378160.0,rf:298.2471674270,ellipseName:"GRS 67(IUGG 1967)"},"bessel":{a:6377397.155,rf:299.1528128,ellipseName:"Bessel 1841"},"bess_nam":{a:6377483.865,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},"clrk66":{a:6378206.4,b:6356583.8,ellipseName:"Clarke 1866"},"clrk80":{a:6378249.145,rf:293.4663,ellipseName:"Clarke 1880 mod."},"CPM":{a:6375738.7,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},"delmbr":{a:6376428.0,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},"engelis":{a:6378136.05,rf:298.2566,ellipseName:"Engelis 1985"},"evrst30":{a:6377276.345,rf:300.8017,ellipseName:"Everest 1830"},"evrst48":{a:6377304.063,rf:300.8017,ellipseName:"Everest 1948"},"evrst56":{a:6377301.243,rf:300.8017,ellipseName:"Everest 1956"},"evrst69":{a:6377295.664,rf:300.8017,ellipseName:"Everest 1969"},"evrstSS":{a:6377298.556,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},"fschr60":{a:6378166.0,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},"fschr60m":{a:6378155.0,rf:298.3,ellipseName:"Fischer 1960"},"fschr68":{a:6378150.0,rf:298.3,ellipseName:"Fischer 1968"},"helmert":{a:6378200.0,rf:298.3,ellipseName:"Helmert 1906"},"hough":{a:6378270.0,rf:297.0,ellipseName:"Hough"},"intl":{a:6378388.0,rf:297.0,ellipseName:"International 1909 (Hayford)"},"kaula":{a:6378163.0,rf:298.24,ellipseName:"Kaula 1961"},"lerch":{a:6378139.0,rf:298.257,ellipseName:"Lerch 1979"},"mprts":{a:6397300.0,rf:191.0,ellipseName:"Maupertius 1738"},"new_intl":{a:6378157.5,b:6356772.2,ellipseName:"New International 1967"},"plessis":{a:6376523.0,rf:6355863.0,ellipseName:"Plessis 1817 (France)"},"krass":{a:6378245.0,rf:298.3,ellipseName:"Krassovsky, 1942"},"SEasia":{a:6378155.0,b:6356773.3205,ellipseName:"Southeast Asia"},"walbeck":{a:6376896.0,b:6355834.8467,ellipseName:"Walbeck"},"WGS60":{a:6378165.0,rf:298.3,ellipseName:"WGS 60"},"WGS66":{a:6378145.0,rf:298.25,ellipseName:"WGS 66"},"WGS72":{a:6378135.0,rf:298.26,ellipseName:"WGS 72"},"WGS84":{a:6378137.0,rf:298.257223563,ellipseName:"WGS 84"},"sphere":{a:6370997.0,b:6370997.0,ellipseName:"Normal Sphere (r=6370997)"}};Proj4js.Datum={"WGS84":{towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},"GGRS87":{towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},"NAD83":{towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},"NAD27":{nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},"potsdam":{towgs84:"606.0,23.0,413.0",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},"carthage":{towgs84:"-263.0,6.0,431.0",ellipse:"clark80",datumName:"Carthage 1934 Tunisia"},"hermannskogel":{towgs84:"653.0,-212.0,449.0",ellipse:"bessel",datumName:"Hermannskogel"},"ire65":{towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},"nzgd49":{towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},"OSGB36":{towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Airy 1830"}};Proj4js.WGS84=new Proj4js.Proj('WGS84');Proj4js.Datum['OSB36']=Proj4js.Datum['OSGB36'];Proj4js.wktProjections={"Lambert Tangential Conformal Conic Projection":"lcc","Mercator":"merc","Popular Visualisation Pseudo Mercator":"merc","Transverse_Mercator":"tmerc","Transverse Mercator":"tmerc","Lambert Azimuthal Equal Area":"laea","Universal Transverse Mercator System":"utm"};Proj4js.Proj.aea={init:function(){if(Math.abs(this.lat1+this.lat2)<Proj4js.common.EPSLN){Proj4js.reportError("aeaInitEqualLatitudes");return;}
this.temp=this.b/this.a;this.es=1.0-Math.pow(this.temp,2);this.e3=Math.sqrt(this.es);this.sin_po=Math.sin(this.lat1);this.cos_po=Math.cos(this.lat1);this.t1=this.sin_po;this.con=this.sin_po;this.ms1=Proj4js.common.msfnz(this.e3,this.sin_po,this.cos_po);this.qs1=Proj4js.common.qsfnz(this.e3,this.sin_po,this.cos_po);this.sin_po=Math.sin(this.lat2);this.cos_po=Math.cos(this.lat2);this.t2=this.sin_po;this.ms2=Proj4js.common.msfnz(this.e3,this.sin_po,this.cos_po);this.qs2=Proj4js.common.qsfnz(this.e3,this.sin_po,this.cos_po);this.sin_po=Math.sin(this.lat0);this.cos_po=Math.cos(this.lat0);this.t3=this.sin_po;this.qs0=Proj4js.common.qsfnz(this.e3,this.sin_po,this.cos_po);if(Math.abs(this.lat1-this.lat2)>Proj4js.common.EPSLN){this.ns0=(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1);}else{this.ns0=this.con;}
this.c=this.ms1*this.ms1+this.ns0*this.qs1;this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0;},forward:function(p){var lon=p.x;var lat=p.y;this.sin_phi=Math.sin(lat);this.cos_phi=Math.cos(lat);var qs=Proj4js.common.qsfnz(this.e3,this.sin_phi,this.cos_phi);var rh1=this.a*Math.sqrt(this.c-this.ns0*qs)/this.ns0;var theta=this.ns0*Proj4js.common.adjust_lon(lon-this.long0);var x=rh1*Math.sin(theta)+this.x0;var y=this.rh-rh1*Math.cos(theta)+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var rh1,qs,con,theta,lon,lat;p.x-=this.x0;p.y=this.rh-p.y+this.y0;if(this.ns0>=0){rh1=Math.sqrt(p.x*p.x+p.y*p.y);con=1.0;}else{rh1=-Math.sqrt(p.x*p.x+p.y*p.y);con=-1.0;}
theta=0.0;if(rh1!=0.0){theta=Math.atan2(con*p.x,con*p.y);}
con=rh1*this.ns0/this.a;qs=(this.c-con*con)/this.ns0;if(this.e3>=1e-10){con=1-.5*(1.0-this.es)*Math.log((1.0-this.e3)/(1.0+this.e3))/this.e3;if(Math.abs(Math.abs(con)-Math.abs(qs))>.0000000001){lat=this.phi1z(this.e3,qs);}else{if(qs>=0){lat=.5*PI;}else{lat=-.5*PI;}}}else{lat=this.phi1z(e3,qs);}
lon=Proj4js.common.adjust_lon(theta/this.ns0+this.long0);p.x=lon;p.y=lat;return p;},phi1z:function(eccent,qs){var con,com,dphi;var phi=Proj4js.common.asinz(.5*qs);if(eccent<Proj4js.common.EPSLN)return phi;var eccnts=eccent*eccent;for(var i=1;i<=25;i++){sinphi=Math.sin(phi);cosphi=Math.cos(phi);con=eccent*sinphi;com=1.0-con*con;dphi=.5*com*com/cosphi*(qs/(1.0-eccnts)-sinphi/com+.5/eccent*Math.log((1.0-con)/(1.0+con)));phi=phi+dphi;if(Math.abs(dphi)<=1e-7)return phi;}
Proj4js.reportError("aea:phi1z:Convergence error");return null;}};Proj4js.Proj.sterea={dependsOn:'gauss',init:function(){Proj4js.Proj['gauss'].init.apply(this);if(!this.rc){Proj4js.reportError("sterea:init:E_ERROR_0");return;}
this.sinc0=Math.sin(this.phic0);this.cosc0=Math.cos(this.phic0);this.R2=2.0*this.rc;if(!this.title)this.title="Oblique Stereographic Alternative";},forward:function(p){p.x=Proj4js.common.adjust_lon(p.x-this.long0);Proj4js.Proj['gauss'].forward.apply(this,[p]);sinc=Math.sin(p.y);cosc=Math.cos(p.y);cosl=Math.cos(p.x);k=this.k0*this.R2/(1.0+this.sinc0*sinc+this.cosc0*cosc*cosl);p.x=k*cosc*Math.sin(p.x);p.y=k*(this.cosc0*sinc-this.sinc0*cosc*cosl);p.x=this.a*p.x+this.x0;p.y=this.a*p.y+this.y0;return p;},inverse:function(p){var lon,lat;p.x=(p.x-this.x0)/this.a;p.y=(p.y-this.y0)/this.a;p.x/=this.k0;p.y/=this.k0;if((rho=Math.sqrt(p.x*p.x+p.y*p.y))){c=2.0*Math.atan2(rho,this.R2);sinc=Math.sin(c);cosc=Math.cos(c);lat=Math.asin(cosc*this.sinc0+p.y*sinc*this.cosc0/rho);lon=Math.atan2(p.x*sinc,rho*this.cosc0*cosc-p.y*this.sinc0*sinc);}else{lat=this.phic0;lon=0.;}
p.x=lon;p.y=lat;Proj4js.Proj['gauss'].inverse.apply(this,[p]);p.x=Proj4js.common.adjust_lon(p.x+this.long0);return p;}};function phi4z(eccent,e0,e1,e2,e3,a,b,c,phi){var sinphi,sin2ph,tanph,ml,mlp,con1,con2,con3,dphi,i;phi=a;for(i=1;i<=15;i++){sinphi=Math.sin(phi);tanphi=Math.tan(phi);c=tanphi*Math.sqrt(1.0-eccent*sinphi*sinphi);sin2ph=Math.sin(2.0*phi);ml=e0*phi-e1*sin2ph+e2*Math.sin(4.0*phi)-e3*Math.sin(6.0*phi);mlp=e0-2.0*e1*Math.cos(2.0*phi)+4.0*e2*Math.cos(4.0*phi)-6.0*e3*Math.cos(6.0*phi);con1=2.0*ml+c*(ml*ml+b)-2.0*a*(c*ml+1.0);con2=eccent*sin2ph*(ml*ml+b-2.0*a*ml)/(2.0*c);con3=2.0*(a-ml)*(c*mlp-2.0/sin2ph)-2.0*mlp;dphi=con1/(con2+con3);phi+=dphi;if(Math.abs(dphi)<=.0000000001)return(phi);}
Proj4js.reportError("phi4z: No convergence");return null;}
function e4fn(x){var con,com;con=1.0+x;com=1.0-x;return(Math.sqrt((Math.pow(con,con))*(Math.pow(com,com))));}
Proj4js.Proj.poly={init:function(){var temp;if(this.lat0=0)this.lat0=90;this.temp=this.b/this.a;this.es=1.0-Math.pow(this.temp,2);this.e=Math.sqrt(this.es);this.e0=Proj4js.common.e0fn(this.es);this.e1=Proj4js.common.e1fn(this.es);this.e2=Proj4js.common.e2fn(this.es);this.e3=Proj4js.common.e3fn(this.es);this.ml0=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0);},forward:function(p){var sinphi,cosphi;var al;var c;var con,ml;var ms;var x,y;var lon=p.x;var lat=p.y;con=Proj4js.common.adjust_lon(lon-this.long0);if(Math.abs(lat)<=.0000001){x=this.x0+this.a*con;y=this.y0-this.a*this.ml0;}else{sinphi=Math.sin(lat);cosphi=Math.cos(lat);ml=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,lat);ms=Proj4js.common.msfnz(this.e,sinphi,cosphi);con=sinphi;x=this.x0+this.a*ms*Math.sin(con)/sinphi;y=this.y0+this.a*(ml-this.ml0+ms*(1.0-Math.cos(con))/sinphi);}
p.x=x;p.y=y;return p;},inverse:function(p){var sin_phi,cos_phi;var al;var b;var c;var con,ml;var iflg;var lon,lat;p.x-=this.x0;p.y-=this.y0;al=this.ml0+p.y/this.a;iflg=0;if(Math.abs(al)<=.0000001){lon=p.x/this.a+this.long0;lat=0.0;}else{b=al*al+(p.x/this.a)*(p.x/this.a);iflg=phi4z(this.es,this.e0,this.e1,this.e2,this.e3,this.al,b,c,lat);if(iflg!=1)return(iflg);lon=Proj4js.common.adjust_lon((Proj4js.common.asinz(p.x*c/this.a)/Math.sin(lat))+this.long0);}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.equi={init:function(){if(!this.x0)this.x0=0;if(!this.y0)this.y0=0;if(!this.lat0)this.lat0=0;if(!this.long0)this.long0=0;},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+this.a*dlon*Math.cos(this.lat0);var y=this.y0+this.a*lat;this.t1=x;this.t2=Math.cos(this.lat0);p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var lat=p.y/this.a;if(Math.abs(lat)>Proj4js.common.HALF_PI){Proj4js.reportError("equi:Inv:DataError");}
var lon=Proj4js.common.adjust_lon(this.long0+p.x/(this.a*Math.cos(this.lat0)));p.x=lon;p.y=lat;}};Proj4js.Proj.merc={init:function(){if(this.lat_ts){if(this.sphere){this.k0=Math.cos(this.lat_ts);}else{this.k0=Proj4js.common.msfnz(this.es,Math.sin(this.lat_ts),Math.cos(this.lat_ts));}}},forward:function(p){var lon=p.x;var lat=p.y;if(lat*Proj4js.common.R2D>90.0&&lat*Proj4js.common.R2D<-90.0&&lon*Proj4js.common.R2D>180.0&&lon*Proj4js.common.R2D<-180.0){Proj4js.reportError("merc:forward: llInputOutOfRange: "+lon+" : "+lat);return null;}
var x,y;if(Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI)<=Proj4js.common.EPSLN){Proj4js.reportError("merc:forward: ll2mAtPoles");return null;}else{if(this.sphere){x=this.x0+this.a*this.k0*Proj4js.common.adjust_lon(lon-this.long0);y=this.y0+this.a*this.k0*Math.log(Math.tan(Proj4js.common.FORTPI+0.5*lat));}else{var sinphi=Math.sin(lat);var ts=Proj4js.common.tsfnz(this.e,lat,sinphi);x=this.x0+this.a*this.k0*Proj4js.common.adjust_lon(lon-this.long0);y=this.y0-this.a*this.k0*Math.log(ts);}
p.x=x;p.y=y;return p;}},inverse:function(p){var x=p.x-this.x0;var y=p.y-this.y0;var lon,lat;if(this.sphere){lat=Proj4js.common.HALF_PI-2.0*Math.atan(Math.exp(-y/this.a*this.k0));}else{var ts=Math.exp(-y/(this.a*this.k0));lat=Proj4js.common.phi2z(this.e,ts);if(lat==-9999){Proj4js.reportError("merc:inverse: lat = -9999");return null;}}
lon=Proj4js.common.adjust_lon(this.long0+x/(this.a*this.k0));p.x=lon;p.y=lat;return p;}};Proj4js.Proj.utm={dependsOn:'tmerc',init:function(){if(!this.zone){Proj4js.reportError("utm:init: zone must be specified for UTM");return;}
this.lat0=0.0;this.long0=((6*Math.abs(this.zone))-183)*Proj4js.common.D2R;this.x0=500000.0;this.y0=this.utmSouth?10000000.0:0.0;this.k0=0.9996;Proj4js.Proj['tmerc'].init.apply(this);this.forward=Proj4js.Proj['tmerc'].forward;this.inverse=Proj4js.Proj['tmerc'].inverse;}};Proj4js.Proj.eqdc={init:function(){if(!this.mode)this.mode=0;this.temp=this.b/this.a;this.es=1.0-Math.pow(this.temp,2);this.e=Math.sqrt(this.es);this.e0=Proj4js.common.e0fn(this.es);this.e1=Proj4js.common.e1fn(this.es);this.e2=Proj4js.common.e2fn(this.es);this.e3=Proj4js.common.e3fn(this.es);this.sinphi=Math.sin(this.lat1);this.cosphi=Math.cos(this.lat1);this.ms1=Proj4js.common.msfnz(this.e,this.sinphi,this.cosphi);this.ml1=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat1);if(this.mode!=0){if(Math.abs(this.lat1+this.lat2)<Proj4js.common.EPSLN){Proj4js.reportError("eqdc:Init:EqualLatitudes");}
this.sinphi=Math.sin(this.lat2);this.cosphi=Math.cos(this.lat2);this.ms2=Proj4js.common.msfnz(this.e,this.sinphi,this.cosphi);this.ml2=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat2);if(Math.abs(this.lat1-this.lat2)>=Proj4js.common.EPSLN){this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1);}else{this.ns=this.sinphi;}}else{this.ns=this.sinphi;}
this.g=this.ml1+this.ms1/this.ns;this.ml0=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0);this.rh=this.a*(this.g-this.ml0);},forward:function(p){var lon=p.x;var lat=p.y;var ml=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,lat);var rh1=this.a*(this.g-ml);var theta=this.ns*Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+rh1*Math.sin(theta);var y=this.y0+this.rh-rh1*Math.cos(theta);p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y=this.rh-p.y+this.y0;var con,rh1;if(this.ns>=0){var rh1=Math.sqrt(p.x*p.x+p.y*p.y);var con=1.0;}else{rh1=-Math.sqrt(p.x*p.x+p.y*p.y);con=-1.0;}
var theta=0.0;if(rh1!=0.0)theta=Math.atan2(con*p.x,con*p.y);var ml=this.g-rh1/this.a;var lat=this.phi3z(ml,this.e0,this.e1,this.e2,this.e3);var lon=Proj4js.common.adjust_lon(this.long0+theta/this.ns);p.x=lon;p.y=lat;return p;},phi3z:function(ml,e0,e1,e2,e3){var phi;var dphi;phi=ml;for(var i=0;i<15;i++){dphi=(ml+e1*Math.sin(2.0*phi)-e2*Math.sin(4.0*phi)+e3*Math.sin(6.0*phi))/e0-phi;phi+=dphi;if(Math.abs(dphi)<=.0000000001){return phi;}}
Proj4js.reportError("PHI3Z-CONV:Latitude failed to converge after 15 iterations");return null;}};Proj4js.Proj.tmerc={init:function(){this.e0=Proj4js.common.e0fn(this.es);this.e1=Proj4js.common.e1fn(this.es);this.e2=Proj4js.common.e2fn(this.es);this.e3=Proj4js.common.e3fn(this.es);this.ml0=this.a*Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0);},forward:function(p){var lon=p.x;var lat=p.y;var delta_lon=Proj4js.common.adjust_lon(lon-this.long0);var con;var x,y;var sin_phi=Math.sin(lat);var cos_phi=Math.cos(lat);if(this.sphere){var b=cos_phi*Math.sin(delta_lon);if((Math.abs(Math.abs(b)-1.0))<.0000000001){Proj4js.reportError("tmerc:forward: Point projects into infinity");return(93);}else{x=.5*this.a*this.k0*Math.log((1.0+b)/(1.0-b));con=Math.acos(cos_phi*Math.cos(delta_lon)/Math.sqrt(1.0-b*b));if(lat<0)con=-con;y=this.a*this.k0*(con-this.lat0);}}else{var al=cos_phi*delta_lon;var als=Math.pow(al,2);var c=this.ep2*Math.pow(cos_phi,2);var tq=Math.tan(lat);var t=Math.pow(tq,2);con=1.0-this.es*Math.pow(sin_phi,2);var n=this.a/Math.sqrt(con);var ml=this.a*Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,lat);x=this.k0*n*al*(1.0+als/6.0*(1.0-t+c+als/20.0*(5.0-18.0*t+Math.pow(t,2)+72.0*c-58.0*this.ep2)))+this.x0;y=this.k0*(ml-this.ml0+n*tq*(als*(0.5+als/24.0*(5.0-t+9.0*c+4.0*Math.pow(c,2)+als/30.0*(61.0-58.0*t+Math.pow(t,2)+600.0*c-330.0*this.ep2)))))+this.y0;}
p.x=x;p.y=y;return p;},inverse:function(p){var con,phi;var delta_phi;var i;var max_iter=6;var lat,lon;if(this.sphere){var f=Math.exp(p.x/(this.a*this.k0));var g=.5*(f-1/f);var temp=this.lat0+p.y/(this.a*this.k0);var h=Math.cos(temp);con=Math.sqrt((1.0-h*h)/(1.0+g*g));lat=Proj4js.common.asinz(con);if(temp<0)
lat=-lat;if((g==0)&&(h==0)){lon=this.long0;}else{lon=Proj4js.common.adjust_lon(Math.atan2(g,h)+this.long0);}}else{var x=p.x-this.x0;var y=p.y-this.y0;con=(this.ml0+y/this.k0)/this.a;phi=con;for(i=0;true;i++){delta_phi=((con+this.e1*Math.sin(2.0*phi)-this.e2*Math.sin(4.0*phi)+this.e3*Math.sin(6.0*phi))/this.e0)-phi;phi+=delta_phi;if(Math.abs(delta_phi)<=Proj4js.common.EPSLN)break;if(i>=max_iter){Proj4js.reportError("tmerc:inverse: Latitude failed to converge");return(95);}}
if(Math.abs(phi)<Proj4js.common.HALF_PI){var sin_phi=Math.sin(phi);var cos_phi=Math.cos(phi);var tan_phi=Math.tan(phi);var c=this.ep2*Math.pow(cos_phi,2);var cs=Math.pow(c,2);var t=Math.pow(tan_phi,2);var ts=Math.pow(t,2);con=1.0-this.es*Math.pow(sin_phi,2);var n=this.a/Math.sqrt(con);var r=n*(1.0-this.es)/con;var d=x/(n*this.k0);var ds=Math.pow(d,2);lat=phi-(n*tan_phi*ds/r)*(0.5-ds/24.0*(5.0+3.0*t+10.0*c-4.0*cs-9.0*this.ep2-ds/30.0*(61.0+90.0*t+298.0*c+45.0*ts-252.0*this.ep2-3.0*cs)));lon=Proj4js.common.adjust_lon(this.long0+(d*(1.0-ds/6.0*(1.0+2.0*t+c-ds/20.0*(5.0-2.0*c+28.0*t-3.0*cs+8.0*this.ep2+24.0*ts)))/cos_phi));}else{lat=Proj4js.common.HALF_PI*Proj4js.common.sign(y);lon=this.long0;}}
p.x=lon;p.y=lat;return p;}};Proj4js.defs["GOOGLE"]="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";Proj4js.defs["EPSG:900913"]=Proj4js.defs["GOOGLE"];Proj4js.Proj.gstmerc={init:function(){var temp=this.b/this.a;this.e=Math.sqrt(1.0-temp*temp);this.lc=this.long0;this.rs=Math.sqrt(1.0+this.e*this.e*Math.pow(Math.cos(this.lat0),4.0)/(1.0-this.e*this.e));var sinz=Math.sin(this.lat0);var pc=Math.asin(sinz/this.rs);var sinzpc=Math.sin(pc);this.cp=Proj4js.common.latiso(0.0,pc,sinzpc)-this.rs*Proj4js.common.latiso(this.e,this.lat0,sinz);this.n2=this.k0*this.a*Math.sqrt(1.0-this.e*this.e)/(1.0-this.e*this.e*sinz*sinz);this.xs=this.x0;this.ys=this.y0-this.n2*pc;if(!this.title)this.title="Gauss Schreiber transverse mercator";},forward:function(p){var lon=p.x;var lat=p.y;var L=this.rs*(lon-this.lc);var Ls=this.cp+(this.rs*Proj4js.common.latiso(this.e,lat,Math.sin(lat)));var lat1=Math.asin(Math.sin(L)/Proj4js.common.cosh(Ls));var Ls1=Proj4js.common.latiso(0.0,lat1,Math.sin(lat1));p.x=this.xs+(this.n2*Ls1);p.y=this.ys+(this.n2*Math.atan(Proj4js.common.sinh(Ls)/Math.cos(L)));return p;},inverse:function(p){var x=p.x;var y=p.y;var L=Math.atan(Proj4js.common.sinh((x-this.xs)/this.n2)/Math.cos((y-this.ys)/this.n2));var lat1=Math.asin(Math.sin((y-this.ys)/this.n2)/Proj4js.common.cosh((x-this.xs)/this.n2));var LC=Proj4js.common.latiso(0.0,lat1,Math.sin(lat1));p.x=this.lc+L/this.rs;p.y=Proj4js.common.invlatiso(this.e,(LC-this.cp)/this.rs);return p;}};Proj4js.Proj.ortho={init:function(def){;this.sin_p14=Math.sin(this.lat0);this.cos_p14=Math.cos(this.lat0);},forward:function(p){var sinphi,cosphi;var dlon;var coslon;var ksp;var g;var lon=p.x;var lat=p.y;dlon=Proj4js.common.adjust_lon(lon-this.long0);sinphi=Math.sin(lat);cosphi=Math.cos(lat);coslon=Math.cos(dlon);g=this.sin_p14*sinphi+this.cos_p14*cosphi*coslon;ksp=1.0;if((g>0)||(Math.abs(g)<=Proj4js.common.EPSLN)){var x=this.a*ksp*cosphi*Math.sin(dlon);var y=this.y0+this.a*ksp*(this.cos_p14*sinphi-this.sin_p14*cosphi*coslon);}else{Proj4js.reportError("orthoFwdPointError");}
p.x=x;p.y=y;return p;},inverse:function(p){var rh;var z;var sinz,cosz;var temp;var con;var lon,lat;p.x-=this.x0;p.y-=this.y0;rh=Math.sqrt(p.x*p.x+p.y*p.y);if(rh>this.a+.0000001){Proj4js.reportError("orthoInvDataError");}
z=Proj4js.common.asinz(rh/this.a);sinz=Math.sin(z);cosz=Math.cos(z);lon=this.long0;if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.lat0;}
lat=Proj4js.common.asinz(cosz*this.sin_p14+(p.y*sinz*this.cos_p14)/rh);con=Math.abs(this.lat0)-Proj4js.common.HALF_PI;if(Math.abs(con)<=Proj4js.common.EPSLN){if(this.lat0>=0){lon=Proj4js.common.adjust_lon(this.long0+Math.atan2(p.x,-p.y));}else{lon=Proj4js.common.adjust_lon(this.long0-Math.atan2(-p.x,p.y));}}
con=cosz-this.sin_p14*Math.sin(lat);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.somerc={init:function(){var phy0=this.lat0;this.lambda0=this.long0;var sinPhy0=Math.sin(phy0);var semiMajorAxis=this.a;var invF=this.rf;var flattening=1/invF;var e2=2*flattening-Math.pow(flattening,2);var e=this.e=Math.sqrt(e2);this.R=this.k0*semiMajorAxis*Math.sqrt(1-e2)/(1-e2*Math.pow(sinPhy0,2.0));this.alpha=Math.sqrt(1+e2/(1-e2)*Math.pow(Math.cos(phy0),4.0));this.b0=Math.asin(sinPhy0/this.alpha);this.K=Math.log(Math.tan(Math.PI/4.0+this.b0/2.0))
-this.alpha*Math.log(Math.tan(Math.PI/4.0+phy0/2.0))
+this.alpha*e/2*Math.log((1+e*sinPhy0)/(1-e*sinPhy0));},forward:function(p){var Sa1=Math.log(Math.tan(Math.PI/4.0-p.y/2.0));var Sa2=this.e/2.0*Math.log((1+this.e*Math.sin(p.y))/(1-this.e*Math.sin(p.y)));var S=-this.alpha*(Sa1+Sa2)+this.K;var b=2.0*(Math.atan(Math.exp(S))-Math.PI/4.0);var I=this.alpha*(p.x-this.lambda0);var rotI=Math.atan(Math.sin(I)/(Math.sin(this.b0)*Math.tan(b)+
Math.cos(this.b0)*Math.cos(I)));var rotB=Math.asin(Math.cos(this.b0)*Math.sin(b)-
Math.sin(this.b0)*Math.cos(b)*Math.cos(I));p.y=this.R/2.0*Math.log((1+Math.sin(rotB))/(1-Math.sin(rotB)))
+this.y0;p.x=this.R*rotI+this.x0;return p;},inverse:function(p){var Y=p.x-this.x0;var X=p.y-this.y0;var rotI=Y/this.R;var rotB=2*(Math.atan(Math.exp(X/this.R))-Math.PI/4.0);var b=Math.asin(Math.cos(this.b0)*Math.sin(rotB)
+Math.sin(this.b0)*Math.cos(rotB)*Math.cos(rotI));var I=Math.atan(Math.sin(rotI)/(Math.cos(this.b0)*Math.cos(rotI)-Math.sin(this.b0)*Math.tan(rotB)));var lambda=this.lambda0+I/this.alpha;var S=0.0;var phy=b;var prevPhy=-1000.0;var iteration=0;while(Math.abs(phy-prevPhy)>0.0000001)
{if(++iteration>20)
{Proj4js.reportError("omercFwdInfinity");return;}
S=1.0/this.alpha*(Math.log(Math.tan(Math.PI/4.0+b/2.0))-this.K)
+this.e*Math.log(Math.tan(Math.PI/4.0
+Math.asin(this.e*Math.sin(phy))/2.0));prevPhy=phy;phy=2.0*Math.atan(Math.exp(S))-Math.PI/2.0;}
p.x=lambda;p.y=phy;return p;}};Proj4js.Proj.stere={ssfn_:function(phit,sinphi,eccen){sinphi*=eccen;return(Math.tan(.5*(Proj4js.common.HALF_PI+phit))*Math.pow((1.-sinphi)/(1.+sinphi),.5*eccen));},TOL:1.e-8,NITER:8,CONV:1.e-10,S_POLE:0,N_POLE:1,OBLIQ:2,EQUIT:3,init:function(){this.phits=this.lat_ts?this.lat_ts:Proj4js.common.HALF_PI;var t=Math.abs(this.lat0);if((Math.abs(t)-Proj4js.common.HALF_PI)<Proj4js.common.EPSLN){this.mode=this.lat0<0.?this.S_POLE:this.N_POLE;}else{this.mode=t>Proj4js.common.EPSLN?this.OBLIQ:this.EQUIT;}
this.phits=Math.abs(this.phits);if(this.es){var X;switch(this.mode){case this.N_POLE:case this.S_POLE:if(Math.abs(this.phits-Proj4js.common.HALF_PI)<Proj4js.common.EPSLN){this.akm1=2.*this.k0/Math.sqrt(Math.pow(1+this.e,1+this.e)*Math.pow(1-this.e,1-this.e));}else{t=Math.sin(this.phits);this.akm1=Math.cos(this.phits)/Proj4js.common.tsfnz(this.e,this.phits,t);t*=this.e;this.akm1/=Math.sqrt(1.-t*t);}
break;case this.EQUIT:this.akm1=2.*this.k0;break;case this.OBLIQ:t=Math.sin(this.lat0);X=2.*Math.atan(this.ssfn_(this.lat0,t,this.e))-Proj4js.common.HALF_PI;t*=this.e;this.akm1=2.*this.k0*Math.cos(this.lat0)/Math.sqrt(1.-t*t);this.sinX1=Math.sin(X);this.cosX1=Math.cos(X);break;}}else{switch(this.mode){case this.OBLIQ:this.sinph0=Math.sin(this.lat0);this.cosph0=Math.cos(this.lat0);case this.EQUIT:this.akm1=2.*this.k0;break;case this.S_POLE:case this.N_POLE:this.akm1=Math.abs(this.phits-Proj4js.common.HALF_PI)>=Proj4js.common.EPSLN?Math.cos(this.phits)/Math.tan(Proj4js.common.FORTPI-.5*this.phits):2.*this.k0;break;}}},forward:function(p){var lon=p.x;lon=Proj4js.common.adjust_lon(lon-this.long0);var lat=p.y;var x,y;if(this.sphere){var sinphi,cosphi,coslam,sinlam;sinphi=Math.sin(lat);cosphi=Math.cos(lat);coslam=Math.cos(lon);sinlam=Math.sin(lon);switch(this.mode){case this.EQUIT:y=1.+cosphi*coslam;if(y<=Proj4js.common.EPSLN){F_ERROR;}
y=this.akm1/y;x=y*cosphi*sinlam;y*=sinphi;break;case this.OBLIQ:y=1.+this.sinph0*sinphi+this.cosph0*cosphi*coslam;if(y<=Proj4js.common.EPSLN){F_ERROR;}
y=this.akm1/y;x=y*cosphi*sinlam;y*=this.cosph0*sinphi-this.sinph0*cosphi*coslam;break;case this.N_POLE:coslam=-coslam;lat=-lat;case this.S_POLE:if(Math.abs(lat-Proj4js.common.HALF_PI)<this.TOL){F_ERROR;}
y=this.akm1*Math.tan(Proj4js.common.FORTPI+.5*lat);x=sinlam*y;y*=coslam;break;}}else{coslam=Math.cos(lon);sinlam=Math.sin(lon);sinphi=Math.sin(lat);if(this.mode==this.OBLIQ||this.mode==this.EQUIT){X=2.*Math.atan(this.ssfn_(lat,sinphi,this.e));sinX=Math.sin(X-Proj4js.common.HALF_PI);cosX=Math.cos(X);}
switch(this.mode){case this.OBLIQ:A=this.akm1/(this.cosX1*(1.+this.sinX1*sinX+this.cosX1*cosX*coslam));y=A*(this.cosX1*sinX-this.sinX1*cosX*coslam);x=A*cosX;break;case this.EQUIT:A=2.*this.akm1/(1.+cosX*coslam);y=A*sinX;x=A*cosX;break;case this.S_POLE:lat=-lat;coslam=-coslam;sinphi=-sinphi;case this.N_POLE:x=this.akm1*Proj4js.common.tsfnz(this.e,lat,sinphi);y=-x*coslam;break;}
x=x*sinlam;}
p.x=x*this.a+this.x0;p.y=y*this.a+this.y0;return p;},inverse:function(p){var x=(p.x-this.x0)/this.a;var y=(p.y-this.y0)/this.a;var lon,lat;var cosphi,sinphi,tp=0.0,phi_l=0.0,rho,halfe=0.0,pi2=0.0;var i;if(this.sphere){var c,rh,sinc,cosc;rh=Math.sqrt(x*x+y*y);c=2.*Math.atan(rh/this.akm1);sinc=Math.sin(c);cosc=Math.cos(c);lon=0.;switch(this.mode){case this.EQUIT:if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=0.;}else{lat=Math.asin(y*sinc/rh);}
if(cosc!=0.||x!=0.)lon=Math.atan2(x*sinc,cosc*rh);break;case this.OBLIQ:if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.phi0;}else{lat=Math.asin(cosc*sinph0+y*sinc*cosph0/rh);}
c=cosc-sinph0*Math.sin(lat);if(c!=0.||x!=0.){lon=Math.atan2(x*sinc*cosph0,c*rh);}
break;case this.N_POLE:y=-y;case this.S_POLE:if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.phi0;}else{lat=Math.asin(this.mode==this.S_POLE?-cosc:cosc);}
lon=(x==0.&&y==0.)?0.:Math.atan2(x,y);break;}
p.x=Proj4js.common.adjust_lon(lon+this.long0);p.y=lat;}else{rho=Math.sqrt(x*x+y*y);switch(this.mode){case this.OBLIQ:case this.EQUIT:tp=2.*Math.atan2(rho*this.cosX1,this.akm1);cosphi=Math.cos(tp);sinphi=Math.sin(tp);if(rho==0.0){phi_l=Math.asin(cosphi*this.sinX1);}else{phi_l=Math.asin(cosphi*this.sinX1+(y*sinphi*this.cosX1/rho));}
tp=Math.tan(.5*(Proj4js.common.HALF_PI+phi_l));x*=sinphi;y=rho*this.cosX1*cosphi-y*this.sinX1*sinphi;pi2=Proj4js.common.HALF_PI;halfe=.5*this.e;break;case this.N_POLE:y=-y;case this.S_POLE:tp=-rho/this.akm1;phi_l=Proj4js.common.HALF_PI-2.*Math.atan(tp);pi2=-Proj4js.common.HALF_PI;halfe=-.5*this.e;break;}
for(i=this.NITER;i--;phi_l=lat){sinphi=this.e*Math.sin(phi_l);lat=2.*Math.atan(tp*Math.pow((1.+sinphi)/(1.-sinphi),halfe))-pi2;if(Math.abs(phi_l-lat)<this.CONV){if(this.mode==this.S_POLE)lat=-lat;lon=(x==0.&&y==0.)?0.:Math.atan2(x,y);p.x=Proj4js.common.adjust_lon(lon+this.long0);p.y=lat;return p;}}}}};Proj4js.Proj.nzmg={iterations:1,init:function(){this.A=new Array();this.A[1]=+0.6399175073;this.A[2]=-0.1358797613;this.A[3]=+0.063294409;this.A[4]=-0.02526853;this.A[5]=+0.0117879;this.A[6]=-0.0055161;this.A[7]=+0.0026906;this.A[8]=-0.001333;this.A[9]=+0.00067;this.A[10]=-0.00034;this.B_re=new Array();this.B_im=new Array();this.B_re[1]=+0.7557853228;this.B_im[1]=0.0;this.B_re[2]=+0.249204646;this.B_im[2]=+0.003371507;this.B_re[3]=-0.001541739;this.B_im[3]=+0.041058560;this.B_re[4]=-0.10162907;this.B_im[4]=+0.01727609;this.B_re[5]=-0.26623489;this.B_im[5]=-0.36249218;this.B_re[6]=-0.6870983;this.B_im[6]=-1.1651967;this.C_re=new Array();this.C_im=new Array();this.C_re[1]=+1.3231270439;this.C_im[1]=0.0;this.C_re[2]=-0.577245789;this.C_im[2]=-0.007809598;this.C_re[3]=+0.508307513;this.C_im[3]=-0.112208952;this.C_re[4]=-0.15094762;this.C_im[4]=+0.18200602;this.C_re[5]=+1.01418179;this.C_im[5]=+1.64497696;this.C_re[6]=+1.9660549;this.C_im[6]=+2.5127645;this.D=new Array();this.D[1]=+1.5627014243;this.D[2]=+0.5185406398;this.D[3]=-0.03333098;this.D[4]=-0.1052906;this.D[5]=-0.0368594;this.D[6]=+0.007317;this.D[7]=+0.01220;this.D[8]=+0.00394;this.D[9]=-0.0013;},forward:function(p){var lon=p.x;var lat=p.y;var delta_lat=lat-this.lat0;var delta_lon=lon-this.long0;var d_phi=delta_lat/Proj4js.common.SEC_TO_RAD*1E-5;var d_lambda=delta_lon;var d_phi_n=1;var d_psi=0;for(n=1;n<=10;n++){d_phi_n=d_phi_n*d_phi;d_psi=d_psi+this.A[n]*d_phi_n;}
var th_re=d_psi;var th_im=d_lambda;var th_n_re=1;var th_n_im=0;var th_n_re1;var th_n_im1;var z_re=0;var z_im=0;for(n=1;n<=6;n++){th_n_re1=th_n_re*th_re-th_n_im*th_im;th_n_im1=th_n_im*th_re+th_n_re*th_im;th_n_re=th_n_re1;th_n_im=th_n_im1;z_re=z_re+this.B_re[n]*th_n_re-this.B_im[n]*th_n_im;z_im=z_im+this.B_im[n]*th_n_re+this.B_re[n]*th_n_im;}
x=(z_im*this.a)+this.x0;y=(z_re*this.a)+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var x=p.x;var y=p.y;var delta_x=x-this.x0;var delta_y=y-this.y0;var z_re=delta_y/this.a;var z_im=delta_x/this.a;var z_n_re=1;var z_n_im=0;var z_n_re1;var z_n_im1;var th_re=0;var th_im=0;for(n=1;n<=6;n++){z_n_re1=z_n_re*z_re-z_n_im*z_im;z_n_im1=z_n_im*z_re+z_n_re*z_im;z_n_re=z_n_re1;z_n_im=z_n_im1;th_re=th_re+this.C_re[n]*z_n_re-this.C_im[n]*z_n_im;th_im=th_im+this.C_im[n]*z_n_re+this.C_re[n]*z_n_im;}
for(i=0;i<this.iterations;i++){var th_n_re=th_re;var th_n_im=th_im;var th_n_re1;var th_n_im1;var num_re=z_re;var num_im=z_im;for(n=2;n<=6;n++){th_n_re1=th_n_re*th_re-th_n_im*th_im;th_n_im1=th_n_im*th_re+th_n_re*th_im;th_n_re=th_n_re1;th_n_im=th_n_im1;num_re=num_re+(n-1)*(this.B_re[n]*th_n_re-this.B_im[n]*th_n_im);num_im=num_im+(n-1)*(this.B_im[n]*th_n_re+this.B_re[n]*th_n_im);}
th_n_re=1;th_n_im=0;var den_re=this.B_re[1];var den_im=this.B_im[1];for(n=2;n<=6;n++){th_n_re1=th_n_re*th_re-th_n_im*th_im;th_n_im1=th_n_im*th_re+th_n_re*th_im;th_n_re=th_n_re1;th_n_im=th_n_im1;den_re=den_re+n*(this.B_re[n]*th_n_re-this.B_im[n]*th_n_im);den_im=den_im+n*(this.B_im[n]*th_n_re+this.B_re[n]*th_n_im);}
var den2=den_re*den_re+den_im*den_im;th_re=(num_re*den_re+num_im*den_im)/den2;th_im=(num_im*den_re-num_re*den_im)/den2;}
var d_psi=th_re;var d_lambda=th_im;var d_psi_n=1;var d_phi=0;for(n=1;n<=9;n++){d_psi_n=d_psi_n*d_psi;d_phi=d_phi+this.D[n]*d_psi_n;}
var lat=this.lat0+(d_phi*Proj4js.common.SEC_TO_RAD*1E5);var lon=this.long0+d_lambda;p.x=lon;p.y=lat;return p;}};Proj4js.Proj.mill={init:function(){},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+this.a*dlon;var y=this.y0+this.a*Math.log(Math.tan((Proj4js.common.PI/4.0)+(lat/2.5)))*1.25;p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var lon=Proj4js.common.adjust_lon(this.long0+p.x/this.a);var lat=2.5*(Math.atan(Math.exp(0.8*p.y/this.a))-Proj4js.common.PI/4.0);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.gnom={init:function(def){this.sin_p14=Math.sin(this.lat0);this.cos_p14=Math.cos(this.lat0);this.infinity_dist=1000*this.a;this.rc=1;},forward:function(p){var sinphi,cosphi;var dlon;var coslon;var ksp;var g;var lon=p.x;var lat=p.y;dlon=Proj4js.common.adjust_lon(lon-this.long0);sinphi=Math.sin(lat);cosphi=Math.cos(lat);coslon=Math.cos(dlon);g=this.sin_p14*sinphi+this.cos_p14*cosphi*coslon;ksp=1.0;if((g>0)||(Math.abs(g)<=Proj4js.common.EPSLN)){x=this.x0+this.a*ksp*cosphi*Math.sin(dlon)/g;y=this.y0+this.a*ksp*(this.cos_p14*sinphi-this.sin_p14*cosphi*coslon)/g;}else{Proj4js.reportError("orthoFwdPointError");x=this.x0+this.infinity_dist*cosphi*Math.sin(dlon);y=this.y0+this.infinity_dist*(this.cos_p14*sinphi-this.sin_p14*cosphi*coslon);}
p.x=x;p.y=y;return p;},inverse:function(p){var rh;var z;var sinc,cosc;var c;var lon,lat;p.x=(p.x-this.x0)/this.a;p.y=(p.y-this.y0)/this.a;p.x/=this.k0;p.y/=this.k0;if((rh=Math.sqrt(p.x*p.x+p.y*p.y))){c=Math.atan2(rh,this.rc);sinc=Math.sin(c);cosc=Math.cos(c);lat=Proj4js.common.asinz(cosc*this.sin_p14+(p.y*sinc*this.cos_p14)/rh);lon=Math.atan2(p.x*sinc,rh*this.cos_p14*cosc-p.y*this.sin_p14*sinc);lon=Proj4js.common.adjust_lon(this.long0+lon);}else{lat=this.phic0;lon=0.0;}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.sinu={init:function(){this.R=6370997.0;},forward:function(p){var x,y,delta_lon;var lon=p.x;var lat=p.y;delta_lon=Proj4js.common.adjust_lon(lon-this.long0);x=this.R*delta_lon*Math.cos(lat)+this.x0;y=this.R*lat+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var lat,temp,lon;p.x-=this.x0;p.y-=this.y0;lat=p.y/this.R;if(Math.abs(lat)>Proj4js.common.HALF_PI){Proj4js.reportError("sinu:Inv:DataError");}
temp=Math.abs(lat)-Proj4js.common.HALF_PI;if(Math.abs(temp)>Proj4js.common.EPSLN){temp=this.long0+p.x/(this.R*Math.cos(lat));lon=Proj4js.common.adjust_lon(temp);}else{lon=this.long0;}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.vandg={init:function(){this.R=6370997.0;},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var x,y;if(Math.abs(lat)<=Proj4js.common.EPSLN){x=this.x0+this.R*dlon;y=this.y0;}
var theta=Proj4js.common.asinz(2.0*Math.abs(lat/Proj4js.common.PI));if((Math.abs(dlon)<=Proj4js.common.EPSLN)||(Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI)<=Proj4js.common.EPSLN)){x=this.x0;if(lat>=0){y=this.y0+Proj4js.common.PI*this.R*Math.tan(.5*theta);}else{y=this.y0+Proj4js.common.PI*this.R*-Math.tan(.5*theta);}}
var al=.5*Math.abs((Proj4js.common.PI/dlon)-(dlon/Proj4js.common.PI));var asq=al*al;var sinth=Math.sin(theta);var costh=Math.cos(theta);var g=costh/(sinth+costh-1.0);var gsq=g*g;var m=g*(2.0/sinth-1.0);var msq=m*m;var con=Proj4js.common.PI*this.R*(al*(g-msq)+Math.sqrt(asq*(g-msq)*(g-msq)-(msq+asq)*(gsq-msq)))/(msq+asq);if(dlon<0){con=-con;}
x=this.x0+con;con=Math.abs(con/(Proj4js.common.PI*this.R));if(lat>=0){y=this.y0+Proj4js.common.PI*this.R*Math.sqrt(1.0-con*con-2.0*al*con);}else{y=this.y0-Proj4js.common.PI*this.R*Math.sqrt(1.0-con*con-2.0*al*con);}
p.x=x;p.y=y;return p;},inverse:function(p){var dlon;var xx,yy,xys,c1,c2,c3;var al,asq;var a1;var m1;var con;var th1;var d;p.x-=this.x0;p.y-=this.y0;con=Proj4js.common.PI*this.R;xx=p.x/con;yy=p.y/con;xys=xx*xx+yy*yy;c1=-Math.abs(yy)*(1.0+xys);c2=c1-2.0*yy*yy+xx*xx;c3=-2.0*c1+1.0+2.0*yy*yy+xys*xys;d=yy*yy/c3+(2.0*c2*c2*c2/c3/c3/c3-9.0*c1*c2/c3/c3)/27.0;a1=(c1-c2*c2/3.0/c3)/c3;m1=2.0*Math.sqrt(-a1/3.0);con=((3.0*d)/a1)/m1;if(Math.abs(con)>1.0){if(con>=0.0){con=1.0;}else{con=-1.0;}}
th1=Math.acos(con)/3.0;if(p.y>=0){lat=(-m1*Math.cos(th1+Proj4js.common.PI/3.0)-c2/3.0/c3)*Proj4js.common.PI;}else{lat=-(-m1*Math.cos(th1+Proj4js.common.PI/3.0)-c2/3.0/c3)*Proj4js.common.PI;}
if(Math.abs(xx)<Proj4js.common.EPSLN){lon=this.long0;}
lon=Proj4js.common.adjust_lon(this.long0+Proj4js.common.PI*(xys-1.0+Math.sqrt(1.0+2.0*(xx*xx-yy*yy)+xys*xys))/2.0/xx);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.cea={init:function(){},forward:function(p){var lon=p.x;var lat=p.y;dlon=Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+this.a*dlon*Math.cos(this.lat_ts);var y=this.y0+this.a*Math.sin(lat)/Math.cos(this.lat_ts);p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var lon=Proj4js.common.adjust_lon(this.long0+(p.x/this.a)/Math.cos(this.lat_ts));var lat=Math.asin((p.y/this.a)*Math.cos(this.lat_ts));p.x=lon;p.y=lat;return p;}};Proj4js.Proj.eqc={init:function(){if(!this.x0)this.x0=0;if(!this.y0)this.y0=0;if(!this.lat0)this.lat0=0;if(!this.long0)this.long0=0;if(!this.lat_ts)this.lat_ts=0;if(!this.title)this.title="Equidistant Cylindrical (Plate Carre)";this.rc=Math.cos(this.lat_ts);},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var dlat=Proj4js.common.adjust_lat(lat-this.lat0);p.x=this.x0+(this.a*dlon*this.rc);p.y=this.y0+(this.a*dlat);return p;},inverse:function(p){var x=p.x;var y=p.y;p.x=Proj4js.common.adjust_lon(this.long0+((x-this.x0)/(this.a*this.rc)));p.y=Proj4js.common.adjust_lat(this.lat0+((y-this.y0)/(this.a)));return p;}};Proj4js.Proj.cass={init:function(){if(!this.sphere){this.en=this.pj_enfn(this.es)
this.m0=this.pj_mlfn(this.lat0,Math.sin(this.lat0),Math.cos(this.lat0),this.en);}},C1:.16666666666666666666,C2:.00833333333333333333,C3:.04166666666666666666,C4:.33333333333333333333,C5:.06666666666666666666,forward:function(p){var x,y;var lam=p.x;var phi=p.y;lam=Proj4js.common.adjust_lon(lam-this.long0);if(this.sphere){x=Math.asin(Math.cos(phi)*Math.sin(lam));y=Math.atan2(Math.tan(phi),Math.cos(lam))-this.phi0;}else{this.n=Math.sin(phi);this.c=Math.cos(phi);y=this.pj_mlfn(phi,this.n,this.c,this.en);this.n=1./Math.sqrt(1.-this.es*this.n*this.n);this.tn=Math.tan(phi);this.t=this.tn*this.tn;this.a1=lam*this.c;this.c*=this.es*this.c/(1-this.es);this.a2=this.a1*this.a1;x=this.n*this.a1*(1.-this.a2*this.t*(this.C1-(8.-this.t+8.*this.c)*this.a2*this.C2));y-=this.m0-this.n*this.tn*this.a2*(.5+(5.-this.t+6.*this.c)*this.a2*this.C3);}
p.x=this.a*x+this.x0;p.y=this.a*y+this.y0;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var x=p.x/this.a;var y=p.y/this.a;if(this.sphere){this.dd=y+this.lat0;phi=Math.asin(Math.sin(this.dd)*Math.cos(x));lam=Math.atan2(Math.tan(x),Math.cos(this.dd));}else{ph1=this.pj_inv_mlfn(this.m0+y,this.es,this.en);this.tn=Math.tan(ph1);this.t=this.tn*this.tn;this.n=Math.sin(ph1);this.r=1./(1.-this.es*this.n*this.n);this.n=Math.sqrt(this.r);this.r*=(1.-this.es)*this.n;this.dd=x/this.n;this.d2=this.dd*this.dd;phi=ph1-(this.n*this.tn/this.r)*this.d2*(.5-(1.+3.*this.t)*this.d2*this.C3);lam=this.dd*(1.+this.t*this.d2*(-this.C4+(1.+3.*this.t)*this.d2*this.C5))/Math.cos(ph1);}
p.x=Proj4js.common.adjust_lon(this.long0+lam);p.y=phi;return p;},pj_enfn:function(es){en=new Array();en[0]=this.C00-es*(this.C02+es*(this.C04+es*(this.C06+es*this.C08)));en[1]=es*(this.C22-es*(this.C04+es*(this.C06+es*this.C08)));var t=es*es;en[2]=t*(this.C44-es*(this.C46+es*this.C48));t*=es;en[3]=t*(this.C66-es*this.C68);en[4]=t*es*this.C88;return en;},pj_mlfn:function(phi,sphi,cphi,en){cphi*=sphi;sphi*=sphi;return(en[0]*phi-cphi*(en[1]+sphi*(en[2]+sphi*(en[3]+sphi*en[4]))));},pj_inv_mlfn:function(arg,es,en){k=1./(1.-es);phi=arg;for(i=Proj4js.common.MAX_ITER;i;--i){s=Math.sin(phi);t=1.-es*s*s;t=(this.pj_mlfn(phi,s,Math.cos(phi),en)-arg)*(t*Math.sqrt(t))*k;phi-=t;if(Math.abs(t)<Proj4js.common.EPSLN)
return phi;}
Proj4js.reportError("cass:pj_inv_mlfn: Convergence error");return phi;},C00:1.0,C02:.25,C04:.046875,C06:.01953125,C08:.01068115234375,C22:.75,C44:.46875,C46:.01302083333333333333,C48:.00712076822916666666,C66:.36458333333333333333,C68:.00569661458333333333,C88:.3076171875}
Proj4js.Proj.gauss={init:function(){sphi=Math.sin(this.lat0);cphi=Math.cos(this.lat0);cphi*=cphi;this.rc=Math.sqrt(1.0-this.es)/(1.0-this.es*sphi*sphi);this.C=Math.sqrt(1.0+this.es*cphi*cphi/(1.0-this.es));this.phic0=Math.asin(sphi/this.C);this.ratexp=0.5*this.C*this.e;this.K=Math.tan(0.5*this.phic0+Proj4js.common.FORTPI)/(Math.pow(Math.tan(0.5*this.lat0+Proj4js.common.FORTPI),this.C)*Proj4js.common.srat(this.e*sphi,this.ratexp));},forward:function(p){var lon=p.x;var lat=p.y;p.y=2.0*Math.atan(this.K*Math.pow(Math.tan(0.5*lat+Proj4js.common.FORTPI),this.C)*Proj4js.common.srat(this.e*Math.sin(lat),this.ratexp))-Proj4js.common.HALF_PI;p.x=this.C*lon;return p;},inverse:function(p){var DEL_TOL=1e-14;var lon=p.x/this.C;var lat=p.y;num=Math.pow(Math.tan(0.5*lat+Proj4js.common.FORTPI)/this.K,1./this.C);for(var i=Proj4js.common.MAX_ITER;i>0;--i){lat=2.0*Math.atan(num*Proj4js.common.srat(this.e*Math.sin(p.y),-0.5*this.e))-Proj4js.common.HALF_PI;if(Math.abs(lat-p.y)<DEL_TOL)break;p.y=lat;}
if(!i){Proj4js.reportError("gauss:inverse:convergence failed");return null;}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.omerc={init:function(){if(!this.mode)this.mode=0;if(!this.lon1){this.lon1=0;this.mode=1;}
if(!this.lon2)this.lon2=0;if(!this.lat2)this.lat2=0;var temp=this.b/this.a;var es=1.0-Math.pow(temp,2);var e=Math.sqrt(es);this.sin_p20=Math.sin(this.lat0);this.cos_p20=Math.cos(this.lat0);this.con=1.0-this.es*this.sin_p20*this.sin_p20;this.com=Math.sqrt(1.0-es);this.bl=Math.sqrt(1.0+this.es*Math.pow(this.cos_p20,4.0)/(1.0-es));this.al=this.a*this.bl*this.k0*this.com/this.con;if(Math.abs(this.lat0)<Proj4js.common.EPSLN){this.ts=1.0;this.d=1.0;this.el=1.0;}else{this.ts=Proj4js.common.tsfnz(this.e,this.lat0,this.sin_p20);this.con=Math.sqrt(this.con);this.d=this.bl*this.com/(this.cos_p20*this.con);if((this.d*this.d-1.0)>0.0){if(this.lat0>=0.0){this.f=this.d+Math.sqrt(this.d*this.d-1.0);}else{this.f=this.d-Math.sqrt(this.d*this.d-1.0);}}else{this.f=this.d;}
this.el=this.f*Math.pow(this.ts,this.bl);}
if(this.mode!=0){this.g=.5*(this.f-1.0/this.f);this.gama=Proj4js.common.asinz(Math.sin(this.alpha)/this.d);this.longc=this.longc-Proj4js.common.asinz(this.g*Math.tan(this.gama))/this.bl;this.con=Math.abs(this.lat0);if((this.con>Proj4js.common.EPSLN)&&(Math.abs(this.con-Proj4js.common.HALF_PI)>Proj4js.common.EPSLN)){this.singam=Math.sin(this.gama);this.cosgam=Math.cos(this.gama);this.sinaz=Math.sin(this.alpha);this.cosaz=Math.cos(this.alpha);if(this.lat0>=0){this.u=(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}else{this.u=-(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}}else{Proj4js.reportError("omerc:Init:DataError");}}else{this.sinphi=Math.sin(this.at1);this.ts1=Proj4js.common.tsfnz(this.e,this.lat1,this.sinphi);this.sinphi=Math.sin(this.lat2);this.ts2=Proj4js.common.tsfnz(this.e,this.lat2,this.sinphi);this.h=Math.pow(this.ts1,this.bl);this.l=Math.pow(this.ts2,this.bl);this.f=this.el/this.h;this.g=.5*(this.f-1.0/this.f);this.j=(this.el*this.el-this.l*this.h)/(this.el*this.el+this.l*this.h);this.p=(this.l-this.h)/(this.l+this.h);this.dlon=this.lon1-this.lon2;if(this.dlon<-Proj4js.common.PI)this.lon2=this.lon2-2.0*Proj4js.common.PI;if(this.dlon>Proj4js.common.PI)this.lon2=this.lon2+2.0*Proj4js.common.PI;this.dlon=this.lon1-this.lon2;this.longc=.5*(this.lon1+this.lon2)-Math.atan(this.j*Math.tan(.5*this.bl*this.dlon)/this.p)/this.bl;this.dlon=Proj4js.common.adjust_lon(this.lon1-this.longc);this.gama=Math.atan(Math.sin(this.bl*this.dlon)/this.g);this.alpha=Proj4js.common.asinz(this.d*Math.sin(this.gama));if(Math.abs(this.lat1-this.lat2)<=Proj4js.common.EPSLN){Proj4js.reportError("omercInitDataError");}else{this.con=Math.abs(this.lat1);}
if((this.con<=Proj4js.common.EPSLN)||(Math.abs(this.con-HALF_PI)<=Proj4js.common.EPSLN)){Proj4js.reportError("omercInitDataError");}else{if(Math.abs(Math.abs(this.lat0)-Proj4js.common.HALF_PI)<=Proj4js.common.EPSLN){Proj4js.reportError("omercInitDataError");}}
this.singam=Math.sin(this.gam);this.cosgam=Math.cos(this.gam);this.sinaz=Math.sin(this.alpha);this.cosaz=Math.cos(this.alpha);if(this.lat0>=0){this.u=(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}else{this.u=-(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}}},forward:function(p){var theta;var sin_phi,cos_phi;var b;var c,t,tq;var con,n,ml;var q,us,vl;var ul,vs;var s;var dlon;var ts1;var lon=p.x;var lat=p.y;sin_phi=Math.sin(lat);dlon=Proj4js.common.adjust_lon(lon-this.longc);vl=Math.sin(this.bl*dlon);if(Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI)>Proj4js.common.EPSLN){ts1=Proj4js.common.tsfnz(this.e,lat,sin_phi);q=this.el/(Math.pow(ts1,this.bl));s=.5*(q-1.0/q);t=.5*(q+1.0/q);ul=(s*this.singam-vl*this.cosgam)/t;con=Math.cos(this.bl*dlon);if(Math.abs(con)<.0000001){us=this.al*this.bl*dlon;}else{us=this.al*Math.atan((s*this.cosgam+vl*this.singam)/con)/this.bl;if(con<0)us=us+Proj4js.common.PI*this.al/this.bl;}}else{if(lat>=0){ul=this.singam;}else{ul=-this.singam;}
us=this.al*lat/this.bl;}
if(Math.abs(Math.abs(ul)-1.0)<=Proj4js.common.EPSLN){Proj4js.reportError("omercFwdInfinity");}
vs=.5*this.al*Math.log((1.0-ul)/(1.0+ul))/this.bl;us=us-this.u;var x=this.x0+vs*this.cosaz+us*this.sinaz;var y=this.y0+us*this.cosaz-vs*this.sinaz;p.x=x;p.y=y;return p;},inverse:function(p){var delta_lon;var theta;var delta_theta;var sin_phi,cos_phi;var b;var c,t,tq;var con,n,ml;var vs,us,q,s,ts1;var vl,ul,bs;var dlon;var flag;p.x-=this.x0;p.y-=this.y0;flag=0;vs=p.x*this.cosaz-p.y*this.sinaz;us=p.y*this.cosaz+p.x*this.sinaz;us=us+this.u;q=Math.exp(-this.bl*vs/this.al);s=.5*(q-1.0/q);t=.5*(q+1.0/q);vl=Math.sin(this.bl*us/this.al);ul=(vl*this.cosgam+s*this.singam)/t;if(Math.abs(Math.abs(ul)-1.0)<=Proj4js.common.EPSLN)
{lon=this.longc;if(ul>=0.0){lat=Proj4js.common.HALF_PI;}else{lat=-Proj4js.common.HALF_PI;}}else{con=1.0/this.bl;ts1=Math.pow((this.el/Math.sqrt((1.0+ul)/(1.0-ul))),con);lat=Proj4js.common.phi2z(this.e,ts1);theta=this.longc-Math.atan2((s*this.cosgam-vl*this.singam),con)/this.bl;lon=Proj4js.common.adjust_lon(theta);}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.lcc={init:function(){if(!this.lat2){this.lat2=this.lat0;}
if(!this.k0)this.k0=1.0;if(Math.abs(this.lat1+this.lat2)<Proj4js.common.EPSLN){Proj4js.reportError("lcc:init: Equal Latitudes");return;}
var temp=this.b/this.a;this.e=Math.sqrt(1.0-temp*temp);var sin1=Math.sin(this.lat1);var cos1=Math.cos(this.lat1);var ms1=Proj4js.common.msfnz(this.e,sin1,cos1);var ts1=Proj4js.common.tsfnz(this.e,this.lat1,sin1);var sin2=Math.sin(this.lat2);var cos2=Math.cos(this.lat2);var ms2=Proj4js.common.msfnz(this.e,sin2,cos2);var ts2=Proj4js.common.tsfnz(this.e,this.lat2,sin2);var ts0=Proj4js.common.tsfnz(this.e,this.lat0,Math.sin(this.lat0));if(Math.abs(this.lat1-this.lat2)>Proj4js.common.EPSLN){this.ns=Math.log(ms1/ms2)/Math.log(ts1/ts2);}else{this.ns=sin1;}
this.f0=ms1/(this.ns*Math.pow(ts1,this.ns));this.rh=this.a*this.f0*Math.pow(ts0,this.ns);if(!this.title)this.title="Lambert Conformal Conic";},forward:function(p){var lon=p.x;var lat=p.y;if(lat<=90.0&&lat>=-90.0&&lon<=180.0&&lon>=-180.0){}else{Proj4js.reportError("lcc:forward: llInputOutOfRange: "+lon+" : "+lat);return null;}
var con=Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI);var ts,rh1;if(con>Proj4js.common.EPSLN){ts=Proj4js.common.tsfnz(this.e,lat,Math.sin(lat));rh1=this.a*this.f0*Math.pow(ts,this.ns);}else{con=lat*this.ns;if(con<=0){Proj4js.reportError("lcc:forward: No Projection");return null;}
rh1=0;}
var theta=this.ns*Proj4js.common.adjust_lon(lon-this.long0);p.x=this.k0*(rh1*Math.sin(theta))+this.x0;p.y=this.k0*(this.rh-rh1*Math.cos(theta))+this.y0;return p;},inverse:function(p){var rh1,con,ts;var lat,lon;var x=(p.x-this.x0)/this.k0;var y=(this.rh-(p.y-this.y0)/this.k0);if(this.ns>0){rh1=Math.sqrt(x*x+y*y);con=1.0;}else{rh1=-Math.sqrt(x*x+y*y);con=-1.0;}
var theta=0.0;if(rh1!=0){theta=Math.atan2((con*x),(con*y));}
if((rh1!=0)||(this.ns>0.0)){con=1.0/this.ns;ts=Math.pow((rh1/(this.a*this.f0)),con);lat=Proj4js.common.phi2z(this.e,ts);if(lat==-9999)return null;}else{lat=-Proj4js.common.HALF_PI;}
lon=Proj4js.common.adjust_lon(theta/this.ns+this.long0);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.laea={S_POLE:1,N_POLE:2,EQUIT:3,OBLIQ:4,init:function(){var t=Math.abs(this.lat0);if(Math.abs(t-Proj4js.common.HALF_PI)<Proj4js.common.EPSLN){this.mode=this.lat0<0.?this.S_POLE:this.N_POLE;}else if(Math.abs(t)<Proj4js.common.EPSLN){this.mode=this.EQUIT;}else{this.mode=this.OBLIQ;}
if(this.es>0){var sinphi;this.qp=Proj4js.common.qsfnz(this.e,1.0);this.mmf=.5/(1.-this.es);this.apa=this.authset(this.es);switch(this.mode){case this.N_POLE:case this.S_POLE:this.dd=1.;break;case this.EQUIT:this.rq=Math.sqrt(.5*this.qp);this.dd=1./this.rq;this.xmf=1.;this.ymf=.5*this.qp;break;case this.OBLIQ:this.rq=Math.sqrt(.5*this.qp);sinphi=Math.sin(this.lat0);this.sinb1=Proj4js.common.qsfnz(this.e,sinphi)/this.qp;this.cosb1=Math.sqrt(1.-this.sinb1*this.sinb1);this.dd=Math.cos(this.lat0)/(Math.sqrt(1.-this.es*sinphi*sinphi)*this.rq*this.cosb1);this.ymf=(this.xmf=this.rq)/this.dd;this.xmf*=this.dd;break;}}else{if(this.mode==this.OBLIQ){this.sinph0=Math.sin(this.lat0);this.cosph0=Math.cos(this.lat0);}}},forward:function(p){var x,y;var lam=p.x;var phi=p.y;lam=Proj4js.common.adjust_lon(lam-this.long0);if(this.sphere){var coslam,cosphi,sinphi;sinphi=Math.sin(phi);cosphi=Math.cos(phi);coslam=Math.cos(lam);switch(this.mode){case this.OBLIQ:case this.EQUIT:y=(this.mode==this.EQUIT)?1.+cosphi*coslam:1.+this.sinph0*sinphi+this.cosph0*cosphi*coslam;if(y<=Proj4js.common.EPSLN){Proj4js.reportError("laea:fwd:y less than eps");return null;}
y=Math.sqrt(2./y);x=y*cosphi*Math.sin(lam);y*=(this.mode==this.EQUIT)?sinphi:this.cosph0*sinphi-this.sinph0*cosphi*coslam;break;case this.N_POLE:coslam=-coslam;case this.S_POLE:if(Math.abs(phi+this.phi0)<Proj4js.common.EPSLN){Proj4js.reportError("laea:fwd:phi < eps");return null;}
y=Proj4js.common.FORTPI-phi*.5;y=2.*((this.mode==this.S_POLE)?Math.cos(y):Math.sin(y));x=y*Math.sin(lam);y*=coslam;break;}}else{var coslam,sinlam,sinphi,q,sinb=0.0,cosb=0.0,b=0.0;coslam=Math.cos(lam);sinlam=Math.sin(lam);sinphi=Math.sin(phi);q=Proj4js.common.qsfnz(this.e,sinphi);if(this.mode==this.OBLIQ||this.mode==this.EQUIT){sinb=q/this.qp;cosb=Math.sqrt(1.-sinb*sinb);}
switch(this.mode){case this.OBLIQ:b=1.+this.sinb1*sinb+this.cosb1*cosb*coslam;break;case this.EQUIT:b=1.+cosb*coslam;break;case this.N_POLE:b=Proj4js.common.HALF_PI+phi;q=this.qp-q;break;case this.S_POLE:b=phi-Proj4js.common.HALF_PI;q=this.qp+q;break;}
if(Math.abs(b)<Proj4js.common.EPSLN){Proj4js.reportError("laea:fwd:b < eps");return null;}
switch(this.mode){case this.OBLIQ:case this.EQUIT:b=Math.sqrt(2./b);if(this.mode==this.OBLIQ){y=this.ymf*b*(this.cosb1*sinb-this.sinb1*cosb*coslam);}else{y=(b=Math.sqrt(2./(1.+cosb*coslam)))*sinb*this.ymf;}
x=this.xmf*b*cosb*sinlam;break;case this.N_POLE:case this.S_POLE:if(q>=0.){x=(b=Math.sqrt(q))*sinlam;y=coslam*((this.mode==this.S_POLE)?b:-b);}else{x=y=0.;}
break;}}
p.x=this.a*x+this.x0;p.y=this.a*y+this.y0;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var x=p.x/this.a;var y=p.y/this.a;if(this.sphere){var cosz=0.0,rh,sinz=0.0;rh=Math.sqrt(x*x+y*y);var phi=rh*.5;if(phi>1.){Proj4js.reportError("laea:Inv:DataError");return null;}
phi=2.*Math.asin(phi);if(this.mode==this.OBLIQ||this.mode==this.EQUIT){sinz=Math.sin(phi);cosz=Math.cos(phi);}
switch(this.mode){case this.EQUIT:phi=(Math.abs(rh)<=Proj4js.common.EPSLN)?0.:Math.asin(y*sinz/rh);x*=sinz;y=cosz*rh;break;case this.OBLIQ:phi=(Math.abs(rh)<=Proj4js.common.EPSLN)?this.phi0:Math.asin(cosz*sinph0+y*sinz*cosph0/rh);x*=sinz*cosph0;y=(cosz-Math.sin(phi)*sinph0)*rh;break;case this.N_POLE:y=-y;phi=Proj4js.common.HALF_PI-phi;break;case this.S_POLE:phi-=Proj4js.common.HALF_PI;break;}
lam=(y==0.&&(this.mode==this.EQUIT||this.mode==this.OBLIQ))?0.:Math.atan2(x,y);}else{var cCe,sCe,q,rho,ab=0.0;switch(this.mode){case this.EQUIT:case this.OBLIQ:x/=this.dd;y*=this.dd;rho=Math.sqrt(x*x+y*y);if(rho<Proj4js.common.EPSLN){p.x=0.;p.y=this.phi0;return p;}
sCe=2.*Math.asin(.5*rho/this.rq);cCe=Math.cos(sCe);x*=(sCe=Math.sin(sCe));if(this.mode==this.OBLIQ){ab=cCe*this.sinb1+y*sCe*this.cosb1/rho
q=this.qp*ab;y=rho*this.cosb1*cCe-y*this.sinb1*sCe;}else{ab=y*sCe/rho;q=this.qp*ab;y=rho*cCe;}
break;case this.N_POLE:y=-y;case this.S_POLE:q=(x*x+y*y);if(!q){p.x=0.;p.y=this.phi0;return p;}
ab=1.-q/this.qp;if(this.mode==this.S_POLE){ab=-ab;}
break;}
lam=Math.atan2(x,y);phi=this.authlat(Math.asin(ab),this.apa);}
p.x=Proj4js.common.adjust_lon(this.long0+lam);p.y=phi;return p;},P00:.33333333333333333333,P01:.17222222222222222222,P02:.10257936507936507936,P10:.06388888888888888888,P11:.06640211640211640211,P20:.01641501294219154443,authset:function(es){var t;var APA=new Array();APA[0]=es*this.P00;t=es*es;APA[0]+=t*this.P01;APA[1]=t*this.P10;t*=es;APA[0]+=t*this.P02;APA[1]+=t*this.P11;APA[2]=t*this.P20;return APA;},authlat:function(beta,APA){var t=beta+beta;return(beta+APA[0]*Math.sin(t)+APA[1]*Math.sin(t+t)+APA[2]*Math.sin(t+t+t));}};Proj4js.Proj.aeqd={init:function(){this.sin_p12=Math.sin(this.lat0);this.cos_p12=Math.cos(this.lat0);},forward:function(p){var lon=p.x;var lat=p.y;var ksp;var sinphi=Math.sin(p.y);var cosphi=Math.cos(p.y);var dlon=Proj4js.common.adjust_lon(lon-this.long0);var coslon=Math.cos(dlon);var g=this.sin_p12*sinphi+this.cos_p12*cosphi*coslon;if(Math.abs(Math.abs(g)-1.0)<Proj4js.common.EPSLN){ksp=1.0;if(g<0.0){Proj4js.reportError("aeqd:Fwd:PointError");return;}}else{var z=Math.acos(g);ksp=z/Math.sin(z);}
p.x=this.x0+this.a*ksp*cosphi*Math.sin(dlon);p.y=this.y0+this.a*ksp*(this.cos_p12*sinphi-this.sin_p12*cosphi*coslon);return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var rh=Math.sqrt(p.x*p.x+p.y*p.y);if(rh>(2.0*Proj4js.common.HALF_PI*this.a)){Proj4js.reportError("aeqdInvDataError");return;}
var z=rh/this.a;var sinz=Math.sin(z);var cosz=Math.cos(z);var lon=this.long0;var lat;if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.lat0;}else{lat=Proj4js.common.asinz(cosz*this.sin_p12+(p.y*sinz*this.cos_p12)/rh);var con=Math.abs(this.lat0)-Proj4js.common.HALF_PI;if(Math.abs(con)<=Proj4js.common.EPSLN){if(lat0>=0.0){lon=Proj4js.common.adjust_lon(this.long0+Math.atan2(p.x,-p.y));}else{lon=Proj4js.common.adjust_lon(this.long0-Math.atan2(-p.x,p.y));}}else{con=cosz-this.sin_p12*Math.sin(lat);if((Math.abs(con)<Proj4js.common.EPSLN)&&(Math.abs(p.x)<Proj4js.common.EPSLN)){}else{var temp=Math.atan2((p.x*sinz*this.cos_p12),(con*rh));lon=Proj4js.common.adjust_lon(this.long0+Math.atan2((p.x*sinz*this.cos_p12),(con*rh)));}}}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.moll={init:function(){},forward:function(p){var lon=p.x;var lat=p.y;var delta_lon=Proj4js.common.adjust_lon(lon-this.long0);var theta=lat;var con=Proj4js.common.PI*Math.sin(lat);for(var i=0;true;i++){var delta_theta=-(theta+Math.sin(theta)-con)/(1.0+Math.cos(theta));theta+=delta_theta;if(Math.abs(delta_theta)<Proj4js.common.EPSLN)break;if(i>=50){Proj4js.reportError("moll:Fwd:IterationError");}}
theta/=2.0;if(Proj4js.common.PI/2-Math.abs(lat)<Proj4js.common.EPSLN)delta_lon=0;var x=0.900316316158*this.a*delta_lon*Math.cos(theta)+this.x0;var y=1.4142135623731*this.a*Math.sin(theta)+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var theta;var arg;p.x-=this.x0;var arg=p.y/(1.4142135623731*this.a);if(Math.abs(arg)>0.999999999999)arg=0.999999999999;var theta=Math.asin(arg);var lon=Proj4js.common.adjust_lon(this.long0+(p.x/(0.900316316158*this.a*Math.cos(theta))));if(lon<(-Proj4js.common.PI))lon=-Proj4js.common.PI;if(lon>Proj4js.common.PI)lon=Proj4js.common.PI;arg=(2.0*theta+Math.sin(2.0*theta))/Proj4js.common.PI;if(Math.abs(arg)>1.0)arg=1.0;var lat=Math.asin(arg);p.x=lon;p.y=lat;return p;}};
L.Proj = {};

L.Proj._isProj4Proj = function(a) {
	return typeof a['projName'] !== 'undefined';
}

L.Proj.Projection = L.Class.extend({
	initialize: function(a, def) {
		if (L.Proj._isProj4Proj(a)) {
			this._proj = a;
		} else {
			var code = a;
			if (def)
				Proj4js.defs[code] = def;
			this._proj = new Proj4js.Proj(code);
		}
	},

	project: function (latlng) {
		var point = new L.Point(latlng.lng, latlng.lat);
		return Proj4js.transform(Proj4js.WGS84, this._proj, point);
	},

	unproject: function (point, unbounded) {
		var point2 = Proj4js.transform(this._proj, Proj4js.WGS84, point.clone());
		return new L.LatLng(point2.y, point2.x, unbounded);
	}
});

L.Proj.CRS = L.Class.extend({
	includes: L.CRS,

	options: {
		transformation: new L.Transformation(1, 0, -1, 0)
	},

	initialize: function(a, b, c) {
		var code, proj, def, options;

		if (L.Proj._isProj4Proj(a)) {
			proj = a;
			code = proj.srsCode;
			options = b || {};

			this.projection = new L.Proj.Projection(proj);
		} else {
			code = a;
			def = b;
			options = c || {};
			this.projection = new L.Proj.Projection(code, def);
		}

		L.Util.setOptions(this, options);
		this.code = code;
		this.transformation = this.options.transformation;

		if (this.options.origin) {
			this.transformation =
				new L.Transformation(1, -this.options.origin[0],
					-1, this.options.origin[1]);
		}

		if (this.options.scales) {
			this.scale = function(zoom) {
				return this.options.scales[zoom];
			}
		} else if (this.options.resolutions) {
			this.scale = function(zoom) {
				return 1 / this.options.resolutions[zoom];
			}
		}
	}
});

L.Proj.CRS.TMS = L.Proj.CRS.extend({
	initialize: function(a, b, c, d) {
		if (L.Proj._isProj4Proj(a)) {
			var proj = a,
				projectedBounds = b,
				options = c || {};
			options.origin = [projectedBounds[0], projectedBounds[3]];
			L.Proj.CRS.prototype.initialize(proj, options);
		} else {
			var code = a,
				def = b,
				projectedBounds = c,
				options = d || {};
			options.origin = [projectedBounds[0], projectedBounds[3]];
			L.Proj.CRS.prototype.initialize(code, def, options);
		}

		this.projectedBounds = projectedBounds;
	}
});

L.Proj.TileLayer = {};

L.Proj.TileLayer.TMS = L.TileLayer.extend({
	options: {
		tms: true,
		continuousWorld: true
	},

	initialize: function(urlTemplate, crs, options) {
		if (!(crs instanceof L.Proj.CRS.TMS)) {
			throw new Error("CRS is not L.Proj.CRS.TMS.");
		}

		L.TileLayer.prototype.initialize.call(this, urlTemplate, options);
		this.crs = crs;

		// Verify grid alignment
		for (var i = this.options.minZoom; i < this.options.maxZoom; i++) {
			var gridHeight = (this.crs.projectedBounds[3] - this.crs.projectedBounds[1]) /
				this._projectedTileSize(i);
			if (Math.abs(gridHeight - Math.round(gridHeight)) > 1e-3) {
				throw new Error("Projected bounds does not match grid at zoom " + i);
			}
		}
	},

	getTileUrl: function(tilePoint) {
		var gridHeight =
			Math.round((this.crs.projectedBounds[3] - this.crs.projectedBounds[1]) /
			this._projectedTileSize(this._map.getZoom()));

		// TODO: relies on some of TileLayer's internals
		return L.Util.template(this._url, L.Util.extend({
			s: this._getSubdomain(tilePoint),
			z: this._getZoomForUrl(),
			x: tilePoint.x,
			y: gridHeight - tilePoint.y - 1
		}, this.options));
	},

	_projectedTileSize: function(zoom) {
		return (this.options.tileSize / this.crs.scale(zoom));
	}
});

L.Proj.GeoJSON = L.GeoJSON.extend({
	initialize: function(geojson, options) {
		if (geojson.crs && geojson.crs.type == 'name') {
			var crs = new L.Proj.CRS(geojson.crs.properties.name)
			options = options || {};
			options.coordsToLatLng = function(coords) {
				var point = L.point(coords[0], coords[1]);
				return crs.projection.unproject(point);
			};
		}
		L.GeoJSON.prototype.initialize.call(this, geojson, options);
	}
});

L.Proj.geoJson = function(geojson, options) {
	return new L.Proj.GeoJSON(geojson, options);
}

if (typeof module !== 'undefined') module.exports = L.Proj;

if (typeof L !== 'undefined' && typeof L.CRS !== 'undefined') {
	// This is left here for backwards compatibility
	L.CRS.proj4js = (function () {
		return function (code, def, transformation, options) {
			options = options || {};
			if (transformation) options.transformation = transformation;

			return new L.Proj.CRS(code, def, options);
		};
	}());
}

//var crs25831
L.CRS.EPSG25831 = L.CRS.proj4js('EPSG:25831', '+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs',
		//new L.Transformation(0.5 / (Math.PI * L.Projection.Mercator.R_MAJOR), 0.5, -0.5 / (Math.PI * L.Projection.Mercator.R_MINOR), 0.5),
		new L.Transformation(1, -258000, -1, 4766600),
		
		{
	/*
	new L.Transformation(0.5 / (Math.PI * L.Projection.Mercator.R_MAJOR),
			             0.5, -0.5 / (Math.PI * L.Projection.Mercator.R_MINOR), 0.5),
		*/	 
	scale:function(zoom) {
        return 1 / (1100 / Math.pow(2, zoom));
	},
	resolutions : [1100, 550, 275, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.1]}	

);

//var crs23031 
L.CRS.EPSG23031 = L.CRS.proj4js('EPSG:23031', "+proj=utm +zone=31 +ellps=intl +towgs84=-136.65549,-141.46580,-167.29848,-2.09308759,-0.00140548839,-0.107708594,1.000011546110 +units=m +no_defs",		
		L.Transformation(1, 0, -1, 0),
		{origin:[258000, 4485000, 536000, 4752000],
		/*
		new L.Transformation(0.5 / (Math.PI * L.Projection.Mercator.R_MAJOR),
				             0.5, -0.5 / (Math.PI * L.Projection.Mercator.R_MINOR), 0.5),
			*/	             
		resolutions : [1100, 550, 275, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.1]}		             
);



/*

new L.Proj.CRS('EPSG:2400',
  '+lon_0=15.808277777799999 +lat_0=0.0 +k=1.0 +x_0=1500000.0 ' +
  '+y_0=0.0 +proj=tmerc +ellps=bessel +units=m ' +
  '+towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +no_defs',
  {
    resolutions: [8192, 4096, 2048], // 3 example zoom level resolutions
  }
);


new L.Proj.CRS('EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  {
    origin: [218128.7031, 6126002.9379],
    resolutions: [8192, 4096, 2048], // 3 example zoom level resolutions
  }
);

// EPSG:102012 served by TMS with bounds (-5401501.0, 4065283.0, 4402101.0, 39905283.0)
new L.Proj.CRS.TMS('EPSG:102012',
    '+proj=lcc +lat_1=30 +lat_2=62 +lat_0=0 +lon_0=105 +x_0=0 +y_0=0 '
    + '+ellps=WGS84 +datum=WGS84 +units=m +no_defs',
    [-5401501.0, 4065283.0, 4402101.0, 39905283.0],
    {
        resolutions: [
           140000.0000000000,
            70000.0000000000,
            35000.0000000000,
            17500.0000000000
        ]
    }
);

*/

L.Control.Sidebar = L.Control.extend({
    options: {
        closeButton: true,
        position: 'left'
    },

    initialize: function (placeholder, options) {
        L.setOptions(this, options);

        // Find content container
        var content = this._contentContainer = L.DomUtil.get(placeholder);

        // Remove the content container from its original parent
        content.parentNode.removeChild(content);

        // Make sure we don't drag the map when we interact with the content
        var stop = L.DomEvent.stopPropagation;
        L.DomEvent
            .on(content, 'click', stop)
            .on(content, 'mousedown', stop)
            .on(content, 'touchstart', stop)
            .on(content, 'dblclick', stop)
            .on(content, 'mousewheel', stop)
            .on(content, 'MozMousePixelScroll', stop);
    },

    addTo: function (map) {
        var sidebar = this;
        var l = 'leaflet-';

        // Create sidebar container
        var container = this._container =
            L.DomUtil.create('div', l + 'sidebar ' + this.options.position);

        // Style and attach content container
        var content = this._contentContainer;
        L.DomUtil.addClass(content, l + 'control');
        container.appendChild(content);

        // Create close button and attach it if configured
        if (this.options.closeButton) {
            var close = L.DomUtil.create('a', 'close', container);
            close.innerHTML = '&times;';

            L.DomEvent.on(close, 'click', function () {
                sidebar.hide();
                L.DomEvent.stopPropagation();
            });
        }

        // Attach sidebar container to controls container
        var controlContainer = map._controlContainer;
        controlContainer.insertBefore(container, controlContainer.firstChild);

        this._map = map;

        return this;
    },

    removeFrom: function (map) {
        // Remove sidebar container from controls container
        var controlContainer = map._controlContainer;
        controlContainer.removeChild(this._container);

        return this;
    },

    isVisible: function () {
        return L.DomUtil.hasClass(this._container, 'visible');
    },

    show: function () {
        if (!this.isVisible()) {
            L.DomUtil.addClass(this._container, 'visible');
            this._map.panBy([-this.getOffset() / 2, 0], {
                duration: 0.5
            });
        }
    },

    
    hide: function () {
        if (this.isVisible()) {
            L.DomUtil.removeClass(this._container, 'visible');
            this._map.panBy([this.getOffset() / 2, 0], {
                duration: 0.5
            });
        }
    },

    toggle: function () {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    },

    getContainer: function () {
        return this._contentContainer;
    },

    setContent: function (content) {
        this.getContainer().innerHTML = content;
        return this;
    },

    getOffset: function () {
        if (this.options.position === 'right') {
            return -this._container.offsetWidth;
        } else {
            return this._container.offsetWidth;
        }
    }
});

L.control.sidebar = function (placeholder, options) {
    return new L.Control.Sidebar(placeholder, options);
};

;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("calvinmetcalf-setImmediate/lib/index.js", function(exports, require, module){
"use strict";
var types = [
    require("./nextTick"),
    require("./mutation"),
    require("./postMessage"),
    require("./messageChannel"),
    require("./stateChange"),
    require("./timeout")
];
var handlerQueue = [];

function drainQueue() {
    var i = 0,
        task,
        innerQueue = handlerQueue;
	handlerQueue = [];
	/*jslint boss: true */
	while (task = innerQueue[i++]) {
		task();
	}
}
var nextTick;
types.some(function (obj) {
    var t = obj.test();
    if (t) {
        nextTick = obj.install(drainQueue);
    }
    return t;
});
var retFunc = function (task) {
    var len, args;
    if (arguments.length > 1 && typeof task === "function") {
        args = Array.prototype.slice.call(arguments, 1);
        args.unshift(undefined);
        task = task.bind.apply(task, args);
    }
    if ((len = handlerQueue.push(task)) === 1) {
        nextTick(drainQueue);
    }
    return len;
};
retFunc.clear = function (n) {
    if (n <= handlerQueue.length) {
        handlerQueue[n - 1] = function () {};
    }
    return this;
};
module.exports = retFunc;

});
require.register("calvinmetcalf-setImmediate/lib/nextTick.js", function(exports, require, module){
"use strict";
exports.test = function () {
    // Don't get fooled by e.g. browserify environments.
    return typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
};

exports.install = function () {
    return process.nextTick;
};
});
require.register("calvinmetcalf-setImmediate/lib/postMessage.js", function(exports, require, module){
"use strict";
var globe = require("./global");
exports.test = function () {
    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
    // where `global.postMessage` means something completely different and can"t be used for this purpose.

    if (!globe.postMessage || globe.importScripts) {
        return false;
    }

    var postMessageIsAsynchronous = true;
    var oldOnMessage = globe.onmessage;
    globe.onmessage = function () {
        postMessageIsAsynchronous = false;
    };
    globe.postMessage("", "*");
    globe.onmessage = oldOnMessage;

    return postMessageIsAsynchronous;
};

exports.install = function (func) {
    var codeWord = "com.calvinmetcalf.setImmediate" + Math.random();
    function globalMessage(event) {
        if (event.source === globe && event.data === codeWord) {
            func();
        }
    }
    if (globe.addEventListener) {
        globe.addEventListener("message", globalMessage, false);
    } else {
        globe.attachEvent("onmessage", globalMessage);
    }
    return function () {
        globe.postMessage(codeWord, "*");
    };
};
});
require.register("calvinmetcalf-setImmediate/lib/messageChannel.js", function(exports, require, module){
"use strict";
var globe = require("./global");
exports.test = function () {
    return !!globe.MessageChannel;
};

exports.install = function (func) {
    var channel = new globe.MessageChannel();
    channel.port1.onmessage = func;
    return function () {
        channel.port2.postMessage(0);
    };
};
});
require.register("calvinmetcalf-setImmediate/lib/stateChange.js", function(exports, require, module){
"use strict";
var globe = require("./global");
exports.test = function () {
    return "document" in globe && "onreadystatechange" in globe.document.createElement("script");
};

exports.install = function (handle) {
    return function () {

        // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
        // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
        var scriptEl = globe.document.createElement("script");
        scriptEl.onreadystatechange = function () {
            handle();

            scriptEl.onreadystatechange = null;
            scriptEl.parentNode.removeChild(scriptEl);
            scriptEl = null;
        };
        globe.document.documentElement.appendChild(scriptEl);

        return handle;
    };
};
});
require.register("calvinmetcalf-setImmediate/lib/timeout.js", function(exports, require, module){
"use strict";
exports.test = function () {
    return true;
};

exports.install = function (t) {
    return function () {
        setTimeout(t, 0);
    };
};
});
require.register("calvinmetcalf-setImmediate/lib/global.js", function(exports, require, module){
module.exports = typeof global === "object" && global ? global : this;
});
require.register("calvinmetcalf-setImmediate/lib/mutation.js", function(exports, require, module){
"use strict";
//based off rsvp
//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/async.js
var globe = require("./global");

var MutationObserver = globe.MutationObserver || globe.WebKitMutationObserver;

exports.test = function () {
    return MutationObserver;
};

exports.install = function (handle) {
    var observer = new MutationObserver(handle);
    var element = globe.document.createElement("div");
    observer.observe(element, { attributes: true });

    // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
    globe.addEventListener("unload", function () {
        observer.disconnect();
        observer = null;
    }, false);
    return function () {
        element.setAttribute("drainQueue", "drainQueue");
    };
};
});
require.register("lie/lie.js", function(exports, require, module){
var immediate = require('immediate');
// Creates a deferred: an object with a promise and corresponding resolve/reject methods
function Promise(resolver) {
     if (!(this instanceof Promise)) {
        return new Promise(resolver);
    }
    var queue = [];
    var resolved = false;
    // The `handler` variable points to the function that will
    // 1) handle a .then(onFulfilled, onRejected) call
    // 2) handle a .resolve or .reject call (if not fulfilled)
    // Before 2), `handler` holds a queue of callbacks.
    // After 2), `handler` is a simple .then handler.
    // We use only one function to save memory and complexity.
     // Case 1) handle a .then(onFulfilled, onRejected) call
    function pending(onFulfilled, onRejected){
        return Promise(function(resolver,rejecter){
            queue.push({
                resolve: onFulfilled,
                reject: onRejected,
                resolver:resolver,
                rejecter:rejecter
            });
        });
    }
    function then(onFulfilled, onRejected) {
        return resolved?resolved(onFulfilled, onRejected):pending(onFulfilled, onRejected);
    }
    // Case 2) handle a .resolve or .reject call
        // (`onFulfilled` acts as a sentinel)
        // The actual function signature is
        // .re[ject|solve](sentinel, success, value)
    function resolve(success, value){
        var action = success ? 'resolve' : 'reject';
        var queued;
        var callback;
        for (var i = 0, l = queue.length; i < l; i++) {
            queued = queue[i];
            callback = queued[action];
            if (typeof callback === 'function') {
                immediate(execute,callback, value, queued.resolver, queued.rejecter);
            }else if(success){
            	if(!value){
            		//out.println(callback + "({\"results\":\"EXCEPTION ERROR:"+e.getMessage()+"\",\"status\":\"ERROR\"})");
					value = {results: "ERROR de COMUNICACIO", status: "ERROR"};
				}
            	
            	if(value.status!=undefined && value.status == "ERROR"){
					//console.debug(value);
            		queued.rejecter(value);	
            	}else{
            		queued.resolver(value);	
            	}
            }else{
                queued.resolver(value);
            }
        }
        // Replace this handler with a simple resolved or rejected handler
        resolved = createHandler(then, value, success);
    }
    this.then = then;
    function yes(value) {
        if (!resolved) {
            resolve(true, value);
        }
    }
    function no (reason) {
        if (!resolved) {
            resolve(false, reason);
        }
    }
    try{
        resolver(function(a){
            if(a && typeof a.then==='function'){
                a.then(yes,no);
            }else{
                yes(a);
            }
        },no);
    }catch(e){
        no(e);
    }
}

// Creates a fulfilled or rejected .then function
function createHandler(then, value, success) {
    return function(onFulfilled, onRejected) {
        var callback = success ? onFulfilled : onRejected;
        if (typeof callback !== 'function') {
            return Promise(function(resolve,reject){
                then(resolve,reject);
            });
        }
        return Promise(function(resolve,reject){
            immediate(execute,callback,value,resolve,reject);
       });
    };
}

// Executes the callback with the specified value,
// resolving or rejecting the deferred
function execute(callback, value, resolve, reject) {
        try {
            var result = callback(value);
            if (result && typeof result.then === 'function') {
                result.then(resolve, reject);
            }
            else {
                resolve(result);
            }
        }
        catch (error) {
            reject(error);
        }
}
module.exports = Promise;

});
require.alias("calvinmetcalf-setImmediate/lib/index.js", "lie/deps/immediate/lib/index.js");
require.alias("calvinmetcalf-setImmediate/lib/nextTick.js", "lie/deps/immediate/lib/nextTick.js");
require.alias("calvinmetcalf-setImmediate/lib/postMessage.js", "lie/deps/immediate/lib/postMessage.js");
require.alias("calvinmetcalf-setImmediate/lib/messageChannel.js", "lie/deps/immediate/lib/messageChannel.js");
require.alias("calvinmetcalf-setImmediate/lib/stateChange.js", "lie/deps/immediate/lib/stateChange.js");
require.alias("calvinmetcalf-setImmediate/lib/timeout.js", "lie/deps/immediate/lib/timeout.js");
require.alias("calvinmetcalf-setImmediate/lib/global.js", "lie/deps/immediate/lib/global.js");
require.alias("calvinmetcalf-setImmediate/lib/mutation.js", "lie/deps/immediate/lib/mutation.js");
require.alias("calvinmetcalf-setImmediate/lib/index.js", "lie/deps/immediate/index.js");
require.alias("calvinmetcalf-setImmediate/lib/index.js", "immediate/index.js");
require.alias("calvinmetcalf-setImmediate/lib/index.js", "calvinmetcalf-setImmediate/index.js");

require.alias("lie/lie.js", "lie/index.js");

L.Util.Promise = require("lie");
})();

L.Util.ajax = function(url, options) {
	'use strict';
	options = options || {};
	if (options.jsonp) {
		return L.Util.ajax.jsonp(url, options);
	}
	var request;
	var cancel;
	var out = L.Util.Promise(function(resolve,reject){
		var Ajax;
		cancel=reject;
		// the following is from JavaScript: The Definitive Guide
		if (window.XMLHttpRequest === undefined) {
			Ajax = function() {
				try {
					return new ActiveXObject('Microsoft.XMLHTTP.6.0');
				}
				catch (e1) {
					try {
						return new ActiveXObject('Microsoft.XMLHTTP.3.0');
					}
					catch (e2) {
						reject('XMLHttpRequest is not supported');
					}
				}
			};
		}
		else {
			Ajax = window.XMLHttpRequest;
		}
		var response;
		request = new Ajax();
		request.open('GET', url);
		request.onreadystatechange = function() {
			/*jslint evil: true */
			if (request.readyState === 4) {
				if((request.status < 400&&options.local)|| request.status===200) {
					if (window.JSON) {
						response = JSON.parse(request.responseText);
					} else if (options.evil) {
						response = eval('(' + request.responseText + ')');
					}
					resolve(response);
				} else {
					if(!request.status){
						reject('Attempted cross origin request without CORS enabled');
					}else{
						reject(request.statusText);
					}
				}
			}
		};
		request.send();
	});
	out.then(null,function(reason){
		request.abort();
		return reason;
	});
	out.abort = cancel;
	return out;
};

L.Util.jsonp = function(url, options) {
	options = options || {};
	var head = document.getElementsByTagName('head')[0];
	var scriptNode = L.DomUtil.create('script', '', head);
	var cbName, ourl, cbSuffix, cancel;
	var out = L.Util.Promise(function(resolve, reject){
		cancel=reject;
		var cbParam = options.cbParam || 'callback';
		if (options.callbackName) {
			cbName = options.callbackName;
		}
		else {
			cbSuffix = '_' + ('' + Math.random()).slice(2);
			cbName = 'L.Util.jsonp.cb.' + cbSuffix;
		}
		scriptNode.type = 'text/javascript';
		if (cbSuffix) {
			L.Util.jsonp.cb[cbSuffix] = function(data) {
				head.removeChild(scriptNode);
				delete L.Util.jsonp.cb[cbSuffix];
				resolve(data);
			};
		}
		if (url.indexOf('?') === -1) {
			ourl = url + '?' + cbParam + '=' + cbName;
		}
		else {
			ourl = url + '&' + cbParam + '=' + cbName;
		}
		scriptNode.src = ourl;
	}).then(null,function(reason){
	    head.removeChild(scriptNode);
		delete L.Util.ajax.cb[cbSuffix];
		return reason;
	});
	out.abort = cancel;
	return out;
};
L.Util.jsonp.cb = {};

L.GeoJSON.AJAX = L.GeoJSON.extend({
	defaultAJAXparams: {
		dataType: 'json',
		callbackParam: 'callback',
		local:false,
		middleware: function(f) {
			return f;
		}
	},
	initialize: function(url, options) {

		this.urls = [];
		if (url) {
			if (typeof url === 'string') {
				this.urls.push(url);
			}
			else if (typeof url.pop === 'function') {
				this.urls = this.urls.concat(url);
			}
			else {
				options = url;
				url = undefined;
			}
		}
		var ajaxParams = L.Util.extend({}, this.defaultAJAXparams);

		for (var i in options) {
			if (this.defaultAJAXparams.hasOwnProperty(i)) {
				ajaxParams[i] = options[i];
			}
		}
		this.ajaxParams = ajaxParams;
		this._layers = {};
		L.Util.setOptions(this, options);
		this.on('data:loaded', function() {
			if (this.filter) {
				this.refilter(this.filter);
			}
		}, this);
		var self = this;
		if (this.urls.length > 0) {
			L.Util.Promise(function(yes){
			    yes();
			}).then(function(){
			    self.addUrl();
		    });
		}
	},
	clearLayers: function() {
		this.urls = [];
		L.GeoJSON.prototype.clearLayers.call(this);
		return this;
	},
	addUrl: function(url) {
		var self = this;
		if (url) {
			if (typeof url === 'string') {
				self.urls.push(url);
			}
			else if (typeof url.pop === 'function') {
				self.urls = self.urls.concat(url);
			}
		}
		var loading = self.urls.length;
		var done = 0;
		self.fire('data:loading');
		self.urls.forEach(function(url) {
			if (self.ajaxParams.dataType.toLowerCase() === 'json') {
				L.Util.ajax(url,self.ajaxParams).then(function(d) {
					var data = self.ajaxParams.middleware(d);
					if(data.status && data.status === "ERROR"){
						self.fire('data:progress',{error:data});
					}else{
						self.addData(data);
						self.fire('data:progress',data);
					}
				},function(err){
					self.fire('data:progress',{error:err});
				});
			}
			else if (self.ajaxParams.dataType.toLowerCase() === 'jsonp') {
				L.Util.jsonp(url,self.ajaxParams).then(function(d) {
					var data = self.ajaxParams.middleware(d);
					self.addData(data);
					self.fire('data:progress',data);
				},function(err){
					self.fire('data:progress',{error:err});
				});
			}
		});
		self.on('data:progress', function() {
			if (++done === loading) {
				self.fire('data:loaded');
			}
		});
	},
	refresh: function(url) {
		url = url || this.urls;
		this.clearLayers();
		this.addUrl(url);
	},
	refilter: function(func) {
		if (typeof func !== 'function') {
			this.filter = false;
			this.eachLayer(function(a) {
				a.setStyle({
					stroke: true,
					clickable: true
				});
			});
		}
		else {
			this.filter = func;
			this.eachLayer(function(a) {

				if (func(a.feature)) {
					a.setStyle({
						stroke: true,
						clickable: true
					});
				}
				else {
					a.setStyle({
						stroke: false,
						clickable: false
					});
				}
			});
		}
	}
});
L.geoJson.ajax = function(geojson, options) {
	return new L.GeoJSON.AJAX(geojson, options);
};

/*
 Leaflet.markercluster, Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 https://github.com/Leaflet/Leaflet.markercluster
 (c) 2012-2013, Dave Leaver, smartrak
*/
!function(t,e){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,singleMarkerMode:!1,disableClusteringAtZoom:null,removeOutsideVisibleBounds:!0,animateAddingMarkers:!1,spiderfyDistanceMultiplier:1,polygonOptions:{}},initialize:function(t){L.Util.setOptions(this,t),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),this._featureGroup=L.featureGroup(),this._featureGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._nonPointGroup=L.featureGroup(),this._nonPointGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._inZoomAnimation=0,this._needsClustering=[],this._needsRemoving=[],this._currentShownBounds=null},addLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.addLayers(e)}if(!t.getLatLng)return this._nonPointGroup.addLayer(t),this;if(!this._map)return this._needsClustering.push(t),this;if(this.hasLayer(t))return this;this._unspiderfy&&this._unspiderfy(),this._addLayer(t,this._maxZoom);var n=t,s=this._map.getZoom();if(t.__parent)for(;n.__parent._zoom>=s;)n=n.__parent;return this._currentShownBounds.contains(n.getLatLng())&&(this.options.animateAddingMarkers?this._animationAddLayer(t,n):this._animationAddLayerNonAnimated(t,n)),this},removeLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.removeLayers(e)}return t.getLatLng?this._map?t.__parent?(this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(t)),this._removeLayer(t,!0),this._featureGroup.hasLayer(t)&&(this._featureGroup.removeLayer(t),t.setOpacity&&t.setOpacity(1)),this):this:(!this._arraySplice(this._needsClustering,t)&&this.hasLayer(t)&&this._needsRemoving.push(t),this):(this._nonPointGroup.removeLayer(t),this)},addLayers:function(t){var e,i,n,s=this._map,r=this._featureGroup,o=this._nonPointGroup;for(e=0,i=t.length;i>e;e++)if(n=t[e],n.getLatLng){if(!this.hasLayer(n))if(s){if(this._addLayer(n,this._maxZoom),n.__parent&&2===n.__parent.getChildCount()){var a=n.__parent.getAllChildMarkers(),h=a[0]===n?a[1]:a[0];r.removeLayer(h)}}else this._needsClustering.push(n)}else o.addLayer(n);return s&&(r.eachLayer(function(t){t instanceof L.MarkerCluster&&t._iconNeedsUpdate&&t._updateIcon()}),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)),this},removeLayers:function(t){var e,i,n,s=this._featureGroup,r=this._nonPointGroup;if(!this._map){for(e=0,i=t.length;i>e;e++)n=t[e],this._arraySplice(this._needsClustering,n),r.removeLayer(n);return this}for(e=0,i=t.length;i>e;e++)n=t[e],n.__parent?(this._removeLayer(n,!0,!0),s.hasLayer(n)&&(s.removeLayer(n),n.setOpacity&&n.setOpacity(1))):r.removeLayer(n);return this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds),s.eachLayer(function(t){t instanceof L.MarkerCluster&&t._updateIcon()}),this},clearLayers:function(){return this._map||(this._needsClustering=[],delete this._gridClusters,delete this._gridUnclustered),this._noanimationUnspiderfy&&this._noanimationUnspiderfy(),this._featureGroup.clearLayers(),this._nonPointGroup.clearLayers(),this.eachLayer(function(t){delete t.__parent}),this._map&&this._generateInitialClusters(),this},getBounds:function(){var t=new L.LatLngBounds;if(this._topClusterLevel)t.extend(this._topClusterLevel._bounds);else for(var e=this._needsClustering.length-1;e>=0;e--)t.extend(this._needsClustering[e].getLatLng());return t.extend(this._nonPointGroup.getBounds()),t},eachLayer:function(t,e){var i,n=this._needsClustering.slice();for(this._topClusterLevel&&this._topClusterLevel.getAllChildMarkers(n),i=n.length-1;i>=0;i--)t.call(e,n[i]);this._nonPointGroup.eachLayer(t,e)},getLayers:function(){var t=[];return this.eachLayer(function(e){t.push(e)}),t},hasLayer:function(t){if(!t)return!1;var e,i=this._needsClustering;for(e=i.length-1;e>=0;e--)if(i[e]===t)return!0;for(i=this._needsRemoving,e=i.length-1;e>=0;e--)if(i[e]===t)return!1;return!(!t.__parent||t.__parent._group!==this)||this._nonPointGroup.hasLayer(t)},zoomToShowLayer:function(t,e){var i=function(){if((t._icon||t.__parent._icon)&&!this._inZoomAnimation)if(this._map.off("moveend",i,this),this.off("animationend",i,this),t._icon)e();else if(t.__parent._icon){var n=function(){this.off("spiderfied",n,this),e()};this.on("spiderfied",n,this),t.__parent.spiderfy()}};t._icon?e():t.__parent._zoom<this._map.getZoom()?(this._map.on("moveend",i,this),t._icon||this._map.panTo(t.getLatLng())):(this._map.on("moveend",i,this),this.on("animationend",i,this),this._map.setView(t.getLatLng(),t.__parent._zoom+1),t.__parent.zoomToBounds())},onAdd:function(t){this._map=t;var e,i,n;if(!isFinite(this._map.getMaxZoom()))throw"Map has no maxZoom specified";for(this._featureGroup.onAdd(t),this._nonPointGroup.onAdd(t),this._gridClusters||this._generateInitialClusters(),e=0,i=this._needsRemoving.length;i>e;e++)n=this._needsRemoving[e],this._removeLayer(n,!0);for(this._needsRemoving=[],e=0,i=this._needsClustering.length;i>e;e++)n=this._needsClustering[e],n.getLatLng?n.__parent||this._addLayer(n,this._maxZoom):this._featureGroup.addLayer(n);this._needsClustering=[],this._map.on("zoomend",this._zoomEnd,this),this._map.on("moveend",this._moveEnd,this),this._spiderfierOnAdd&&this._spiderfierOnAdd(),this._bindEvents(),this._zoom=this._map.getZoom(),this._currentShownBounds=this._getExpandedVisibleBounds(),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)},onRemove:function(t){t.off("zoomend",this._zoomEnd,this),t.off("moveend",this._moveEnd,this),this._unbindEvents(),this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._spiderfierOnRemove&&this._spiderfierOnRemove(),this._hideCoverage(),this._featureGroup.onRemove(t),this._nonPointGroup.onRemove(t),this._featureGroup.clearLayers(),this._map=null},getVisibleParent:function(t){for(var e=t;e&&!e._icon;)e=e.__parent;return e||null},_arraySplice:function(t,e){for(var i=t.length-1;i>=0;i--)if(t[i]===e)return t.splice(i,1),!0},_removeLayer:function(t,e,i){var n=this._gridClusters,s=this._gridUnclustered,r=this._featureGroup,o=this._map;if(e)for(var a=this._maxZoom;a>=0&&s[a].removeObject(t,o.project(t.getLatLng(),a));a--);var h,_=t.__parent,u=_._markers;for(this._arraySplice(u,t);_&&(_._childCount--,!(_._zoom<0));)e&&_._childCount<=1?(h=_._markers[0]===t?_._markers[1]:_._markers[0],n[_._zoom].removeObject(_,o.project(_._cLatLng,_._zoom)),s[_._zoom].addObject(h,o.project(h.getLatLng(),_._zoom)),this._arraySplice(_.__parent._childClusters,_),_.__parent._markers.push(h),h.__parent=_.__parent,_._icon&&(r.removeLayer(_),i||r.addLayer(h))):(_._recalculateBounds(),i&&_._icon||_._updateIcon()),_=_.__parent;delete t.__parent},_propagateEvent:function(t){t.layer instanceof L.MarkerCluster&&(t.type="cluster"+t.type),this.fire(t.type,t)},_defaultIconCreateFunction:function(t){var e=t.getChildCount(),i=" marker-cluster-";return i+=10>e?"small":100>e?"medium":"large",new L.DivIcon({html:"<div><span>"+e+"</span></div>",className:"marker-cluster"+i,iconSize:new L.Point(40,40)})},_bindEvents:function(){var t=this._map,e=this.options.spiderfyOnMaxZoom,i=this.options.showCoverageOnHover,n=this.options.zoomToBoundsOnClick;(e||n)&&this.on("clusterclick",this._zoomOrSpiderfy,this),i&&(this.on("clustermouseover",this._showCoverage,this),this.on("clustermouseout",this._hideCoverage,this),t.on("zoomend",this._hideCoverage,this))},_zoomOrSpiderfy:function(t){var e=this._map;e.getMaxZoom()===e.getZoom()?this.options.spiderfyOnMaxZoom&&t.layer.spiderfy():this.options.zoomToBoundsOnClick&&t.layer.zoomToBounds()},_showCoverage:function(t){var e=this._map;this._inZoomAnimation||(this._shownPolygon&&e.removeLayer(this._shownPolygon),t.layer.getChildCount()>2&&t.layer!==this._spiderfied&&(this._shownPolygon=new L.Polygon(t.layer.getConvexHull(),this.options.polygonOptions),e.addLayer(this._shownPolygon)))},_hideCoverage:function(){this._shownPolygon&&(this._map.removeLayer(this._shownPolygon),this._shownPolygon=null)},_unbindEvents:function(){var t=this.options.spiderfyOnMaxZoom,e=this.options.showCoverageOnHover,i=this.options.zoomToBoundsOnClick,n=this._map;(t||i)&&this.off("clusterclick",this._zoomOrSpiderfy,this),e&&(this.off("clustermouseover",this._showCoverage,this),this.off("clustermouseout",this._hideCoverage,this),n.off("zoomend",this._hideCoverage,this))},_zoomEnd:function(){this._map&&(this._mergeSplitClusters(),this._zoom=this._map._zoom,this._currentShownBounds=this._getExpandedVisibleBounds())},_moveEnd:function(){if(!this._inZoomAnimation){var t=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._map._zoom,t),this._currentShownBounds=t}},_generateInitialClusters:function(){var t=this._map.getMaxZoom(),e=this.options.maxClusterRadius;this.options.disableClusteringAtZoom&&(t=this.options.disableClusteringAtZoom-1),this._maxZoom=t,this._gridClusters={},this._gridUnclustered={};for(var i=t;i>=0;i--)this._gridClusters[i]=new L.DistanceGrid(e),this._gridUnclustered[i]=new L.DistanceGrid(e);this._topClusterLevel=new L.MarkerCluster(this,-1)},_addLayer:function(t,e){var i,n,s=this._gridClusters,r=this._gridUnclustered;for(this.options.singleMarkerMode&&(t.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[t]}}));e>=0;e--){i=this._map.project(t.getLatLng(),e);var o=s[e].getNearObject(i);if(o)return o._addChild(t),t.__parent=o,void 0;if(o=r[e].getNearObject(i)){var a=o.__parent;a&&this._removeLayer(o,!1);var h=new L.MarkerCluster(this,e,o,t);s[e].addObject(h,this._map.project(h._cLatLng,e)),o.__parent=h,t.__parent=h;var _=h;for(n=e-1;n>a._zoom;n--)_=new L.MarkerCluster(this,n,_),s[n].addObject(_,this._map.project(o.getLatLng(),n));for(a._addChild(_),n=e;n>=0&&r[n].removeObject(o,this._map.project(o.getLatLng(),n));n--);return}r[e].addObject(t,i)}this._topClusterLevel._addChild(t),t.__parent=this._topClusterLevel},_mergeSplitClusters:function(){this._zoom<this._map._zoom&&this._currentShownBounds.contains(this._getExpandedVisibleBounds())?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,this._map._zoom)):this._zoom>this._map._zoom?(this._animationStart(),this._animationZoomOut(this._zoom,this._map._zoom)):this._moveEnd()},_getExpandedVisibleBounds:function(){if(!this.options.removeOutsideVisibleBounds)return this.getBounds();var t=this._map,e=t.getBounds(),i=e._southWest,n=e._northEast,s=L.Browser.mobile?0:Math.abs(i.lat-n.lat),r=L.Browser.mobile?0:Math.abs(i.lng-n.lng);return new L.LatLngBounds(new L.LatLng(i.lat-s,i.lng-r,!0),new L.LatLng(n.lat+s,n.lng+r,!0))},_animationAddLayerNonAnimated:function(t,e){if(e===t)this._featureGroup.addLayer(t);else if(2===e._childCount){e._addToMap();var i=e.getAllChildMarkers();this._featureGroup.removeLayer(i[0]),this._featureGroup.removeLayer(i[1])}else e._updateIcon()}}),L.MarkerClusterGroup.include(L.DomUtil.TRANSITION?{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationEnd:function(){this._map&&(this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")),this._inZoomAnimation--,this.fire("animationend")},_animationZoomIn:function(t,e){var i,n=this,s=this._getExpandedVisibleBounds(),r=this._featureGroup;this._topClusterLevel._recursively(s,t,0,function(n){var o,a=n._latlng,h=n._markers;for(s.contains(a)||(a=null),n._isSingleParent()&&t+1===e?(r.removeLayer(n),n._recursivelyAddChildrenToMap(null,e,s)):(n.setOpacity(0),n._recursivelyAddChildrenToMap(a,e,s)),i=h.length-1;i>=0;i--)o=h[i],s.contains(o._latlng)||r.removeLayer(o)}),this._forceLayout(),n._topClusterLevel._recursivelyBecomeVisible(s,e),r.eachLayer(function(t){t instanceof L.MarkerCluster||!t._icon||t.setOpacity(1)}),n._topClusterLevel._recursively(s,t,e,function(t){t._recursivelyRestoreChildPositions(e)}),setTimeout(function(){n._topClusterLevel._recursively(s,t,0,function(t){r.removeLayer(t),t.setOpacity(1)}),n._animationEnd()},200)},_animationZoomOut:function(t,e){this._animationZoomOutSingle(this._topClusterLevel,t-1,e),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds()),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(t,e,i){var n=this._getExpandedVisibleBounds();t._recursivelyAnimateChildrenInAndAddSelfToMap(n,e+1,i);var s=this;this._forceLayout(),t._recursivelyBecomeVisible(n,i),setTimeout(function(){if(1===t._childCount){var r=t._markers[0];r.setLatLng(r.getLatLng()),r.setOpacity(1)}else t._recursively(n,i,0,function(t){t._recursivelyRemoveChildrenFromMap(n,e+1)});s._animationEnd()},200)},_animationAddLayer:function(t,e){var i=this,n=this._featureGroup;n.addLayer(t),e!==t&&(e._childCount>2?(e._updateIcon(),this._forceLayout(),this._animationStart(),t._setPos(this._map.latLngToLayerPoint(e.getLatLng())),t.setOpacity(0),setTimeout(function(){n.removeLayer(t),t.setOpacity(1),i._animationEnd()},200)):(this._forceLayout(),i._animationStart(),i._animationZoomOutSingle(e,this._map.getMaxZoom(),this._map.getZoom())))},_forceLayout:function(){L.Util.falseFn(e.body.offsetWidth)}}:{_animationStart:function(){},_animationZoomIn:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds())},_animationZoomOut:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds())},_animationAddLayer:function(t,e){this._animationAddLayerNonAnimated(t,e)}}),L.markerClusterGroup=function(t){return new L.MarkerClusterGroup(t)},L.MarkerCluster=L.Marker.extend({initialize:function(t,e,i,n){L.Marker.prototype.initialize.call(this,i?i._cLatLng||i.getLatLng():new L.LatLng(0,0),{icon:this}),this._group=t,this._zoom=e,this._markers=[],this._childClusters=[],this._childCount=0,this._iconNeedsUpdate=!0,this._bounds=new L.LatLngBounds,i&&this._addChild(i),n&&this._addChild(n)},getAllChildMarkers:function(t){t=t||[];for(var e=this._childClusters.length-1;e>=0;e--)this._childClusters[e].getAllChildMarkers(t);for(var i=this._markers.length-1;i>=0;i--)t.push(this._markers[i]);return t},getChildCount:function(){return this._childCount},zoomToBounds:function(){for(var t,e=this._childClusters.slice(),i=this._group._map,n=i.getBoundsZoom(this._bounds),s=this._zoom+1;e.length>0&&n>s;){s++;var r=[];for(t=0;t<e.length;t++)r=r.concat(e[t]._childClusters);e=r}n>s?this._group._map.setView(this._latlng,s):this._group._map.fitBounds(this._bounds)},getBounds:function(){var t=new L.LatLngBounds;return t.extend(this._bounds),t},_updateIcon:function(){this._iconNeedsUpdate=!0,this._icon&&this.setIcon(this)},createIcon:function(){return this._iconNeedsUpdate&&(this._iconObj=this._group.options.iconCreateFunction(this),this._iconNeedsUpdate=!1),this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(t,e){this._iconNeedsUpdate=!0,this._expandBounds(t),t instanceof L.MarkerCluster?(e||(this._childClusters.push(t),t.__parent=this),this._childCount+=t._childCount):(e||this._markers.push(t),this._childCount++),this.__parent&&this.__parent._addChild(t,!0)},_expandBounds:function(t){var e,i=t._wLatLng||t._latlng;t instanceof L.MarkerCluster?(this._bounds.extend(t._bounds),e=t._childCount):(this._bounds.extend(i),e=1),this._cLatLng||(this._cLatLng=t._cLatLng||i);var n=this._childCount+e;this._wLatLng?(this._wLatLng.lat=(i.lat*e+this._wLatLng.lat*this._childCount)/n,this._wLatLng.lng=(i.lng*e+this._wLatLng.lng*this._childCount)/n):this._latlng=this._wLatLng=new L.LatLng(i.lat,i.lng)},_addToMap:function(t){t&&(this._backupLatlng=this._latlng,this.setLatLng(t)),this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(t,e,i){this._recursively(t,0,i-1,function(t){var i,n,s=t._markers;for(i=s.length-1;i>=0;i--)n=s[i],n._icon&&(n._setPos(e),n.setOpacity(0))},function(t){var i,n,s=t._childClusters;for(i=s.length-1;i>=0;i--)n=s[i],n._icon&&(n._setPos(e),n.setOpacity(0))})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(t,e,i){this._recursively(t,i,0,function(n){n._recursivelyAnimateChildrenIn(t,n._group._map.latLngToLayerPoint(n.getLatLng()).round(),e),n._isSingleParent()&&e-1===i?(n.setOpacity(1),n._recursivelyRemoveChildrenFromMap(t,e)):n.setOpacity(0),n._addToMap()})},_recursivelyBecomeVisible:function(t,e){this._recursively(t,0,e,null,function(t){t.setOpacity(1)})},_recursivelyAddChildrenToMap:function(t,e,i){this._recursively(i,-1,e,function(n){if(e!==n._zoom)for(var s=n._markers.length-1;s>=0;s--){var r=n._markers[s];i.contains(r._latlng)&&(t&&(r._backupLatlng=r.getLatLng(),r.setLatLng(t),r.setOpacity&&r.setOpacity(0)),n._group._featureGroup.addLayer(r))}},function(e){e._addToMap(t)})},_recursivelyRestoreChildPositions:function(t){for(var e=this._markers.length-1;e>=0;e--){var i=this._markers[e];i._backupLatlng&&(i.setLatLng(i._backupLatlng),delete i._backupLatlng)}if(t-1===this._zoom)for(var n=this._childClusters.length-1;n>=0;n--)this._childClusters[n]._restorePosition();else for(var s=this._childClusters.length-1;s>=0;s--)this._childClusters[s]._recursivelyRestoreChildPositions(t)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(t,e,i){var n,s;this._recursively(t,-1,e-1,function(t){for(s=t._markers.length-1;s>=0;s--)n=t._markers[s],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))},function(t){for(s=t._childClusters.length-1;s>=0;s--)n=t._childClusters[s],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))})},_recursively:function(t,e,i,n,s){var r,o,a=this._childClusters,h=this._zoom;if(e>h)for(r=a.length-1;r>=0;r--)o=a[r],t.intersects(o._bounds)&&o._recursively(t,e,i,n,s);else if(n&&n(this),s&&this._zoom===i&&s(this),i>h)for(r=a.length-1;r>=0;r--)o=a[r],t.intersects(o._bounds)&&o._recursively(t,e,i,n,s)},_recalculateBounds:function(){var t,e=this._markers,i=this._childClusters;for(this._bounds=new L.LatLngBounds,delete this._wLatLng,t=e.length-1;t>=0;t--)this._expandBounds(e[t]);for(t=i.length-1;t>=0;t--)this._expandBounds(i[t])},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}}),L.DistanceGrid=function(t){this._cellSize=t,this._sqCellSize=t*t,this._grid={},this._objectPoint={}},L.DistanceGrid.prototype={addObject:function(t,e){var i=this._getCoord(e.x),n=this._getCoord(e.y),s=this._grid,r=s[n]=s[n]||{},o=r[i]=r[i]||[],a=L.Util.stamp(t);this._objectPoint[a]=e,o.push(t)},updateObject:function(t,e){this.removeObject(t),this.addObject(t,e)},removeObject:function(t,e){var i,n,s=this._getCoord(e.x),r=this._getCoord(e.y),o=this._grid,a=o[r]=o[r]||{},h=a[s]=a[s]||[];for(delete this._objectPoint[L.Util.stamp(t)],i=0,n=h.length;n>i;i++)if(h[i]===t)return h.splice(i,1),1===n&&delete a[s],!0},eachObject:function(t,e){var i,n,s,r,o,a,h,_=this._grid;for(i in _){o=_[i];for(n in o)for(a=o[n],s=0,r=a.length;r>s;s++)h=t.call(e,a[s]),h&&(s--,r--)}},getNearObject:function(t){var e,i,n,s,r,o,a,h,_=this._getCoord(t.x),u=this._getCoord(t.y),l=this._objectPoint,d=this._sqCellSize,p=null;for(e=u-1;u+1>=e;e++)if(s=this._grid[e])for(i=_-1;_+1>=i;i++)if(r=s[i])for(n=0,o=r.length;o>n;n++)a=r[n],h=this._sqDist(l[L.Util.stamp(a)],t),d>h&&(d=h,p=a);return p},_getCoord:function(t){return Math.floor(t/this._cellSize)},_sqDist:function(t,e){var i=e.x-t.x,n=e.y-t.y;return i*i+n*n}},function(){L.QuickHull={getDistant:function(t,e){var i=e[1].lat-e[0].lat,n=e[0].lng-e[1].lng;return n*(t.lat-e[0].lat)+i*(t.lng-e[0].lng)},findMostDistantPointFromBaseLine:function(t,e){var i,n,s,r=0,o=null,a=[];for(i=e.length-1;i>=0;i--)n=e[i],s=this.getDistant(n,t),s>0&&(a.push(n),s>r&&(r=s,o=n));return{maxPoint:o,newPoints:a}},buildConvexHull:function(t,e){var i=[],n=this.findMostDistantPointFromBaseLine(t,e);return n.maxPoint?(i=i.concat(this.buildConvexHull([t[0],n.maxPoint],n.newPoints)),i=i.concat(this.buildConvexHull([n.maxPoint,t[1]],n.newPoints))):[t[0]]},getConvexHull:function(t){var e,i=!1,n=!1,s=null,r=null;for(e=t.length-1;e>=0;e--){var o=t[e];(i===!1||o.lat>i)&&(s=o,i=o.lat),(n===!1||o.lat<n)&&(r=o,n=o.lat)}var a=[].concat(this.buildConvexHull([r,s],t),this.buildConvexHull([s,r],t));return a}}}(),L.MarkerCluster.include({getConvexHull:function(){var t,e,i=this.getAllChildMarkers(),n=[];for(e=i.length-1;e>=0;e--)t=i[e].getLatLng(),n.push(t);return L.QuickHull.getConvexHull(n)}}),L.MarkerCluster.include({_2PI:2*Math.PI,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied!==this&&!this._group._inZoomAnimation){var t,e=this.getAllChildMarkers(),i=this._group,n=i._map,s=n.latLngToLayerPoint(this._latlng);this._group._unspiderfy(),this._group._spiderfied=this,e.length>=this._circleSpiralSwitchover?t=this._generatePointsSpiral(e.length,s):(s.y+=10,t=this._generatePointsCircle(e.length,s)),this._animationSpiderfy(e,t)}},unspiderfy:function(t){this._group._inZoomAnimation||(this._animationUnspiderfy(t),this._group._spiderfied=null)},_generatePointsCircle:function(t,e){var i,n,s=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+t),r=s/this._2PI,o=this._2PI/t,a=[];for(a.length=t,i=t-1;i>=0;i--)n=this._circleStartAngle+i*o,a[i]=new L.Point(e.x+r*Math.cos(n),e.y+r*Math.sin(n))._round();return a},_generatePointsSpiral:function(t,e){var i,n=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthStart,s=this._group.options.spiderfyDistanceMultiplier*this._spiralFootSeparation,r=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthFactor,o=0,a=[];for(a.length=t,i=t-1;i>=0;i--)o+=s/n+5e-4*i,a[i]=new L.Point(e.x+n*Math.cos(o),e.y+n*Math.sin(o))._round(),n+=this._2PI*r/o;return a},_noanimationUnspiderfy:function(){var t,e,i=this._group,n=i._map,s=i._featureGroup,r=this.getAllChildMarkers();for(this.setOpacity(1),e=r.length-1;e>=0;e--)t=r[e],s.removeLayer(t),t._preSpiderfyLatlng&&(t.setLatLng(t._preSpiderfyLatlng),delete t._preSpiderfyLatlng),t.setZIndexOffset&&t.setZIndexOffset(0),t._spiderLeg&&(n.removeLayer(t._spiderLeg),delete t._spiderLeg);i._spiderfied=null}}),L.MarkerCluster.include(L.DomUtil.TRANSITION?{SVG_ANIMATION:function(){return e.createElementNS("http://www.w3.org/2000/svg","animate").toString().indexOf("SVGAnimate")>-1}(),_animationSpiderfy:function(t,i){var n,s,r,o,a=this,h=this._group,_=h._map,u=h._featureGroup,l=_.latLngToLayerPoint(this._latlng);for(n=t.length-1;n>=0;n--)s=t[n],s.setOpacity?(s.setZIndexOffset(1e6),s.setOpacity(0),u.addLayer(s),s._setPos(l)):u.addLayer(s);h._forceLayout(),h._animationStart();var d=L.Path.SVG?0:.3,p=L.Path.SVG_NS;for(n=t.length-1;n>=0;n--)if(o=_.layerPointToLatLng(i[n]),s=t[n],s._preSpiderfyLatlng=s._latlng,s.setLatLng(o),s.setOpacity&&s.setOpacity(1),r=new L.Polyline([a._latlng,o],{weight:1.5,color:"#222",opacity:d}),_.addLayer(r),s._spiderLeg=r,L.Path.SVG&&this.SVG_ANIMATION){var c=r._path.getTotalLength();r._path.setAttribute("stroke-dasharray",c+","+c);var m=e.createElementNS(p,"animate");m.setAttribute("attributeName","stroke-dashoffset"),m.setAttribute("begin","indefinite"),m.setAttribute("from",c),m.setAttribute("to",0),m.setAttribute("dur",.25),r._path.appendChild(m),m.beginElement(),m=e.createElementNS(p,"animate"),m.setAttribute("attributeName","stroke-opacity"),m.setAttribute("attributeName","stroke-opacity"),m.setAttribute("begin","indefinite"),m.setAttribute("from",0),m.setAttribute("to",.5),m.setAttribute("dur",.25),r._path.appendChild(m),m.beginElement()}if(a.setOpacity(.3),L.Path.SVG)for(this._group._forceLayout(),n=t.length-1;n>=0;n--)s=t[n]._spiderLeg,s.options.opacity=.5,s._path.setAttribute("stroke-opacity",.5);setTimeout(function(){h._animationEnd(),h.fire("spiderfied")},200)},_animationUnspiderfy:function(t){var e,i,n,s=this._group,r=s._map,o=s._featureGroup,a=t?r._latLngToNewLayerPoint(this._latlng,t.zoom,t.center):r.latLngToLayerPoint(this._latlng),h=this.getAllChildMarkers(),_=L.Path.SVG&&this.SVG_ANIMATION;for(s._animationStart(),this.setOpacity(1),i=h.length-1;i>=0;i--)e=h[i],e._preSpiderfyLatlng&&(e.setLatLng(e._preSpiderfyLatlng),delete e._preSpiderfyLatlng,e.setOpacity?(e._setPos(a),e.setOpacity(0)):o.removeLayer(e),_&&(n=e._spiderLeg._path.childNodes[0],n.setAttribute("to",n.getAttribute("from")),n.setAttribute("from",0),n.beginElement(),n=e._spiderLeg._path.childNodes[1],n.setAttribute("from",.5),n.setAttribute("to",0),n.setAttribute("stroke-opacity",0),n.beginElement(),e._spiderLeg._path.setAttribute("stroke-opacity",0)));setTimeout(function(){var t=0;for(i=h.length-1;i>=0;i--)e=h[i],e._spiderLeg&&t++;for(i=h.length-1;i>=0;i--)e=h[i],e._spiderLeg&&(e.setOpacity&&(e.setOpacity(1),e.setZIndexOffset(0)),t>1&&o.removeLayer(e),r.removeLayer(e._spiderLeg),delete e._spiderLeg);s._animationEnd()},200)}}:{_animationSpiderfy:function(t,e){var i,n,s,r,o=this._group,a=o._map,h=o._featureGroup;for(i=t.length-1;i>=0;i--)r=a.layerPointToLatLng(e[i]),n=t[i],n._preSpiderfyLatlng=n._latlng,n.setLatLng(r),n.setZIndexOffset&&n.setZIndexOffset(1e6),h.addLayer(n),s=new L.Polyline([this._latlng,r],{weight:1.5,color:"#222"}),a.addLayer(s),n._spiderLeg=s;this.setOpacity(.3),o.fire("spiderfied")},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}),L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this),this._map.options.zoomAnimation&&this._map.on("zoomstart",this._unspiderfyZoomStart,this),this._map.on("zoomend",this._noanimationUnspiderfy,this),L.Path.SVG&&!L.Browser.touch&&this._map._initPathRoot()},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this),this._map.off("zoomstart",this._unspiderfyZoomStart,this),this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy()},_unspiderfyZoomStart:function(){this._map&&this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(t){L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")||(this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy(t))},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(t){this._spiderfied&&this._spiderfied.unspiderfy(t)},_noanimationUnspiderfy:function(){this._spiderfied&&this._spiderfied._noanimationUnspiderfy()},_unspiderfyLayer:function(t){t._spiderLeg&&(this._featureGroup.removeLayer(t),t.setOpacity(1),t.setZIndexOffset(0),this._map.removeLayer(t._spiderLeg),delete t._spiderLeg)}})}(window,document);
L.Control.MiniMap = L.Control.extend({
	options: {
		position: 'bottomright',
		toggleDisplay: false,
		zoomLevelOffset: -5,
		zoomLevelFixed: false,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150,
		aimingRectOptions: {color: "#ff7800", weight: 1, clickable: false},
		shadowRectOptions: {color: "#000000", weight: 1, clickable: false, opacity:0, fillOpacity:0},
		mapOptions: {} // Allows definition / override of Leaflet map options.
	},
	
	hideText: 'Hide MiniMap',
	
	showText: 'Show MiniMap',
	
	//layer is the map layer to be shown in the minimap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		//Make sure the aiming rects are non-clickable even if the user tries to set them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},
	
	onAdd: function (map) {
		this._mainMap = map;

		//Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

		var mapOptions = {
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this.options.zoomLevelFixed,
			scrollWheelZoom: !this.options.zoomLevelFixed,
			doubleClickZoom: !this.options.zoomLevelFixed,
			boxZoom: !this.options.zoomLevelFixed,
			crs: map.options.crs
		};
		
		mapOptions = L.Util.extend(this.options.mapOptions, mapOptions);
		
		this._miniMap = new L.Map(this._container,mapOptions);
		
		this._miniMap.addLayer(this._layer);

		//These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
		this._mainMapMoving = false;
		this._miniMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._miniMap.whenReady(L.Util.bind(function () {
			this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);
			this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);
			this._mainMap.on('moveend', this._onMainMapMoved, this);
			this._mainMap.on('move', this._onMainMapMoving, this);
			//this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
			//this._miniMap.on('move', this._onMiniMapMoving, this);
			//this._miniMap.on('moveend', this._onMiniMapMoved, this);
		}, this));
				
		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
		this._setDisplay(this._decideMinimized());
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._miniMap.off('moveend', this._onMiniMapMoved, this);

		this._miniMap.removeLayer(this._layer);
	},

	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
				'', this.hideText, 'leaflet-control-minimap-toggle-display', this._container, this._toggleDisplayButtonClicked, this) : undefined;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.showText;
		}
		else {
			this._restore();
			this._toggleDisplayButton.title = this.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize != this._minimized) {
			if (!this._minimized) {
				this._minimize();
			}
			else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the minimap
		if (this.options.toggleDisplay) {
			this._container.style.width = '19px';
			this._container.style.height = '19px';
			this._toggleDisplayButton.className += ' minimized';
		}
		else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace(/(?:^|\s)minimized(?!\S)/g, '');
		}
		else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_onMainMapMoved: function (e) {
		if (!this._miniMapMoving) {
			this._mainMapMoving = true;
			this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._miniMapMoving = false;
		}
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMiniMapMoveStarted:function (e) {
		var lastAimingRect = this._aimingRect.getBounds();
		var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
		var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
		this._lastAimingRectPosition = {sw:sw,ne:ne};
	},

	_onMiniMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw),this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
			this._shadowRect.setStyle({opacity:1,fillOpacity:0.3});
		}
	},

	_onMiniMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._miniMapMoving = true;
			this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity:0,fillOpacity:0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_decideZoom: function (fromMaintoMini) {
		if (!this.options.zoomLevelFixed) {
			if (fromMaintoMini)
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			else {
				var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;
				
				if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset) {
					//This means the miniMap is zoomed out to the minimum zoom level and can't zoom any more.
					if (this._miniMap.getZoom() > this._lastMiniMapZoom) {
						//This means the user is trying to zoom in by using the minimap, zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						//Also we cheat and zoom the minimap out again to keep it visually consistent.
						this._miniMap.setZoom(this._miniMap.getZoom() -1);
					} else {
						//Either the user is trying to zoom out past the mini map's min zoom or has just panned using it, we can't tell the difference.
						//Therefore, we ignore it!
						toRet = this._mainMap.getZoom();
					}
				} else {
					//This is what happens in the majority of cases, and always if you configure the min levels + offset in a sane fashion.
					toRet = proposedZoom;
				}
				this._lastMiniMapZoom = this._miniMap.getZoom();
				return toRet;
			}
		} else {
			if (fromMaintoMini)
				return this.options.zoomLevelFixed;
			else
				return this._mainMap.getZoom();
		}
	},

	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
				return true;
			}
			return true;
		}

		return this._minimized;
	}
});

L.Map.mergeOptions({
	miniMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.miniMapControl) {
		this.miniMapControl = (new L.Control.MiniMap()).addTo(this);
	}
});

L.control.minimap = function (options) {
	return new L.Control.MiniMap(options);
};

(function(window) {
	var HAS_HASHCHANGE = (function() {
		var doc_mode = window.documentMode;
		return ('onhashchange' in window) &&
			(doc_mode === undefined || doc_mode > 7);
	})();

	L.Hash = function(map) {
		this.onHashChange = L.Util.bind(this.onHashChange, this);

		if (map) {
			this.init(map);
		}
	};

	L.Hash.parseHash = function(hash) {
		if(hash.indexOf('#') === 0) {
			hash = hash.substr(1);
		}
		var args = hash.split("/");
		if (args.length == 3) {
			var zoom = parseInt(args[0], 10),
			lat = parseFloat(args[1]),
			lon = parseFloat(args[2]);
			if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
				return false;
			} else {
				return {
					center: new L.LatLng(lat, lon),
					zoom: zoom
				};
			}
		} else {
			return false;
		}
	};

	L.Hash.formatHash = function(map) {
		var center = map.getCenter(),
		    zoom = map.getZoom(),
		    precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

		return "#" + [zoom,
			center.lat.toFixed(precision),
			center.lng.toFixed(precision)
		].join("/");
	},

	L.Hash.prototype = {
		map: null,
		lastHash: null,

		parseHash: L.Hash.parseHash,
		formatHash: L.Hash.formatHash,

		init: function(map) {
			this.map = map;

			// reset the hash
			this.lastHash = null;
			this.onHashChange();

			if (!this.isListening) {
				this.startListening();
			}
		},

		removeFrom: function(map) {
			if (this.changeTimeout) {
				clearTimeout(this.changeTimeout);
			}

			if (this.isListening) {
				this.stopListening();
			}

			this.map = null;
		},

		onMapMove: function() {
			// bail if we're moving the map (updating from a hash),
			// or if the map is not yet loaded

			if (this.movingMap || !this.map._loaded) {
				return false;
			}

			var hash = this.formatHash(this.map);
			if (this.lastHash != hash) {
				location.replace(hash);
				this.lastHash = hash;
			}
		},

		movingMap: false,
		update: function() {
			var hash = location.hash;
			if (hash === this.lastHash) {
				return;
			}
			var parsed = this.parseHash(hash);
			if (parsed) {
				this.movingMap = true;

				this.map.setView(parsed.center, parsed.zoom);

				this.movingMap = false;
			} else {
				this.onMapMove(this.map);
			}
		},

		// defer hash change updates every 100ms
		changeDefer: 100,
		changeTimeout: null,
		onHashChange: function() {
			// throttle calls to update() so that they only happen every
			// `changeDefer` ms
			if (!this.changeTimeout) {
				var that = this;
				this.changeTimeout = setTimeout(function() {
					that.update();
					that.changeTimeout = null;
				}, this.changeDefer);
			}
		},

		isListening: false,
		hashChangeInterval: null,
		startListening: function() {
			this.map.on("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.addListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
				this.hashChangeInterval = setInterval(this.onHashChange, 50);
			}
			this.isListening = true;
		},

		stopListening: function() {
			this.map.off("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
			}
			this.isListening = false;
		}
	};
	L.hash = function(map) {
		return new L.Hash(map);
	};
	L.Map.prototype.addHash = function() {
		this._hash = L.hash(this);
	};
	L.Map.prototype.removeHash = function() {
		this._hash.removeFrom();
	};
})(window);


(function() {

L.Control.Gps = L.Control.extend({

	includes: L.Mixin.Events, 
	//
	//Managed Events:
	//	Event			Data passed			Description
	//
	//	gpslocated		{latlng, marker}	fired after gps marker is located
	//	gpsdisabled							fired after gps is disabled
	//
	//Methods exposed:
	//	Method 			Description
	//
	//  getLocation		return Latlng and marker of current position
	//  activate		active tracking on runtime
	//  deactivate		deactive tracking on runtime
	//
	options: {		
		autoActive: false,		//activate control at startup
		autoCenter: false,		//move map when gps location change
		maxZoom: null,			//max zoom for autoCenter
		marker: null,			//L.Marker used for location, default use a L.CircleMarker
		textErr: null,			//error message on alert notification
		callErr: null,			//function that run on gps error activating
		style: {radius: 16,		//marker circle style
				weight:3,
				color: '#e03',
				fill: false},
		title: 'Center map on your location',
		position: 'topleft'
		//TODO add gpsLayer
		//TODO timeout autoCenter		
	},

	initialize: function(options) {
		if(options && options.style)
			options.style = L.Util.extend({}, this.options.style, options.style); 
		L.Util.setOptions(this, options);
		this._errorFunc = this.options.callErr || this.showAlert;
		this._isActive = false;//global state of gps
		this._firstMoved = false;//global state of gps
		this._currentLocation = null;	//store last location
	},
	
    onAdd: function (map) {
    
    	this._map = map;	
        	
        var container = L.DomUtil.create('div', 'leaflet-control-gps');

        this._button = L.DomUtil.create('a', 'gps-button', container);
        this._button.href = '#';
        this._button.title = this.options.title;
		L.DomEvent
			.on(this._button, 'click', L.DomEvent.stop, this)
			.on(this._button, 'click', this._switchGps, this);

		this._alert = L.DomUtil.create('div', 'gps-alert', container);
		this._alert.style.display = 'none';

		this._gpsMarker = this.options.marker ? this.options.marker : new L.CircleMarker([0,0], this.options.style);
		
		this._map
			.on('locationfound', this._drawGps, this)
			.on('locationerror', this._errorGps, this);	
			
		if(this.options.autoActive)
			this.activate();

        return container;
    },
    
	onRemove: function(map) {
		this.deactivate();
	},
	
	_switchGps: function() {
		if(this._isActive)
			this.deactivate();
		else
			this.activate();
	},
	
	getLocation: function() {	//get last location
		return this._currentLocation;
	},
    
    activate: function() {
	    this._isActive = true;
		this._map.addLayer( this._gpsMarker );
	    this._map.locate({
	        enableHighAccuracy: true,
			watch: true,
			//maximumAge:s
	        setView: false,	//automatically sets the map view to the user location
			maxZoom: this.options.maxZoom   
	    });	    
    },
    
    deactivate: function() {
   		this._isActive = false;    
		this._firstMoved = false;
		this._map.stopLocate();
    	L.DomUtil.removeClass(this._button, 'active');
    	this._map.removeLayer( this._gpsMarker );
		//this._gpsMarker.setLatLng([-90,0]);  //move to antarctica!
		//TODO make method .hide() using _icon.style.display = 'none'
		this.fire('gpsdisabled');
    },
    
    _drawGps: function(e) {
    	//TODO use e.accuracy for gps circle radius/color
    	this._currentLocation = e.latlng;
			
    	this._gpsMarker.setLatLng(e.latlng);

    	if(this._isActive && (!this._firstMoved || this.options.autoCenter))
			this._moveTo(e.latlng);
//    	if(this._gpsMarker.accuracyCircle)
//    		this._gpsMarker.accuracyCircle.setRadius((e.accuracy / 2).toFixed(0));
    		
    	this.fire('gpslocated', {latlng: e.latlng, marker: this._gpsMarker});
    	
    	L.DomUtil.addClass(this._button, 'active');	
    },
    
    _moveTo: function(latlng) {
    	this._firstMoved = true;
		if(this.options.maxZoom)
			this._map.setView(latlng, Math.min(this._map.getZoom(), this.options.maxZoom) );
		else
			this._map.panTo(latlng);    
    },
    
    _errorGps: function(e) {
    	this.deactivate();
    	this._errorFunc.call(this, this.options.textErr || e.message);
    },
    
	showAlert: function(text) {
		this._alert.style.display = 'block';
		this._alert.innerHTML = text;
		var that = this;
		clearTimeout(this.timerAlert);
		this.timerAlert = setTimeout(function() {
			that._alert.style.display = 'none';
		}, 2000);
	}
});

L.control.gps = function (options) {
    return new L.Control.Gps(options);
};

}).call(this);

var control_llegenda_WMS;
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
	onAdd: function (map) {
		this.creaControlLLegenda(map);
		// Triggered when the layer is added to a map.
		// Register a click listener, then do all the upstream WMS things
		this.options.maxZoom=20;
		this.options.queryable=true;
		L.TileLayer.WMS.prototype.onAdd.call(this, map);
		//if (this.url && this.url.indexOf('http://betaserver.icgc.cat/geoservice/')==-1){
			map.on('click', this.getFeatureInfo, this);
			var params = this.getLegendGraphic();
			this.updateControlLLegenda(params,this.wmsParams.layers,true,this.options.nom,this.options.businessId);	
		//}		
		
	},
	onRemove: function (map) {
		// Triggered when the layer is removed from a map.
		// Unregister a click listener, then do all the upstream WMS things
		L.TileLayer.WMS.prototype.onRemove.call(this, map);
		map.off('click', this.getFeatureInfo, this);
		var params = this.getLegendGraphic();
		this.updateControlLLegenda(params,this.wmsParams.layers,false,this.options.nom,this.options.businessId);
	},
	getFeatureInfo: function (evt) {
		// Make an AJAX request to the server and hope for the best
		var params = this.getFeatureInfoUrl(evt.latlng);
		params = params.replace("INFO_FORMAT=text%2Fhtml","INFO_FORMAT=text/html");
		if(this.options.queryable){
			if ((params.indexOf('instamaps.cat')!=-1 || params.indexOf('172.70.1.11')!=-1 || params.indexOf('localhost')!=-1) && params.indexOf('instaserver')==-1){
				if (params.indexOf('/geoservicelocal/')!=-1){
					params = params.replace("INFO_FORMAT=text%2Fhtml","INFO_FORMAT=text%2Fplain");
					params = params.replace("INFO_FORMAT=text/html","INFO_FORMAT=text/plain");
				}
				var dataF="<iframe style=\"display: block; width:300px; height:200px;border:none;\"  src="+params+" ></iframe></div>";
				var pop=L.popup({ maxWidth: 800})
					.setLatLng(evt.latlng)
					.setContent(dataF).openOn(map);	
			}else{
				var esNomesWMS = true;
				var teUtfGrid = false;
				//De moment, si es un wms creat pel cloudifier, demanem text/pla
				//mes endavant passarem per ogrinfo i podrem demanar HTML amb template
				//per mostrar la informacio
				if (params.indexOf('http://betaserver.icgc.cat/geoservice/')!=-1){
					params = params.replace("INFO_FORMAT=text%2Fhtml","INFO_FORMAT=text%2Fplain");
				}
				for(val in controlCapes._layers){
					if(controlCapes._layers[val].layer.options.tipus != t_wms){
						esNomesWMS = false;
					}
					if (controlCapes._layers[val].layer.options.tipus == t_vis_wms){
						teUtfGrid=true;
					}
				}
				if(esNomesWMS){
					$.ajax({
						url: paramUrl.proxy_betterWMS,
						data: {url: params},
						success: function (data, status, xhr) {
							var err = typeof data === 'string' ? null : data;

							if(data.length > 5){
								var pop=L.popup({ maxWidth: 800})
								.setLatLng(evt.latlng)
								.setContent(data).openOn(map);					
							}
						},
						error: function (xhr, status, error) {

						}
					});				
				}else{
					if (!teUtfGrid || params.indexOf('instaserver')==-1) {
						var dataF="<iframe style=\"display: block; width:300px; height:200px;border:none;\"  src="+params+" ></iframe></div>";
						var pop=L.popup({ maxWidth: 800})
							.setLatLng(evt.latlng)
							.setContent(dataF).openOn(map);	
					}
				}
			}
		}//fi querable
		return;
	},
	getFeatureInfoUrl: function (latlng) {
		var bounds = this._map.getBounds();
		var SRS=this.wmsParams.srs;
		var BBOX=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
			var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
			var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
			BBOX=NW.x+","+SE.y+","+SE.x+","+NW.y;
		}
		// Construct a GetFeatureInfo request URL given a point
		var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
		size = this._map.getSize(),
		params = {
			request: 'GetFeatureInfo',
			service: 'WMS',
			srs: SRS,
			styles: this.wmsParams.styles,
			transparent: this.wmsParams.transparent,
			version: this.wmsParams.version,
			format: this.wmsParams.format,
			bbox: BBOX,
			height: size.y,
			width: size.x,
			//exceptions:'application/vnd.ogc.se_blank',
			layers: this.wmsParams.layers,
			query_layers: this.wmsParams.layers,
			info_format: 'text/html'
		};
		params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
		params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;
		return this._url + L.Util.getParamString(params, this._url, true);
	},
	showGetFeatureInfo: function (err, latlng, content) {
		if (err) { console.log(err); return; } // do nothing if there's an error
		// Otherwise show the content in a popup, or something.
		L.popup({ maxWidth: 800})
		.setLatLng(latlng)
		.setContent(content)
		.openOn(this._map);
	},
	getLegendGraphic : function () {
		//console.debug("getLegendGraphic");
		var _format=this.wmsParams.format;
		_format=_format.replace('png8','png');
		var layers = this.wmsParams.layers.split(",");
		if(layers.length === 1){
			params = {
				request : 'GetLegendGraphic',
				service : 'WMS',
				version : this.wmsParams.version,
				format : _format,
				layer : this.wmsParams.layers
			};
			return this._url + L.Util.getParamString(params, this._url, true);
		}else{
			var legend = [];
			for(var i = 0, length = layers.length; i < length; i++){
				var layer = layers[i];
				params = {
					request : 'GetLegendGraphic',
					service : 'WMS',
					version : this.wmsParams.version,
					format : _format,
					layer : layer
				};
				legend.push(this._url + L.Util.getParamString(params, this._url, true));
			}
			return legend;
		}
		
	},
	creaControlLLegenda : function (map) {
		//console.debug("creaControlLLegenda");
		var fet = false;
		if(jQuery('#div_control_wms_llegenda').length==0){
			if (map) {
				control_llegenda_WMS = L.control({
					position : 'bottomright'
				});
				control_llegenda_WMS.onAdd = function(map) {
					this._div = L.DomUtil.create('div', 'psolar_infoLL'); // create div with a class
					this._div.id = 'div_control_wms_llegenda';
					this.update();
					return this._div;
				};
				control_llegenda_WMS.update = function(props) {
					this._div.innerHTML = props;
				};
				control_llegenda_WMS.addTo(map);
				control_llegenda_WMS.update("");
				fet = true;
				return fet;
			}
		}
		return fet;
	},
	updateControlLLegenda :function (params,layer,estat,nom,businessId){
		
		/*
		if(getModeMapa()){//si estic visor i no hi ha llegenda
			if($("#mapLegend").length==0 && $("#mapLegendEdicio").length==0){
				addLegend();
			}
			if(estat){ //afegeixo
				var html = '<div style="text-align:center" id="wms_' + businessId + '"><div class="titol-legend col-md-12 col-xs-12">'+nom+'</div><div class="titol-separate-legend-row"></div>';
				html+='<img onerror="document.getElementById(\'wms_' + businessId + '\').style.display=\'none\';"  src="' + params + '"></div>';
				//mapLegendEdicio
				var divLlegenda='mapLegendEdicio';
				if($("#mapLegend").length > 0){divLlegenda='mapLegend';}
				$("#"+divLlegenda).append(html);			
				$("#"+divLlegenda).addClass("info");
				$("#"+divLlegenda).addClass("legend");
				$("#"+divLlegenda).addClass("visor-legend");
				if(!$("#mapLegend").hasClass("mCustomScrollbar") && $("#mapLegend").length > 0){				
					$("#mapLegend").addClass("mCustomScrollbar");
					$("#mapLegend").mCustomScrollbar();
				}
				if(!$("#mapLegendEdicio").hasClass("mCustomScrollbar") && $("#mapLegendEdicio").length > 0){
					$("#mapLegendEdicio").addClass("mCustomScrollbar");
					$("#mapLegendEdicio").mCustomScrollbar();
				}
				$(".bt_legend").show();
				activaLlegenda(true);
			}else{ //esborro
				jQuery('#wms_' + businessId).remove();
			}
		}
		*/
		
	}
});

L.tileLayer.betterWms = function (url, options) {
	return new L.TileLayer.BetterWMS(url, options);
};
/*
	Leaflet.draw, a plugin that adds drawing and editing tools to Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.draw
	http://leafletjs.com
	https://github.com/jacobtoye
*/
(function (window, document, undefined) {/*
 * Leaflet.draw assumes that you have already included the Leaflet library.
 */

L.drawVersion = '0.2.4-dev';

L.drawLocal = {
	draw: {
		toolbar: {
			actions: {
				title: 'Cancel drawing',
				text: 'Cancel'
			},
			undo: {
				title: 'Delete last point drawn',
				text: 'Delete last point'
			},
			buttons: {
				polyline: 'Draw a polyline',
				polygon: 'Draw a polygon',
				rectangle: 'Draw a rectangle',
				circle: 'Draw a circle',
				marker: 'Draw a marker'
			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: 'Click and drag to draw circle.'
				},
				radius: 'Radius'
			},
			marker: {
				tooltip: {
					start: 'Click map to place marker.'
				}
			},
			polygon: {
				tooltip: {
					start: 'Click to start drawing shape.',
					cont: 'Click to continue drawing shape.',
					end: 'Click first point to close this shape.'
				}
			},
			polyline: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Click to start drawing line.',
					cont: 'Click to continue drawing line.',
					end: 'Click last point to finish line.'
				}
			},
			rectangle: {
				tooltip: {
					start: 'Click and drag to draw rectangle.'
				}
			},
			simpleshape: {
				tooltip: {
					end: 'Release mouse to finish drawing.'
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: 'Save changes.',
					text: 'Save'
				},
				cancel: {
					title: 'Cancel editing, discards all changes.',
					text: 'Cancel'
				}
			},
			buttons: {
				edit: 'Edit layers.',
				editDisabled: 'No layers to edit.',
				remove: 'Delete layers.',
				removeDisabled: 'No layers to delete.'
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: 'Drag handles, or marker to edit feature.',
					subtext: 'Click cancel to undo changes.'
				}
			},
			remove: {
				tooltip: {
					text: 'Click on a feature to remove'
				}
			}
		}
	}
};


L.Draw = {};

L.Draw.Feature = L.Handler.extend({
	includes: L.Mixin.Events,

	initialize: function (map, options) {
		this._map = map;
		this._container = map._container;
		this._overlayPane = map._panes.overlayPane;
		this._popupPane = map._panes.popupPane;

		// Merge default shapeOptions options with custom shapeOptions
		if (options && options.shapeOptions) {
			options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
		}
		L.setOptions(this, options);
	},

	enable: function () {
		if (this._enabled) { return; }

		L.Handler.prototype.enable.call(this);

		this.fire('enabled', { handler: this.type });

		this._map.fire('draw:drawstart', { layerType: this.type });
	},

	disable: function () {
		if (!this._enabled) { return; }

		L.Handler.prototype.disable.call(this);

		this._map.fire('draw:drawstop', { layerType: this.type });

		this.fire('disabled', { handler: this.type });
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			L.DomUtil.disableTextSelection();

			map.getContainer().focus();

			this._tooltip = new L.Tooltip(this._map);

			L.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
		}
	},

	removeHooks: function () {
		if (this._map) {
			L.DomUtil.enableTextSelection();

			this._tooltip.dispose();
			this._tooltip = null;

			L.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
		}
	},

	setOptions: function (options) {
		L.setOptions(this, options);
	},

	_fireCreatedEvent: function (layer) {
		this._map.fire('draw:created', { layer: layer, layerType: this.type });
	},

	// Cancel drawing when the escape key is pressed
	_cancelDrawing: function (e) {
		if (e.keyCode === 27) {
			this.disable();
		}
	}
});

L.Draw.Polyline = L.Draw.Feature.extend({
	statics: {
		TYPE: 'polyline'
	},

	Poly: L.Polyline,

	options: {
		allowIntersection: true,
		repeatMode: false,
		drawError: {
			color: '#b00b00',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		maxGuideLineLength: 4000,
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: false,
			clickable: true
		},
		metric: true, // Whether to use the metric meaurement system or imperial
		showLength: true, // Whether to display distance in the tooltip
		zIndexOffset: 2000 // This should be > than the highest z-index any map layers
	},

	initialize: function (map, options) {
		// Need to set this here to ensure the correct message is used.
		this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error;

		// Merge default drawError options with custom options
		if (options && options.drawError) {
			options.drawError = L.Util.extend({}, this.options.drawError, options.drawError);
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polyline.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._markers = [];

			this._markerGroup = new L.LayerGroup();
			this._map.addLayer(this._markerGroup);

			this._poly = new L.Polyline([], this.options.shapeOptions);

			this._tooltip.updateContent(this._getTooltipText());

			// Make a transparent marker that will used to catch click events. These click
			// events will create the vertices. We need to do this so we can ensure that
			// we can create vertices over other map layers (markers, vector layers). We
			// also do not want to trigger any click handlers of objects we are clicking on
			// while drawing.
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40]
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker
				.on('mousedown', this._onMouseDown, this)
				.addTo(this._map);

			this._map
				.on('mousemove', this._onMouseMove, this)
				.on('mouseup', this._onMouseUp, this)
				.on('zoomend', this._onZoomEnd, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		this._clearHideErrorTimeout();

		this._cleanUpShape();

		// remove markers from map
		this._map.removeLayer(this._markerGroup);
		delete this._markerGroup;
		delete this._markers;

		if(this._poly)
		{
		
			this._map.removeLayer(this._poly);
			delete this._poly;

		}

		this._mouseMarker
			.off('mousedown', this._onMouseDown, this)
			.off('mouseup', this._onMouseUp, this);
		this._map.removeLayer(this._mouseMarker);
		delete this._mouseMarker;

		// clean up DOM
		this._clearGuides();

		this._map
			.off('mousemove', this._onMouseMove, this)
			.off('zoomend', this._onZoomEnd, this);
	},

	deleteLastVertex: function () {
		if (this._markers.length <= 1) {
			return;
		}

		var lastMarker = this._markers.pop(),
			poly = this._poly,
			latlng = this._poly.spliceLatLngs(poly.getLatLngs().length - 1, 1)[0];

		this._markerGroup.removeLayer(lastMarker);

		if (poly.getLatLngs().length < 2) {
			this._map.removeLayer(poly);
		}

		this._vertexChanged(latlng, false);
	},

	addVertex: function (latlng) {
		var markersLength = this._markers.length;

		if (markersLength > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
			this._showErrorTooltip();
			return;
		}
		else if (this._errorShown) {
			this._hideErrorTooltip();
		}

		this._markers.push(this._createMarker(latlng));

		this._poly.addLatLng(latlng);

		if (this._poly.getLatLngs().length === 2) {
			this._map.addLayer(this._poly);
		}

		this._vertexChanged(latlng, true);
	},

	_finishShape: function () {
		var intersects = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], true);

		if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
			this._showErrorTooltip();
			return;
		}

		this._fireCreatedEvent();
		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},

	//Called to verify the shape is valid when the user tries to finish it
	//Return false if the shape is not valid
	_shapeIsValid: function () {
		return true;
	},

	_onZoomEnd: function () {
		this._updateGuide();
	},

	_onMouseMove: function (e) {
		var newPos = e.layerPoint,
			latlng = e.latlng;

		// Save latlng
		// should this be moved to _updateGuide() ?
		this._currentLatLng = latlng;

		this._updateTooltip(latlng);

		// Update the guide line
		this._updateGuide(newPos);

		// Update the mouse marker position
		this._mouseMarker.setLatLng(latlng);

		L.DomEvent.preventDefault(e.originalEvent);
	},

	_vertexChanged: function (latlng, added) {
		this._updateFinishHandler();

		this._updateRunningMeasure(latlng, added);

		this._clearGuides();

		this._updateTooltip();
	},

	_onMouseDown: function (e) {
		var originalEvent = e.originalEvent;
		this._mouseDownOrigin = L.point(originalEvent.clientX, originalEvent.clientY);
	},

	_onMouseUp: function (e) {
		if (this._mouseDownOrigin) {
			// We detect clicks within a certain tolerance, otherwise let it
			// be interpreted as a drag by the map
			var distance = L.point(e.originalEvent.clientX, e.originalEvent.clientY)
				.distanceTo(this._mouseDownOrigin);
			if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) {
				this.addVertex(e.latlng);
			}
		}
		this._mouseDownOrigin = null;
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;
		// The last marker should have a click handler to close the polyline
		if (markerCount > 1) {
			this._markers[markerCount - 1].on('click', this._finishShape, this);
		}

		// Remove the old marker click handler (as only the last point should close the polyline)
		if (markerCount > 2) {
			this._markers[markerCount - 2].off('click', this._finishShape, this);
		}
	},

	_createMarker: function (latlng) {
		var marker = new L.Marker(latlng, {
			icon: this.options.icon,
			zIndexOffset: this.options.zIndexOffset * 2
		});

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_updateGuide: function (newPos) {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);

			// draw the guide line
			this._clearGuides();
			this._drawGuide(
				this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
				newPos
			);
		}
	},

	_updateTooltip: function (latLng) {
		var text = this._getTooltipText();

		if (latLng) {
			this._tooltip.updatePosition(latLng);
		}

		if (!this._errorShown) {
			this._tooltip.updateContent(text);
		}
	},

	_drawGuide: function (pointA, pointB) {
		var length = Math.floor(Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2))),
			guidelineDistance = this.options.guidelineDistance,
			maxGuideLineLength = this.options.maxGuideLineLength,
			// Only draw a guideline with a max length
			i = length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance,
			fraction,
			dashPoint,
			dash;

		//create the guides container if we haven't yet
		if (!this._guidesContainer) {
			this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
		}

		//draw a dash every GuildeLineDistance
		for (; i < length; i += this.options.guidelineDistance) {
			//work out fraction along line we are
			fraction = i / length;

			//calculate new x,y point
			dashPoint = {
				x: Math.floor((pointA.x * (1 - fraction)) + (fraction * pointB.x)),
				y: Math.floor((pointA.y * (1 - fraction)) + (fraction * pointB.y))
			};

			//add guide dash to guide container
			dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
			dash.style.backgroundColor =
				!this._errorShown ? this.options.shapeOptions.color : this.options.drawError.color;

			L.DomUtil.setPosition(dash, dashPoint);
		}
	},

	_updateGuideColor: function (color) {
		if (this._guidesContainer) {
			for (var i = 0, l = this._guidesContainer.childNodes.length; i < l; i++) {
				this._guidesContainer.childNodes[i].style.backgroundColor = color;
			}
		}
	},

	// removes all child elements (guide dashes) from the guides container
	_clearGuides: function () {
		if (this._guidesContainer) {
			while (this._guidesContainer.firstChild) {
				this._guidesContainer.removeChild(this._guidesContainer.firstChild);
			}
		}
	},

	_getTooltipText: function () {
		var showLength = this.options.showLength,
			labelText, distanceStr;

		if (this._markers.length === 0) {
			labelText = {
				text: L.drawLocal.draw.handlers.polyline.tooltip.start
			};
		} else {
			distanceStr = showLength ? this._getMeasurementString() : '';

			if (this._markers.length === 1) {
				labelText = {
					text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
					subtext: distanceStr
				};
			} else {
				labelText = {
					text: L.drawLocal.draw.handlers.polyline.tooltip.end,
					subtext: distanceStr
				};
			}
		}
		return labelText;
	},

	_updateRunningMeasure: function (latlng, added) {
		var markersLength = this._markers.length,
			previousMarkerIndex, distance;

		if (this._markers.length === 1) {
			this._measurementRunningTotal = 0;
		} else {
			previousMarkerIndex = markersLength - (added ? 2 : 1);
			distance = latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng());

			this._measurementRunningTotal += distance * (added ? 1 : -1);
		}
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
			previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
			distance, latlngs = [];

		for(var i=0; i<this._markers.length; ++i)
			latlngs.push(this._markers[i].getLatLng());

		latlngs.push(this._markers[this._markers.length - 1].getLatLng());

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng);
		distanceStr = L.GeometryUtil.readableDistance(distance, this.options.metric);
		area = L.GeometryUtil.geodesicArea(latlngs);
		areaStr = L.GeometryUtil.readableArea(area, this.options.metric);

		return window.lang.translate("Distància") + " " + distanceStr + "<br />" + window.lang.translate("Àrea") + " " + areaStr;
	},

	_showErrorTooltip: function () {
		this._errorShown = true;

		// Update tooltip
		this._tooltip
			.showAsError()
			.updateContent({ text: this.options.drawError.message });

		// Update shape
		this._updateGuideColor(this.options.drawError.color);
		this._poly.setStyle({ color: this.options.drawError.color });

		// Hide the error after 2 seconds
		this._clearHideErrorTimeout();
		this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
	},

	_hideErrorTooltip: function () {
		this._errorShown = false;

		this._clearHideErrorTimeout();

		// Revert tooltip
		this._tooltip
			.removeError()
			.updateContent(this._getTooltipText());

		// Revert shape
		this._updateGuideColor(this.options.shapeOptions.color);
		this._poly.setStyle({ color: this.options.shapeOptions.color });
	},

	_clearHideErrorTimeout: function () {
		if (this._hideErrorTimeout) {
			clearTimeout(this._hideErrorTimeout);
			this._hideErrorTimeout = null;
		}
	},

	_cleanUpShape: function () {
		if (this._markers.length > 1) {
			this._markers[this._markers.length - 1].off('click', this._finishShape, this);
		}
	},

	_fireCreatedEvent: function () {
		var poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, poly);
	}
});


L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
		showArea: false,
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;

		// The first marker should have a click handler to close the polygon
		if (markerCount === 1) {
			this._markers[0].on('click', this._finishShape, this);
		}

		// Add and update the double click handler
		if (markerCount > 2) {
			this._markers[markerCount - 1].on('dblclick', this._finishShape, this);
			// Only need to remove handler if has been added before
			if (markerCount > 3) {
				this._markers[markerCount - 2].off('dblclick', this._finishShape, this);
			}
		}
	},

	_getTooltipText: function () {
		var text, subtext;

		if (this._markers.length === 0) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.start;
		} else if (this._markers.length < 3) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.cont;
		} else {
			text = L.drawLocal.draw.handlers.polygon.tooltip.end;
			subtext = this._getMeasurementString();
		}

		return {
			text: text,
			subtext: subtext
		};
	},

	_getMeasurementString: function () {
		var area = this._area;

		if (!area) {
			return null;
		}

		return L.GeometryUtil.readableArea(area, this.options.metric);
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexChanged: function (latlng, added) {
		var latLngs;

		// Check to see if we should show the area
		if (!this.options.allowIntersection && this.options.showArea) {
			latLngs = this._poly.getLatLngs();

			this._area = L.GeometryUtil.geodesicArea(latLngs);
		}

		L.Draw.Polyline.prototype._vertexChanged.call(this, latlng, added);
	},

	_cleanUpShape: function () {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			this._markers[0].off('click', this._finishShape, this);

			if (markerCount > 2) {
				this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
			}
		}
	}
});


L.SimpleShape = {};

L.Draw.SimpleShape = L.Draw.Feature.extend({
	options: {
		repeatMode: false
	},

	initialize: function (map, options) {
		this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._mapDraggable = this._map.dragging.enabled();

			if (this._mapDraggable) {
				this._map.dragging.disable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			if (this._mapDraggable) {
				this._map.dragging.enable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
		}
		this._isDrawing = false;
	},

	_getTooltipText: function () {
		return {
			text: this._endLabelText
		};
	},

	_onMouseDown: function (e) {
		this._isDrawing = true;
		this._startLatLng = e.latlng;

		L.DomEvent
			.on(document, 'mouseup', this._onMouseUp, this)
			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent(this._getTooltipText());
			this._drawShape(latlng);
		}
	},

	_onMouseUp: function () {
		if (this._shape) {
			this._fireCreatedEvent();
		}

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	}
});

L.Draw.Rectangle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'rectangle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		metric: true // Whether to use the metric meaurement system or imperial
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Rectangle.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function () {
		var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
	},

	_getTooltipText: function () {
		var tooltipText = L.Draw.SimpleShape.prototype._getTooltipText.call(this),
			shape = this._shape,
			latLngs, area, subtext;

		if (shape) {
			latLngs = this._shape.getLatLngs();
			area = L.GeometryUtil.geodesicArea(latLngs);
			subtext = L.GeometryUtil.readableArea(area, this.options.metric);
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}
});


L.Draw.Circle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true // Whether to use the metric meaurement system or imperial
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Circle.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setRadius(this._startLatLng.distanceTo(latlng));
		}
	},

	_fireCreatedEvent: function () {
		var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, circle);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng,
			showRadius = this.options.showRadius,
			useMetric = this.options.metric,
			radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			// Get the new radius (rounded to 1 dp)
			radius = this._shape.getRadius().toFixed(1);

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.circle.radius + ': ' + L.GeometryUtil.readableDistance(radius, useMetric) : ''
			});
		}
	}
});


L.Draw.Marker = L.Draw.Feature.extend({
	statics: {
		TYPE: 'marker'
	},

	options: {
		icon: new L.Icon.Default(),
		repeatMode: false,
		zIndexOffset: 2000 // This should be > than the highest z-index any markers
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Marker.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);

		if (this._map) {
			this._tooltip.updateContent({ text: L.drawLocal.draw.handlers.marker.tooltip.start });

			// Same mouseMarker as in Draw.Polyline
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40]
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker
				.on('click', this._onClick, this)
				.addTo(this._map);

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		if (this._map) {
			if (this._marker) {
				this._marker.off('click', this._onClick, this);
				this._map
					.off('click', this._onClick, this)
					.removeLayer(this._marker);
				delete this._marker;
			}

			this._mouseMarker.off('click', this._onClick, this);
			this._map.removeLayer(this._mouseMarker);
			delete this._mouseMarker;

			this._map.off('mousemove', this._onMouseMove, this);
		}
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		this._mouseMarker.setLatLng(latlng);

		if (!this._marker) {
			this._marker = new L.Marker(latlng, {
				icon: this.options.icon,
				zIndexOffset: this.options.zIndexOffset
			});
			// Bind to both marker and map to make sure we get the click event.
			this._marker.on('click', this._onClick, this);
			this._map
				.on('click', this._onClick, this)
				.addLayer(this._marker);
		}
		else {
			latlng = this._mouseMarker.getLatLng();
			this._marker.setLatLng(latlng);
		}
	},

	_onClick: function () {
		this._fireCreatedEvent();

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},

	_fireCreatedEvent: function () {
		var marker = new L.Marker(this._marker.getLatLng(), { icon: this.options.icon });
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
	}
});


L.Edit = L.Edit || {};

L.Edit.Marker = L.Handler.extend({
	initialize: function (marker, options) {
		this._marker = marker;
		L.setOptions(this, options);
	},

	addHooks: function () {
		var marker = this._marker;

		marker.dragging.enable();
		marker.on('dragend', this._onDragEnd, marker);
		this._toggleMarkerHighlight();
	},

	removeHooks: function () {
		var marker = this._marker;

		marker.dragging.disable();
		marker.off('dragend', this._onDragEnd, marker);
		this._toggleMarkerHighlight();
	},

	_onDragEnd: function (e) {
		var layer = e.target;
		layer.edited = true;
	},

	_toggleMarkerHighlight: function () {

		// Don't do anything if this layer is a marker but doesn't have an icon. Markers
		// should usually have icons. If using Leaflet.draw with Leafler.markercluster there
		// is a chance that a marker doesn't.
		if (!this._icon) {
			return;
		}
		
		// This is quite naughty, but I don't see another way of doing it. (short of setting a new icon)
		var icon = this._icon;

		icon.style.display = 'none';

		if (L.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
			L.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, 0);

		} else {
			L.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, 0);
		}

		icon.style.display = '';
	},

	_offsetMarker: function (icon, offset) {
		var iconMarginTop = parseInt(icon.style.marginTop, 10) - offset,
			iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

		icon.style.marginTop = iconMarginTop + 'px';
		icon.style.marginLeft = iconMarginLeft + 'px';
	}
});

L.Marker.addInitHook(function () {
	if (L.Edit.Marker) {
		this.editing = new L.Edit.Marker(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});


L.Edit = L.Edit || {};

/*
 * L.Edit.Poly is an editing handler for polylines and polygons.
 */

L.Edit.Poly = L.Handler.extend({
	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon'
		})
	},

	initialize: function (poly, options) {
		this._poly = poly;
		L.setOptions(this, options);
	},

	addHooks: function () {
		var poly = this._poly;

		if (!(poly instanceof L.Polygon)) {
			if (poly.options.editing!=undefined) {
				poly.options.editing.fill = false;
			}
		}

		poly.setStyle(poly.options.editing);

		if (this._poly._map) {
			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._poly._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		var poly = this._poly;

		poly.setStyle(poly.options.original);

		if (poly._map) {
			poly._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
			delete this._markers;
		}
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}
		this._markers = [];

		var latlngs = this._poly._latlngs,
			i, j, len, marker;

		// TODO refactor holes implementation in Polygon to support it here

		for (i = 0, len = latlngs.length; i < len; i++) {

			marker = this._createMarker(latlngs[i], i);
			marker.on('click', this._onMarkerClick, this);
			this._markers.push(marker);
		}

		var markerLeft, markerRight;

		for (i = 0, j = len - 1; i < len; j = i++) {
			if (i === 0 && !(L.Polygon && (this._poly instanceof L.Polygon))) {
				continue;
			}

			markerLeft = this._markers[j];
			markerRight = this._markers[i];

			this._createMiddleMarker(markerLeft, markerRight);
			this._updatePrevNext(markerLeft, markerRight);
		}
	},

	_createMarker: function (latlng, index) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: this.options.icon
		});

		marker._origLatLng = latlng;
		marker._index = index;

		marker.on('drag', this._onMarkerDrag, this);
		marker.on('dragend', this._fireEdit, this);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_removeMarker: function (marker) {
		var i = marker._index;

		this._markerGroup.removeLayer(marker);
		this._markers.splice(i, 1);
		this._poly.spliceLatLngs(i, 1);
		this._updateIndexes(i, -1);

		marker
			.off('drag', this._onMarkerDrag, this)
			.off('dragend', this._fireEdit, this)
			.off('click', this._onMarkerClick, this);
	},

	_fireEdit: function () {
		this._poly.edited = true;
		this._poly.fire('edit');
	},

	_onMarkerDrag: function (e) {
		var marker = e.target;

		L.extend(marker._origLatLng, marker._latlng);

		if (marker._middleLeft) {
			marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
		}
		if (marker._middleRight) {
			marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
		}

		this._poly.redraw();
	},

	_onMarkerClick: function (e) {
		var minPoints = L.Polygon && (this._poly instanceof L.Polygon) ? 4 : 3,
			marker = e.target;

		// If removing this point would create an invalid polyline/polygon don't remove
		if (this._poly._latlngs.length < minPoints) {
			return;
		}

		// remove the marker
		this._removeMarker(marker);

		// update prev/next links of adjacent markers
		this._updatePrevNext(marker._prev, marker._next);

		// remove ghost markers near the removed marker
		if (marker._middleLeft) {
			this._markerGroup.removeLayer(marker._middleLeft);
		}
		if (marker._middleRight) {
			this._markerGroup.removeLayer(marker._middleRight);
		}

		// create a ghost marker in place of the removed one
		if (marker._prev && marker._next) {
			this._createMiddleMarker(marker._prev, marker._next);

		} else if (!marker._prev) {
			marker._next._middleLeft = null;

		} else if (!marker._next) {
			marker._prev._middleRight = null;
		}

		this._fireEdit();
	},

	_updateIndexes: function (index, delta) {
		this._markerGroup.eachLayer(function (marker) {
			if (marker._index > index) {
				marker._index += delta;
			}
		});
	},

	_createMiddleMarker: function (marker1, marker2) {
		var latlng = this._getMiddleLatLng(marker1, marker2),
		    marker = this._createMarker(latlng),
		    onClick,
		    onDragStart,
		    onDragEnd;

		marker.setOpacity(0.6);

		marker1._middleRight = marker2._middleLeft = marker;

		onDragStart = function () {
			var i = marker2._index;

			marker._index = i;

			marker
			    .off('click', onClick, this)
			    .on('click', this._onMarkerClick, this);

			latlng.lat = marker.getLatLng().lat;
			latlng.lng = marker.getLatLng().lng;
			this._poly.spliceLatLngs(i, 0, latlng);
			this._markers.splice(i, 0, marker);

			marker.setOpacity(1);

			this._updateIndexes(i, 1);
			marker2._index++;
			this._updatePrevNext(marker1, marker);
			this._updatePrevNext(marker, marker2);

			this._poly.fire('editstart');
		};

		onDragEnd = function () {
			marker.off('dragstart', onDragStart, this);
			marker.off('dragend', onDragEnd, this);

			this._createMiddleMarker(marker1, marker);
			this._createMiddleMarker(marker, marker2);
		};

		onClick = function () {
			onDragStart.call(this);
			onDragEnd.call(this);
			this._fireEdit();
		};

		marker
		    .on('click', onClick, this)
		    .on('dragstart', onDragStart, this)
		    .on('dragend', onDragEnd, this);

		this._markerGroup.addLayer(marker);
	},

	_updatePrevNext: function (marker1, marker2) {
		if (marker1) {
			marker1._next = marker2;
		}
		if (marker2) {
			marker2._prev = marker1;
		}
	},

	_getMiddleLatLng: function (marker1, marker2) {
		var map = this._poly._map,
		    p1 = map.project(marker1.getLatLng()),
		    p2 = map.project(marker2.getLatLng());

		return map.unproject(p1._add(p2)._divideBy(2));
	}
});

L.Polyline.addInitHook(function () {

	// Check to see if handler has already been initialized. This is to support versions of Leaflet that still have L.Handler.PolyEdit
	if (this.editing) {
		return;
	}

	if (L.Edit.Poly) {
		this.editing = new L.Edit.Poly(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});


L.Edit = L.Edit || {};

L.Edit.SimpleShape = L.Handler.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		})
	},

	initialize: function (shape, options) {
		this._shape = shape;
		L.Util.setOptions(this, options);
	},

	addHooks: function () {
		var shape = this._shape;

		shape.setStyle(shape.options.editing);

		if (shape._map) {
			this._map = shape._map;

			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		var shape = this._shape;

		shape.setStyle(shape.options.original);

		if (shape._map) {
			this._unbindMarker(this._moveMarker);

			for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
				this._unbindMarker(this._resizeMarkers[i]);
			}
			this._resizeMarkers = null;

			this._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
		}

		this._map = null;
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createResizeMarker();
	},

	_createMoveMarker: function () {
		// Children override
	},

	_createResizeMarker: function () {
		// Children override
	},

	_createMarker: function (latlng, icon) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10
		});

		this._bindMarker(marker);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_bindMarker: function (marker) {
		marker
			.on('dragstart', this._onMarkerDragStart, this)
			.on('drag', this._onMarkerDrag, this)
			.on('dragend', this._onMarkerDragEnd, this);
	},

	_unbindMarker: function (marker) {
		marker
			.off('dragstart', this._onMarkerDragStart, this)
			.off('drag', this._onMarkerDrag, this)
			.off('dragend', this._onMarkerDragEnd, this);
	},

	_onMarkerDragStart: function (e) {
		var marker = e.target;
		marker.setOpacity(0);

		this._shape.fire('editstart');
	},

	_fireEdit: function () {
		this._shape.edited = true;
		this._shape.fire('edit');
	},

	_onMarkerDrag: function (e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng);
		} else {
			this._resize(latlng);
		}

		this._shape.redraw();
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target;
		marker.setOpacity(1);

		this._fireEdit();
	},

	_move: function () {
		// Children override
	},

	_resize: function () {
		// Children override
	}
});


L.Edit = L.Edit || {};

L.Edit.Rectangle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		var bounds = this._shape.getBounds(),
			center = bounds.getCenter();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function () {
		var corners = this._getCorners();

		this._resizeMarkers = [];

		for (var i = 0, l = corners.length; i < l; i++) {
			this._resizeMarkers.push(this._createMarker(corners[i], this.options.resizeIcon));
			// Monkey in the corner index as we will need to know this for dragging
			this._resizeMarkers[i]._cornerIndex = i;
		}
	},

	_onMarkerDragStart: function (e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);

		// Save a reference to the opposite point
		var corners = this._getCorners(),
			marker = e.target,
			currentCornerIndex = marker._cornerIndex;

		this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];

		this._toggleCornerMarkers(0, currentCornerIndex);
	},

	_onMarkerDragEnd: function (e) {
		var marker = e.target,
			bounds, center;

		// Reset move marker position to the center
		if (marker === this._moveMarker) {
			bounds = this._shape.getBounds();
			center = bounds.getCenter();

			marker.setLatLng(center);
		}

		this._toggleCornerMarkers(1);

		this._repositionCornerMarkers();

		L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, e);
	},

	_move: function (newCenter) {
		var latlngs = this._shape.getLatLngs(),
			bounds = this._shape.getBounds(),
			center = bounds.getCenter(),
			offset, newLatLngs = [];

		// Offset the latlngs to the new center
		for (var i = 0, l = latlngs.length; i < l; i++) {
			offset = [latlngs[i].lat - center.lat, latlngs[i].lng - center.lng];
			newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]]);
		}

		this._shape.setLatLngs(newLatLngs);

		// Reposition the resize markers
		this._repositionCornerMarkers();
	},

	_resize: function (latlng) {
		var bounds;

		// Update the shape based on the current position of this corner and the opposite point
		this._shape.setBounds(L.latLngBounds(latlng, this._oppositeCorner));

		// Reposition the move marker
		bounds = this._shape.getBounds();
		this._moveMarker.setLatLng(bounds.getCenter());
	},

	_getCorners: function () {
		var bounds = this._shape.getBounds(),
			nw = bounds.getNorthWest(),
			ne = bounds.getNorthEast(),
			se = bounds.getSouthEast(),
			sw = bounds.getSouthWest();

		return [nw, ne, se, sw];
	},

	_toggleCornerMarkers: function (opacity) {
		for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
			this._resizeMarkers[i].setOpacity(opacity);
		}
	},

	_repositionCornerMarkers: function () {
		var corners = this._getCorners();

		for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
			this._resizeMarkers[i].setLatLng(corners[i]);
		}
	}
});

L.Rectangle.addInitHook(function () {
	if (L.Edit.Rectangle) {
		this.editing = new L.Edit.Rectangle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});


L.Edit = L.Edit || {};

L.Edit.Circle = L.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		var center = this._shape.getLatLng();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function () {
		var center = this._shape.getLatLng(),
			resizemarkerPoint = this._getResizeMarkerPoint(center);

		this._resizeMarkers = [];
		this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
	},

	_getResizeMarkerPoint: function (latlng) {
		// From L.shape.getBounds()
		var delta = this._shape._radius * Math.cos(Math.PI / 4),
			point = this._map.project(latlng);
		return this._map.unproject([point.x + delta, point.y - delta]);
	},

	_move: function (latlng) {
		var resizemarkerPoint = this._getResizeMarkerPoint(latlng);

		// Move the resize marker
		this._resizeMarkers[0].setLatLng(resizemarkerPoint);

		// Move the circle
		this._shape.setLatLng(latlng);
	},

	_resize: function (latlng) {
		var moveLatLng = this._moveMarker.getLatLng(),
			radius = moveLatLng.distanceTo(latlng);

		this._shape.setRadius(radius);
	}
});

L.Circle.addInitHook(function () {
	if (L.Edit.Circle) {
		this.editing = new L.Edit.Circle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});

/*
 * L.LatLngUtil contains different utility functions for LatLngs.
 */

L.LatLngUtil = {
	// Clones a LatLngs[], returns [][]
	cloneLatLngs: function (latlngs) {
		var clone = [];
		for (var i = 0, l = latlngs.length; i < l; i++) {
			clone.push(this.cloneLatLng(latlngs[i]));
		}
		return clone;
	},

	cloneLatLng: function (latlng) {
		return L.latLng(latlng.lat, latlng.lng);
	}
};

L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
	// Ported from the OpenLayers implementation. See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
	geodesicArea: function (latLngs) {
		var pointsCount = latLngs.length,
			area = 0.0,
			d2r = L.LatLng.DEG_TO_RAD,
			p1, p2;

		if (pointsCount > 2) {
			for (var i = 0; i < pointsCount; i++) {
				p1 = latLngs[i];
				p2 = latLngs[(i + 1) % pointsCount];
				area += ((p2.lng - p1.lng) * d2r) *
						(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
			}
			area = area * 6378137.0 * 6378137.0 / 2.0;
		}

		return Math.abs(area);
	},

	readableArea: function (area, isMetric) {
		var areaStr;

		if (isMetric) {
			if (area >= 10000) {
				areaStr = (area * 0.0001).toFixed(2) + ' ha';
			} else {
				areaStr = area.toFixed(2) + ' m&sup2;';
			}
		} else {
			area /= 0.836127; // Square yards in 1 meter

			if (area >= 3097600) { //3097600 square yards in 1 square mile
				areaStr = (area / 3097600).toFixed(2) + ' mi&sup2;';
			} else if (area >= 4840) {//48040 square yards in 1 acre
				areaStr = (area / 4840).toFixed(2) + ' acres';
			} else {
				areaStr = Math.ceil(area) + ' yd&sup2;';
			}
		}

		return areaStr;
	},

	readableDistance: function (distance, isMetric) {
		var distanceStr;

		if (isMetric) {
			// show metres when distance is < 1km, then show km
			if (distance > 1000) {
				distanceStr = (distance  / 1000).toFixed(2) + ' km';
			} else {
				distanceStr = Math.ceil(distance) + ' m';
			}
		} else {
			distance *= 1.09361;

			if (distance > 1760) {
				distanceStr = (distance / 1760).toFixed(2) + ' miles';
			} else {
				distanceStr = Math.ceil(distance) + ' yd';
			}
		}

		return distanceStr;
	}
});

L.Util.extend(L.LineUtil, {
	// Checks to see if two line segments intersect. Does not handle degenerate cases.
	// http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
	segmentsIntersect: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2, /*Point*/ p3) {
		return	this._checkCounterclockwise(p, p2, p3) !==
				this._checkCounterclockwise(p1, p2, p3) &&
				this._checkCounterclockwise(p, p1, p2) !==
				this._checkCounterclockwise(p, p1, p3);
	},

	// check to see if points are in counterclockwise order
	_checkCounterclockwise: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
	}
});

L.Polyline.include({
	// Check to see if this polyline has any linesegments that intersect.
	// NOTE: does not support detecting intersection for degenerate cases.
	intersects: function () {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			i, p, p1;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		for (i = len - 1; i >= 3; i--) {
			p = points[i - 1];
			p1 = points[i];


			if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
				return true;
			}
		}

		return false;
	},

	// Check for intersection if new latlng was added to this polyline.
	// NOTE: does not support detecting intersection for degenerate cases.
	newLatLngIntersects: function (latlng, skipFirst) {
		// Cannot check a polyline for intersecting lats/lngs when not added to the map
		if (!this._map) {
			return false;
		}

		return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
	},

	// Check for intersection if new point was added to this polyline.
	// newPoint must be a layer point.
	// NOTE: does not support detecting intersection for degenerate cases.
	newPointIntersects: function (newPoint, skipFirst) {
		var points = this._originalPoints,
			len = points ? points.length : 0,
			lastPoint = points ? points[len - 1] : null,
			// The previous previous line segment. Previous line segment doesn't need testing.
			maxIndex = len - 2;

		if (this._tooFewPointsForIntersection(1)) {
			return false;
		}

		return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
	},

	// Polylines with 2 sides can only intersect in cases where points are collinear (we don't support detecting these).
	// Cannot have intersection when < 3 line segments (< 4 points)
	_tooFewPointsForIntersection: function (extraPoints) {
		var points = this._originalPoints,
			len = points ? points.length : 0;
		// Increment length by extraPoints if present
		len += extraPoints || 0;

		return !this._originalPoints || len <= 3;
	},

	// Checks a line segment intersections with any line segments before its predecessor.
	// Don't need to check the predecessor as will never intersect.
	_lineSegmentsIntersectsRange: function (p, p1, maxIndex, minIndex) {
		var points = this._originalPoints,
			p2, p3;

		minIndex = minIndex || 0;

		// Check all previous line segments (beside the immediately previous) for intersections
		for (var j = maxIndex; j > minIndex; j--) {
			p2 = points[j - 1];
			p3 = points[j];

			if (L.LineUtil.segmentsIntersect(p, p1, p2, p3)) {
				return true;
			}
		}

		return false;
	}
});


L.Polygon.include({
	// Checks a polygon for any intersecting line segments. Ignores holes.
	intersects: function () {
		var polylineIntersects,
			points = this._originalPoints,
			len, firstPoint, lastPoint, maxIndex;

		if (this._tooFewPointsForIntersection()) {
			return false;
		}

		polylineIntersects = L.Polyline.prototype.intersects.call(this);

		// If already found an intersection don't need to check for any more.
		if (polylineIntersects) {
			return true;
		}

		len = points.length;
		firstPoint = points[0];
		lastPoint = points[len - 1];
		maxIndex = len - 2;

		// Check the line segment between last and first point. Don't need to check the first line segment (minIndex = 1)
		return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
	}
});

L.Control.Draw = L.Control.extend({

	options: {
		position: 'topleft',
		draw: {},
		edit: false
	},

	initialize: function (options) {
		if (L.version < '0.7') {
			throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
		}

		L.Control.prototype.initialize.call(this, options);

		var toolbar;

		this._toolbars = {};

		// Initialize toolbars
		if (L.DrawToolbar && this.options.draw) {
			toolbar = new L.DrawToolbar(this.options.draw);

			this._toolbars[L.DrawToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[L.DrawToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}

		if (L.EditToolbar && this.options.edit) {
			toolbar = new L.EditToolbar(this.options.edit);

			this._toolbars[L.EditToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[L.EditToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}
	},

	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-draw'),
			addedTopClass = false,
			topClassName = 'leaflet-draw-toolbar-top',
			toolbarContainer;

		for (var toolbarId in this._toolbars) {
			if (this._toolbars.hasOwnProperty(toolbarId)) {
				toolbarContainer = this._toolbars[toolbarId].addToolbar(map);

				if (toolbarContainer) {
					// Add class to the first toolbar to remove the margin
					if (!addedTopClass) {
						if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
							L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
						}
						addedTopClass = true;
					}

					container.appendChild(toolbarContainer);
				}
			}
		}

		return container;
	},

	onRemove: function () {
		for (var toolbarId in this._toolbars) {
			if (this._toolbars.hasOwnProperty(toolbarId)) {
				this._toolbars[toolbarId].removeToolbar();
			}
		}
	},

	setDrawingOptions: function (options) {
		for (var toolbarId in this._toolbars) {
			if (this._toolbars[toolbarId] instanceof L.DrawToolbar) {
				this._toolbars[toolbarId].setOptions(options);
			}
		}
	},

	_toolbarEnabled: function (e) {
		var enabledToolbar = e.target;

		for (var toolbarId in this._toolbars) {
			if (this._toolbars[toolbarId] !== enabledToolbar) {
				this._toolbars[toolbarId].disable();
			}
		}
	}
});

L.Map.mergeOptions({
	drawControlTooltips: true,
	drawControl: false
});

L.Map.addInitHook(function () {
	if (this.options.drawControl) {
		this.drawControl = new L.Control.Draw();
		this.addControl(this.drawControl);
	}
});


L.Toolbar = L.Class.extend({
	includes: [L.Mixin.Events],

	initialize: function (options) {
		L.setOptions(this, options);

		this._modes = {};
		this._actionButtons = [];
		this._activeMode = null;
	},

	enabled: function () {
		return this._activeMode !== null;
	},

	disable: function () {
		if (!this.enabled()) { return; }

		this._activeMode.handler.disable();
	},

	addToolbar: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-draw-section'),
			buttonIndex = 0,
			buttonClassPrefix = this._toolbarClass || '',
			modeHandlers = this.getModeHandlers(map),
			i;

		this._toolbarContainer = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
		this._map = map;

		for (i = 0; i < modeHandlers.length; i++) {
			if (modeHandlers[i].enabled) {
				this._initModeHandler(
					modeHandlers[i].handler,
					this._toolbarContainer,
					buttonIndex++,
					buttonClassPrefix,
					modeHandlers[i].title
				);
			}
		}

		// if no buttons were added, do not add the toolbar
		if (!buttonIndex) {
			return;
		}

		// Save button index of the last button, -1 as we would have ++ after the last button
		this._lastButtonIndex = --buttonIndex;

		// Create empty actions part of the toolbar
		this._actionsContainer = L.DomUtil.create('ul', 'leaflet-draw-actions');

		// Add draw and cancel containers to the control container
		container.appendChild(this._toolbarContainer);
		container.appendChild(this._actionsContainer);

		return container;
	},

	removeToolbar: function () {
		// Dispose each handler
		for (var handlerId in this._modes) {
			if (this._modes.hasOwnProperty(handlerId)) {
				// Unbind handler button
				this._disposeButton(
					this._modes[handlerId].button,
					this._modes[handlerId].handler.enable,
					this._modes[handlerId].handler
				);

				// Make sure is disabled
				this._modes[handlerId].handler.disable();

				// Unbind handler
				this._modes[handlerId].handler
					.off('enabled', this._handlerActivated, this)
					.off('disabled', this._handlerDeactivated, this);
			}
		}
		this._modes = {};

		// Dispose the actions toolbar
		for (var i = 0, l = this._actionButtons.length; i < l; i++) {
			this._disposeButton(
				this._actionButtons[i].button,
				this._actionButtons[i].callback,
				this
			);
		}
		this._actionButtons = [];
		this._actionsContainer = null;
	},

	_initModeHandler: function (handler, container, buttonIndex, classNamePredix, buttonTitle) {
		var type = handler.type;

		this._modes[type] = {};

		this._modes[type].handler = handler;

		this._modes[type].button = this._createButton({
			title: buttonTitle,
			className: classNamePredix + '-' + type,
			container: container,
			callback: this._modes[type].handler.enable,
			context: this._modes[type].handler
		});

		this._modes[type].buttonIndex = buttonIndex;

		this._modes[type].handler
			.on('enabled', this._handlerActivated, this)
			.on('disabled', this._handlerDeactivated, this);
	},

	_createButton: function (options) {
		var link = L.DomUtil.create('a', options.className || '', options.container);
		link.href = '#';

		if (options.text) {
			link.innerHTML = options.text;
		}

		if (options.title) {
			link.title = options.title;
		}

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'mousedown', L.DomEvent.stopPropagation)
			.on(link, 'dblclick', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', options.callback, options.context);

		return link;
	},

	_disposeButton: function (button, callback) {
		L.DomEvent
			.off(button, 'click', L.DomEvent.stopPropagation)
			.off(button, 'mousedown', L.DomEvent.stopPropagation)
			.off(button, 'dblclick', L.DomEvent.stopPropagation)
			.off(button, 'click', L.DomEvent.preventDefault)
			.off(button, 'click', callback);
	},

	_handlerActivated: function (e) {
		// Disable active mode (if present)
		this.disable();

		// Cache new active feature
		this._activeMode = this._modes[e.handler];

		L.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

		this._showActionsToolbar();

		this.fire('enable');
	},

	_handlerDeactivated: function () {
		this._hideActionsToolbar();

		L.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

		this._activeMode = null;

		this.fire('disable');
	},

	_createActions: function (handler) {
		var container = this._actionsContainer,
			buttons = this.getActions(handler),
			l = buttons.length,
			li, di, dl, button;

		// Dispose the actions toolbar (todo: dispose only not used buttons)
		for (di = 0, dl = this._actionButtons.length; di < dl; di++) {
			this._disposeButton(this._actionButtons[di].button, this._actionButtons[di].callback);
		}
		this._actionButtons = [];

		// Remove all old buttons
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		for (var i = 0; i < l; i++) {
			if ('enabled' in buttons[i] && !buttons[i].enabled) {
				continue;
			}

			li = L.DomUtil.create('li', '', container);

			button = this._createButton({
				title: buttons[i].title,
				text: buttons[i].text,
				container: li,
				callback: buttons[i].callback,
				context: buttons[i].context
			});

			this._actionButtons.push({
				button: button,
				callback: buttons[i].callback
			});
		}
	},

	_showActionsToolbar: function () {
		var buttonIndex = this._activeMode.buttonIndex,
			lastButtonIndex = this._lastButtonIndex,
			toolbarPosition = this._activeMode.button.offsetTop - 1;

		// Recreate action buttons on every click
		this._createActions(this._activeMode.handler);

		// Correctly position the cancel button
		this._actionsContainer.style.top = toolbarPosition + 'px';

		if (buttonIndex === 0) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
			L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top');
		}

		if (buttonIndex === lastButtonIndex) {
			L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
			L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
		}

		this._actionsContainer.style.display = 'block';
	},

	_hideActionsToolbar: function () {
		this._actionsContainer.style.display = 'none';

		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
		L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top');
		L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
	}
});


L.Tooltip = L.Class.extend({
	initialize: function (map) {
		this._map = map;
		this._popupPane = map._panes.popupPane;

		this._container = map.options.drawControlTooltips ? L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane) : null;
		this._singleLineLabel = false;
	},

	dispose: function () {
		if (this._container) {
			this._popupPane.removeChild(this._container);
			this._container = null;
		}
	},

	updateContent: function (labelText) {
		if (!this._container) {
			return this;
		}
		labelText.subtext = labelText.subtext || '';

		// update the vertical position (only if changed)
		if (labelText.subtext.length === 0 && !this._singleLineLabel) {
			L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
			this._singleLineLabel = true;
		}
		else if (labelText.subtext.length > 0 && this._singleLineLabel) {
			L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
			this._singleLineLabel = false;
		}

		this._container.innerHTML =
			(labelText.subtext.length > 0 ? '<span class="leaflet-draw-tooltip-subtext">' + labelText.subtext + '</span>' + '<br />' : '') +
			'<span>' + labelText.text + '</span>';

		return this;
	},

	updatePosition: function (latlng) {
		var pos = this._map.latLngToLayerPoint(latlng),
			tooltipContainer = this._container;

		if (this._container) {
			tooltipContainer.style.visibility = 'inherit';
			L.DomUtil.setPosition(tooltipContainer, pos);
		}

		return this;
	},

	showAsError: function () {
		if (this._container) {
			L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
		}
		return this;
	},

	removeError: function () {
		if (this._container) {
			L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
		}
		return this;
	}
});

L.DrawToolbar = L.Toolbar.extend({

	statics: {
		TYPE: 'draw'
	},

	options: {
		polyline: {},
		polygon: {},
		rectangle: {},
		circle: {},
		marker: {}
	},

	initialize: function (options) {
		// Ensure that the options are merged correctly since L.extend is only shallow
		for (var type in this.options) {
			if (this.options.hasOwnProperty(type)) {
				if (options[type]) {
					options[type] = L.extend({}, this.options[type], options[type]);
				}
			}
		}

		this._toolbarClass = 'leaflet-draw-draw';
		L.Toolbar.prototype.initialize.call(this, options);
	},

	getModeHandlers: function (map) {
		return [
			{
				enabled: this.options.polyline,
				handler: new L.Draw.Polyline(map, this.options.polyline),
				title: L.drawLocal.draw.toolbar.buttons.polyline
			},
			{
				enabled: this.options.polygon,
				handler: new L.Draw.Polygon(map, this.options.polygon),
				title: L.drawLocal.draw.toolbar.buttons.polygon
			},
			{
				enabled: this.options.rectangle,
				handler: new L.Draw.Rectangle(map, this.options.rectangle),
				title: L.drawLocal.draw.toolbar.buttons.rectangle
			},
			{
				enabled: this.options.circle,
				handler: new L.Draw.Circle(map, this.options.circle),
				title: L.drawLocal.draw.toolbar.buttons.circle
			},
			{
				enabled: this.options.marker,
				handler: new L.Draw.Marker(map, this.options.marker),
				title: L.drawLocal.draw.toolbar.buttons.marker
			}
		];
	},

	// Get the actions part of the toolbar
	getActions: function (handler) {
		return [
			{
				enabled: handler.deleteLastVertex,
				title: L.drawLocal.draw.toolbar.undo.title,
				text: L.drawLocal.draw.toolbar.undo.text,
				callback: handler.deleteLastVertex,
				context: handler
			},
			{
				title: L.drawLocal.draw.toolbar.actions.title,
				text: L.drawLocal.draw.toolbar.actions.text,
				callback: this.disable,
				context: this
			}
		];
	},

	setOptions: function (options) {
		L.setOptions(this, options);

		for (var type in this._modes) {
			if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
				this._modes[type].handler.setOptions(options[type]);
			}
		}
	}
});


/*L.Map.mergeOptions({
	editControl: true
});*/

L.EditToolbar = L.Toolbar.extend({
	statics: {
		TYPE: 'edit'
	},

	options: {
		edit: {
			selectedPathOptions: {
				color: '#fe57a1', /* Hot pink all the things! */
				opacity: 0.6,
				dashArray: '10, 10',

				fill: true,
				fillColor: '#fe57a1',
				fillOpacity: 0.1,

				// Whether to user the existing layers color
				maintainColor: false
			}
		},
		remove: {},
		featureGroup: null /* REQUIRED! TODO: perhaps if not set then all layers on the map are selectable? */
	},

	initialize: function (options) {
		// Need to set this manually since null is an acceptable value here
		if (options.edit) {
			if (typeof options.edit.selectedPathOptions === 'undefined') {
				options.edit.selectedPathOptions = this.options.edit.selectedPathOptions;
			}
			options.edit.selectedPathOptions = L.extend({}, this.options.edit.selectedPathOptions, options.edit.selectedPathOptions);
		}

		if (options.remove) {
			options.remove = L.extend({}, this.options.remove, options.remove);
		}

		this._toolbarClass = 'leaflet-draw-edit';
		L.Toolbar.prototype.initialize.call(this, options);

		this._selectedFeatureCount = 0;
	},

	getModeHandlers: function (map) {
		var featureGroup = this.options.featureGroup;
		return [
			{
				enabled: this.options.edit,
				handler: new L.EditToolbar.Edit(map, {
					featureGroup: featureGroup,
					selectedPathOptions: this.options.edit.selectedPathOptions
				}),
				title: L.drawLocal.edit.toolbar.buttons.edit
			},
			{
				enabled: this.options.remove,
				handler: new L.EditToolbar.Delete(map, {
					featureGroup: featureGroup
				}),
				title: L.drawLocal.edit.toolbar.buttons.remove
			}
		];
	},

	getActions: function () {
		return [
			{
				title: L.drawLocal.edit.toolbar.actions.save.title,
				text: L.drawLocal.edit.toolbar.actions.save.text,
				callback: this._save,
				context: this
			},
			{
				title: L.drawLocal.edit.toolbar.actions.cancel.title,
				text: L.drawLocal.edit.toolbar.actions.cancel.text,
				callback: this.disable,
				context: this
			}
		];
	},

	addToolbar: function (map) {
		var container = L.Toolbar.prototype.addToolbar.call(this, map);

		this._checkDisabled();

		this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this);

		return container;
	},

	removeToolbar: function () {
		this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this);

		L.Toolbar.prototype.removeToolbar.call(this);
	},

	disable: function () {
		if (!this.enabled()) { return; }

		this._activeMode.handler.revertLayers();

		L.Toolbar.prototype.disable.call(this);
	},

	_save: function () {
		this._activeMode.handler.save();
		this._activeMode.handler.disable();
	},

	_checkDisabled: function () {
		var featureGroup = this.options.featureGroup,
			hasLayers = featureGroup.getLayers().length !== 0,
			button;

		if (this.options.edit) {
			button = this._modes[L.EditToolbar.Edit.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
				L.drawLocal.edit.toolbar.buttons.edit
				: L.drawLocal.edit.toolbar.buttons.editDisabled
			);
		}

		if (this.options.remove) {
			button = this._modes[L.EditToolbar.Delete.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
				L.drawLocal.edit.toolbar.buttons.remove
				: L.drawLocal.edit.toolbar.buttons.removeDisabled
			);
		}
	}
});


L.EditToolbar.Edit = L.Handler.extend({
	statics: {
		TYPE: 'edit'
	},

	includes: L.Mixin.Events,

	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		L.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._featureGroup = options.featureGroup;

		if (!(this._featureGroup instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		this._uneditedLayerProps = {};

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.EditToolbar.Edit.TYPE;
	},

	enable: function () {
		if (this._enabled || !this._hasAvailableLayers()) {
			return;
		}
		this.fire('enabled', {handler: this.type});
			//this disable other handlers

		this._map.fire('draw:editstart', { handler: this.type });
			//allow drawLayer to be updated before beginning edition.

		L.Handler.prototype.enable.call(this);
		this._featureGroup
			.on('layeradd', this._enableLayerEdit, this)
			.on('layerremove', this._disableLayerEdit, this);
	},

	disable: function () {
		if (!this._enabled) { return; }
		this._featureGroup
			.off('layeradd', this._enableLayerEdit, this)
			.off('layerremove', this._disableLayerEdit, this);
		L.Handler.prototype.disable.call(this);
		this._map.fire('draw:editstop', { handler: this.type });
		this.fire('disabled', {handler: this.type});
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			map.getContainer().focus();

			this._featureGroup.eachLayer(this._enableLayerEdit, this);

			this._tooltip = new L.Tooltip(this._map);
			this._tooltip.updateContent({
				text: L.drawLocal.edit.handlers.edit.tooltip.text,
				subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
			});

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		if (this._map) {
			// Clean up selected layers.
			this._featureGroup.eachLayer(this._disableLayerEdit, this);

			// Clear the backups of the original layers
			this._uneditedLayerProps = {};

			this._tooltip.dispose();
			this._tooltip = null;

			this._map.off('mousemove', this._onMouseMove, this);
		}
	},

	revertLayers: function () {
		this._featureGroup.eachLayer(function (layer) {
			this._revertLayer(layer);
		}, this);
	},

	save: function () {
		var editedLayers = new L.LayerGroup();
		this._featureGroup.eachLayer(function (layer) {
			if (layer.edited) {
				editedLayers.addLayer(layer);
				layer.edited = false;
			}
		});
		this._map.fire('draw:edited', {layers: editedLayers});
	},

	_backupLayer: function (layer) {
		var id = L.Util.stamp(layer);

		if (!this._uneditedLayerProps[id]) {
			// Polyline, Polygon or Rectangle
			if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
				this._uneditedLayerProps[id] = {
					latlngs: L.LatLngUtil.cloneLatLngs(layer.getLatLngs())
				};
			} else if (layer instanceof L.Circle) {
				this._uneditedLayerProps[id] = {
					latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng()),
					radius: layer.getRadius()
				};
			} else if (layer instanceof L.Marker) { // Marker
				this._uneditedLayerProps[id] = {
					latlng: L.LatLngUtil.cloneLatLng(layer.getLatLng())
				};
			}
		}
	},

	_revertLayer: function (layer) {
		var id = L.Util.stamp(layer);
		layer.edited = false;
		if (this._uneditedLayerProps.hasOwnProperty(id)) {
			// Polyline, Polygon or Rectangle
			if (layer instanceof L.Polyline || layer instanceof L.Polygon || layer instanceof L.Rectangle) {
				layer.setLatLngs(this._uneditedLayerProps[id].latlngs);
			} else if (layer instanceof L.Circle) {
				layer.setLatLng(this._uneditedLayerProps[id].latlng);
				layer.setRadius(this._uneditedLayerProps[id].radius);
			} else if (layer instanceof L.Marker) { // Marker
				layer.setLatLng(this._uneditedLayerProps[id].latlng);
			}

			layer.fire('revert-edited', { layer: layer });
		}
	},

	_enableLayerEdit: function (e) {
		var layer = e.layer || e.target || e,
			pathOptions;

		// Back up this layer (if haven't before)
		this._backupLayer(layer);

		// Set different style for editing mode
		if (this.options.selectedPathOptions) {
			pathOptions = L.Util.extend({}, this.options.selectedPathOptions);

			// Use the existing color of the layer
			if (pathOptions.maintainColor) {
				pathOptions.color = layer.options.color;
				pathOptions.fillColor = layer.options.fillColor;
			}

			layer.options.original = L.extend({}, layer.options);
			layer.options.editing = pathOptions;
		}

		layer.editing.enable();
	},

	_disableLayerEdit: function (e) {
		var layer = e.layer || e.target || e;

		layer.edited = false;
		layer.editing.disable();

		delete layer.options.editing;
		delete layer.options.original;
	},

	_onMouseMove: function (e) {
		this._tooltip.updatePosition(e.latlng);
	},

	_hasAvailableLayers: function () {
		return this._featureGroup.getLayers().length !== 0;
	}
});


L.EditToolbar.Delete = L.Handler.extend({
	statics: {
		TYPE: 'remove' // not delete as delete is reserved in js
	},

	includes: L.Mixin.Events,

	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		L.Util.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._deletableLayers = this.options.featureGroup;

		if (!(this._deletableLayers instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.EditToolbar.Delete.TYPE;
	},

	enable: function () {
		if (this._enabled || !this._hasAvailableLayers()) {
			return;
		}
		this.fire('enabled', { handler: this.type});

		this._map.fire('draw:deletestart', { handler: this.type });

		L.Handler.prototype.enable.call(this);

		this._deletableLayers
			.on('layeradd', this._enableLayerDelete, this)
			.on('layerremove', this._disableLayerDelete, this);
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._deletableLayers
			.off('layeradd', this._enableLayerDelete, this)
			.off('layerremove', this._disableLayerDelete, this);

		L.Handler.prototype.disable.call(this);

		this._map.fire('draw:deletestop', { handler: this.type });

		this.fire('disabled', { handler: this.type});
	},

	addHooks: function () {
		var map = this._map;

		if (map) {
			map.getContainer().focus();

			this._deletableLayers.eachLayer(this._enableLayerDelete, this);
			this._deletedLayers = new L.LayerGroup();

			this._tooltip = new L.Tooltip(this._map);
			this._tooltip.updateContent({ text: L.drawLocal.edit.handlers.remove.tooltip.text });

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		if (this._map) {
			this._deletableLayers.eachLayer(this._disableLayerDelete, this);
			this._deletedLayers = null;

			this._tooltip.dispose();
			this._tooltip = null;

			this._map.off('mousemove', this._onMouseMove, this);
		}
	},

	revertLayers: function () {
		// Iterate of the deleted layers and add them back into the featureGroup
		this._deletedLayers.eachLayer(function (layer) {
			this._deletableLayers.addLayer(layer);
			layer.fire('revert-deleted', { layer: layer });
		}, this);
	},

	save: function () {
		this._map.fire('draw:deleted', { layers: this._deletedLayers });
	},

	_enableLayerDelete: function (e) {
		var layer = e.layer || e.target || e;

		layer.on('click', this._removeLayer, this);
	},

	_disableLayerDelete: function (e) {
		var layer = e.layer || e.target || e;

		layer.off('click', this._removeLayer, this);

		// Remove from the deleted layers so we can't accidently revert if the user presses cancel
		this._deletedLayers.removeLayer(layer);
	},

	_removeLayer: function (e) {
		var layer = e.layer || e.target || e;

		this._deletableLayers.removeLayer(layer);

		this._deletedLayers.addLayer(layer);

		layer.fire('deleted');
	},

	_onMouseMove: function (e) {
		this._tooltip.updatePosition(e.latlng);
	},

	_hasAvailableLayers: function () {
		return this._deletableLayers.getLayers().length !== 0;
	}
});


}(window, document));
L.Polyline.Measure = L.Draw.Polyline.extend({
    addHooks: function() {
        L.Draw.Polyline.prototype.addHooks.call(this);
        if (this._map) {
            this._markerGroup = new L.LayerGroup();
            this._map.addLayer(this._markerGroup);

            this._markers = [];
            this._map.on('click', this._onClick, this);
            this._startShape();
        }
    },

    removeHooks: function () {

        this._clearHideErrorTimeout();

        //!\ Still useful when control is disabled before any drawing (refactor needed?)
        this._map
            .off('pointermove', this._onMouseMove, this)
            .off('mousemove', this._onMouseMove, this)
            .off('click', this._onClick, this);

        this._clearGuides();
        this._container.style.cursor = '';

        this._removeShape();
        L.Draw.Polyline.prototype.removeHooks.call(this);
    },

    _startShape: function() {
        this._drawing = true;
        this._poly = new L.Polyline([], this.options.shapeOptions);
        //this is added as a placeholder, if leaflet doesn't recieve this when the tool is turned off all onclick events are removed
        this._poly._onClick = function() {};
        
        this._container.style.cursor = 'crosshair';

        this._updateTooltip();
        map.off('click',L.TileLayer.BetterWMS.getFeatureInfo);
        this._map
            .on('pointermove', this._onMouseMove, this)
            .on('mousemove', this._onMouseMove, this)
            .on('click', this._onClick, this);
    },

    _finishShape: function () {
        this._drawing = false;

        this._cleanUpShape();
        this._clearGuides();

        this._updateTooltip();

        var map=this._map;
    	this._map.eachLayer(function(layer) {
			if (layer.options
					&& layer.options.tipus == "wms") {
				map.on('click',layer.getFeatureInfo,layer);
			}

		});
       
        this._map
            .off('pointermove', this._onMouseMove, this)
            .off('mousemove', this._onMouseMove, this)
            .off('click', this._onClick, this);
        
        this._container.style.cursor = '';
    },

    _removeShape: function() {
        if (!this._poly)
            return;
        this._map.removeLayer(this._poly);
        delete this._poly;
        this._markers.splice(0);
        this._markerGroup.clearLayers();
    },

    _onClick: function(e) {
        if (!this._drawing) {
            this._removeShape();
            this._startShape();
            return;
        }
    },

    _getTooltipText: function() {
        var labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);
        if (!this._drawing) {
            labelText.text = '';
        }
        return labelText;
    }
});

L.Control.MeasureControl = L.Control.extend({

    statics: {
        TITLE: 'Mesurar distància'
    },
    options: {
        position: 'topleft',
        handler: {
            shapeOptions: {
                fill: true,
                fillOpacity: 0.2
            }
        }
    },

    toggle: function() {
        if (this.handler.enabled()) {
            this.handler.disable.call(this.handler);
        } else {
            this.handler.enable.call(this.handler);
        }
    },

    onAdd: function(map) {
        var className = 'leaflet-control-draw';

        this._container = L.DomUtil.create('div', 'leaflet-bar');

        this.handler = new L.Polyline.Measure(map, this.options.handler);

        this.handler.on('enabled', function () {
            this.enabled = true;
            L.DomUtil.addClass(this._container, 'enabled');
        }, this);

        this.handler.on('disabled', function () {
            delete this.enabled;
            L.DomUtil.removeClass(this._container, 'enabled');
        }, this);

        var link = L.DomUtil.create('a', className+'-measure', this._container);
        link.href = '#';
		link.lang = 'ca';
        link.title = L.Control.MeasureControl.TITLE;

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stopPropagation)
            .addListener(link, 'click', L.DomEvent.preventDefault)
            .addListener(link, 'click', this.toggle, this);

        return this._container;
    }
});


L.Map.mergeOptions({
    measureControl: false
});


L.Map.addInitHook(function () {
    if (this.options.measureControl) {
        this.measureControl = L.Control.measureControl().addTo(this);
    }
});


L.Control.measureControl = function (options) {
    return new L.Control.MeasureControl(options);
};


/*
  Leaflet.AwesomeMarkers, a plugin that adds colorful iconic markers for Leaflet, based on the Font Awesome icons
  (c) 2012-2013, Lennard Voogdt

  http://leafletjs.com
  https://github.com/lvoogdt
*/

/*global L*/

(function (window, document, undefined) {
    "use strict";
    /*
     * Leaflet.AwesomeMarkers assumes that you have already included the Leaflet library.
     */

    L.AwesomeMarkers = {};

    L.AwesomeMarkers.version = '2.0.1';

    L.AwesomeMarkers.Icon = L.Icon.extend({
        options: {
            iconSize: [35, 45],
            iconAnchor:   [17, 42],
            popupAnchor: [1, -32],
            shadowAnchor: [10, 12],
            shadowSize: [36, 16],
            className: 'awesome-marker',
			divColor:'transparent',
            prefix: 'glyphicon',
            spinClass: 'fa-spin',
            icon: 'home',
            markerColor: 'blue',
            iconColor: 'white'
        },

        initialize: function (options) {
            options = L.Util.setOptions(this, options);
        },

        createIcon: function () {
            var div = document.createElement('div'),
                options = this.options;

            if (options.icon) {
                div.innerHTML = this._createInner();
            }

            if (options.bgPos) {
                div.style.backgroundPosition =
                    (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
            }

            this._setIconStyles(div, 'icon-' + options.markerColor);
            return div;
        },

        _createInner: function() {
            var iconClass, iconSpinClass = "", iconColorClass = "", iconColorStyle = "", options = this.options;

            if(options.icon.slice(0,options.prefix.length+1) === options.prefix + "-") {
                iconClass = options.icon;
            } else {
                iconClass = options.prefix + "-" + options.icon;
            }

            if(options.spin && typeof options.spinClass === "string") {
                iconSpinClass = options.spinClass;
            }

            if(options.iconColor) {
                if(options.iconColor === 'white' || options.iconColor === 'black') {
                    iconColorClass = "icon-" + options.iconColor;
                } else {
                    iconColorStyle = "style='color: " + options.iconColor + "' ";
                }
            }

            return "<i " + iconColorStyle + "class='" + options.prefix + " " + iconClass + " " + iconSpinClass + " " + iconColorClass + "'></i>";
        },

        _setIconStyles: function (img, name) {
            var options = this.options,
                size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
                anchor;

            if (name === 'shadow') {
                anchor = L.point(options.shadowAnchor || options.iconAnchor);
            } else {
                anchor = L.point(options.iconAnchor);
            }

            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }

            img.className = 'awesome-marker-' + name + ' ' + options.className;

			img.style.backgroundColor=options.divColor;
			
            if (anchor) {
                img.style.marginLeft = (-anchor.x) + 'px';
                img.style.marginTop  = (-anchor.y) + 'px';
            }

            if (size) {
                img.style.width  = size.x + 'px';
                img.style.height = size.y + 'px';
            }
        },

        createShadow: function () {
            var div = document.createElement('div');

            this._setIconStyles(div, 'shadow');
            return div;
      }
    });
        
    L.AwesomeMarkers.icon = function (options) {
        return new L.AwesomeMarkers.Icon(options);
    };

}(this, document));




///*
// (c) 2014, Vladimir Agafonkin
// simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
// https://github.com/mourner/simpleheat
//*/
//!function(){"use strict";function t(i){return this instanceof t?(this._canvas=i="string"==typeof i?document.getElementById(i):i,this._ctx=i.getContext("2d"),this._width=i.width,this._height=i.height,this._max=1,void this.clear()):new t(i)}t.prototype={defaultRadius:25,defaultGradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"},data:function(t){return this._data=t,this},max:function(t){return this._max=t,this},add:function(t){return this._data.push(t),this},clear:function(){return this._data=[],this},radius:function(t,i){i=i||15;var a=this._circle=document.createElement("canvas"),e=a.getContext("2d"),s=this._r=t+i;return a.width=a.height=2*s,e.shadowOffsetX=e.shadowOffsetY=200,e.shadowBlur=i,e.shadowColor="black",e.beginPath(),e.arc(s-200,s-200,t,0,2*Math.PI,!0),e.closePath(),e.fill(),this},gradient:function(t){
//	var i=document.createElement("canvas"),
//	a=i.getContext("2d"),
//	e=a.createLinearGradient(0,0,0,256);
//	i.width=1,i.height=256;
//	for(var s in t)e.addColorStop(s,t[s]);return a.fillStyle=e,a.fillRect(0,0,1,256),this._grad=a.getImageData(0,0,1,256).data,this},draw:function(t){
//		this._circle||this.radius(this.defaultRadius),
//		this._grad||this.gradient(this.defaultGradient);
//		var i=this._ctx;i.clearRect(0,0,this._width,this._height);for(var a,e=0,s=this._data.length;s>e;e++)a=this._data[e],i.globalAlpha=Math.max(a[2]/this._max,t||.2),i.drawImage(this._circle,a[0]-this._r,a[1]-this._r);var n=i.getImageData(0,0,this._width,this._height);return this._colorize(n.data,this._grad),i.putImageData(n,0,0),this},_colorize:function(t,i){for(var a,e=3,s=t.length;s>e;e+=4)a=4*t[e],a&&(t[e-3]=i[a],t[e-2]=i[a+1],t[e-1]=i[a+2])}},window.simpleheat=t}(),/*
// (c) 2014, Vladimir Agafonkin
// Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
// https://github.com/Leaflet/Leaflet.heat
//*/
//L.HeatLayer=L.Class.extend({initialize:function(t,i){this._latlngs=t,L.setOptions(this,i)},setLatLngs:function(t){return this._latlngs=t,this.redraw()},addLatLng:function(t){return this._latlngs.push(t),this.redraw()},setOptions:function(t){return L.setOptions(this,t),this._heat&&this._updateOptions(),this.redraw()},redraw:function(){return this._heat&&!this._frame&&(this._frame=L.Util.requestAnimFrame(this._redraw,this)),this},onAdd:function(t){this._map=t,this._canvas||this._initCanvas(),t._panes.overlayPane.appendChild(this._canvas),t.on("moveend",this._reset,this),t.options.zoomAnimation&&L.Browser.any3d&&t.on("zoomanim",this._animateZoom,this),this._reset()},onRemove:function(t){t.getPanes().overlayPane.removeChild(this._canvas),t.off("moveend",this._reset,this),t.options.zoomAnimation&&t.off("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},_initCanvas:function(){var t=this._canvas=L.DomUtil.create("canvas","leaflet-heatmap-layer"),i=this._map.getSize();t.width=i.x,t.height=i.y;var a=this._map.options.zoomAnimation&&L.Browser.any3d;L.DomUtil.addClass(t,"leaflet-zoom-"+(a?"animated":"hide")),this._heat=simpleheat(t),this._updateOptions()},_updateOptions:function(){this._heat.radius(this.options.radius||this._heat.defaultRadius,this.options.blur),this.options.gradient&&this._heat.gradient(this.options.gradient),this.options.max&&this._heat.max(this.options.max)},_reset:function(){var t=this._map.containerPointToLayerPoint([0,0]);L.DomUtil.setPosition(this._canvas,t);var i=this._map.getSize();this._heat._width!==i.x&&(this._canvas.width=this._heat._width=i.x),this._heat._height!==i.y&&(this._canvas.height=this._heat._height=i.y),this._redraw()},_redraw:function(){var t,i,a,e,s,n,h,o,r,d=[],_=this._heat._r,l=this._map.getSize(),m=new L.LatLngBounds(this._map.containerPointToLatLng(L.point([-_,-_])),this._map.containerPointToLatLng(l.add([_,_]))),c=void 0===this.options.maxZoom?this._map.getMaxZoom():this.options.maxZoom,u=1/Math.pow(2,Math.max(0,Math.min(c-this._map.getZoom(),12))),g=_/2,f=[],p=this._map._getMapPanePos(),v=p.x%g,w=p.y%g;for(t=0,i=this._latlngs.length;i>t;t++)m.contains(this._latlngs[t])&&(a=this._map.latLngToContainerPoint(this._latlngs[t]),s=Math.floor((a.x-v)/g)+2,n=Math.floor((a.y-w)/g)+2,r=(this._latlngs[t].alt||1)*u,f[n]=f[n]||[],e=f[n][s],e?(e[0]=(e[0]*e[2]+a.x*r)/(e[2]+r),e[1]=(e[1]*e[2]+a.y*r)/(e[2]+r),e[2]+=r):f[n][s]=[a.x,a.y,r]);for(t=0,i=f.length;i>t;t++)if(f[t])for(h=0,o=f[t].length;o>h;h++)e=f[t][h],e&&d.push([Math.round(e[0]),Math.round(e[1]),Math.min(e[2],1)]);this._heat.data(d).draw(),this._frame=null},_animateZoom:function(t){var i=this._map.getZoomScale(t.zoom),a=this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());this._canvas.style[L.DomUtil.TRANSFORM]=L.DomUtil.getTranslateString(a)+" scale("+i+")"}}),L.heatLayer=function(t,i){return new L.HeatLayer(t,i)};


/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/
!function(){"use strict";function t(i){return this instanceof t?(this._canvas=i="string"==typeof i?document.getElementById(i):i,this._ctx=i.getContext("2d"),this._width=i.width,this._height=i.height,this._max=1,void this.clear()):new t(i)}t.prototype={defaultRadius:25,defaultGradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"},data:function(t){return this._data=t,this},max:function(t){return this._max=t,this},add:function(t){return this._data.push(t),this},clear:function(){return this._data=[],this},radius:function(t,i){i=i||15;var a=this._circle=document.createElement("canvas"),e=a.getContext("2d"),s=this._r=t+i;return a.width=a.height=2*s,e.shadowOffsetX=e.shadowOffsetY=200,e.shadowBlur=i,e.shadowColor="black",e.beginPath(),e.arc(s-200,s-200,t,0,2*Math.PI,!0),e.closePath(),e.fill(),this},gradient:function(t){var i=document.createElement("canvas"),a=i.getContext("2d"),e=a.createLinearGradient(0,0,0,256);i.width=1,i.height=256;for(var s in t)e.addColorStop(s,t[s]);return a.fillStyle=e,a.fillRect(0,0,1,256),this._grad=a.getImageData(0,0,1,256).data,this},draw:function(t){this._circle||this.radius(this.defaultRadius),this._grad||this.gradient(this.defaultGradient);var i=this._ctx;i.clearRect(0,0,this._width,this._height);for(var a,e=0,s=this._data.length;s>e;e++)a=this._data[e],i.globalAlpha=Math.max(a[2]/this._max,t||.25),i.drawImage(this._circle,a[0]-this._r,a[1]-this._r);var n=i.getImageData(0,0,this._width,this._height);return this._colorize(n.data,this._grad),i.putImageData(n,0,0),this},_colorize:function(t,i){for(var a,e=3,s=t.length;s>e;e+=4)a=4*t[e],a&&(t[e-3]=i[a],t[e-2]=i[a+1],t[e-1]=i[a+2])}},window.simpleheat=t}(),/*
 (c) 2014, Vladimir Agafonkin
 Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 https://github.com/Leaflet/Leaflet.heat
*/
L.HeatLayer=L.Class.extend({initialize:function(t,i){this._latlngs=t,L.setOptions(this,i)},setLatLngs:function(t){return this._latlngs=t,this.redraw()},addLatLng:function(t){return this._latlngs.push(t),this.redraw()},setOptions:function(t){return L.setOptions(this,t),this._heat&&this._updateOptions(),this.redraw()},redraw:function(){return!this._heat||this._frame||this._map._animating||(this._frame=L.Util.requestAnimFrame(this._redraw,this)),this},onAdd:function(t){this._map=t,this._canvas||this._initCanvas(),t._panes.overlayPane.appendChild(this._canvas),t.on("moveend",this._reset,this),t.options.zoomAnimation&&L.Browser.any3d&&t.on("zoomanim",this._animateZoom,this),this._reset()},onRemove:function(t){t.getPanes().overlayPane.removeChild(this._canvas),t.off("moveend",this._reset,this),t.options.zoomAnimation&&t.off("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},_initCanvas:function(){var t=this._canvas=L.DomUtil.create("canvas","leaflet-heatmap-layer leaflet-layer"),i=this._map.getSize();t.width=i.x,t.height=i.y;var a=this._map.options.zoomAnimation&&L.Browser.any3d;L.DomUtil.addClass(t,"leaflet-zoom-"+(a?"animated":"hide")),this._heat=simpleheat(t),this._updateOptions()},_updateOptions:function(){this._heat.radius(this.options.radius||this._heat.defaultRadius,this.options.blur),this.options.gradient&&this._heat.gradient(this.options.gradient),this.options.max&&this._heat.max(this.options.max)},_reset:function(){var t=this._map.containerPointToLayerPoint([0,0]);L.DomUtil.setPosition(this._canvas,t);var i=this._map.getSize();this._heat._width!==i.x&&(this._canvas.width=this._heat._width=i.x),this._heat._height!==i.y&&(this._canvas.height=this._heat._height=i.y),this._redraw()},_redraw:function(){var t,i,a,e,s,n,h,o,r,_=[],d=this._heat._r,l=this._map.getSize(),m=new L.LatLngBounds(this._map.containerPointToLatLng(L.point([-d,-d])),this._map.containerPointToLatLng(l.add([d,d]))),c=void 0===this.options.maxZoom?this._map.getMaxZoom():this.options.maxZoom,u=1/Math.pow(2,Math.max(0,Math.min(c-this._map.getZoom(),12))),g=d/2,f=[],p=this._map._getMapPanePos(),v=p.x%g,w=p.y%g;for(t=0,i=this._latlngs.length;i>t;t++)m.contains(this._latlngs[t])&&(a=this._map.latLngToContainerPoint(this._latlngs[t]),s=Math.floor((a.x-v)/g)+2,n=Math.floor((a.y-w)/g)+2,r=(this._latlngs[t].alt||1)*u,f[n]=f[n]||[],e=f[n][s],e?(e[0]=(e[0]*e[2]+a.x*r)/(e[2]+r),e[1]=(e[1]*e[2]+a.y*r)/(e[2]+r),e[2]+=r):f[n][s]=[a.x,a.y,r]);for(t=0,i=f.length;i>t;t++)if(f[t])for(h=0,o=f[t].length;o>h;h++)e=f[t][h],e&&_.push([Math.round(e[0]),Math.round(e[1]),Math.min(e[2],1)]);this._heat.data(_).draw(),this._frame=null},_animateZoom:function(t){var i=this._map.getZoomScale(t.zoom),a=this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());this._canvas.style[L.DomUtil.TRANSFORM]=L.DomUtil.getTranslateString(a)+" scale("+i+")"}}),L.heatLayer=function(t,i){return new L.HeatLayer(t,i)};
(function(){/*
 OverlappingMarkerSpiderfier
https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
Copyright (c) 2011 - 2012 George MacKerron
Released under the MIT licence: http://opensource.org/licenses/mit-license
Note: The Leaflet maps API must be included *before* this code
*/
(function(){var q={}.hasOwnProperty,r=[].slice;null!=this.L&&(this.OverlappingMarkerSpiderfier=function(){function n(c,b){var a,e,g,f,d=this;this.map=c;null==b&&(b={});for(a in b)q.call(b,a)&&(e=b[a],this[a]=e);this.initMarkerArrays();this.listeners={};f=["click","zoomend"];e=0;for(g=f.length;e<g;e++)a=f[e],this.map.addEventListener(a,function(){return d.unspiderfy()})}var d,k;d=n.prototype;d.VERSION="0.2.6";k=2*Math.PI;d.keepSpiderfied=!1;d.nearbyDistance=20;d.circleSpiralSwitchover=9;d.circleFootSeparation=
25;d.circleStartAngle=k/12;d.spiralFootSeparation=28;d.spiralLengthStart=11;d.spiralLengthFactor=5;d.legWeight=1.5;d.legColors={usual:"#222",highlighted:"#f00"};d.initMarkerArrays=function(){this.markers=[];return this.markerListeners=[]};d.addMarker=function(c){var b,a=this;if(null!=c._oms)return this;c._oms=!0;b=function(){return a.spiderListener(c)};c.addEventListener("click",b);this.markerListeners.push(b);this.markers.push(c);return this};d.getMarkers=function(){return this.markers.slice(0)};
d.removeMarker=function(c){var b,a;null!=c._omsData&&this.unspiderfy();b=this.arrIndexOf(this.markers,c);if(0>b)return this;a=this.markerListeners.splice(b,1)[0];c.removeEventListener("click",a);delete c._oms;this.markers.splice(b,1);return this};d.clearMarkers=function(){var c,b,a,e,g;this.unspiderfy();g=this.markers;c=a=0;for(e=g.length;a<e;c=++a)b=g[c],c=this.markerListeners[c],b.removeEventListener("click",c),delete b._oms;this.initMarkerArrays();return this};d.addListener=function(c,b){var a,
e;(null!=(e=(a=this.listeners)[c])?e:a[c]=[]).push(b);return this};d.removeListener=function(c,b){var a;a=this.arrIndexOf(this.listeners[c],b);0>a||this.listeners[c].splice(a,1);return this};d.clearListeners=function(c){this.listeners[c]=[];return this};d.trigger=function(){var c,b,a,e,g,f;b=arguments[0];c=2<=arguments.length?r.call(arguments,1):[];b=null!=(a=this.listeners[b])?a:[];f=[];e=0;for(g=b.length;e<g;e++)a=b[e],f.push(a.apply(null,c));return f};d.generatePtsCircle=function(c,b){var a,e,
g,f,d;g=this.circleFootSeparation*(2+c)/k;e=k/c;d=[];for(a=f=0;0<=c?f<c:f>c;a=0<=c?++f:--f)a=this.circleStartAngle+a*e,d.push(new L.Point(b.x+g*Math.cos(a),b.y+g*Math.sin(a)));return d};d.generatePtsSpiral=function(c,b){var a,e,g,f,d;g=this.spiralLengthStart;a=0;d=[];for(e=f=0;0<=c?f<c:f>c;e=0<=c?++f:--f)a+=this.spiralFootSeparation/g+5E-4*e,e=new L.Point(b.x+g*Math.cos(a),b.y+g*Math.sin(a)),g+=k*this.spiralLengthFactor/a,d.push(e);return d};d.spiderListener=function(c){var b,a,e,g,f,d,h,k,l;(b=null!=
c._omsData)&&this.keepSpiderfied||this.unspiderfy();if(b)return this.trigger("click",c);g=[];f=[];d=this.nearbyDistance*this.nearbyDistance;e=this.map.latLngToLayerPoint(c.getLatLng());l=this.markers;h=0;for(k=l.length;h<k;h++)b=l[h],this.map.hasLayer(b)&&(a=this.map.latLngToLayerPoint(b.getLatLng()),this.ptDistanceSq(a,e)<d?g.push({marker:b,markerPt:a}):f.push(b));return 1===g.length?this.trigger("click",c):this.spiderfy(g,f)};d.makeHighlightListeners=function(c){var b=this;return{highlight:function(){return c._omsData.leg.setStyle({color:b.legColors.highlighted})},
unhighlight:function(){return c._omsData.leg.setStyle({color:b.legColors.usual})}}};d.spiderfy=function(c,b){var a,e,g,d,p,h,k,l,n,m;this.spiderfying=!0;m=c.length;a=this.ptAverage(function(){var a,b,e;e=[];a=0;for(b=c.length;a<b;a++)k=c[a],e.push(k.markerPt);return e}());d=m>=this.circleSpiralSwitchover?this.generatePtsSpiral(m,a).reverse():this.generatePtsCircle(m,a);a=function(){var a,b,k,m=this;k=[];a=0;for(b=d.length;a<b;a++)g=d[a],e=this.map.layerPointToLatLng(g),n=this.minExtract(c,function(a){return m.ptDistanceSq(a.markerPt,
g)}),h=n.marker,p=new L.Polyline([h.getLatLng(),e],{color:this.legColors.usual,weight:this.legWeight,clickable:!1}),this.map.addLayer(p),h._omsData={usualPosition:h.getLatLng(),leg:p},this.legColors.highlighted!==this.legColors.usual&&(l=this.makeHighlightListeners(h),h._omsData.highlightListeners=l,h.addEventListener("mouseover",l.highlight),h.addEventListener("mouseout",l.unhighlight)),h.setLatLng(e);if(h.setZIndexOffset){h.setZIndexOffset(1E6)};k.push(h);return k}.call(this);delete this.spiderfying;this.spiderfied=!0;
return this.trigger("spiderfy",a,b)};d.unspiderfy=function(c){var b,a,e,d,f,k,h;null==c&&(c=null);if(null==this.spiderfied)return this;this.unspiderfying=!0;d=[];e=[];h=this.markers;f=0;for(k=h.length;f<k;f++)b=h[f],null!=b._omsData?(this.map.removeLayer(b._omsData.leg),b!==c&&b.setLatLng(b._omsData.usualPosition),(b.setZIndexOffset ? b.setZIndexOffset(0) : b),a=b._omsData.highlightListeners,null!=a&&(b.removeEventListener("mouseover",a.highlight),b.removeEventListener("mouseout",a.unhighlight)),delete b._omsData,d.push(b)):
e.push(b);delete this.unspiderfying;delete this.spiderfied;this.trigger("unspiderfy",d,e);return this};d.ptDistanceSq=function(c,b){var a,e;a=c.x-b.x;e=c.y-b.y;return a*a+e*e};d.ptAverage=function(c){var b,a,e,d,f;d=a=e=0;for(f=c.length;d<f;d++)b=c[d],a+=b.x,e+=b.y;c=c.length;return new L.Point(a/c,e/c)};d.minExtract=function(c,b){var a,d,g,f,k,h;g=k=0;for(h=c.length;k<h;g=++k)if(f=c[g],f=b(f),"undefined"===typeof a||null===a||f<d)d=f,a=g;return c.splice(a,1)[0]};d.arrIndexOf=function(c,b){var a,
d,g,f;if(null!=c.indexOf)return c.indexOf(b);a=g=0;for(f=c.length;g<f;a=++g)if(d=c[a],d===b)return a;return-1};return n}())}).call(this);}).call(this);
/* Mon 14 Oct 2013 10:54:59 BST */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.turf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function simpleFeature(e,r){return{type:"Feature",geometry:e,properties:r}}var simplify=require("simplify-js");module.exports=function(e,r,t){if("LineString"===e.geometry.type){var i={type:"LineString",coordinates:[]},o=e.geometry.coordinates.map(function(e){return{x:e[0],y:e[1]}});return i.coordinates=simplify(o,r,t).map(function(e){return[e.x,e.y]}),simpleFeature(i,e.properties)}if("Polygon"===e.geometry.type){var n={type:"Polygon",coordinates:[]};return e.geometry.coordinates.forEach(function(e){var i=e.map(function(e){return{x:e[0],y:e[1]}}),o=simplify(i,r,t).map(function(e){return[e.x,e.y]});n.coordinates.push(o)}),simpleFeature(n,e.properties)}};

},{"simplify-js":2}],2:[function(require,module,exports){
!function(){"use strict";function n(n,e){var r=n.x-e.x,f=n.y-e.y;return r*r+f*f}function e(n,e,r){var f=e.x,t=e.y,i=r.x-f,u=r.y-t;if(0!==i||0!==u){var o=((n.x-f)*i+(n.y-t)*u)/(i*i+u*u);o>1?(f=r.x,t=r.y):o>0&&(f+=i*o,t+=u*o)}return i=n.x-f,u=n.y-t,i*i+u*u}function r(e,r){for(var f,t=e[0],i=[t],u=1,o=e.length;o>u;u++)f=e[u],n(f,t)>r&&(i.push(f),t=f);return t!==f&&i.push(f),i}function f(n,r){var f,t,i,u,o=n.length,y="undefined"!=typeof Uint8Array?Uint8Array:Array,p=new y(o),d=0,s=o-1,a=[],c=[];for(p[d]=p[s]=1;s;){for(t=0,f=d+1;s>f;f++)i=e(n[f],n[d],n[s]),i>t&&(u=f,t=i);t>r&&(p[u]=1,a.push(d,u,u,s)),s=a.pop(),d=a.pop()}for(f=0;o>f;f++)p[f]&&c.push(n[f]);return c}function t(n,e,t){var i=void 0!==e?e*e:1;return n=t?n:r(n,i),n=f(n,i)}"function"==typeof define&&define.amd?define(function(){return t}):"undefined"!=typeof module?module.exports=t:"undefined"!=typeof self?self.simplify=t:window.simplify=t}();

},{}],3:[function(require,module,exports){
module.exports={simplify:require("turf-simplify")};
},{"turf-simplify":1}]},{},[3])(3)
});
/*
 Copyright (c) 2012, Smartrak, David Leaver
 Leaflet.utfgrid is an open-source JavaScript library that provides utfgrid interaction on leaflet powered maps.
 https://github.com/danzel/Leaflet.utfgrid
*/
(function (window, undefined) {

L.Util.ajaxGrid = function (url, cb) {
	// the following is from JavaScript: The Definitive Guide
	// and https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest_in_IE6
	if (window.XMLHttpRequest === undefined) {
		window.XMLHttpRequest = function () {
			/*global ActiveXObject:true */
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch  (e) {
				throw new Error("XMLHttpRequest is not supported");
			}
		};
	}
	var response, request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function () {
		/*jshint evil: true */
		if (request.readyState === 4 && request.status === 200) {
			if (window.JSON) {
				if(request.responseText.toLowerCase().indexOf("error")!=-1){
					console.debug("ResponseText WMS error:"+request.responseText);
				}
				else if (request.responseText.toLowerCase().indexOf("mapserver message")!=-1){
					console.debug("MapServer Message:"+request.responseText);
				}
				else response = JSON.parse(request.responseText);
			} else {
				response = eval("(" + request.responseText + ")");
			}
			cb(response);
		}
	};
	request.send();
};


L.UtfGrid = L.Class.extend({
	includes: L.Mixin.Events,
	options: {
		subdomains: 'abc',

		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,

		resolution: 4,

		useJsonP: false,
		pointerCursor: true
	},
	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'utfgrid',
		transparent: false
	},

	//The thing the mouse is currently on
	_mouseOn: null,

	initialize: function (url, options) {
		
		this._url = url;
		this._cache = {};

		//Find a unique id in window we can use for our callbacks
		//Required for jsonP
		var i = 0;
		while (window['lu' + i]) {
			i++;
		}
		this._windowKey = 'lu' + i;
		window[this._windowKey] = {};

		var subdomains = this.options.subdomains;
		if (typeof this.options.subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
		var wmsParams = L.Util.extend({}, this.defaultWmsParams);
		wmsParams.width = wmsParams.height = this.options.tileSize;

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i)) {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.Util.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;
		this._container = this._map._container;

		this._update();

		var zoom = this._map.getZoom();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		map.on('click', this._click, this);
		map.on('mousemove', this._move, this);
		map.on('moveend', this._update, this);
	},

	onRemove: function () {
		var map = this._map;
		map.off('click', this._click, this);
		map.off('mousemove', this._move, this);
		map.off('moveend', this._update, this);
		if (this.options.pointerCursor) {
			this._container.style.cursor = '';
		}
	},

	_click: function (e) {
		this.fire('click', this._objectForEvent(e));
	},
	_move: function (e) {
		var on = this._objectForEvent(e);

		if (on.data !== this._mouseOn) {
			if (this._mouseOn) {
				this.fire('mouseout', { latlng: e.latlng, data: this._mouseOn });
				if (this.options.pointerCursor) {
					this._container.style.cursor = '';
				}
			}
			if (on.data) {
				this.fire('mouseover', on);
				if (this.options.pointerCursor) {
					this._container.style.cursor = 'pointer';
				}
			}

			this._mouseOn = on.data;
		} else if (on.data) {
			this.fire('mousemove', on);
		}
	},

	_objectForEvent: function (e) {
		var map = this._map,
		    point = map.project(e.latlng),
		    tileSize = this.options.tileSize,
		    resolution = this.options.resolution,
		    x = Math.floor(point.x / tileSize),
		    y = Math.floor(point.y / tileSize),
		    gridX = Math.floor((point.x - (x * tileSize)) / resolution),
		    gridY = Math.floor((point.y - (y * tileSize)) / resolution),
			max = map.options.crs.scale(map.getZoom()) / tileSize;

		x = (x + max) % max;
		y = (y + max) % max;
		
		var data = this._cache[map.getZoom() + '_' + x + '_' + y];
		if (!data) {
			return { latlng: e.latlng, data: null };
		}

		var idx = this._utfDecode(data.grid[gridY].charCodeAt(gridX)),
		    key = data.keys[idx],
		    result = data.data[key];

		if (!data.data.hasOwnProperty(key)) {
			result = null;
		}

		return { latlng: e.latlng, data: result};
	},

	//Load up all required json grid files
	//TODO: Load from center etc
	_update: function () {
		var bounds = this._map.getPixelBounds(),
		    zoom = this._map.getZoom(),
		    tileSize = this.options.tileSize;

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var nwTilePoint = new L.Point(
				Math.floor(bounds.min.x / tileSize),
				Math.floor(bounds.min.y / tileSize)),
			seTilePoint = new L.Point(
				Math.floor(bounds.max.x / tileSize),
				Math.floor(bounds.max.y / tileSize)),
				max = this._map.options.crs.scale(zoom) / tileSize;

		//Load all required ones
		for (var x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (var y = nwTilePoint.y; y <= seTilePoint.y; y++) {

				var xw = (x + max) % max, yw = (y + max) % max;
				var key = zoom + '_' + xw + '_' + yw;

				if (!this._cache.hasOwnProperty(key)) {
					this._cache[key] = null;

					if (this.options.useJsonP) {
						this._loadTileP(zoom, xw, yw);
					} else {
						this._loadTile(zoom, xw, yw);
					}
				}
			}
		}
	},

	_loadTileP: function (zoom, x, y) {
		var head = document.getElementsByTagName('head')[0],
		    key = zoom + '_' + x + '_' + y,
		    functionName = 'lu_' + key,
		    wk = this._windowKey,
		    self = this;

		var url = L.Util.template(this._url, L.Util.extend({
			s: L.TileLayer.prototype._getSubdomain.call(this, { x: x, y: y }),
			z: zoom,
			x: x,
			y: y,
			cb: wk + '.' + functionName
		}, this.options));

		
		/*var map = this._map,
		crs = map.options.crs,

		tileSize = this.options.tileSize,

	
		
		bounds = this._map.getBounds();
		var SRS="EPSG:4326";
		var bbox=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 bbox=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		*/
		var tilePoint = new L.Point(x,y);
				
		  var map = this._map,
	          crs = map.options.crs,
	          tileSize = this.options.tileSize,
		  nwPoint = tilePoint.multiplyBy(tileSize),
		  sePoint = nwPoint.add([tileSize, tileSize]),

		  //nw = crs.project(map.unproject(nwPoint, zoom)),
		  //se = crs.project(map.unproject(sePoint, zoom)),

		  bbox = [nwPoint.x, sePoint.y, sePoint.x, nwPoint.y].join(','),
			
		url = url + (L.Util.getParamString(this.wmsParams)).replace("?","") + "&bbox=" + bbox;
		
				
		var script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", url);

		window[wk][functionName] = function (data) {
			self._cache[key] = data;
			delete window[wk][functionName];
			//head.removeChild(script);
		};

		head.appendChild(script);
	},

	_loadTile: function (zoom, x, y) {
		var url = L.Util.template(this._url, L.Util.extend({
			s: L.TileLayer.prototype._getSubdomain.call(this, { x: x, y: y }),
			z: zoom,
			x: x,
			y: y
		}, this.options));
		
		
		/*bounds = this._map.getBounds();
		var SRS="EPSG:4326";
		var bbox=bounds.toBBoxString();
		if(SRS.indexOf('3857')!=-1){
				var NW = L.CRS.EPSG3857.project(bounds.getNorthWest());
				var SE = L.CRS.EPSG3857.project(bounds.getSouthEast());
				  
				 bbox=NW.x+","+SE.y+","+SE.x+","+NW.y;
			
			}
		*/


		  
		  
		  var tilePoint = new L.Point(x,y);
		  var tileSize = this.options.tileSize,
          nwPoint = tilePoint.multiplyBy(tileSize),
          sePoint = nwPoint.add([tileSize, tileSize]),
          nw = this._map.unproject(nwPoint),
          se = this._map.unproject(sePoint);
		  
		  var my_crs = this._map.options.crs; // get the CRS
		  var my_proj = my_crs.projection; // get the projection
		  // transform the lat lon Point to a utm point
		  var nw_utm = my_proj.project(nw); 
		  var se_utm = my_proj.project(se); 
          bbox = [nw.lng, se.lat, se.lng, nw.lat].join(','),
			
		url = url + (L.Util.getParamString(this.wmsParams)).replace("?","") + "&bbox=" + bbox;

		
		var key = zoom + '_' + x + '_' + y;
		var self = this;
		L.Util.ajaxGrid(url, function (data) {
			self._cache[key] = data;
		});
	},

	_utfDecode: function (c) {
		if (c >= 93) {
			c--;
		}
		if (c >= 35) {
			c--;
		}
		return c - 32;
	},
	openPopUp: function(data){
		
//		jQuery('#bt_info_geojsonvt_close').on('click', function (e) {
////			jQuery('#info_geojsonvt .div_popup_visor').html('');
//			jQuery('#info_geojsonvt').hide();
//		});
		
		var html ='';
		html+='<div class="popup_pres">';
		$.each( data, function( key, value ) {
			if(value!=undefined && value!=null && value != " "){
				html+='<div class="popup_data_row">';
				
				
					
					if(key.indexOf("ANY_ANTIC")!=-1) key = "ANY CONSTRUCCI&Oacute; LOCAL PRINCIPAL";
					else if(key.indexOf("TIPOLOGIA4")!=-1) key = "TIPOLOGIA";
					
					
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+value+'</div>';
				html+= '</div>';
			}
		});
		
		html+= '</div>';
		
		jQuery('#info_utfgrid .div_popup').html(html);
		jQuery('#info_utfgrid').css("border", "none");
		jQuery('#info_utfgrid').show();		
		
	}
	
});


L.utfGrid = function (url, options) {
	return new L.UtfGrid(url, options);
};


}(this));

// Panoramio plugin for Leaflet
// https://github.com/shurshur/Leaflet.Panoramio

L.Panoramio = L.FeatureGroup.extend({
	options: {
		maxLoad: 100, // max photos loaded in one request (should be less or equal 100)
		maxTotal: 300 // max total photos
	},

	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this);
		L.Util.setOptions(this, options);
	},

	onAdd: function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;
		this._update('map');
		map.on('moveend', this._update, this);
		this.fire('add');
	},

	onRemove: function(map) {
		map.off('moveend', this._update, this);
		this.eachLayer(map.removeLayer, map);
		this.fire('remove');
	},

	_load: function(data) {
		for (var i = 0; i < data.photos.length; i++) {
			var p = data.photos[i];
			var ico = new L.Icon({
				iconUrl: 'http://www.panoramio.com/img/panoramio-marker.png',
				shadowUrl: null,
				iconAnchor: [9,9],
				popupAnchor: [0,-10]
			});
			var m = new L.Marker([p.latitude,p.longitude], {icon: ico});
			m.bindPopup('<img src="http://www.panoramio.com/img/glass/components/logo_bar/panoramio.png"><br/>'+p.photo_title+'<br/><a id="'+p.photo_id+'" title="'+p.photo_title+'" rel="pano" href="'+p.photo_url+'" target="_new"><img src="'+p.photo_file_url +'" alt="'+p.photo_title+'" width="167"/></a><br/>&copy;&nbsp;<a href="'+p.owner_url+'" target="_new">'+p.owner_name+'</a>, '+p.upload_date);
			this.fire('addlayer', {
				layer: m
			});
			this.addLayer(m);
		}
		var ks = [];
		for(var key in this._layers)
			ks.push(key);
		for(var i = 0; i < ks.length-this.options.maxTotal; i++)
			this.removeLayer(this._layers[ks[i]]);
		//this.fire("loaded");
	},

	_update: function() {
		var zoom = this._map.getZoom();
		var bounds = this._map.getBounds();
		var minll = bounds.getSouthWest();
		var maxll = bounds.getNorthEast();
  		if(this._zoom && this._bbox)
    			if(this._zoom == zoom && minll.lng >= this._bbox[0] && minll.lat >= this._bbox[1] && maxll.lng <= this._bbox[2] && maxll.lat <= this._bbox[3])
      				return;
  		var bbox = [];
  		bbox[0] = minll.lng;
  		bbox[1] = minll.lat;
  		bbox[2] = maxll.lng;
  		bbox[3] = maxll.lat;
		this._bbox = bbox;
		this._zoom = zoom;
		var _this = this;
		var cbid = '_leaflet_panoramio';
		window[cbid] = function (json) {
			_this.json = json;
			window[cbid] = undefined;
			var e = document.getElementById(cbid);
			e.parentNode.removeChild(e);
			_this._load(json);
		};
		var url = 'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to='+this.options.maxLoad+'&minx='+
		  minll.lng+'&miny='+minll.lat+'&maxx='+maxll.lng+'&maxy='+maxll.lat+'&size=small&mapfilter=true&callback='+cbid;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.id = cbid;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

});

// Panoramio plugin for Leaflet
// https://github.com/shurshur/Leaflet.Panoramio

L.Panoramio.custom = L.Panoramio.extend({

	_load: function(data) {
		for (var i = 0; i < data.photos.length; i++) {
			var p = data.photos[i];
			var ico = new L.Icon({
				iconUrl: p.photo_file_url,//'http://www.panoramio.com/img/panoramio-marker.png',
				shadowUrl: null,
				iconAnchor: [9,9],
				popupAnchor: [0,-10],
				className: 'photo-panoramio'
			});
			var m = new L.Marker([p.latitude,p.longitude], {icon: ico});
			m.bindPopup('<img src="http://www.panoramio.com/img/glass/components/logo_bar/panoramio.png"><br/>'+p.photo_title+'<br/><a id="'+p.photo_id+'" title="'+p.photo_title+'" rel="pano" href="'+p.photo_url+'" target="_new"><img src="'+p.photo_file_url +'" alt="'+p.photo_title+'" width="167"/></a><br/>&copy;&nbsp;<a href="'+p.owner_url+'" target="_new">'+p.owner_name+'</a>, '+p.upload_date);
			this.fire('addlayer', {
				layer: m
			});
			this.addLayer(m);
		}
		var ks = [];
		for(var key in this._layers)
			ks.push(key);
		for(var i = 0; i < ks.length-this.options.maxTotal; i++)
			this.removeLayer(this._layers[ks[i]]);
		this.fire("loaded");
	},

	_update: function() {
		var zoom = this._map.getZoom();
		var bounds = this._map.getBounds();
		var minll = bounds.getSouthWest();
		var maxll = bounds.getNorthEast();
  		/*if(this._zoom && this._bbox)
    			if(this._zoom == zoom && minll.lng >= this._bbox[0] && minll.lat >= this._bbox[1] && maxll.lng <= this._bbox[2] && maxll.lat <= this._bbox[3])
      				return;*/
		
		//Abans de recarregar elimino tots els markers
		this.clearLayers();  		
		
		var bbox = [];
  		bbox[0] = minll.lng;
  		bbox[1] = minll.lat;
  		bbox[2] = maxll.lng;
  		bbox[3] = maxll.lat;
  		
		this._bbox = bbox;
		this._zoom = zoom;
		var _this = this;
		var cbid = '_leaflet_panoramio';
		window[cbid] = function (json) {
			_this.json = json;
			window[cbid] = undefined;
			var e = document.getElementById(cbid);
			e.parentNode.removeChild(e);
			_this._load(json);
		};
		
		var url = 'http://www.panoramio.com/map/get_panoramas.php?order=upload_date&set=public&from=0&to='+this.options.maxLoad+'&minx='+
		  minll.lng+'&miny='+minll.lat+'&maxx='+maxll.lng+'&maxy='+maxll.lat+'&size=small&mapfilter=true&callback='+cbid;
		
		var boundsICGC = L.latLngBounds(L.latLng(41.368060902971166, 2.1521562337875366), 
					 L.latLng(41.37156735542552, 2.158936858177185));
		 
		if(boundsICGC.contains(bounds)){
			console.info("geostarters!");
			var url = 'http://www.panoramio.com/map/get_panoramas.php?order=upload_date&set=8024775&from=0&to='+this.options.maxLoad+'&minx='+
			  minll.lng+'&miny='+minll.lat+'&maxx='+maxll.lng+'&maxy='+maxll.lat+'&size=medium&mapfilter=true&callback='+cbid;			
		}
		//var url = 'http://api.geonames.org/wikipediaBoundingBox?north=43.25320494908846&south=39.554883059924016&east=4.6142578125&west=-2.3291015625&username=geostarters&callback=_leaflet_panoramio';
		
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.id = cbid;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

});

/*
	Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.label
	http://leafletjs.com
	https://github.com/jacobtoye
*/
(function (window, document, undefined) {
var L = window.L;/*
 * Leaflet.label assumes that you have already included the Leaflet library.
 */

L.labelVersion = '0.2.2-dev';

L.Label = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		className: '',
		clickable: false,
		direction: 'right',
		noHide: false,
		offset: [12, -15], // 6 (width of the label triangle) + 6 (padding)
		opacity: 1,
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		this._pane = this.options.pane ? map._panes[this.options.pane] :
			this._source instanceof L.Marker ? map._panes.markerPane : map._panes.popupPane;

		if (!this._container) {
			this._initLayout();
		}

		this._pane.appendChild(this._container);

		this._initInteraction();

		this._update();

		this.setOpacity(this.options.opacity);

		map
			.on('moveend', this._onMoveEnd, this)
			.on('viewreset', this._onViewReset, this);

		if (this._animated) {
			map.on('zoomanim', this._zoomAnimation, this);
		}

		if (L.Browser.touch && !this.options.noHide) {
			L.DomEvent.on(this._container, 'click', this.close, this);
			map.on('click', this.close, this);
		}
	},

	onRemove: function (map) {
		this._pane.removeChild(this._container);

		map.off({
			zoomanim: this._zoomAnimation,
			moveend: this._onMoveEnd,
			viewreset: this._onViewReset
		}, this);

		this._removeInteraction();

		this._map = null;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
		}
		return this;
	},

	setContent: function (content) {
		// Backup previous content and store new content
		this._previousContent = this._content;
		this._content = content;

		this._updateContent();

		return this;
	},

	close: function () {
		var map = this._map;

		if (map) {
			if (L.Browser.touch && !this.options.noHide) {
				L.DomEvent.off(this._container, 'click', this.close);
				map.off('click', this.close, this);
			}

			map.removeLayer(this);
		}
	},

	updateZIndex: function (zIndex) {
		this._zIndex = zIndex;

		if (this._container && this._zIndex) {
			this._container.style.zIndex = zIndex;
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._container) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	_initLayout: function () {
		this._container = L.DomUtil.create('div', 'leaflet-label ' + this.options.className + ' leaflet-zoom-animated');
		this.updateZIndex(this._zIndex);
	},

	_update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updatePosition();

		this._container.style.visibility = '';
	},

	_updateContent: function () {
		if (!this._content || !this._map || this._prevContent === this._content) {
			return;
		}

		if (typeof this._content === 'string') {
			this._container.innerHTML = this._content;

			this._prevContent = this._content;

			this._labelWidth = this._container.offsetWidth;
			this._labelHeight = this._container.offsetHeight;
		}
	},

	_updatePosition: function () {
		var pos = this._map.latLngToLayerPoint(this._latlng);

		this._setPosition(pos);
	},

	_setPosition: function (pos) {
		var map = this._map,
			container = this._container,
			centerPoint = map.latLngToContainerPoint(map.getCenter()),
			labelPoint = map.layerPointToContainerPoint(pos),
			direction = this.options.direction,
			labelWidth = this._labelWidth,
			labelHeight = this._labelHeight,
			offset = L.point(this.options.offset);

		// position to the right (right or auto & needs to)
		if (direction === 'center') {
				L.DomUtil.addClass(container, 'leaflet-label-center');
				L.DomUtil.removeClass(container, 'leaflet-label-left');
				L.DomUtil.removeClass(container, 'leaflet-label-right');
				pos = pos.add(L.point(-offset.x - (labelWidth / 2), offset.y));
		}
		else if (direction === 'right' || direction === 'auto' && labelPoint.x < centerPoint.x) {
			L.DomUtil.addClass(container, 'leaflet-label-right');
			L.DomUtil.removeClass(container, 'leaflet-label-left');

			pos = pos.add(offset);
		} else if (direction === 'left') { // position to the left
			L.DomUtil.addClass(container, 'leaflet-label-left');
			L.DomUtil.removeClass(container, 'leaflet-label-right');

			pos = pos.add(L.point(-offset.x - labelWidth, offset.y));
		} else { // position to the left
			L.DomUtil.removeClass(container, 'leaflet-label-left');
			L.DomUtil.removeClass(container, 'leaflet-label-right');
			pos = pos.add(L.point(-offset.x - (labelWidth / 2), labelHeight));
			
			
		}
		//console.debug(pos);
		L.DomUtil.setPosition(container, pos);
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPosition(pos);
	},

	_onMoveEnd: function () {
		if (!this._animated || this.options.direction === 'auto') {
			this._updatePosition();
		}
	},

	_onViewReset: function (e) {
		/* if map resets hard, we must update the label */
		if (e && e.hard) {
			this._update();
		}
	},

	_initInteraction: function () {
		if (!this.options.clickable) { return; }

		var container = this._container,
			events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(container, 'leaflet-clickable');
		L.DomEvent.on(container, 'click', this._onMouseClick, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(container, events[i], this._fireMouseEvent, this);
		}
	},

	_removeInteraction: function () {
		if (!this.options.clickable) { return; }

		var container = this._container,
			events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.removeClass(container, 'leaflet-clickable');
		L.DomEvent.off(container, 'click', this._onMouseClick, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.off(container, events[i], this._fireMouseEvent, this);
		}
	},

	_onMouseClick: function (e) {
		this._source.openPopup();
		 e.stopPropagation();
		  e.preventDefault();
		if (this.hasEventListeners(e.type)) {
			L.DomEvent.stopPropagation(e);
		}
		
		
       	 
		this.fire(e.type, {
			originalEvent: e
		});
	},

	_fireMouseEvent: function (e) {
		this.fire(e.type, {
			originalEvent: e
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	}
});


// This object is a mixin for L.Marker and L.CircleMarker. We declare it here as both need to include the contents.
L.BaseMarkerMethods = {
	showLabel: function () {
		if (this.label && this._map) {
			this.label.setLatLng(this._latlng);
			this._map.showLabel(this.label);
		}

		return this;
	},

	hideLabel: function () {
		if (this.label) {
			this.label.close();
		}
		return this;
	},

	setLabelNoHide: function (noHide) {
		if (this._labelNoHide === noHide) {
			return;
		}

		this._labelNoHide = noHide;

		if (noHide) {
			this._removeLabelRevealHandlers();
			this.showLabel();
		} else {
			this._addLabelRevealHandlers();
			this.hideLabel();
		}
	},

	bindLabel: function (content, options) {
		var labelAnchor = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor,
			anchor = L.point(labelAnchor) || L.point(0, 0);

		anchor = anchor.add(L.Label.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.Util.extend({offset: anchor}, options);

		this._labelNoHide = options.noHide;

		if (!this.label) {
			if (!this._labelNoHide) {
				this._addLabelRevealHandlers();
			}

			this
				.on('remove', this.hideLabel, this)
				.on('move', this._moveLabel, this)
				.on('add', this._onMarkerAdd, this);

			this._hasLabelHandlers = true;
		}

		this.label = new L.Label(options, this)
			.setContent(content);

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this.hideLabel();

			this.label = null;

			if (this._hasLabelHandlers) {
				if (!this._labelNoHide) {
					this._removeLabelRevealHandlers();
				}

				this
					.off('remove', this.hideLabel, this)
					.off('move', this._moveLabel, this)
					.off('add', this._onMarkerAdd, this);
			}

			this._hasLabelHandlers = false;
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	getLabel: function () {
		return this.label;
	},

	_onMarkerAdd: function () {
		if (this._labelNoHide) {
			this.showLabel();
		}
	},

	_addLabelRevealHandlers: function () {
		this
			.on('mouseover', this.showLabel, this)
			.on('mouseout', this.hideLabel, this);

		if (L.Browser.touch) {
			this.on('click', this.showLabel, this);
		}
	},

	_removeLabelRevealHandlers: function () {
		this
			.off('mouseover', this.showLabel, this)
			.off('mouseout', this.hideLabel, this);

		if (L.Browser.touch) {
			this.off('click', this.showLabel, this);
		}
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	}
};

// Add in an option to icon that is used to set where the label anchor is
L.Icon.Default.mergeOptions({
	labelAnchor: new L.Point(9, -20)
});

// Have to do this since Leaflet is loaded before this plugin and initializes
// L.Marker.options.icon therefore missing our mixin above.
L.Marker.mergeOptions({
	icon: new L.Icon.Default()
});

L.Marker.include(L.BaseMarkerMethods);
L.Marker.include({
	_originalUpdateZIndex: L.Marker.prototype._updateZIndex,

	_updateZIndex: function (offset) {
		var zIndex = this._zIndex + offset;

		this._originalUpdateZIndex(offset);

		if (this.label) {
			this.label.updateZIndex(zIndex);
		}
	},

	_originalSetOpacity: L.Marker.prototype.setOpacity,

	setOpacity: function (opacity, labelHasSemiTransparency) {
		this.options.labelHasSemiTransparency = labelHasSemiTransparency;

		this._originalSetOpacity(opacity);
	},

	_originalUpdateOpacity: L.Marker.prototype._updateOpacity,

	_updateOpacity: function () {
		var absoluteOpacity = this.options.opacity === 0 ? 0 : 1;

		this._originalUpdateOpacity();

		/*if (this.label) {
			this.label.setOpacity(this.options.labelHasSemiTransparency ? this.options.opacity : absoluteOpacity);
		}*/
	},

	_originalSetLatLng: L.Marker.prototype.setLatLng,

	setLatLng: function (latlng) {
		if (this.label && !this._labelNoHide) {
			this.hideLabel();
		}

		return this._originalSetLatLng(latlng);
	}
});

// Add in an option to icon that is used to set where the label anchor is
L.CircleMarker.mergeOptions({
	labelAnchor: new L.Point(0, 0)
});


L.CircleMarker.include(L.BaseMarkerMethods);

L.Path.include({
	bindLabel: function (content, options) {
		if (!this.label || this.label.options !== options) {
			this.label = new L.Label(options, this);
		}

		this.label.setContent(content);

		if (!this._showLabelAdded) {
			this
				.on('mouseover', this._showLabel, this)
				.on('mousemove', this._moveLabel, this)
				.on('mouseout remove', this._hideLabel, this);

			if (L.Browser.touch) {
				this.on('click', this._showLabel, this);
			}
			this._showLabelAdded = true;
		}

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this._hideLabel();
			this.label = null;
			this._showLabelAdded = false;
			this
				.off('mouseover', this._showLabel, this)
				.off('mousemove', this._moveLabel, this)
				.off('mouseout remove', this._hideLabel, this);
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	_showLabel: function (e) {
		this.label.setLatLng(e.latlng);
		this._map.showLabel(this.label);
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	},

	_hideLabel: function () {
		this.label.close();
	}
});

L.Map.include({
	showLabel: function (label) {
		return this.addLayer(label);
	}
});

L.FeatureGroup.include({
	// TODO: remove this when AOP is supported in Leaflet, need this as we cannot put code in removeLayer()
	clearLayers: function () {
		this.unbindLabel();
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	bindLabel: function (content, options) {
		return this.invoke('bindLabel', content, options);
	},

	unbindLabel: function () {
		return this.invoke('unbindLabel');
	},

	updateLabelContent: function (content) {
		this.invoke('updateLabelContent', content);
	}
});



}(window, document));
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geojsonvt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = clip;

/* clip features between two axis-parallel lines:
 *     |        |
 *  ___|___     |     /
 * /   |   \____|____/
 *     |        |
 */

function clip(features, scale, k1, k2, axis, intersect) {

    k1 /= scale;
    k2 /= scale;

    var clipped = [];

    for (var i = 0; i < features.length; i++) {

        var feature = features[i],
            geometry = feature.geometry,
            type = feature.type,
            min, max;

        if (feature.min) {
            min = feature.min[axis];
            max = feature.max[axis];

            if (min >= k1 && max <= k2) { // trivial accept
                clipped.push(feature);
                continue;
            } else if (min > k2 || max < k1) continue; // trivial reject
        }

        var slices = type === 1 ?
                clipPoints(geometry, k1, k2, axis) :
                clipGeometry(geometry, k1, k2, axis, intersect, type === 3);

        if (slices.length) {
            // if a feature got clipped, it will likely get clipped on the next zoom level as well,
            // so there's no need to recalculate bboxes
            clipped.push({
                geometry: slices,
                type: type,
                tags: features[i].tags || null
            });
        }
    }

    return clipped.length ? clipped : null;
}

function clipPoints(geometry, k1, k2, axis) {
    var slice = [];

    for (var i = 0; i < geometry.length; i++) {
        var a = geometry[i],
            ak = a[axis];

        if (ak >= k1 && ak <= k2) slice.push(a);
    }
    return slice;
}

function clipGeometry(geometry, k1, k2, axis, intersect, closed) {

    var slices = [];

    for (var i = 0; i < geometry.length; i++) {

        var ak = 0,
            bk = 0,
            b = null,
            points = geometry[i],
            area = points.area,
            dist = points.dist,
            len = points.length,
            a, j;

        var slice = [];

        for (j = 0; j < len - 1; j++) {
            a = b || points[j];
            b = points[j + 1];
            ak = bk || a[axis];
            bk = b[axis];

            if (ak < k1) {

                if ((bk > k2)) { // ---|-----|-->
                    slice.push(intersect(a, b, k1), intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk >= k1) slice.push(intersect(a, b, k1)); // ---|-->  |

            } else if (ak > k2) {

                if ((bk < k1)) { // <--|-----|---
                    slice.push(intersect(a, b, k2), intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk <= k2) slice.push(intersect(a, b, k2)); // |  <--|---

            } else {

                slice.push(a);

                if (bk < k1) { // <--|---  |
                    slice.push(intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk > k2) { // |  ---|-->
                    slice.push(intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);
                }
                // | --> |
            }
        }

        // add the last point
        a = points[len - 1];
        ak = a[axis];
        if (ak >= k1 && ak <= k2) slice.push(a);

        // close the polygon if its endpoints are not the same after clipping
        if (closed && slice[0] !== slice[slice.length - 1]) slice.push(slice[0]);

        // add the final slice
        newSlice(slices, slice, area, dist);
    }

    return slices;
}

function newSlice(slices, slice, area, dist) {
    if (slice.length) {
        // we don't recalculate the area/length of the unclipped geometry because the case where it goes
        // below the visibility threshold as a result of clipping is rare, so we avoid doing unnecessary work
        slice.area = area;
        slice.dist = dist;

        slices.push(slice);
    }
    return [];
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = convert;

var simplify = require('./simplify');

// converts GeoJSON feature into an intermediate projected JSON vector format with simplification data

function convert(data, tolerance) {
    var features = [];

    if (data.type === 'FeatureCollection') {
        for (var i = 0; i < data.features.length; i++) {
            convertFeature(features, data.features[i], tolerance);
        }
    } else if (data.type === 'Feature') {
        convertFeature(features, data, tolerance);

    } else {
        // single geometry or a geometry collection
        convertFeature(features, {geometry: data}, tolerance);
    }
    return features;
}

function convertFeature(features, feature, tolerance) {
    var geom = feature.geometry,
        type = geom.type,
        coords = geom.coordinates,
        tags = feature.properties,
        i, j, rings;

    if (type === 'Point') {
        features.push(create(tags, 1, [projectPoint(coords)]));

    } else if (type === 'MultiPoint') {
        features.push(create(tags, 1, project(coords)));

    } else if (type === 'LineString') {
        features.push(create(tags, 2, [project(coords, tolerance)]));

    } else if (type === 'MultiLineString' || type === 'Polygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            rings.push(project(coords[i], tolerance));
        }
        features.push(create(tags, type === 'Polygon' ? 3 : 2, rings));

    } else if (type === 'MultiPolygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                rings.push(project(coords[i][j], tolerance));
            }
        }
        features.push(create(tags, 3, rings));

    } else if (type === 'GeometryCollection') {
        for (i = 0; i < geom.geometries.length; i++) {
            convertFeature(features, {
                geometry: geom.geometries[i],
                properties: tags
            }, tolerance);
        }

    } else {
        console.warn('Unsupported GeoJSON type: ' + geom.type);
    }
}

function create(tags, type, geometry) {
    var feature = {
        geometry: geometry,
        type: type,
        tags: tags || null,
        min: [1, 1], // initial bbox values;
        max: [0, 0]  // note that all coords are in [0..1] range
    };
    calcBBox(feature);
    return feature;
}

function project(lonlats, tolerance) {
    var projected = [];
    for (var i = 0; i < lonlats.length; i++) {
        projected.push(projectPoint(lonlats[i]));
    }
    if (tolerance) {
        simplify(projected, tolerance);
        calcSize(projected);
    }
    return projected;
}

function projectPoint(p) {
    var sin = Math.sin(p[1] * Math.PI / 180),
        x = (p[0] / 360 + 0.5),
        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);
    return [x, y, 0];
}

// calculate area and length of the poly
function calcSize(points) {
    var area = 0,
        dist = 0;

    for (var i = 0, a, b; i < points.length - 1; i++) {
        a = b || points[i];
        b = points[i + 1];

        area += a[0] * b[1] - b[0] * a[1];

        // use Manhattan distance instead of Euclidian one to avoid expensive square root computation
        dist += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }
    points.area = Math.abs(area / 2);
    points.dist = dist;
}

// calculate the feature bounding box for faster clipping later
function calcBBox(feature) {
    var geometry = feature.geometry,
        min = feature.min,
        max = feature.max;

    if (feature.type === 1) calcRingBBox(min, max, geometry);
    else for (var i = 0; i < geometry.length; i++) calcRingBBox(min, max, geometry[i]);

    return feature;
}

function calcRingBBox(min, max, points) {
    for (var i = 0, p; i < points.length; i++) {
        p = points[i];
        min[0] = Math.min(p[0], min[0]);
        max[0] = Math.max(p[0], max[0]);
        min[1] = Math.min(p[1], min[1]);
        max[1] = Math.max(p[1], max[1]);
    }
}

},{"./simplify":4}],3:[function(require,module,exports){
'use strict';

module.exports = geojsonvt;

var convert = require('./convert'), // GeoJSON conversion and preprocessing
    clip = require('./clip'),       // stripe clipping algorithm
    createTile = require('./tile'); // final simplified tile generation


function geojsonvt(data, options) {
    return new GeoJSONVT(data, options);
}

function GeoJSONVT(data, options) {
    options = this.options = extend(Object.create(this.options), options);

    var debug = options.debug;

    if (debug) console.time('preprocess data');

    var z2 = 1 << options.maxZoom, // 2^z
        features = convert(data, options.tolerance / (z2 * options.extent));

    this.tiles = {};

    if (debug) {
        console.timeEnd('preprocess data');
        console.log('index: maxZoom: %d, maxPoints: %d', options.indexMaxZoom, options.indexMaxPoints);
        console.time('generate tiles');
        this.stats = {};
        this.total = 0;
    }

    // start slicing from the top tile down
    this.splitTile(features, 0, 0, 0);

    if (debug) {
        console.log('features: %d, points: %d', this.tiles[0].numFeatures, this.tiles[0].numPoints);
        console.timeEnd('generate tiles');
        console.log('tiles generated:', this.total, JSON.stringify(this.stats));
    }
}

GeoJSONVT.prototype.options = {
    maxZoom: 14,            // max zoom to preserve detail on
    indexMaxZoom: 5,        // max zoom in the tile index
    indexMaxPoints: 100000, // max number of points per tile in the tile index
    tolerance: 3,           // simplification tolerance (higher means simpler)
    extent: 4096,           // tile extent
    buffer: 64,             // tile buffer on each side
    debug: 0                // logging level (0, 1 or 2)
};

GeoJSONVT.prototype.splitTile = function (features, z, x, y, cz, cx, cy) {

    var stack = [features, z, x, y],
        options = this.options,
        debug = options.debug,
        extent = options.extent,
        buffer = options.buffer;

    // avoid recursion by using a processing queue
    while (stack.length) {
        features = stack.shift();
        z = stack.shift();
        x = stack.shift();
        y = stack.shift();

        var z2 = 1 << z,
            id = toID(z, x, y),
            tile = this.tiles[id],
            tileTolerance = z === options.maxZoom ? 0 : options.tolerance / (z2 * extent);

        if (!tile) {
            if (debug > 1) console.time('creation');

            tile = this.tiles[id] = createTile(features, z2, x, y, tileTolerance, z === options.maxZoom);

            if (debug) {
                if (debug > 1) {
                    console.log('tile z%d-%d-%d (features: %d, points: %d, simplified: %d)',
                        z, x, y, tile.numFeatures, tile.numPoints, tile.numSimplified);
                    console.timeEnd('creation');
                }
                var key = 'z' + z;
                this.stats[key] = (this.stats[key] || 0) + 1;
                this.total++;
            }
        }

        // save reference to original geometry in tile so that we can drill down later if we stop now
        tile.source = features;

        // stop tiling if the tile is degenerate
        if (isClippedSquare(tile.features, extent, buffer)) continue;

        // if it's the first-pass tiling
        if (!cz) {
            // stop tiling if we reached max zoom, or if the tile is too simple
            if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;

        // if a drilldown to a specific tile
        } else {
            // stop tiling if we reached base zoom or our target tile zoom
            if (z === options.maxZoom || z === cz) continue;

            // stop tiling if it's not an ancestor of the target tile
            var m = 1 << (cz - z);
            if (x !== Math.floor(cx / m) && y !== Math.floor(cy / m)) continue;
        }

        // if we slice further down, no need to keep source geometry
        tile.source = null;

        if (debug > 1) console.time('clipping');

        // values we'll use for clipping
        var k1 = 0.5 * buffer / extent,
            k2 = 0.5 - k1,
            k3 = 0.5 + k1,
            k4 = 1 + k1,
            tl, bl, tr, br, left, right;

        tl = bl = tr = br = null;

        left  = clip(features, z2, x - k1, x + k3, 0, intersectX);
        right = clip(features, z2, x + k2, x + k4, 0, intersectX);

        if (left) {
            tl = clip(left, z2, y - k1, y + k3, 1, intersectY);
            bl = clip(left, z2, y + k2, y + k4, 1, intersectY);
        }

        if (right) {
            tr = clip(right, z2, y - k1, y + k3, 1, intersectY);
            br = clip(right, z2, y + k2, y + k4, 1, intersectY);
        }

        if (debug > 1) console.timeEnd('clipping');

        if (tl) stack.push(tl, z + 1, x * 2,     y * 2);
        if (bl) stack.push(bl, z + 1, x * 2,     y * 2 + 1);
        if (tr) stack.push(tr, z + 1, x * 2 + 1, y * 2);
        if (br) stack.push(br, z + 1, x * 2 + 1, y * 2 + 1);
    }
};

GeoJSONVT.prototype.getTile = function (z, x, y) {
    var options = this.options,
        extent = options.extent,
        debug = options.debug;

    var id = toID(z, x, y);
    if (this.tiles[id]) return transformTile(this.tiles[id], extent);

    if (debug > 1) console.log('drilling down to z%d-%d-%d', z, x, y);

    var z0 = z,
        x0 = x,
        y0 = y,
        parent;

    while (!parent && z0 > 0) {
        z0--;
        x0 = Math.floor(x0 / 2);
        y0 = Math.floor(y0 / 2);
        parent = this.tiles[toID(z0, x0, y0)];
    }

    if (debug > 1) console.log('found parent tile z%d-%d-%d', z0, x0, y0);

    // if we found a parent tile containing the original geometry, we can drill down from it
    if (parent.source) {
        if (isClippedSquare(parent.features, options.extent, options.buffer)) return transformTile(parent, extent);

        if (debug > 1) console.time('drilling down');
        this.splitTile(parent.source, z0, x0, y0, z, x, y);
        if (debug > 1) console.timeEnd('drilling down');
    }

    return transformTile(this.tiles[id], extent);
};

function transformTile(tile, extent) {
    if (!tile || tile.transformed) return tile;

    var z2 = tile.z2,
        tx = tile.x,
        ty = tile.y,
        i, j, k;

    for (i = 0; i < tile.features.length; i++) {
        var feature = tile.features[i],
            geom = feature.geometry,
            type = feature.type;

        if (type === 1) {
            for (j = 0; j < geom.length; j++) geom[j] = transformPoint(geom[j], extent, z2, tx, ty);

        } else {
            for (j = 0; j < geom.length; j++) {
                var ring = geom[j];
                for (k = 0; k < ring.length; k++) ring[k] = transformPoint(ring[k], extent, z2, tx, ty);
            }
        }
    }

    tile.transformed = true;

    return tile;
}

function transformPoint(p, extent, z2, tx, ty) {
    var x = Math.round(extent * (p[0] * z2 - tx)),
        y = Math.round(extent * (p[1] * z2 - ty));
    return [x, y];
}

// checks whether a tile is a whole-area fill after clipping; if it is, there's no sense slicing it further
function isClippedSquare(features, extent, buffer) {
    if (features.length !== 1) return false;

    var feature = features[0];
    if (feature.type !== 3 || feature.geometry.length > 1) return false;

    for (var i = 0; i < feature.geometry[0].length; i++) {
        var p = feature.geometry[0][i];
        if ((p[0] !== -buffer && p[0] !== extent + buffer) ||
            (p[1] !== -buffer && p[1] !== extent + buffer)) return false;
    }
    return true;
}

function toID(z, x, y) {
    return (((1 << z) * y + x) * 32) + z;
}

function intersectX(a, b, x) {
    return [x, (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) + a[1], 1];
}
function intersectY(a, b, y) {
    return [(y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) + a[0], y, 1];
}

function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}

},{"./clip":1,"./convert":2,"./tile":5}],4:[function(require,module,exports){
'use strict';

module.exports = simplify;

// calculate simplification data using optimized Douglas-Peucker algorithm

function simplify(points, tolerance) {

    var sqTolerance = tolerance * tolerance,
        len = points.length,
        first = 0,
        last = len - 1,
        stack = [],
        i, maxSqDist, sqDist, index;

    // always retain the endpoints (1 is the max value)
    points[first][2] = 1;
    points[last][2] = 1;

    // avoid recursion by using a stack
    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            points[index][2] = maxSqDist; // save the point importance in squared pixels as a z coordinate
            stack.push(first);
            stack.push(index);
            first = index;

        } else {
            last = stack.pop();
            first = stack.pop();
        }
    }
}

// square distance from a point to a segment
function getSqSegDist(p, a, b) {

    var x = a[0], y = a[1],
        bx = b[0], by = b[1],
        px = p[0], py = p[1],
        dx = bx - x,
        dy = by - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = bx;
            y = by;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

},{}],5:[function(require,module,exports){
'use strict';

module.exports = createTile;

function createTile(features, z2, tx, ty, tolerance, noSimplify) {
    var tile = {
        features: [],
        numPoints: 0,
        numSimplified: 0,
        numFeatures: 0,
        source: null,
        x: tx,
        y: ty,
        z2: z2,
        transformed: false
    };
    for (var i = 0; i < features.length; i++) {
        tile.numFeatures++;
        addFeature(tile, features[i], tolerance, noSimplify);
    }
    return tile;
}

function addFeature(tile, feature, tolerance, noSimplify) {

    var geom = feature.geometry,
        type = feature.type,
        simplified = [],
        sqTolerance = tolerance * tolerance,
        i, j, ring, p;

    if (type === 1) {
        for (i = 0; i < geom.length; i++) {
            simplified.push(geom[i]);
            tile.numPoints++;
            tile.numSimplified++;
        }

    } else {

        // simplify and transform projected coordinates for tile geometry
        for (i = 0; i < geom.length; i++) {
            ring = geom[i];

            // filter out tiny polylines & polygons
            if (!noSimplify && ((type === 2 && ring.dist < tolerance) ||
                                (type === 3 && ring.area < sqTolerance))) {
                tile.numPoints += ring.length;
                continue;
            }

            var simplifiedRing = [];

            for (j = 0; j < ring.length; j++) {
                p = ring[j];
                // keep points with importance > tolerance
                if (noSimplify || p[2] > sqTolerance) {
                    simplifiedRing.push(p);
                    tile.numSimplified++;
                }
                tile.numPoints++;
            }

            simplified.push(simplifiedRing);
        }
    }

    if (simplified.length) {
        tile.features.push({
            geometry: simplified,
            type: type,
            tags: feature.tags || null
        });
    }
}

},{}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpcC5qcyIsInNyYy9jb252ZXJ0LmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NpbXBsaWZ5LmpzIiwic3JjL3RpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBjbGlwO1xuXG4vKiBjbGlwIGZlYXR1cmVzIGJldHdlZW4gdHdvIGF4aXMtcGFyYWxsZWwgbGluZXM6XG4gKiAgICAgfCAgICAgICAgfFxuICogIF9fX3xfX18gICAgIHwgICAgIC9cbiAqIC8gICB8ICAgXFxfX19ffF9fX18vXG4gKiAgICAgfCAgICAgICAgfFxuICovXG5cbmZ1bmN0aW9uIGNsaXAoZmVhdHVyZXMsIHNjYWxlLCBrMSwgazIsIGF4aXMsIGludGVyc2VjdCkge1xuXG4gICAgazEgLz0gc2NhbGU7XG4gICAgazIgLz0gc2NhbGU7XG5cbiAgICB2YXIgY2xpcHBlZCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIHZhciBmZWF0dXJlID0gZmVhdHVyZXNbaV0sXG4gICAgICAgICAgICBnZW9tZXRyeSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlLFxuICAgICAgICAgICAgbWluLCBtYXg7XG5cbiAgICAgICAgaWYgKGZlYXR1cmUubWluKSB7XG4gICAgICAgICAgICBtaW4gPSBmZWF0dXJlLm1pbltheGlzXTtcbiAgICAgICAgICAgIG1heCA9IGZlYXR1cmUubWF4W2F4aXNdO1xuXG4gICAgICAgICAgICBpZiAobWluID49IGsxICYmIG1heCA8PSBrMikgeyAvLyB0cml2aWFsIGFjY2VwdFxuICAgICAgICAgICAgICAgIGNsaXBwZWQucHVzaChmZWF0dXJlKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWluID4gazIgfHwgbWF4IDwgazEpIGNvbnRpbnVlOyAvLyB0cml2aWFsIHJlamVjdFxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNsaWNlcyA9IHR5cGUgPT09IDEgP1xuICAgICAgICAgICAgICAgIGNsaXBQb2ludHMoZ2VvbWV0cnksIGsxLCBrMiwgYXhpcykgOlxuICAgICAgICAgICAgICAgIGNsaXBHZW9tZXRyeShnZW9tZXRyeSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIHR5cGUgPT09IDMpO1xuXG4gICAgICAgIGlmIChzbGljZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBpZiBhIGZlYXR1cmUgZ290IGNsaXBwZWQsIGl0IHdpbGwgbGlrZWx5IGdldCBjbGlwcGVkIG9uIHRoZSBuZXh0IHpvb20gbGV2ZWwgYXMgd2VsbCxcbiAgICAgICAgICAgIC8vIHNvIHRoZXJlJ3Mgbm8gbmVlZCB0byByZWNhbGN1bGF0ZSBiYm94ZXNcbiAgICAgICAgICAgIGNsaXBwZWQucHVzaCh7XG4gICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHNsaWNlcyxcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgIHRhZ3M6IGZlYXR1cmVzW2ldLnRhZ3MgfHwgbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xpcHBlZC5sZW5ndGggPyBjbGlwcGVkIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gY2xpcFBvaW50cyhnZW9tZXRyeSwgazEsIGsyLCBheGlzKSB7XG4gICAgdmFyIHNsaWNlID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhID0gZ2VvbWV0cnlbaV0sXG4gICAgICAgICAgICBhayA9IGFbYXhpc107XG5cbiAgICAgICAgaWYgKGFrID49IGsxICYmIGFrIDw9IGsyKSBzbGljZS5wdXNoKGEpO1xuICAgIH1cbiAgICByZXR1cm4gc2xpY2U7XG59XG5cbmZ1bmN0aW9uIGNsaXBHZW9tZXRyeShnZW9tZXRyeSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIGNsb3NlZCkge1xuXG4gICAgdmFyIHNsaWNlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnZW9tZXRyeS5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIHZhciBhayA9IDAsXG4gICAgICAgICAgICBiayA9IDAsXG4gICAgICAgICAgICBiID0gbnVsbCxcbiAgICAgICAgICAgIHBvaW50cyA9IGdlb21ldHJ5W2ldLFxuICAgICAgICAgICAgYXJlYSA9IHBvaW50cy5hcmVhLFxuICAgICAgICAgICAgZGlzdCA9IHBvaW50cy5kaXN0LFxuICAgICAgICAgICAgbGVuID0gcG9pbnRzLmxlbmd0aCxcbiAgICAgICAgICAgIGEsIGo7XG5cbiAgICAgICAgdmFyIHNsaWNlID0gW107XG5cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGxlbiAtIDE7IGorKykge1xuICAgICAgICAgICAgYSA9IGIgfHwgcG9pbnRzW2pdO1xuICAgICAgICAgICAgYiA9IHBvaW50c1tqICsgMV07XG4gICAgICAgICAgICBhayA9IGJrIHx8IGFbYXhpc107XG4gICAgICAgICAgICBiayA9IGJbYXhpc107XG5cbiAgICAgICAgICAgIGlmIChhayA8IGsxKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKGJrID4gazIpKSB7IC8vIC0tLXwtLS0tLXwtLT5cbiAgICAgICAgICAgICAgICAgICAgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazEpLCBpbnRlcnNlY3QoYSwgYiwgazIpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9zZWQpIHNsaWNlID0gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrID49IGsxKSBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMSkpOyAvLyAtLS18LS0+ICB8XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWsgPiBrMikge1xuXG4gICAgICAgICAgICAgICAgaWYgKChiayA8IGsxKSkgeyAvLyA8LS18LS0tLS18LS0tXG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSwgaW50ZXJzZWN0KGEsIGIsIGsxKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiayA8PSBrMikgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazIpKTsgLy8gfCAgPC0tfC0tLVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgc2xpY2UucHVzaChhKTtcblxuICAgICAgICAgICAgICAgIGlmIChiayA8IGsxKSB7IC8vIDwtLXwtLS0gIHxcbiAgICAgICAgICAgICAgICAgICAgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9zZWQpIHNsaWNlID0gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrID4gazIpIHsgLy8gfCAgLS0tfC0tPlxuICAgICAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMikpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfCAtLT4gfFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSBsYXN0IHBvaW50XG4gICAgICAgIGEgPSBwb2ludHNbbGVuIC0gMV07XG4gICAgICAgIGFrID0gYVtheGlzXTtcbiAgICAgICAgaWYgKGFrID49IGsxICYmIGFrIDw9IGsyKSBzbGljZS5wdXNoKGEpO1xuXG4gICAgICAgIC8vIGNsb3NlIHRoZSBwb2x5Z29uIGlmIGl0cyBlbmRwb2ludHMgYXJlIG5vdCB0aGUgc2FtZSBhZnRlciBjbGlwcGluZ1xuICAgICAgICBpZiAoY2xvc2VkICYmIHNsaWNlWzBdICE9PSBzbGljZVtzbGljZS5sZW5ndGggLSAxXSkgc2xpY2UucHVzaChzbGljZVswXSk7XG5cbiAgICAgICAgLy8gYWRkIHRoZSBmaW5hbCBzbGljZVxuICAgICAgICBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2xpY2VzO1xufVxuXG5mdW5jdGlvbiBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KSB7XG4gICAgaWYgKHNsaWNlLmxlbmd0aCkge1xuICAgICAgICAvLyB3ZSBkb24ndCByZWNhbGN1bGF0ZSB0aGUgYXJlYS9sZW5ndGggb2YgdGhlIHVuY2xpcHBlZCBnZW9tZXRyeSBiZWNhdXNlIHRoZSBjYXNlIHdoZXJlIGl0IGdvZXNcbiAgICAgICAgLy8gYmVsb3cgdGhlIHZpc2liaWxpdHkgdGhyZXNob2xkIGFzIGEgcmVzdWx0IG9mIGNsaXBwaW5nIGlzIHJhcmUsIHNvIHdlIGF2b2lkIGRvaW5nIHVubmVjZXNzYXJ5IHdvcmtcbiAgICAgICAgc2xpY2UuYXJlYSA9IGFyZWE7XG4gICAgICAgIHNsaWNlLmRpc3QgPSBkaXN0O1xuXG4gICAgICAgIHNsaWNlcy5wdXNoKHNsaWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnQ7XG5cbnZhciBzaW1wbGlmeSA9IHJlcXVpcmUoJy4vc2ltcGxpZnknKTtcblxuLy8gY29udmVydHMgR2VvSlNPTiBmZWF0dXJlIGludG8gYW4gaW50ZXJtZWRpYXRlIHByb2plY3RlZCBKU09OIHZlY3RvciBmb3JtYXQgd2l0aCBzaW1wbGlmaWNhdGlvbiBkYXRhXG5cbmZ1bmN0aW9uIGNvbnZlcnQoZGF0YSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIGZlYXR1cmVzID0gW107XG5cbiAgICBpZiAoZGF0YS50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIGRhdGEuZmVhdHVyZXNbaV0sIHRvbGVyYW5jZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRhdGEudHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCBkYXRhLCB0b2xlcmFuY2UpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc2luZ2xlIGdlb21ldHJ5IG9yIGEgZ2VvbWV0cnkgY29sbGVjdGlvblxuICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywge2dlb21ldHJ5OiBkYXRhfSwgdG9sZXJhbmNlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywgZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIGdlb20gPSBmZWF0dXJlLmdlb21ldHJ5LFxuICAgICAgICB0eXBlID0gZ2VvbS50eXBlLFxuICAgICAgICBjb29yZHMgPSBnZW9tLmNvb3JkaW5hdGVzLFxuICAgICAgICB0YWdzID0gZmVhdHVyZS5wcm9wZXJ0aWVzLFxuICAgICAgICBpLCBqLCByaW5ncztcblxuICAgIGlmICh0eXBlID09PSAnUG9pbnQnKSB7XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDEsIFtwcm9qZWN0UG9pbnQoY29vcmRzKV0pKTtcblxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDEsIHByb2plY3QoY29vcmRzKSkpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnTGluZVN0cmluZycpIHtcbiAgICAgICAgZmVhdHVyZXMucHVzaChjcmVhdGUodGFncywgMiwgW3Byb2plY3QoY29vcmRzLCB0b2xlcmFuY2UpXSkpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlMaW5lU3RyaW5nJyB8fCB0eXBlID09PSAnUG9seWdvbicpIHtcbiAgICAgICAgcmluZ3MgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmluZ3MucHVzaChwcm9qZWN0KGNvb3Jkc1tpXSwgdG9sZXJhbmNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmVhdHVyZXMucHVzaChjcmVhdGUodGFncywgdHlwZSA9PT0gJ1BvbHlnb24nID8gMyA6IDIsIHJpbmdzKSk7XG5cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgIHJpbmdzID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICByaW5ncy5wdXNoKHByb2plY3QoY29vcmRzW2ldW2pdLCB0b2xlcmFuY2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZSh0YWdzLCAzLCByaW5ncykpO1xuXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnR2VvbWV0cnlDb2xsZWN0aW9uJykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ2VvbS5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywge1xuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBnZW9tLmdlb21ldHJpZXNbaV0sXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogdGFnc1xuICAgICAgICAgICAgfSwgdG9sZXJhbmNlKTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCBHZW9KU09OIHR5cGU6ICcgKyBnZW9tLnR5cGUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlKHRhZ3MsIHR5cGUsIGdlb21ldHJ5KSB7XG4gICAgdmFyIGZlYXR1cmUgPSB7XG4gICAgICAgIGdlb21ldHJ5OiBnZW9tZXRyeSxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgdGFnczogdGFncyB8fCBudWxsLFxuICAgICAgICBtaW46IFsxLCAxXSwgLy8gaW5pdGlhbCBiYm94IHZhbHVlcztcbiAgICAgICAgbWF4OiBbMCwgMF0gIC8vIG5vdGUgdGhhdCBhbGwgY29vcmRzIGFyZSBpbiBbMC4uMV0gcmFuZ2VcbiAgICB9O1xuICAgIGNhbGNCQm94KGZlYXR1cmUpO1xuICAgIHJldHVybiBmZWF0dXJlO1xufVxuXG5mdW5jdGlvbiBwcm9qZWN0KGxvbmxhdHMsIHRvbGVyYW5jZSkge1xuICAgIHZhciBwcm9qZWN0ZWQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvbmxhdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcHJvamVjdGVkLnB1c2gocHJvamVjdFBvaW50KGxvbmxhdHNbaV0pKTtcbiAgICB9XG4gICAgaWYgKHRvbGVyYW5jZSkge1xuICAgICAgICBzaW1wbGlmeShwcm9qZWN0ZWQsIHRvbGVyYW5jZSk7XG4gICAgICAgIGNhbGNTaXplKHByb2plY3RlZCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9qZWN0ZWQ7XG59XG5cbmZ1bmN0aW9uIHByb2plY3RQb2ludChwKSB7XG4gICAgdmFyIHNpbiA9IE1hdGguc2luKHBbMV0gKiBNYXRoLlBJIC8gMTgwKSxcbiAgICAgICAgeCA9IChwWzBdIC8gMzYwICsgMC41KSxcbiAgICAgICAgeSA9ICgwLjUgLSAwLjI1ICogTWF0aC5sb2coKDEgKyBzaW4pIC8gKDEgLSBzaW4pKSAvIE1hdGguUEkpO1xuICAgIHJldHVybiBbeCwgeSwgMF07XG59XG5cbi8vIGNhbGN1bGF0ZSBhcmVhIGFuZCBsZW5ndGggb2YgdGhlIHBvbHlcbmZ1bmN0aW9uIGNhbGNTaXplKHBvaW50cykge1xuICAgIHZhciBhcmVhID0gMCxcbiAgICAgICAgZGlzdCA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgYSwgYjsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgYSA9IGIgfHwgcG9pbnRzW2ldO1xuICAgICAgICBiID0gcG9pbnRzW2kgKyAxXTtcblxuICAgICAgICBhcmVhICs9IGFbMF0gKiBiWzFdIC0gYlswXSAqIGFbMV07XG5cbiAgICAgICAgLy8gdXNlIE1hbmhhdHRhbiBkaXN0YW5jZSBpbnN0ZWFkIG9mIEV1Y2xpZGlhbiBvbmUgdG8gYXZvaWQgZXhwZW5zaXZlIHNxdWFyZSByb290IGNvbXB1dGF0aW9uXG4gICAgICAgIGRpc3QgKz0gTWF0aC5hYnMoYlswXSAtIGFbMF0pICsgTWF0aC5hYnMoYlsxXSAtIGFbMV0pO1xuICAgIH1cbiAgICBwb2ludHMuYXJlYSA9IE1hdGguYWJzKGFyZWEgLyAyKTtcbiAgICBwb2ludHMuZGlzdCA9IGRpc3Q7XG59XG5cbi8vIGNhbGN1bGF0ZSB0aGUgZmVhdHVyZSBib3VuZGluZyBib3ggZm9yIGZhc3RlciBjbGlwcGluZyBsYXRlclxuZnVuY3Rpb24gY2FsY0JCb3goZmVhdHVyZSkge1xuICAgIHZhciBnZW9tZXRyeSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgIG1pbiA9IGZlYXR1cmUubWluLFxuICAgICAgICBtYXggPSBmZWF0dXJlLm1heDtcblxuICAgIGlmIChmZWF0dXJlLnR5cGUgPT09IDEpIGNhbGNSaW5nQkJveChtaW4sIG1heCwgZ2VvbWV0cnkpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IDA7IGkgPCBnZW9tZXRyeS5sZW5ndGg7IGkrKykgY2FsY1JpbmdCQm94KG1pbiwgbWF4LCBnZW9tZXRyeVtpXSk7XG5cbiAgICByZXR1cm4gZmVhdHVyZTtcbn1cblxuZnVuY3Rpb24gY2FsY1JpbmdCQm94KG1pbiwgbWF4LCBwb2ludHMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgcDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwID0gcG9pbnRzW2ldO1xuICAgICAgICBtaW5bMF0gPSBNYXRoLm1pbihwWzBdLCBtaW5bMF0pO1xuICAgICAgICBtYXhbMF0gPSBNYXRoLm1heChwWzBdLCBtYXhbMF0pO1xuICAgICAgICBtaW5bMV0gPSBNYXRoLm1pbihwWzFdLCBtaW5bMV0pO1xuICAgICAgICBtYXhbMV0gPSBNYXRoLm1heChwWzFdLCBtYXhbMV0pO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBnZW9qc29udnQ7XG5cbnZhciBjb252ZXJ0ID0gcmVxdWlyZSgnLi9jb252ZXJ0JyksIC8vIEdlb0pTT04gY29udmVyc2lvbiBhbmQgcHJlcHJvY2Vzc2luZ1xuICAgIGNsaXAgPSByZXF1aXJlKCcuL2NsaXAnKSwgICAgICAgLy8gc3RyaXBlIGNsaXBwaW5nIGFsZ29yaXRobVxuICAgIGNyZWF0ZVRpbGUgPSByZXF1aXJlKCcuL3RpbGUnKTsgLy8gZmluYWwgc2ltcGxpZmllZCB0aWxlIGdlbmVyYXRpb25cblxuXG5mdW5jdGlvbiBnZW9qc29udnQoZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgR2VvSlNPTlZUKGRhdGEsIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBHZW9KU09OVlQoZGF0YSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMgPSBleHRlbmQoT2JqZWN0LmNyZWF0ZSh0aGlzLm9wdGlvbnMpLCBvcHRpb25zKTtcblxuICAgIHZhciBkZWJ1ZyA9IG9wdGlvbnMuZGVidWc7XG5cbiAgICBpZiAoZGVidWcpIGNvbnNvbGUudGltZSgncHJlcHJvY2VzcyBkYXRhJyk7XG5cbiAgICB2YXIgejIgPSAxIDw8IG9wdGlvbnMubWF4Wm9vbSwgLy8gMl56XG4gICAgICAgIGZlYXR1cmVzID0gY29udmVydChkYXRhLCBvcHRpb25zLnRvbGVyYW5jZSAvICh6MiAqIG9wdGlvbnMuZXh0ZW50KSk7XG5cbiAgICB0aGlzLnRpbGVzID0ge307XG5cbiAgICBpZiAoZGVidWcpIHtcbiAgICAgICAgY29uc29sZS50aW1lRW5kKCdwcmVwcm9jZXNzIGRhdGEnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2luZGV4OiBtYXhab29tOiAlZCwgbWF4UG9pbnRzOiAlZCcsIG9wdGlvbnMuaW5kZXhNYXhab29tLCBvcHRpb25zLmluZGV4TWF4UG9pbnRzKTtcbiAgICAgICAgY29uc29sZS50aW1lKCdnZW5lcmF0ZSB0aWxlcycpO1xuICAgICAgICB0aGlzLnN0YXRzID0ge307XG4gICAgICAgIHRoaXMudG90YWwgPSAwO1xuICAgIH1cblxuICAgIC8vIHN0YXJ0IHNsaWNpbmcgZnJvbSB0aGUgdG9wIHRpbGUgZG93blxuICAgIHRoaXMuc3BsaXRUaWxlKGZlYXR1cmVzLCAwLCAwLCAwKTtcblxuICAgIGlmIChkZWJ1Zykge1xuICAgICAgICBjb25zb2xlLmxvZygnZmVhdHVyZXM6ICVkLCBwb2ludHM6ICVkJywgdGhpcy50aWxlc1swXS5udW1GZWF0dXJlcywgdGhpcy50aWxlc1swXS5udW1Qb2ludHMpO1xuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2dlbmVyYXRlIHRpbGVzJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aWxlcyBnZW5lcmF0ZWQ6JywgdGhpcy50b3RhbCwgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0cykpO1xuICAgIH1cbn1cblxuR2VvSlNPTlZULnByb3RvdHlwZS5vcHRpb25zID0ge1xuICAgIG1heFpvb206IDE0LCAgICAgICAgICAgIC8vIG1heCB6b29tIHRvIHByZXNlcnZlIGRldGFpbCBvblxuICAgIGluZGV4TWF4Wm9vbTogNSwgICAgICAgIC8vIG1heCB6b29tIGluIHRoZSB0aWxlIGluZGV4XG4gICAgaW5kZXhNYXhQb2ludHM6IDEwMDAwMCwgLy8gbWF4IG51bWJlciBvZiBwb2ludHMgcGVyIHRpbGUgaW4gdGhlIHRpbGUgaW5kZXhcbiAgICB0b2xlcmFuY2U6IDMsICAgICAgICAgICAvLyBzaW1wbGlmaWNhdGlvbiB0b2xlcmFuY2UgKGhpZ2hlciBtZWFucyBzaW1wbGVyKVxuICAgIGV4dGVudDogNDA5NiwgICAgICAgICAgIC8vIHRpbGUgZXh0ZW50XG4gICAgYnVmZmVyOiA2NCwgICAgICAgICAgICAgLy8gdGlsZSBidWZmZXIgb24gZWFjaCBzaWRlXG4gICAgZGVidWc6IDAgICAgICAgICAgICAgICAgLy8gbG9nZ2luZyBsZXZlbCAoMCwgMSBvciAyKVxufTtcblxuR2VvSlNPTlZULnByb3RvdHlwZS5zcGxpdFRpbGUgPSBmdW5jdGlvbiAoZmVhdHVyZXMsIHosIHgsIHksIGN6LCBjeCwgY3kpIHtcblxuICAgIHZhciBzdGFjayA9IFtmZWF0dXJlcywgeiwgeCwgeV0sXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZyxcbiAgICAgICAgZXh0ZW50ID0gb3B0aW9ucy5leHRlbnQsXG4gICAgICAgIGJ1ZmZlciA9IG9wdGlvbnMuYnVmZmVyO1xuXG4gICAgLy8gYXZvaWQgcmVjdXJzaW9uIGJ5IHVzaW5nIGEgcHJvY2Vzc2luZyBxdWV1ZVxuICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgZmVhdHVyZXMgPSBzdGFjay5zaGlmdCgpO1xuICAgICAgICB6ID0gc3RhY2suc2hpZnQoKTtcbiAgICAgICAgeCA9IHN0YWNrLnNoaWZ0KCk7XG4gICAgICAgIHkgPSBzdGFjay5zaGlmdCgpO1xuXG4gICAgICAgIHZhciB6MiA9IDEgPDwgeixcbiAgICAgICAgICAgIGlkID0gdG9JRCh6LCB4LCB5KSxcbiAgICAgICAgICAgIHRpbGUgPSB0aGlzLnRpbGVzW2lkXSxcbiAgICAgICAgICAgIHRpbGVUb2xlcmFuY2UgPSB6ID09PSBvcHRpb25zLm1heFpvb20gPyAwIDogb3B0aW9ucy50b2xlcmFuY2UgLyAoejIgKiBleHRlbnQpO1xuXG4gICAgICAgIGlmICghdGlsZSkge1xuICAgICAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdjcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aWxlID0gdGhpcy50aWxlc1tpZF0gPSBjcmVhdGVUaWxlKGZlYXR1cmVzLCB6MiwgeCwgeSwgdGlsZVRvbGVyYW5jZSwgeiA9PT0gb3B0aW9ucy5tYXhab29tKTtcblxuICAgICAgICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGlsZSB6JWQtJWQtJWQgKGZlYXR1cmVzOiAlZCwgcG9pbnRzOiAlZCwgc2ltcGxpZmllZDogJWQpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHosIHgsIHksIHRpbGUubnVtRmVhdHVyZXMsIHRpbGUubnVtUG9pbnRzLCB0aWxlLm51bVNpbXBsaWZpZWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2NyZWF0aW9uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSAneicgKyB6O1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHNba2V5XSA9ICh0aGlzLnN0YXRzW2tleV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWwrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIGdlb21ldHJ5IGluIHRpbGUgc28gdGhhdCB3ZSBjYW4gZHJpbGwgZG93biBsYXRlciBpZiB3ZSBzdG9wIG5vd1xuICAgICAgICB0aWxlLnNvdXJjZSA9IGZlYXR1cmVzO1xuXG4gICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHRoZSB0aWxlIGlzIGRlZ2VuZXJhdGVcbiAgICAgICAgaWYgKGlzQ2xpcHBlZFNxdWFyZSh0aWxlLmZlYXR1cmVzLCBleHRlbnQsIGJ1ZmZlcikpIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIGlmIGl0J3MgdGhlIGZpcnN0LXBhc3MgdGlsaW5nXG4gICAgICAgIGlmICghY3opIHtcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHdlIHJlYWNoZWQgbWF4IHpvb20sIG9yIGlmIHRoZSB0aWxlIGlzIHRvbyBzaW1wbGVcbiAgICAgICAgICAgIGlmICh6ID09PSBvcHRpb25zLmluZGV4TWF4Wm9vbSB8fCB0aWxlLm51bVBvaW50cyA8PSBvcHRpb25zLmluZGV4TWF4UG9pbnRzKSBjb250aW51ZTtcblxuICAgICAgICAvLyBpZiBhIGRyaWxsZG93biB0byBhIHNwZWNpZmljIHRpbGVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHdlIHJlYWNoZWQgYmFzZSB6b29tIG9yIG91ciB0YXJnZXQgdGlsZSB6b29tXG4gICAgICAgICAgICBpZiAoeiA9PT0gb3B0aW9ucy5tYXhab29tIHx8IHogPT09IGN6KSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gc3RvcCB0aWxpbmcgaWYgaXQncyBub3QgYW4gYW5jZXN0b3Igb2YgdGhlIHRhcmdldCB0aWxlXG4gICAgICAgICAgICB2YXIgbSA9IDEgPDwgKGN6IC0geik7XG4gICAgICAgICAgICBpZiAoeCAhPT0gTWF0aC5mbG9vcihjeCAvIG0pICYmIHkgIT09IE1hdGguZmxvb3IoY3kgLyBtKSkgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBzbGljZSBmdXJ0aGVyIGRvd24sIG5vIG5lZWQgdG8ga2VlcCBzb3VyY2UgZ2VvbWV0cnlcbiAgICAgICAgdGlsZS5zb3VyY2UgPSBudWxsO1xuXG4gICAgICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUudGltZSgnY2xpcHBpbmcnKTtcblxuICAgICAgICAvLyB2YWx1ZXMgd2UnbGwgdXNlIGZvciBjbGlwcGluZ1xuICAgICAgICB2YXIgazEgPSAwLjUgKiBidWZmZXIgLyBleHRlbnQsXG4gICAgICAgICAgICBrMiA9IDAuNSAtIGsxLFxuICAgICAgICAgICAgazMgPSAwLjUgKyBrMSxcbiAgICAgICAgICAgIGs0ID0gMSArIGsxLFxuICAgICAgICAgICAgdGwsIGJsLCB0ciwgYnIsIGxlZnQsIHJpZ2h0O1xuXG4gICAgICAgIHRsID0gYmwgPSB0ciA9IGJyID0gbnVsbDtcblxuICAgICAgICBsZWZ0ICA9IGNsaXAoZmVhdHVyZXMsIHoyLCB4IC0gazEsIHggKyBrMywgMCwgaW50ZXJzZWN0WCk7XG4gICAgICAgIHJpZ2h0ID0gY2xpcChmZWF0dXJlcywgejIsIHggKyBrMiwgeCArIGs0LCAwLCBpbnRlcnNlY3RYKTtcblxuICAgICAgICBpZiAobGVmdCkge1xuICAgICAgICAgICAgdGwgPSBjbGlwKGxlZnQsIHoyLCB5IC0gazEsIHkgKyBrMywgMSwgaW50ZXJzZWN0WSk7XG4gICAgICAgICAgICBibCA9IGNsaXAobGVmdCwgejIsIHkgKyBrMiwgeSArIGs0LCAxLCBpbnRlcnNlY3RZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyaWdodCkge1xuICAgICAgICAgICAgdHIgPSBjbGlwKHJpZ2h0LCB6MiwgeSAtIGsxLCB5ICsgazMsIDEsIGludGVyc2VjdFkpO1xuICAgICAgICAgICAgYnIgPSBjbGlwKHJpZ2h0LCB6MiwgeSArIGsyLCB5ICsgazQsIDEsIGludGVyc2VjdFkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lRW5kKCdjbGlwcGluZycpO1xuXG4gICAgICAgIGlmICh0bCkgc3RhY2sucHVzaCh0bCwgeiArIDEsIHggKiAyLCAgICAgeSAqIDIpO1xuICAgICAgICBpZiAoYmwpIHN0YWNrLnB1c2goYmwsIHogKyAxLCB4ICogMiwgICAgIHkgKiAyICsgMSk7XG4gICAgICAgIGlmICh0cikgc3RhY2sucHVzaCh0ciwgeiArIDEsIHggKiAyICsgMSwgeSAqIDIpO1xuICAgICAgICBpZiAoYnIpIHN0YWNrLnB1c2goYnIsIHogKyAxLCB4ICogMiArIDEsIHkgKiAyICsgMSk7XG4gICAgfVxufTtcblxuR2VvSlNPTlZULnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24gKHosIHgsIHkpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgZXh0ZW50ID0gb3B0aW9ucy5leHRlbnQsXG4gICAgICAgIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcblxuICAgIHZhciBpZCA9IHRvSUQoeiwgeCwgeSk7XG4gICAgaWYgKHRoaXMudGlsZXNbaWRdKSByZXR1cm4gdHJhbnNmb3JtVGlsZSh0aGlzLnRpbGVzW2lkXSwgZXh0ZW50KTtcblxuICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUubG9nKCdkcmlsbGluZyBkb3duIHRvIHolZC0lZC0lZCcsIHosIHgsIHkpO1xuXG4gICAgdmFyIHowID0geixcbiAgICAgICAgeDAgPSB4LFxuICAgICAgICB5MCA9IHksXG4gICAgICAgIHBhcmVudDtcblxuICAgIHdoaWxlICghcGFyZW50ICYmIHowID4gMCkge1xuICAgICAgICB6MC0tO1xuICAgICAgICB4MCA9IE1hdGguZmxvb3IoeDAgLyAyKTtcbiAgICAgICAgeTAgPSBNYXRoLmZsb29yKHkwIC8gMik7XG4gICAgICAgIHBhcmVudCA9IHRoaXMudGlsZXNbdG9JRCh6MCwgeDAsIHkwKV07XG4gICAgfVxuXG4gICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS5sb2coJ2ZvdW5kIHBhcmVudCB0aWxlIHolZC0lZC0lZCcsIHowLCB4MCwgeTApO1xuXG4gICAgLy8gaWYgd2UgZm91bmQgYSBwYXJlbnQgdGlsZSBjb250YWluaW5nIHRoZSBvcmlnaW5hbCBnZW9tZXRyeSwgd2UgY2FuIGRyaWxsIGRvd24gZnJvbSBpdFxuICAgIGlmIChwYXJlbnQuc291cmNlKSB7XG4gICAgICAgIGlmIChpc0NsaXBwZWRTcXVhcmUocGFyZW50LmZlYXR1cmVzLCBvcHRpb25zLmV4dGVudCwgb3B0aW9ucy5idWZmZXIpKSByZXR1cm4gdHJhbnNmb3JtVGlsZShwYXJlbnQsIGV4dGVudCk7XG5cbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdkcmlsbGluZyBkb3duJyk7XG4gICAgICAgIHRoaXMuc3BsaXRUaWxlKHBhcmVudC5zb3VyY2UsIHowLCB4MCwgeTAsIHosIHgsIHkpO1xuICAgICAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWVFbmQoJ2RyaWxsaW5nIGRvd24nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtVGlsZSh0aGlzLnRpbGVzW2lkXSwgZXh0ZW50KTtcbn07XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRpbGUodGlsZSwgZXh0ZW50KSB7XG4gICAgaWYgKCF0aWxlIHx8IHRpbGUudHJhbnNmb3JtZWQpIHJldHVybiB0aWxlO1xuXG4gICAgdmFyIHoyID0gdGlsZS56MixcbiAgICAgICAgdHggPSB0aWxlLngsXG4gICAgICAgIHR5ID0gdGlsZS55LFxuICAgICAgICBpLCBqLCBrO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRpbGUuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZlYXR1cmUgPSB0aWxlLmZlYXR1cmVzW2ldLFxuICAgICAgICAgICAgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZ2VvbS5sZW5ndGg7IGorKykgZ2VvbVtqXSA9IHRyYW5zZm9ybVBvaW50KGdlb21bal0sIGV4dGVudCwgejIsIHR4LCB0eSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBnZW9tLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJpbmcgPSBnZW9tW2pdO1xuICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByaW5nLmxlbmd0aDsgaysrKSByaW5nW2tdID0gdHJhbnNmb3JtUG9pbnQocmluZ1trXSwgZXh0ZW50LCB6MiwgdHgsIHR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRpbGUudHJhbnNmb3JtZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRpbGU7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVBvaW50KHAsIGV4dGVudCwgejIsIHR4LCB0eSkge1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChleHRlbnQgKiAocFswXSAqIHoyIC0gdHgpKSxcbiAgICAgICAgeSA9IE1hdGgucm91bmQoZXh0ZW50ICogKHBbMV0gKiB6MiAtIHR5KSk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbn1cblxuLy8gY2hlY2tzIHdoZXRoZXIgYSB0aWxlIGlzIGEgd2hvbGUtYXJlYSBmaWxsIGFmdGVyIGNsaXBwaW5nOyBpZiBpdCBpcywgdGhlcmUncyBubyBzZW5zZSBzbGljaW5nIGl0IGZ1cnRoZXJcbmZ1bmN0aW9uIGlzQ2xpcHBlZFNxdWFyZShmZWF0dXJlcywgZXh0ZW50LCBidWZmZXIpIHtcbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoICE9PSAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVzWzBdO1xuICAgIGlmIChmZWF0dXJlLnR5cGUgIT09IDMgfHwgZmVhdHVyZS5nZW9tZXRyeS5sZW5ndGggPiAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmUuZ2VvbWV0cnlbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHAgPSBmZWF0dXJlLmdlb21ldHJ5WzBdW2ldO1xuICAgICAgICBpZiAoKHBbMF0gIT09IC1idWZmZXIgJiYgcFswXSAhPT0gZXh0ZW50ICsgYnVmZmVyKSB8fFxuICAgICAgICAgICAgKHBbMV0gIT09IC1idWZmZXIgJiYgcFsxXSAhPT0gZXh0ZW50ICsgYnVmZmVyKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gdG9JRCh6LCB4LCB5KSB7XG4gICAgcmV0dXJuICgoKDEgPDwgeikgKiB5ICsgeCkgKiAzMikgKyB6O1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RYKGEsIGIsIHgpIHtcbiAgICByZXR1cm4gW3gsICh4IC0gYVswXSkgKiAoYlsxXSAtIGFbMV0pIC8gKGJbMF0gLSBhWzBdKSArIGFbMV0sIDFdO1xufVxuZnVuY3Rpb24gaW50ZXJzZWN0WShhLCBiLCB5KSB7XG4gICAgcmV0dXJuIFsoeSAtIGFbMV0pICogKGJbMF0gLSBhWzBdKSAvIChiWzFdIC0gYVsxXSkgKyBhWzBdLCB5LCAxXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYykge1xuICAgIGZvciAodmFyIGkgaW4gc3JjKSBkZXN0W2ldID0gc3JjW2ldO1xuICAgIHJldHVybiBkZXN0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNpbXBsaWZ5O1xuXG4vLyBjYWxjdWxhdGUgc2ltcGxpZmljYXRpb24gZGF0YSB1c2luZyBvcHRpbWl6ZWQgRG91Z2xhcy1QZXVja2VyIGFsZ29yaXRobVxuXG5mdW5jdGlvbiBzaW1wbGlmeShwb2ludHMsIHRvbGVyYW5jZSkge1xuXG4gICAgdmFyIHNxVG9sZXJhbmNlID0gdG9sZXJhbmNlICogdG9sZXJhbmNlLFxuICAgICAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxuICAgICAgICBmaXJzdCA9IDAsXG4gICAgICAgIGxhc3QgPSBsZW4gLSAxLFxuICAgICAgICBzdGFjayA9IFtdLFxuICAgICAgICBpLCBtYXhTcURpc3QsIHNxRGlzdCwgaW5kZXg7XG5cbiAgICAvLyBhbHdheXMgcmV0YWluIHRoZSBlbmRwb2ludHMgKDEgaXMgdGhlIG1heCB2YWx1ZSlcbiAgICBwb2ludHNbZmlyc3RdWzJdID0gMTtcbiAgICBwb2ludHNbbGFzdF1bMl0gPSAxO1xuXG4gICAgLy8gYXZvaWQgcmVjdXJzaW9uIGJ5IHVzaW5nIGEgc3RhY2tcbiAgICB3aGlsZSAobGFzdCkge1xuXG4gICAgICAgIG1heFNxRGlzdCA9IDA7XG5cbiAgICAgICAgZm9yIChpID0gZmlyc3QgKyAxOyBpIDwgbGFzdDsgaSsrKSB7XG4gICAgICAgICAgICBzcURpc3QgPSBnZXRTcVNlZ0Rpc3QocG9pbnRzW2ldLCBwb2ludHNbZmlyc3RdLCBwb2ludHNbbGFzdF0pO1xuXG4gICAgICAgICAgICBpZiAoc3FEaXN0ID4gbWF4U3FEaXN0KSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIG1heFNxRGlzdCA9IHNxRGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXhTcURpc3QgPiBzcVRvbGVyYW5jZSkge1xuICAgICAgICAgICAgcG9pbnRzW2luZGV4XVsyXSA9IG1heFNxRGlzdDsgLy8gc2F2ZSB0aGUgcG9pbnQgaW1wb3J0YW5jZSBpbiBzcXVhcmVkIHBpeGVscyBhcyBhIHogY29vcmRpbmF0ZVxuICAgICAgICAgICAgc3RhY2sucHVzaChmaXJzdCk7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGluZGV4KTtcbiAgICAgICAgICAgIGZpcnN0ID0gaW5kZXg7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3QgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIGZpcnN0ID0gc3RhY2sucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIHNxdWFyZSBkaXN0YW5jZSBmcm9tIGEgcG9pbnQgdG8gYSBzZWdtZW50XG5mdW5jdGlvbiBnZXRTcVNlZ0Rpc3QocCwgYSwgYikge1xuXG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSxcbiAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sXG4gICAgICAgIHB4ID0gcFswXSwgcHkgPSBwWzFdLFxuICAgICAgICBkeCA9IGJ4IC0geCxcbiAgICAgICAgZHkgPSBieSAtIHk7XG5cbiAgICBpZiAoZHggIT09IDAgfHwgZHkgIT09IDApIHtcblxuICAgICAgICB2YXIgdCA9ICgocHggLSB4KSAqIGR4ICsgKHB5IC0geSkgKiBkeSkgLyAoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gICAgICAgIGlmICh0ID4gMSkge1xuICAgICAgICAgICAgeCA9IGJ4O1xuICAgICAgICAgICAgeSA9IGJ5O1xuXG4gICAgICAgIH0gZWxzZSBpZiAodCA+IDApIHtcbiAgICAgICAgICAgIHggKz0gZHggKiB0O1xuICAgICAgICAgICAgeSArPSBkeSAqIHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkeCA9IHB4IC0geDtcbiAgICBkeSA9IHB5IC0geTtcblxuICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVUaWxlO1xuXG5mdW5jdGlvbiBjcmVhdGVUaWxlKGZlYXR1cmVzLCB6MiwgdHgsIHR5LCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpIHtcbiAgICB2YXIgdGlsZSA9IHtcbiAgICAgICAgZmVhdHVyZXM6IFtdLFxuICAgICAgICBudW1Qb2ludHM6IDAsXG4gICAgICAgIG51bVNpbXBsaWZpZWQ6IDAsXG4gICAgICAgIG51bUZlYXR1cmVzOiAwLFxuICAgICAgICBzb3VyY2U6IG51bGwsXG4gICAgICAgIHg6IHR4LFxuICAgICAgICB5OiB0eSxcbiAgICAgICAgejI6IHoyLFxuICAgICAgICB0cmFuc2Zvcm1lZDogZmFsc2VcbiAgICB9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGlsZS5udW1GZWF0dXJlcysrO1xuICAgICAgICBhZGRGZWF0dXJlKHRpbGUsIGZlYXR1cmVzW2ldLCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpO1xuICAgIH1cbiAgICByZXR1cm4gdGlsZTtcbn1cblxuZnVuY3Rpb24gYWRkRmVhdHVyZSh0aWxlLCBmZWF0dXJlLCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpIHtcblxuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeSxcbiAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZSxcbiAgICAgICAgc2ltcGxpZmllZCA9IFtdLFxuICAgICAgICBzcVRvbGVyYW5jZSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZSxcbiAgICAgICAgaSwgaiwgcmluZywgcDtcblxuICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBnZW9tLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzaW1wbGlmaWVkLnB1c2goZ2VvbVtpXSk7XG4gICAgICAgICAgICB0aWxlLm51bVBvaW50cysrO1xuICAgICAgICAgICAgdGlsZS5udW1TaW1wbGlmaWVkKys7XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgLy8gc2ltcGxpZnkgYW5kIHRyYW5zZm9ybSBwcm9qZWN0ZWQgY29vcmRpbmF0ZXMgZm9yIHRpbGUgZ2VvbWV0cnlcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGdlb20ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJpbmcgPSBnZW9tW2ldO1xuXG4gICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IHRpbnkgcG9seWxpbmVzICYgcG9seWdvbnNcbiAgICAgICAgICAgIGlmICghbm9TaW1wbGlmeSAmJiAoKHR5cGUgPT09IDIgJiYgcmluZy5kaXN0IDwgdG9sZXJhbmNlKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZSA9PT0gMyAmJiByaW5nLmFyZWEgPCBzcVRvbGVyYW5jZSkpKSB7XG4gICAgICAgICAgICAgICAgdGlsZS5udW1Qb2ludHMgKz0gcmluZy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzaW1wbGlmaWVkUmluZyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgcmluZy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHAgPSByaW5nW2pdO1xuICAgICAgICAgICAgICAgIC8vIGtlZXAgcG9pbnRzIHdpdGggaW1wb3J0YW5jZSA+IHRvbGVyYW5jZVxuICAgICAgICAgICAgICAgIGlmIChub1NpbXBsaWZ5IHx8IHBbMl0gPiBzcVRvbGVyYW5jZSkge1xuICAgICAgICAgICAgICAgICAgICBzaW1wbGlmaWVkUmluZy5wdXNoKHApO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLm51bVNpbXBsaWZpZWQrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGlsZS5udW1Qb2ludHMrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2ltcGxpZmllZC5wdXNoKHNpbXBsaWZpZWRSaW5nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzaW1wbGlmaWVkLmxlbmd0aCkge1xuICAgICAgICB0aWxlLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgZ2VvbWV0cnk6IHNpbXBsaWZpZWQsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgdGFnczogZmVhdHVyZS50YWdzIHx8IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19

/* 
 * Leaflet TimeDimension v0.1.6 - 2015-11-12 
 * 
 * Copyright 2015 Biel Frontera (ICTS SOCIB) 
 * datacenter@socib.es 
 * http://www.socib.es/ 
 * 
 * Licensed under the MIT license. 
 * 
 * Demos: 
 * http://apps.socib.es/Leaflet.TimeDimension/ 
 * 
 * Source: 
 * git@github.com:socib/Leaflet.TimeDimension.git 
 * 
 */
(function($){/*
 * L.TimeDimension: TimeDimension object manages the time component of a layer.
 * It can be shared among different layers and it can be added to a map, and become
 * the default timedimension component for any layer added to the map.
 */

L.TimeDimension = L.Class.extend({

    includes: L.Mixin.Events,

    initialize: function(options) {
        L.setOptions(this, options);
        // _availableTimes is an array with all the available times in ms.
        this._availableTimes = this._generateAvailableTimes();
        this._currentTimeIndex = -1;
        this._loadingTimeIndex = -1;
        this._loadingTimeout = this.options.loadingTimeout || 3000;
        this._syncedLayers = [];
        this._global_dateFormat="YYYY";
        if (this._availableTimes.length > 0) {
            this.setCurrentTime(this.options.currentTime || this._getDefaultCurrentTime());
        }
    },

    getAvailableTimes: function() {
        return this._availableTimes;
    },

    getCurrentTimeIndex: function() {
        if (this._currentTimeIndex == -1) {
            return this._availableTimes.length - 1;
        }
        return this._currentTimeIndex;
    },

    getCurrentTime: function() {
        var index = -1;
        if (this._loadingTimeIndex != -1) {
            index = this._loadingTimeIndex;
        } else {
            index = this.getCurrentTimeIndex();
        }
        if (index >= 0) {
            return this._availableTimes[index];
        } else {
            return 0;
        }
    },

    isLoading: function() {
        return (this._loadingTimeIndex != -1);
    },

    setCurrentTimeIndex: function(newIndex) {
        if (newIndex >= this._availableTimes.length) {
            newIndex = this._availableTimes.length - 1;
        }
        if (newIndex < 0) {
            return;
        }
        this._loadingTimeIndex = newIndex;
        var newTime = this._availableTimes[newIndex];
        
        if (this._checkSyncedLayersReady(this._availableTimes[this._loadingTimeIndex])) {
            this._newTimeIndexLoaded();
        } else {
            this.fire('timeloading', {
                time: newTime
            });
            // add timeout of 3 seconds if layers doesn't response
            setTimeout((function(index) {
                if (index == this._loadingTimeIndex) {
                    
                    this._newTimeIndexLoaded();
                }
            }).bind(this, newIndex), this._loadingTimeout);
        }

    },

    _newTimeIndexLoaded: function() {
        if (this._loadingTimeIndex == -1) {
            return;
        }
        var time = this._availableTimes[this._loadingTimeIndex];
        
        ////console.warn("TIME*********");
        ////console.warn(time);
        
        
        this._currentTimeIndex = this._loadingTimeIndex;
        this.fire('timeload', {
            time: time
        });
        this._loadingTimeIndex = -1;
    },

    _checkSyncedLayersReady: function(time) {
        for (var i = 0, len = this._syncedLayers.length; i < len; i++) {
            if (this._syncedLayers[i].isReady) {
                if (!this._syncedLayers[i].isReady(time)) {
                    return false;
                }
            }
        }
        return true;
    },

    setCurrentTime: function(time) {
        var newIndex = this._seekNearestTimeIndex(time);
        this.setCurrentTimeIndex(newIndex);
    },

    seekNearestTime: function(time) {
        var index = this._seekNearestTimeIndex(time);
        return this._availableTimes[index];
    },    

    nextTime: function(numSteps, loop) {
        if (numSteps === undefined) {
            numSteps = 1;
        }
        if (loop === undefined) {
            loop = false;
        }

        var newIndex = this._currentTimeIndex;
        if (this._loadingTimeIndex > -1)
            newIndex = this._loadingTimeIndex;
        newIndex = newIndex + numSteps;
        if (newIndex >= this._availableTimes.length) {            
            if (loop){
                newIndex = 0;
            }else{
                // nextTime out of range
                return;                
            }
        }
        this.setCurrentTimeIndex(newIndex);
    },

    prepareNextTimes: function(numSteps, howmany) {
        if (numSteps === undefined) {
            numSteps = 1;
        }

        var newIndex = this._currentTimeIndex;
        if (this._loadingTimeIndex > -1)
            newIndex = this._loadingTimeIndex;
        // assure synced layers have a buffer/cache of at least howmany elements
        for (var i = 0, len = this._syncedLayers.length; i < len; i++) {
            if (this._syncedLayers[i].setMinimumForwardCache) {
                this._syncedLayers[i].setMinimumForwardCache(howmany);
            }
        }
        var count = howmany;
        while (count > 0) {
            newIndex = newIndex + numSteps;
            if (newIndex >= this._availableTimes.length) {
                break;
            }
            this.fire('timeloading', {
                time: this._availableTimes[newIndex]
            });
            count--;
        }
    },

    getNumberNextTimesReady: function(numSteps, howmany) {
        if (numSteps === undefined) {
            numSteps = 1;
        }

        var newIndex = this._currentTimeIndex;
        if (this._loadingTimeIndex > -1)
            newIndex = this._loadingTimeIndex;
        var count = howmany;
        var ready = 0;
        while (count > 0) {
            newIndex = newIndex + numSteps;
            if (newIndex >= this._availableTimes.length) {
                count = 0;
                ready = howmany;
                break;
            }            
            var time = this._availableTimes[newIndex];
            if (this._checkSyncedLayersReady(time)){
                ready++;
            }
            count--;
        }
        return ready;
    },

    previousTime: function(numSteps) {
        if (numSteps === undefined) {
            numSteps = 1;
        }
        var newIndex = this._currentTimeIndex;
        if (this._loadingTimeIndex > -1)
            newIndex = this._loadingTimeIndex;
        newIndex = newIndex - numSteps;
        if (newIndex < 0) {
            newIndex = 0;
        }
        this.setCurrentTimeIndex(newIndex);
    },

    registerSyncedLayer: function(layer) {
        this._syncedLayers.push(layer);
        layer.on("timeload", this._onSyncedLayerLoaded, this);
    },

    unregisterSyncedLayer: function(layer) {
        var index = this._syncedLayers.indexOf(layer);
        if (index != -1) {
            this._syncedLayers.splice(index, 1);
        }
        layer.off("timeload", this._onSyncedLayerLoaded, this);
    },

    _onSyncedLayerLoaded: function(e) {
    	
    	
    	
        if (e.time == this._availableTimes[this._loadingTimeIndex] && this._checkSyncedLayersReady(e.time)) {
            this._newTimeIndexLoaded();
        }
    },

    _generateAvailableTimes: function() {
        if (this.options.times) {
            return L.TimeDimension.Util.parseTimesExpression(this.options.times);
        } else if (this.options.timeInterval) {
            var tiArray = L.TimeDimension.Util.parseTimeInterval(this.options.timeInterval);
            var period = this.options.period || "P1D";
            var validTimeRange = this.options.validTimeRange || undefined; 
            return L.TimeDimension.Util.explodeTimeRange(tiArray[0], tiArray[1], period, validTimeRange);
        } else {
            return [];
        }
    },

    _getDefaultCurrentTime: function() {
        var index = this._seekNearestTimeIndex(new Date().getTime());
        return this._availableTimes[index];
    },

    _seekNearestTimeIndex: function(time) {
        var newIndex = 0;
        var len = this._availableTimes.length;
        for (; newIndex < len; newIndex++) {
            if (time < this._availableTimes[newIndex]) {
                break;
            }
        }
        // We've found the first index greater than the time. Return the previous
        if (newIndex > 0) {
            newIndex--;
        }
        return newIndex;
    },

    setAvailableTimes: function(times, mode) {
        var currentTime = this.getCurrentTime();
        if (mode == 'extremes') {
            var period = this.options.period || "P1D";
            this._availableTimes = L.TimeDimension.Util.explodeTimeRange(new Date(times[0]), new Date(times[times.length - 1]), period);
        } else {
            var parsedTimes = L.TimeDimension.Util.parseTimesExpression(times);
            if (this._availableTimes.length == 0) {
                this._availableTimes = parsedTimes;
            } else if (mode == 'intersect') {
                this._availableTimes = L.TimeDimension.Util.intersect_arrays(parsedTimes, this._availableTimes);
            } else if (mode == 'union') {
                this._availableTimes = L.TimeDimension.Util.union_arrays(parsedTimes, this._availableTimes);
            } else if (mode == 'replace') {
                this._availableTimes = parsedTimes;
            } else {
                throw "Merge available times mode not implemented: " + mode;
            }
        }
        this.setCurrentTime(currentTime);
        this.fire('availabletimeschanged', {});
        
    }
});

L.Map.addInitHook(function() {
    if (this.options.timeDimension) {
        this.timeDimension = L.timeDimension(this.options.timeDimensionOptions || {});
    }
});

L.timeDimension = function(options) {
    return new L.TimeDimension(options);
};
/*
 * L.TimeDimension.Util
 */

L.TimeDimension.Util = {
    getTimeDuration: function(ISODuration) {
        if (nezasa === undefined) {
            throw "iso8601-js-period library is required for Leatlet.TimeDimension: https://github.com/nezasa/iso8601-js-period";
        }
        return nezasa.iso8601.Period.parse(ISODuration, true);
    },

    addTimeDuration: function(date, duration, utc) {
        if (utc === undefined) {
            utc = true;
        }
        if (typeof duration == 'string' || duration instanceof String) {
            duration = this.getTimeDuration(duration);
        }
        var l = duration.length;
        var get = utc ? "getUTC" : "get";
        var set = utc ? "setUTC" : "set";

        if (l > 0 && duration[0] != 0) {
            date[set + "FullYear"](date[get + "FullYear"]() + duration[0]);
        }
        if (l > 1 && duration[1] != 0) {
            date[set + "Month"](date[get + "Month"]() + duration[1]);
        }
        if (l > 2 && duration[2] != 0) {
            // weeks
            date[set + "Date"](date[get + "Date"]() + (duration[2] * 7));
        }
        if (l > 3 && duration[3] != 0) {
            date[set + "Date"](date[get + "Date"]() + duration[3]);
        }
        if (l > 4 && duration[4] != 0) {
            date[set + "Hours"](date[get + "Hours"]() + duration[4]);
        }
        if (l > 5 && duration[5] != 0) {
            date[set + "Minutes"](date[get + "Minutes"]() + duration[5]);
        }
        if (l > 6 && duration[6] != 0) {
            date[set + "Seconds"](date[get + "Seconds"]() + duration[6]);
        }
    },

    subtractTimeDuration: function(date, duration, utc) {
        if (typeof duration == 'string' || duration instanceof String) {
            duration = this.getTimeDuration(duration);
        }
        var subDuration = [];
        for (var i = 0, l = duration.length; i < l; i++) {
            subDuration.push(-duration[i]);
        }
        this.addTimeDuration(date, subDuration, utc);
    },

    parseAndExplodeTimeRange: function(timeRange) {
        var tr = timeRange.split('/');
        var startTime = new Date(Date.parse(tr[0]));
        var endTime = new Date(Date.parse(tr[1]));
        var duration = tr.length > 2 ? tr[2] : "P1D";

        return this.explodeTimeRange(startTime, endTime, duration);
    },

    explodeTimeRange: function(startTime, endTime, ISODuration, validTimeRange) {
        var duration = this.getTimeDuration(ISODuration);
        var result = [];
        var currentTime = new Date(startTime.getTime());
        var minHour = null,
            minMinutes = null,
            maxHour = null,
            maxMinutes = null;
        if (validTimeRange !== undefined) {
            var validTimeRangeArray = validTimeRange.split('/');
            minHour = validTimeRangeArray[0].split(':')[0];
            minMinutes = validTimeRangeArray[0].split(':')[1];
            maxHour = validTimeRangeArray[1].split(':')[0];
            maxMinutes = validTimeRangeArray[1].split(':')[1];
        }
        while (currentTime < endTime) {
            if (validTimeRange === undefined ||
                (currentTime.getUTCHours() >= minHour && currentTime.getUTCHours() <= maxHour)
            ) {
                if ((currentTime.getUTCHours() != minHour || currentTime.getUTCMinutes() >= minMinutes) &&
                    (currentTime.getUTCHours() != maxHour || currentTime.getUTCMinutes() <= maxMinutes)) {
                    result.push(currentTime.getTime());
                }
            }
            this.addTimeDuration(currentTime, duration);
        }
        if (currentTime >= endTime){
            result.push(endTime.getTime());
        }
        return result;
    },

    parseTimeInterval: function(timeInterval) {
        var parts = timeInterval.split("/");
        if (parts.length != 2) {
            throw "Incorrecte ISO9601 Interval: " + timeInterval;
        }
        var startTime = Date.parse(parts[0]);
        var endTime = null;
        var duration = null;
        if (isNaN(startTime)) {
            // -> format duration/endTime
            duration = this.getTimeDuration(parts[0]);
            endTime = Date.parse(parts[1]);
            startTime = new Date(endTime);
            this.subtractTimeDuration(startTime, duration, true);
            endTime = new Date(endTime);
        } else {
            endTime = Date.parse(parts[1]);
            if (isNaN(endTime)) {
                // -> format startTime/duration                
                duration = this.getTimeDuration(parts[1]);
                endTime = new Date(startTime);
                this.addTimeDuration(endTime, duration, true);
            } else {
                // -> format startTime/endTime
                endTime = new Date(endTime);
            }
            startTime = new Date(startTime);
        }
        return [startTime, endTime];
    },

    parseTimesExpression: function(times) {
        var result = [];
        if (!times) {
            return result;
        }
        if (typeof times == 'string' || times instanceof String) {
            var testTimeRange = times.split("/");
            if (testTimeRange.length == 3) {
                result = this.parseAndExplodeTimeRange(times);
            } else {
            	
            	times = times.replace(/\s/g, "");
                var dates = times.split(",");
              
                var time;
                for (var i = 0, l = dates.length; i < l; i++) {
                    time = Date.parse(dates[i]);
                   
                    if (!isNaN(time)) {
                        result.push(time);
                    }
                }
            }
        } else {
            result = times;
        }
        return result.sort(function(a, b) {
            return a - b;
        });
    },

    intersect_arrays: function(arrayA, arrayB) {
        var a = arrayA.slice(0);
        var b = arrayB.slice(0);
        var result = [];
        while (a.length > 0 && b.length > 0) {
            if (a[0] < b[0]) {
                a.shift();
            } else if (a[0] > b[0]) {
                b.shift();
            } else /* they're equal */ {
                result.push(a.shift());
                b.shift();
            }
        }
        return result;
    },

    union_arrays: function(arrayA, arrayB) {
        var a = arrayA.slice(0);
        var b = arrayB.slice(0);
        var result = [];
        while (a.length > 0 && b.length > 0) {
            if (a[0] < b[0]) {
                result.push(a.shift());
            } else if (a[0] > b[0]) {
                result.push(b.shift());
            } else /* they're equal */ {
                result.push(a.shift());
                b.shift();
            }
        }
        if (a.length > 0) {
            result = result.concat(a);
        } else if (b.length > 0) {
            result = result.concat(b);
        }
        return result;
    }

};
/*
 * L.TimeDimension.Layer:  an abstract Layer that can be managed/synchronized with a TimeDimension. 
 * The constructor recieves a layer (of any kind) and options.
 * Any children class should implement `_onNewTimeLoading`, `isReady` and `_update` functions 
 * to react to time changes.
 */

L.TimeDimension.Layer = (L.Layer || L.Class).extend({

    includes: L.Mixin.Events,

    initialize: function(layer, options) {
        L.setOptions(this, options || {});
        this._map = null;
        this._baseLayer = layer;
        this._currentLayer = null;
        this._global_dateFormat="YYYY";
        this._timeDimension = this.options.timeDimension || null;
    },

    addTo: function(map) {
        map.addLayer(this);
        return this;
    },

    onAdd: function(map) {
        this._map = map;
        if (!this._timeDimension && map.timeDimension) {
            this._timeDimension = map.timeDimension;
        }
        this._timeDimension.on("timeloading", this._onNewTimeLoading, this);
        this._timeDimension.on("timeload", this._update, this);
        this._timeDimension.registerSyncedLayer(this);
        this._update();
    },

    onRemove: function(map) {
        this._timeDimension.unregisterSyncedLayer(this);
        this._timeDimension.off("timeloading", this._onNewTimeLoading, this);
        this._timeDimension.off("timeload", this._update, this);
        this.eachLayer(map.removeLayer, map);
        this._map = null;
    },

    eachLayer: function(method, context) {
        method.call(context, this._baseLayer);
        return this;
    },

    setZIndex: function(zIndex) {
        if (this._baseLayer.setZIndex) {
            this._baseLayer.setZIndex(zIndex);
        }
        if (this._currentLayer && this._currentLayer.setZIndex) {
            this._currentLayer.setZIndex(zIndex);
        }
    },

    bringToBack: function() {
        if (!this._currentLayer) {
            return;
        }
        this._currentLayer.bringToBack();
    },

    bringToFront: function() {
        if (!this._currentLayer) {
            return;
        }
        this._currentLayer.bringToFront();
    },

    _onNewTimeLoading: function(ev) {
        // to be implemented for each type of layer
        this.fire('timeload', {
            time: ev.time
        });
        return;
    },

    isReady: function(time) {
        // to be implemented for each type of layer
        return true;
    },

    _update: function() {
        // to be implemented for each type of layer
        return true;
    },

    getBaseLayer: function(){
        return this._baseLayer;
    }

});

L.timeDimension.layer = function(layer, options) {
    return new L.TimeDimension.Layer(layer, options);
};
/*
 * L.TimeDimension.Layer.WMS: wms Layer associated to a TimeDimension
 */

L.TimeDimension.Layer.WMS = L.TimeDimension.Layer.extend({

    initialize: function(layer, options) {
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._timeCacheBackward = this.options.cacheBackward || this.options.cache || 0;
        this._timeCacheForward = this.options.cacheForward || this.options.cache || 0;
        this._wmsVersion = this.options.wmsVersion || "1.1.1";
        this._proxy = this.options.proxy || null;
        this._updateTimeDimension = this.options.updateTimeDimension || false;
		
        this._setDefaultTime = this.options.setDefaultTime || false;
        this._updateTimeDimensionMode = this.options.updateTimeDimensionMode || 'intersect'; // 'union' or 'replace'
        this._layers = {};
        this._defaultTime = 0;
        this._availableTimes = [];
        this._capabilitiesRequested = false;
		this._firstDateAvailable = "";
        if (this._updateTimeDimension || this.options.requestTimeFromCapabilities) {
            this._requestTimeDimensionFromCapabilities();
        }

        this._baseLayer.on('load', (function() {
            this._baseLayer.setLoaded(true);
            this.fire('timeload', {
                time: this._defaultTime
            });
        }).bind(this));
    },

    eachLayer: function(method, context) {
        for (var prop in this._layers) {
            if (this._layers.hasOwnProperty(prop)) {
                method.call(context, this._layers[prop]);
            }
        }
        return L.TimeDimension.Layer.prototype.eachLayer.call(this, method, context);
    },

    _onNewTimeLoading: function(ev) {
        // 
        var layer = this._getLayerForTime(ev.time);
        if (!this._map.hasLayer(layer)) {
            this._map.addLayer(layer);
            // 
        }
    },

    isReady: function(time) {
        var layer = this._getLayerForTime(time);
        return layer.isLoaded();
    },

    onAdd: function(map) {
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        if (this._availableTimes.length == 0) {
            this._requestTimeDimensionFromCapabilities();
        } else {
            this._updateTimeDimensionAvailableTimes();
        }
    },

    _update: function() {
        if (!this._map)
            return;
        var time = this._timeDimension.getCurrentTime();
        // It will get the layer for this time (create or get)
        // Then, the layer will be loaded if necessary, adding it to the map (and show it after loading).
        // If it already on the map (but probably hidden), it will be shown
		//////console.info(time);
        var layer = this._getLayerForTime(time);
        if (this._currentLayer == null) {
            this._currentLayer = layer;
        }
        if (!this._map.hasLayer(layer)) {
            this._map.addLayer(layer);
        } else {
            this._showLayer(layer, time);
        }
    },

    setParams: function(params, noRedraw) {
        L.extend(this._baseLayer.options, params);
        this._baseLayer.setParams(params, noRedraw);
        if (this._currentLayer) {
            this._currentLayer.setParams(params, noRedraw);
        }
        return this;
    },

    _showLayer: function(layer, time) {
        if (this._currentLayer && this._currentLayer !== layer) {
            this._currentLayer.hide();
        }
        layer.show();
        if (this._currentLayer && this._currentLayer === layer) {
            return;
        }
        this._currentLayer = layer;
        
        // Cache management        
        var times = this._getLoadedTimes();
        var strTime = String(time);
		//////console.info(strTime);
        var index = times.indexOf(strTime);
        var remove = [];
        // remove times before current time
        if (this._timeCacheBackward > -1) {
            var objectsToRemove = index - this._timeCacheBackward;
            if (objectsToRemove > 0) {
                remove = times.splice(0, objectsToRemove);
                this._removeLayers(remove);
            }
        }
        if (this._timeCacheForward > -1) {
            index = times.indexOf(strTime);
            var objectsToRemove = times.length - index - this._timeCacheForward - 1;
            if (objectsToRemove > 0) {
                remove = times.splice(index + this._timeCacheForward + 1, objectsToRemove);
                this._removeLayers(remove);
            }
        }
    },

    _getLayerForTime: function(time) {
    	
    
    	
        if (time == 0 || time == this._defaultTime) {
            return this._baseLayer;
        }
        if (this._layers.hasOwnProperty(time)) {
            return this._layers[time];
        }
        var nearestTime = this._getNearestTime(time);
        if (this._layers.hasOwnProperty(nearestTime)) {
            return this._layers[nearestTime];
        }

        var wmsParams = this._baseLayer.options;
		
		if(this._global_dateFormat){
			
		

			if(this._global_dateFormat=='YYYY'){
				
				wmsParams.time = new Date(nearestTime).getFullYear();
				

			}else if(this._global_dateFormat=='YYYY-MM'){
				
				var _TM=new Date(nearestTime);				
				
				wmsParams.time = _TM.getFullYear() +"-"+eval(_TM.getMonth()+1) ;
				
			
			}else if(this._global_dateFormat=='YYYY-MM-DD'){
				
				var _TM=new Date(nearestTime);
								
				wmsParams.time = _TM.getFullYear() +"-"+eval(_TM.getMonth()+1) +"-"+_TM.getDate() ;
							
			
			}else{
			
			wmsParams.time = new Date(nearestTime).toISOString();
			
			}			
			
		
		}else{
			wmsParams.time = new Date(nearestTime).toISOString();
		
		}
	
				
        //wmsParams.time = new Date(nearestTime).toISOString();
		
		//***********************
		//* Patch ICGC Sentinel
		//* El format del param time ha de ser YYYY-MM
		 var firstYearMonth = this._firstDateAvailable.split("-");
		 if(parseInt(firstYearMonth[0]) < 2100 && parseInt(firstYearMonth[1]) < 13){
			 // La data del capabilities es en format Sentinel2 ICGC => 2016-03
			 // cal que la data enviada al geoservei estigui en el mateix format yyyy-mm
			 
			
			 wmsParams.time = wmsParams.time.substr(0,7);
		 }else{
			 
			 //else YYYY
			 
			 wmsParams.time = wmsParams.time.substr(0,4);
		 } 
		//***
		
        var newLayer = null;
        if (this._baseLayer instanceof L.TileLayer) {
            newLayer = L.tileLayer.wms(this._baseLayer.getURL(), wmsParams);
        } else {
            newLayer = L.nonTiledLayer.wms(this._baseLayer.getURL(), wmsParams);
        }
        this._layers[time] = newLayer;

        newLayer.on('load', (function(layer, time) {
            layer.setLoaded(true);
            if (this._timeDimension && time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
                this._showLayer(layer, time);
            }
            // 
            this.fire('timeload', {
                time: time
            });
        }).bind(this, newLayer, time));

       
        newLayer.onAdd = (function(map) {
            Object.getPrototypeOf(this).onAdd.call(this, map);
            this.hide();
        }).bind(newLayer);
        return newLayer;
    },

    _getLoadedTimes: function() {
        var result = [];
        for (var prop in this._layers) {
            if (this._layers.hasOwnProperty(prop)) {
                result.push(prop);
            }
        }
        return result.sort(function(a, b) {
            return a - b;
        });
    },

    _removeLayers: function(times) {
        for (var i = 0, l = times.length; i < l; i++) {
            this._map.removeLayer(this._layers[times[i]]);
            delete this._layers[times[i]];
        }
    },

    setMinimumForwardCache: function(value) {
        if (value > this._timeCacheForward) {
            this._timeCacheForward = value;
        }
    },

    _requestTimeDimensionFromCapabilities: function() {
        if (this._capabilitiesRequested) {
            return;
        }
        this._capabilitiesRequested = true;
        var wms = this._baseLayer.getURL();
        var interro="?";
        if(wms.indexOf('?')>-1){
        	interro="";
        	
        }
        var url = wms +interro+"service=WMS&version=" +
            this._wmsVersion + "&request=GetCapabilities";
        if (this._proxy) {
            url = this._proxy  +'?url=' + encodeURIComponent(url);
        }
        $.get(url, (function(data) {
			
            this._defaultTime = Date.parse(this._getDefaultTimeFromCapabilities(data));			
			
            this._setDefaultTime = this._setDefaultTime || (this._timeDimension && this._timeDimension.getAvailableTimes().length == 0);
            this.setAvailableTimes(this._parseTimeDimensionFromCapabilities(data));
                     
            if (this._setDefaultTime && this._timeDimension) {
				
		
                this._timeDimension.setCurrentTime(this._defaultTime);
            }
        }).bind(this));
    },

    _parseTimeDimensionFromCapabilities: function(xml) {
        var layers = $(xml).find('Layer[queryable="1"]');
        var layerName = this._baseLayer.wmsParams.layers;
        var layerNameElement = layers.find("Name").filter(function(index) {
            return $(this).text() === layerName;
        });
        var times = null;
        if (layerNameElement) {        	       	
            var layer = layerNameElement.parent();                     
            times = this._getTimesFromLayerCapabilities(layer);            
            if (!times) {
                times = this._getTimesFromLayerCapabilities(layer.parent());
            }
        }
		var yearmonth = times.split(",");
		this._firstDateAvailable = yearmonth[0];
        return times;
    },

    _getTimesFromLayerCapabilities: function(layer) {
    	
        var times = null;
        var dimension = layer.find("Dimension[name='time']");
        if (dimension && dimension.length && dimension[0].textContent.length) {
            times = dimension[0].textContent.trim();
        } else {
            var extent = layer.find("Extent[name='time']");
            if (extent && extent.length && extent[0].textContent.length) {
                times = extent[0].textContent.trim();
            }
        }
        
       
        return times;
    },

    _getDefaultTimeFromCapabilities: function(xml) {
        var layers = $(xml).find('Layer[queryable="0"]');
        var layerName = this._baseLayer.wmsParams.layers;
        var layerNameElement = layers.find("Name").filter(function(index) {
            return $(this).text() === layerName;
        });
        var defaultTime = 0;
        if (layerNameElement) {
        	
        	
            var layer = layerNameElement.parent();
            defaultTime = this._getDefaultTimeFromLayerCapabilities(layer);
			
           
            if(defaultTime.length ==4){
            	
            	this._global_dateFormat="YYYY";
            
            }else if (defaultTime.length ==7){
            	
            	this._global_dateFormat="YYYY-MM";	
            		
            }else if (defaultTime.length ==10){
            	
            	this._global_dateFormat="YYYY-MM-DD";
            
            }else if (defaultTime.length ==0){
            	
            	this._global_dateFormat="YYYY";
            	
            	
            }else{
            	            	
            	this._global_dateFormat="YYYY-MM-DD:HHSS";            	           	            	
            	
            }
			
			if (defaultTime == 0) {
                defaultTime = this._getDefaultTimeFromLayerCapabilities(layer.parent());
               // this._global_dateFormat="YYYY";
			
            }
			//console.info(defaultTime);
        }
        
        
        return defaultTime;
    },

    _getDefaultTimeFromLayerCapabilities: function(layer) {
        var defaultTime = 0;
        var dimension = layer.find("Dimension[name='time']");
       
        if (dimension && dimension.attr("default")) {
            defaultTime = dimension.attr("default");
        } else {
            var extent = layer.find("Extent[name='time']");
            if (extent && extent.attr("default")) {
                defaultTime = extent.attr("default");
            }
        }
        
      
        return defaultTime;
    },


    setAvailableTimes: function(times) {
    	
    	
        this._availableTimes = L.TimeDimension.Util.parseTimesExpression(times);
      
        this._updateTimeDimensionAvailableTimes();
    },

    _updateTimeDimensionAvailableTimes: function() {
        if ((this._timeDimension && this._updateTimeDimension) ||
            (this._timeDimension && this._timeDimension.getAvailableTimes().length == 0)) {
            this._timeDimension.setAvailableTimes(this._availableTimes, this._updateTimeDimensionMode);
            if (this._defaultTime > 0) {
                this._timeDimension.setCurrentTime(this._defaultTime);
            }
        }
    },

    _getNearestTime: function(time) {
        if (this._layers.hasOwnProperty(time)) {
            return time;
        }
        if (this._availableTimes.length == 0) {
            return time;
        }
        var index = 0;
        var len = this._availableTimes.length;
        for (; index < len; index++) {
            if (time < this._availableTimes[index]) {
                break;
            }
        }
        // We've found the first index greater than the time. Get the previous
        if (index > 0) {
            index--;
        }
        if (time != this._availableTimes[index]) {
            
            
        }
        return this._availableTimes[index];
    },

});

if (!L.NonTiledLayer) {
    L.NonTiledLayer = L.Class.extend({});
}

L.NonTiledLayer.include({
    _visible: true,
    _loaded: false,

    _originalUpdate: L.NonTiledLayer.prototype._update,

    _update: function() {
        if (!this._visible && this._loaded) {
            return;
        }
        this._originalUpdate();
    },

    setLoaded: function(loaded) {
        this._loaded = loaded;
    },

    isLoaded: function() {
        return this._loaded;
    },

    hide: function() {
        this._visible = false;
        this._div.style.display = 'none';
    },

    show: function() {
        this._visible = true;
        this._div.style.display = 'block';
    },

    getURL: function() {
        return this._wmsUrl;
    }

});

L.TileLayer.include({
    _visible: true,
    _loaded: false,

    _originalUpdate: L.TileLayer.prototype._update,

    _update: function() {
        if (!this._visible && this._loaded) {
            return;
        }
        this._originalUpdate();
    },

    setLoaded: function(loaded) {
        this._loaded = loaded;
    },

    isLoaded: function() {
        return this._loaded;
    },

    hide: function() {
        this._visible = false;
        if (this._container) {
            this._container.style.display = 'none';
        }
    },

    show: function() {
        this._visible = true;
        if (this._container) {
            this._container.style.display = 'block';
        }
    },

    getURL: function() {
        return this._url;
    }

});

L.timeDimension.layer.wms = function(layer, options) {
    return new L.TimeDimension.Layer.WMS(layer, options);
};
/*
 * L.TimeDimension.Layer.GeoJson:
 */

L.TimeDimension.Layer.GeoJson = L.TimeDimension.Layer.extend({

    initialize: function(layer, options) {
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._updateTimeDimension = this.options.updateTimeDimension || false;
        this._updateTimeDimensionMode = this.options.updateTimeDimensionMode || 'extremes'; // 'union', 'replace' or extremes
        this._duration = this.options.duration || null;
        this._addlastPoint = this.options.addlastPoint || false;
        this._waitForReady = this.options.waitForReady || false;
        this._defaultTime = 0;
        this._availableTimes = [];
        this._loaded = false;
        if (this._baseLayer.getLayers().length == 0) {
            if (this._waitForReady){
                this._baseLayer.on("ready", this._onReadyBaseLayer, this);                
            }else{
                this._loaded = true;                
            }
        } else {
            this._loaded = true;
            this._setAvailableTimes();
        }
    },

    onAdd: function(map) {
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        if (this._loaded) {
            this._setAvailableTimes();
        }
    },

    eachLayer: function(method, context) {
        if (this._currentLayer) {
            method.call(context, this._currentLayer);
        }
        return L.TimeDimension.Layer.prototype.eachLayer.call(this, method, context);
    },      

    isReady: function(time) {
        return this._loaded;
    },

    _update: function() {
        if (!this._map)
            return;
        if (!this._loaded) {
            return;
        }

        var time = this._timeDimension.getCurrentTime();

        var maxTime = this._timeDimension.getCurrentTime(),
            minTime = 0;
        if (this._duration) {
            var date = new Date(maxTime);
            L.TimeDimension.Util.subtractTimeDuration(date, this._duration, true);
            minTime = date.getTime();
        }

        // new coordinates:
        var layer = L.geoJson(null, this._baseLayer.options);
        var layers = this._baseLayer.getLayers();
        for (var i = 0, l = layers.length; i < l; i++) {
            var feature = this._getFeatureBetweenDates(layers[i].feature, minTime, maxTime);
            if (feature) {
                layer.addData(feature);
                if (this._addlastPoint && feature.geometry.type == "LineString") {
                    if (feature.geometry.coordinates.length > 0) {
                        var properties = feature.properties;                        
                        properties.last = true;
                        layer.addData({
                            type: 'Feature',
                            properties: properties,
                            geometry: {
                                type: 'Point',
                                coordinates: feature.geometry.coordinates[feature.geometry.coordinates.length - 1]
                            }
                        });
                    }
                }
            }
        }

        if (this._currentLayer) {
            this._map.removeLayer(this._currentLayer);
        }
        if (layer.getLayers().length) {
            layer.addTo(this._map);
            this._currentLayer = layer;
        }
    },

    _setAvailableTimes: function() {
        var times = [];
        this._availableTimes = [];
        var layers = this._baseLayer.getLayers();
        for (var i = 0, l = layers.length; i < l; i++) {
            if (layers[i].feature) {
                times = L.TimeDimension.Util.union_arrays(
                    times,
                    this._getFeatureTimes(layers[i].feature)
                );
            }
        }
        // String dates to ms
        for (var i = 0, l = times.length; i < l; i++) {
            var time = times[i]
            if (typeof time == 'string' || time instanceof String) {
                time = Date.parse(time.trim());
            }
            this._availableTimes.push(time);
        }
        if (this._timeDimension && (this._updateTimeDimension || this._timeDimension.getAvailableTimes().length == 0)) {
            this._timeDimension.setAvailableTimes(this._availableTimes, this._updateTimeDimensionMode);
            this._timeDimension.setCurrentTime(this._availableTimes[0]);
        }
    },

    _getFeatureTimes: function(feature) {
        if (!feature.properties) {
            return [];
        }
        if (feature.properties.hasOwnProperty('coordTimes')) {
            return feature.properties.coordTimes;
        }
        if (feature.properties.hasOwnProperty('times')) {
            return feature.properties.times;
        }
        if (feature.properties.hasOwnProperty('linestringTimestamps')) {
            return feature.properties.linestringTimestamps;
        }
        if (feature.properties.hasOwnProperty('time')) {
            return [feature.properties.time];
        }
        return [];
    },

    _getFeatureBetweenDates: function(feature, minTime, maxTime) {
        var featureStringTimes = this._getFeatureTimes(feature);
        if (featureStringTimes.length == 0) {
            return feature;
        }
        var featureTimes = [];
        for (var i = 0, l = featureStringTimes.length; i < l; i++) {
            var time = featureStringTimes[i]
            if (typeof time == 'string' || time instanceof String) {
                time = Date.parse(time.trim());
            }
            featureTimes.push(time);
        }

        if (featureTimes[0] > maxTime || featureTimes[l - 1] < minTime) {
            return null;
        }
        var index_min = null,
            index_max = null,
            l = featureTimes.length;
        if (featureTimes[l - 1] > minTime) {
            for (var i = 0; i < l; i++) {
                if (index_min === null && featureTimes[i] > minTime) {
                    // set index_min the first time that current time is greater the minTime
                    index_min = i;
                }
                if (featureTimes[i] > maxTime) {
                    index_max = i;
                    break;
                }
            }
        }
        if (index_min === null) {
            index_min = 0;
        }
        if (index_max === null) {
            index_max = l;
        }
        var new_coordinates = [];
        if (feature.geometry.coordinates[0].length) {
            new_coordinates = feature.geometry.coordinates.slice(index_min, index_max);
        } else {
            new_coordinates = feature.geometry.coordinates;
        }
        return {
            type: 'Feature',
            properties: feature.properties,
            geometry: {
                type: feature.geometry.type,
                coordinates: new_coordinates
            }
        };
    },

    _onReadyBaseLayer: function() {
        this._loaded = true;
        this._setAvailableTimes();
        this._update();
    },

});

L.timeDimension.layer.geoJson = function(layer, options) {
    return new L.TimeDimension.Layer.GeoJson(layer, options);
};
/*
 * L.TimeDimension.Player 
 */

L.TimeDimension.Player = L.Class.extend({

    initialize: function(options, timeDimension) {
        L.setOptions(this, options);
        this._timeDimension = timeDimension;
        this._paused = false;
        this._transitionTime = this.options.transitionTime || 1000;
        this._buffer = this.options.buffer || 5;
        this._minBufferReady = this.options.minBufferReady || 1;
        this._waitingForBuffer = false;
        this._loop = this.options.loop || false;
        this._steps = 1;
        this._timeDimension.on('timeload', (function(data){            
            this.continue();  // free clock
        }).bind(this));        
    },


    _tick: function(self) {
        if (self._timeDimension.getCurrentTimeIndex() >= self._timeDimension.getAvailableTimes().length - 1) {
            if (!self._loop){
                clearInterval(self._intervalID);
                self._timeDimension.fire('timeanimationfinished');                
                return;
            }
        }
        if (self._paused) {
            return;
        }
        var numberNextTimesReady = 0;
        if (self._minBufferReady > 0){
            numberNextTimesReady = self._timeDimension.getNumberNextTimesReady(self._steps, self._buffer);            
            // If the player was waiting, check if all times are loaded
            if (self._waitingForBuffer){
                if (numberNextTimesReady < self._buffer){
                    
                    self._timeDimension.fire('timeanimationwaiting', {percent: numberNextTimesReady/self._buffer});
                    return;
                }else{
                    // all times loaded
                    
                    self._timeDimension.fire('timeanimationrunning');
                    self._waitingForBuffer = false;
                }
            } else{
                // check if player has to stop to wait and force to full all the buffer
                if (numberNextTimesReady < self._minBufferReady){
                    
                    self._waitingForBuffer = true;
                    self._timeDimension.fire('timeanimationwaiting', {percent: numberNextTimesReady/self._buffer});
                    self._timeDimension.prepareNextTimes(self._steps, self._buffer);
                    return;
                }
            }
        }
        self.pause();
        self._timeDimension.nextTime(self._steps, self._loop);
        if (self._buffer > 0){
            self._timeDimension.prepareNextTimes(self._steps, self._buffer);
        }
    },

    start: function(numSteps) {
        if (this._intervalID) return;
        this._steps = numSteps || 1;
        this._waitingForBuffer = false;
        this._intervalID = window.setInterval(
            this._tick,
            this._transitionTime,
            this);
        this._tick(this);
    },

    stop: function() {
        if (!this._intervalID) return;
        clearInterval(this._intervalID);
        this._intervalID = null;        
    },

    pause: function() {
        this._paused = true;
    },

    continue: function() {
        this._paused = false;
    },

    getTransitionTime: function() {
        return this._transitionTime;
    },

    isPlaying: function() {
        return this._intervalID ? true : false;
    },

    isWaiting: function() {
        return this._waitingForBuffer;
    },

    setTransitionTime: function(transitionTime) {
        this._transitionTime = transitionTime;
        if (this._intervalID) {
            this.stop();
            this.start();
        }
    }    
});
/*
 * L.Control.TimeDimension: Leaflet control to manage a timeDimension
 */

L.Control.TimeDimension = L.Control.extend({
	options: {
		position: 'bottomleft',
		title: 'Time Control',
		backwardButton: true,
		forwardButton: true,
		playButton: true,
		displayDate: true,
		timeSlider: true,
		speedSlider: true,
		timeSteps: 1,
		autoPlay: false,
		playerOptions:{
			transitionTime: 1000			
		}
	},

	initialize: function (options) {
		L.Control.prototype.initialize.call(this, options);
		this._dateUTC = true;
		this._timeDimension = this.options.timeDimension || null;				
	},	

	onAdd: function(map) {
        if (!this._timeDimension && map.timeDimension){
            this._timeDimension = map.timeDimension;
        }
		var className = 'leaflet-control-timecontrol',
			container;

		container = L.DomUtil.create('div', 'leaflet-bar leaflet-bar-horizontal leaflet-bar-timecontrol barra_temps');

		if (this.options.backwardButton)
			this._buttonBackward = this._createBackwardButton(className + " timecontrol-backward", container);
		if (this.options.playButton)
			this._buttonPlayPause = this._createPlayPauseButton(className + " timecontrol-play", container);
		if (this.options.forwardButton)
			this._buttonForward = this._createForwardButton(className + " timecontrol-forward", container);
		if (this.options.displayDate)
			this._displayDate = this._createDisplayDate(className + " timecontrol-date", container);
		if (this.options.timeSlider)
			this._slider = this._createSlider(className + " timecontrol-slider", container);
		if (this.options.speedSlider)
			this._sliderSpeed = this._createSliderSpeed(className + " timecontrol-slider timecontrol-speed", container);

		this._steps = this.options.timeSteps || 1;

		this._timeDimension.on('timeload', (function(data){						
        	this._update();
    	}).bind(this));

		this._timeDimension.on('timeloading', (function(data){
			if(data.time == this._timeDimension.getCurrentTime()){
				if (this._displayDate && this._displayDate.className.indexOf(' timecontrol-loading') == -1){
					this._displayDate.className += " timecontrol-loading";				
				}				
			}
    	}).bind(this));

    	this._timeDimension.on('timeanimationwaiting', (function(data){
			if (this._buttonPlayPause){
        		this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-play-loading';
        		this._buttonPlayPause.innerHTML = '<span>' + Math.floor(data.percent*100) + '%</span>';
			}

    	}).bind(this));

    	this._timeDimension.on('timeanimationrunning', (function(data){
			if (this._buttonPlayPause){
				this._buttonPlayPause.innerHTML = '';
				if (this._player.isPlaying()){			
					this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-pause';
				} else {
					this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-play';
				}
			}
    	}).bind(this));

		this._timeDimension.on('timeanimationfinished', (function(data){
			if (this._buttonPlayPause)
        		this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-play';
    	}).bind(this));

		this._timeDimension.on('availabletimeschanged', (function(data){
			if (this._slider)
        		this._slider.slider("option", "max", this._timeDimension.getAvailableTimes().length - 1);
    	}).bind(this));

		// Disable dragging and zoom when user's cursor enters the element
		container.addEventListener('mouseover', function() {
			map.dragging.disable();
			map.doubleClickZoom.disable();
			// map.off('mousemove'); 
		});

		// Re-enable dragging and zoom when user's cursor leaves the element
		container.addEventListener('mouseout', function() {
			map.dragging.enable();
			map.doubleClickZoom.enable();			
		});
		this._update();
		if (this.options.autoPlay && this._buttonPlayPause){
			this._buttonPlayPauseClicked();
		}
		return container;
	},

	_update: function () {
		if (!this._timeDimension){
			return;
		}
		var time = this._timeDimension.getCurrentTime();
		if (time > 0){
			var date = new Date(time);
			if (this._displayDate){
				this._displayDate.className = this._displayDate.className.replace(' timecontrol-loading', '');
				this._displayDate.innerHTML = this._getDisplayDateFormat(date);
			}
			if (this._slider){
	        	this._slider.slider( "value", this._timeDimension.getCurrentTimeIndex());			
			}
		}else{
			if (this._displayDate){
				this._displayDate.innerHTML = "Temps no disponible";
			}
			if (this._slider){
	        	this._slider.slider( "value", 0);
	        }
		}
	},

	_createBackwardButton: function(className, container) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = 'Enrrera';
		// link.innerHTML = '<span class="glyphicon glyphicon-backward"></span>';

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', this._buttonBackwardClicked, this);

		return link;
	},

	_createForwardButton: function(className, container) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = 'Endavant';
		// link.innerHTML = '<span class="glyphicon glyphicon-forward"></span>';

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', this._buttonForwardClicked, this);

		return link;
	},

	_createPlayPauseButton: function(className, container) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = 'Iniciar';
		// link.innerHTML = '<span class="glyphicon glyphicon-play"></span>';

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', this._buttonPlayPauseClicked, this);

		return link;
	},

	_createDisplayDate: function(className, container) {
		var link = L.DomUtil.create('a', className, container);		
		link.href = '#';
		link.title = 'UTC Temps';
		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', this._toggleDateUTC, this);

		return link;
	},

	_createSlider: function(className, container) {
		var _slider = L.DomUtil.create('a', className, container);
		_slider.href = '#';
		L.DomEvent
			.addListener(_slider, 'click', L.DomEvent.stopPropagation)
			.addListener(_slider, 'click', L.DomEvent.preventDefault);

		_slider.innerHTML = '<div class="slider"></div>';
		var slider = $(_slider).find('.slider');
		var max = this._timeDimension.getAvailableTimes().length - 1;
		slider.slider({
      		min: 0,
      		max: max,
      		range: "min",
      		stop: (function( event, ui ) {
        		this._sliderValueChanged(ui.value);
        	}).bind(this),
        	slide: (function( event, ui ) {        		
				var date = new Date(this._timeDimension.getAvailableTimes()[ui.value]);
				this._displayDate.innerHTML = this._getDisplayDateFormat(date);
        	}).bind(this),

      	});
		return slider;
	},

	_createSliderSpeed: function(className, container) {
		var _slider = L.DomUtil.create('a', className, container);
		_slider.href = '#';
		L.DomEvent
			.addListener(_slider, 'click', L.DomEvent.stopPropagation)
			.addListener(_slider, 'click', L.DomEvent.preventDefault);

		var currentSpeed = 1;
		if (this._player){
			currentSpeed = 1000/this._playerOptions.getTransitionTime();
		}else{
			currentSpeed = Math.round(10000/(this.options.playerOptions.transitionTime||1000))/10;
		}
		_slider.innerHTML = '<span class="speed">' +  currentSpeed  + 'fps</span><div class="slider"></div>';
		var slider = $(_slider).find('.slider');		
		slider.slider({
      		min: 0.1,
      		max: 10,
      		value: currentSpeed,
      		step: 0.1,
      		range: "min",
      		stop: (function(sliderContainer, event, ui ) {
        		var speed = $(sliderContainer).find('.speed')[0];
				speed.innerHTML = ui.value + "fps";      			
        		this._sliderSpeedValueChanged(ui.value);
        	}).bind(this, _slider),
        	slide: (function(sliderContainer, event, ui ) {        		
        		var speed = $(sliderContainer).find('.speed')[0];
				speed.innerHTML = ui.value + "fps";
        	}).bind(this, _slider),

      	});
		return slider;
	},

	_buttonBackwardClicked: function(event) {
		this._timeDimension.previousTime(this._steps);
	},

	_buttonForwardClicked: function(event) {
		this._timeDimension.nextTime(this._steps);
	},

	_buttonPlayPauseClicked: function(event) {
		if (!this._player){
		    this._player = new L.TimeDimension.Player(this.options.playerOptions, this._timeDimension);
		}
		if (this._player.isPlaying()){
			if (this._player.isWaiting()){
				// force start
				this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-pause';
				this._buttonPlayPause.innerHTML = '';
				this._player.stop();
				this._player.start(this._steps);

			} else {
				this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-play';
				this._player.stop();
				this._buttonPlayPause.innerHTML = '';				
			}
		} else {
			this._buttonPlayPause.className = 'leaflet-control-timecontrol timecontrol-pause';
			this._player.start(this._steps);
		}
	},	

	_sliderValueChanged: function(newValue) {
		this._timeDimension.setCurrentTimeIndex(newValue);
	},

	_sliderSpeedValueChanged: function(newValue){
		if (this._player){			
		    this._player.setTransitionTime(1000/newValue);
		}
	},

	_toggleDateUTC: function(event){
		if (this._dateUTC){
			this._displayDate.title = 'Local Temps';
		}else{
			this._displayDate.title = 'UTC Temps';
		}
		this._dateUTC = !this._dateUTC;
		this._update();
	},

	_getDisplayDateFormat: function(date){
		
	
		
		if(this._global_dateFormat=='YYYY'){
			return this._dateUTC ? date.getFullYear() : date.toLocaleString();
		
		}else if(this._global_dateFormat=='YYYY-MM'){
			
			return this._dateUTC ? date.getFullYear() : date.toLocaleString();
			
			
		}else if(this._global_dateFormat=='YYYY-MM-DD'){
			
			return this._dateUTC ? date.getFullYear() : date.toLocaleString();
		
		}else{

			return this._dateUTC ? date.getFullYear() : date.toLocaleString();
		}	
		
		
		
		//return this._dateUTC ? date.toISOString() : date.toLocaleString();
		//return this._dateUTC ? date.getFullYear() : date.toLocaleString();
		
	}

});

L.Map.addInitHook(function() {
	if (this.options.timeDimensionControl) {
		this.timeDimensionControl = L.control.timeDimension(this.options.timeDimensionControlOptions || {});
		this.addControl(this.timeDimensionControl);
	}
});

L.control.timeDimension = function(options) {
	return new L.Control.TimeDimension(options);
};
})(jQuery);
/*! leaflet-routing-machine - v3.2.0 - 2016-10-07
 * Copyright (c) 2013-2016 Per Liedman
 * Distributed under the ISC license */


(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.L || (g.L = {})).Routing = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(require,module,exports){
'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};

function encode(coordinate, factor) {
    coordinate = Math.round(coordinate * factor);
    coordinate <<= 1;
    if (coordinate < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], factor) + encode(coordinates[0][1], factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0] - b[0], factor);
        output += encode(a[1] - b[1], factor);
    }

    return output;
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        flipped.push(coords[i].slice().reverse());
    }
    return flipped;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }
    return polyline.encode(flipped(geojson.coordinates), precision);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords = polyline.decode(str, precision);
    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}

},{}],3:[function(require,module,exports){
(function() {
	'use strict';

	L.Routing = L.Routing || {};

	L.Routing.Autocomplete = L.Class.extend({
		options: {
			timeout: 500,
			blurTimeout: 100,
			noResultsMessage: 'No results found.'
		},

		initialize: function(elem, callback, context, options) {
			L.setOptions(this, options);

			this._elem = elem;
			this._resultFn = options.resultFn ? L.Util.bind(options.resultFn, options.resultContext) : null;
			this._autocomplete = options.autocompleteFn ? L.Util.bind(options.autocompleteFn, options.autocompleteContext) : null;
			this._selectFn = L.Util.bind(callback, context);
			this._container = L.DomUtil.create('div', 'leaflet-routing-geocoder-result');
			this._resultTable = L.DomUtil.create('table', '', this._container);

			// TODO: looks a bit like a kludge to register same for input and keypress -
			// browsers supporting both will get duplicate events; just registering
			// input will not catch enter, though.
			L.DomEvent.addListener(this._elem, 'input', this._keyPressed, this);
			L.DomEvent.addListener(this._elem, 'keypress', this._keyPressed, this);
			L.DomEvent.addListener(this._elem, 'keydown', this._keyDown, this);
			L.DomEvent.addListener(this._elem, 'blur', function() {
				if (this._isOpen) {
					this.close();
				}
			}, this);
		},

		close: function() {
			L.DomUtil.removeClass(this._container, 'leaflet-routing-geocoder-result-open');
			this._isOpen = false;
		},

		_open: function() {
			var rect = this._elem.getBoundingClientRect();
			if (!this._container.parentElement) {
				// See notes section under https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX
				// This abomination is required to support all flavors of IE
				var scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset
					: (document.documentElement || document.body.parentNode || document.body).scrollLeft;
				var scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset
					: (document.documentElement || document.body.parentNode || document.body).scrollTop;
				this._container.style.left = (rect.left + scrollX) + 'px';
				this._container.style.top = (rect.bottom + scrollY) + 'px';
				this._container.style.width = (rect.right - rect.left) + 'px';
				document.body.appendChild(this._container);
			}

			L.DomUtil.addClass(this._container, 'leaflet-routing-geocoder-result-open');
			this._isOpen = true;
		},

		_setResults: function(results) {
			var i,
			    tr,
			    td,
			    text;

			delete this._selection;
			this._results = results;

			while (this._resultTable.firstChild) {
				this._resultTable.removeChild(this._resultTable.firstChild);
			}

			for (i = 0; i < results.length; i++) {
				tr = L.DomUtil.create('tr', '', this._resultTable);
				tr.setAttribute('data-result-index', i);
				td = L.DomUtil.create('td', '', tr);
				text = document.createTextNode(results[i].name);
				td.appendChild(text);
				// mousedown + click because:
				// http://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event
				L.DomEvent.addListener(td, 'mousedown', L.DomEvent.preventDefault);
				L.DomEvent.addListener(td, 'click', this._createClickListener(results[i]));
			}

			if (!i) {
				tr = L.DomUtil.create('tr', '', this._resultTable);
				td = L.DomUtil.create('td', 'leaflet-routing-geocoder-no-results', tr);
				td.innerHTML = this.options.noResultsMessage;
			}

			this._open();

			if (results.length > 0) {
				// Select the first entry
				this._select(1);
			}
		},

		_createClickListener: function(r) {
			var resultSelected = this._resultSelected(r);
			return L.bind(function() {
				this._elem.blur();
				resultSelected();
			}, this);
		},

		_resultSelected: function(r) {
			return L.bind(function() {
				this.close();
				this._elem.value = r.name;
				this._lastCompletedText = r.name;
				this._selectFn(r);
			}, this);
		},

		_keyPressed: function(e) {
			var index;

			if (this._isOpen && e.keyCode === 13 && this._selection) {
				index = parseInt(this._selection.getAttribute('data-result-index'), 10);
				this._resultSelected(this._results[index])();
				L.DomEvent.preventDefault(e);
				return;
			}

			if (e.keyCode === 13) {
				this._complete(this._resultFn, true);
				return;
			}

			if (this._autocomplete && document.activeElement === this._elem) {
				if (this._timer) {
					clearTimeout(this._timer);
				}
				this._timer = setTimeout(L.Util.bind(function() { this._complete(this._autocomplete); }, this),
					this.options.timeout);
				return;
			}

			this._unselect();
		},

		_select: function(dir) {
			var sel = this._selection;
			if (sel) {
				L.DomUtil.removeClass(sel.firstChild, 'leaflet-routing-geocoder-selected');
				sel = sel[dir > 0 ? 'nextSibling' : 'previousSibling'];
			}
			if (!sel) {
				sel = this._resultTable[dir > 0 ? 'firstChild' : 'lastChild'];
			}

			if (sel) {
				L.DomUtil.addClass(sel.firstChild, 'leaflet-routing-geocoder-selected');
				this._selection = sel;
			}
		},

		_unselect: function() {
			if (this._selection) {
				L.DomUtil.removeClass(this._selection.firstChild, 'leaflet-routing-geocoder-selected');
			}
			delete this._selection;
		},

		_keyDown: function(e) {
			if (this._isOpen) {
				switch (e.keyCode) {
				// Escape
				case 27:
					this.close();
					L.DomEvent.preventDefault(e);
					return;
				// Up
				case 38:
					this._select(-1);
					L.DomEvent.preventDefault(e);
					return;
				// Down
				case 40:
					this._select(1);
					L.DomEvent.preventDefault(e);
					return;
				}
			}
		},

		_complete: function(completeFn, trySelect) {
			var v = this._elem.value;
			function completeResults(results) {
				this._lastCompletedText = v;
				if (trySelect && results.length === 1) {
					this._resultSelected(results[0])();
				} else {
					this._setResults(results);
				}
			}

			if (!v) {
				return;
			}

			if (v !== this._lastCompletedText) {
				completeFn(v, completeResults, this);
			} else if (trySelect) {
				completeResults.call(this, this._results);
			}
		}
	});
})();

},{}],4:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Itinerary'));
	L.extend(L.Routing, require('./L.Routing.Line'));
	L.extend(L.Routing, require('./L.Routing.Plan'));
	L.extend(L.Routing, require('./L.Routing.OSRMv1'));
	L.extend(L.Routing, require('./L.Routing.Mapbox'));
	L.extend(L.Routing, require('./L.Routing.ErrorControl'));

	L.Routing.Control = L.Routing.Itinerary.extend({
		options: {
			fitSelectedRoutes: 'smart',
			routeLine: function(route, options) { return L.Routing.line(route, options); },
			autoRoute: true,
			routeWhileDragging: false,
			routeDragInterval: 500,
			waypointMode: 'connect',
			showAlternatives: false,
			defaultErrorHandler: function(e) {
				console.error('Routing error:', e.error);
			}
		},

		initialize: function(options) {
			L.Util.setOptions(this, options);

			this._router = this.options.router || new L.Routing.OSRMv1(options);
			this._plan = this.options.plan || L.Routing.plan(this.options.waypoints, options);
			this._requestCount = 0;

			L.Routing.Itinerary.prototype.initialize.call(this, options);

			this.on('routeselected', this._routeSelected, this);
			if (this.options.defaultErrorHandler) {
				this.on('routingerror', this.options.defaultErrorHandler);
			}
			this._plan.on('waypointschanged', this._onWaypointsChanged, this);
			if (options.routeWhileDragging) {
				this._setupRouteDragging();
			}

			if (this.options.autoRoute) {
				this.route();
			}
		},

		onAdd: function(map) {
			var container = L.Routing.Itinerary.prototype.onAdd.call(this, map);

			this._map = map;
			this._map.addLayer(this._plan);

			this._map.on('zoomend', function() {
				if (!this._selectedRoute ||
					!this._router.requiresMoreDetail) {
					return;
				}

				var map = this._map;
				if (this._router.requiresMoreDetail(this._selectedRoute,
						map.getZoom(), map.getBounds())) {
					this.route({
						callback: L.bind(function(err, routes) {
							var i;
							if (!err) {
								for (i = 0; i < routes.length; i++) {
									this._routes[i].properties = routes[i].properties;
								}
								this._updateLineCallback(err, routes);
							}

						}, this),
						simplifyGeometry: false,
						geometryOnly: true
					});
				}
			}, this);

			if (this._plan.options.geocoder) {
				container.insertBefore(this._plan.createGeocoders(), container.firstChild);
			}

			return container;
		},

		onRemove: function(map) {
			if (this._line) {
				map.removeLayer(this._line);
			}
			map.removeLayer(this._plan);
			if (this._alternatives && this._alternatives.length > 0) {
				for (var i = 0, len = this._alternatives.length; i < len; i++) {
					map.removeLayer(this._alternatives[i]);
				}
			}
			return L.Routing.Itinerary.prototype.onRemove.call(this, map);
		},

		getWaypoints: function() {
			return this._plan.getWaypoints();
		},

		setWaypoints: function(waypoints) {
			this._plan.setWaypoints(waypoints);
			return this;
		},

		spliceWaypoints: function() {
			var removed = this._plan.spliceWaypoints.apply(this._plan, arguments);
			return removed;
		},

		getPlan: function() {
			return this._plan;
		},

		getRouter: function() {
			return this._router;
		},

		_routeSelected: function(e) {
			var route = this._selectedRoute = e.route,
				alternatives = this.options.showAlternatives && e.alternatives,
				fitMode = this.options.fitSelectedRoutes,
				fitBounds =
					(fitMode === 'smart' && !this._waypointsVisible()) ||
					(fitMode !== 'smart' && fitMode);

			this._updateLines({route: route, alternatives: alternatives});

			if (fitBounds) {
				this._map.fitBounds(this._line.getBounds());
			}

			if (this.options.waypointMode === 'snap') {
				this._plan.off('waypointschanged', this._onWaypointsChanged, this);
				this.setWaypoints(route.waypoints);
				this._plan.on('waypointschanged', this._onWaypointsChanged, this);
			}
		},

		_waypointsVisible: function() {
			var wps = this.getWaypoints(),
				mapSize,
				bounds,
				boundsSize,
				i,
				p;

			try {
				mapSize = this._map.getSize();

				for (i = 0; i < wps.length; i++) {
					p = this._map.latLngToLayerPoint(wps[i].latLng);

					if (bounds) {
						bounds.extend(p);
					} else {
						bounds = L.bounds([p]);
					}
				}

				boundsSize = bounds.getSize();
				return (boundsSize.x > mapSize.x / 5 ||
					boundsSize.y > mapSize.y / 5) && this._waypointsInViewport();

			} catch (e) {
				return false;
			}
		},

		_waypointsInViewport: function() {
			var wps = this.getWaypoints(),
				mapBounds,
				i;

			try {
				mapBounds = this._map.getBounds();
			} catch (e) {
				return false;
			}

			for (i = 0; i < wps.length; i++) {
				if (mapBounds.contains(wps[i].latLng)) {
					return true;
				}
			}

			return false;
		},

		_updateLines: function(routes) {
			var addWaypoints = this.options.addWaypoints !== undefined ?
				this.options.addWaypoints : true;
			this._clearLines();

			// add alternatives first so they lie below the main route
			this._alternatives = [];
			if (routes.alternatives) routes.alternatives.forEach(function(alt, i) {
				this._alternatives[i] = this.options.routeLine(alt,
					L.extend({
						isAlternative: true
					}, this.options.altLineOptions || this.options.lineOptions));
				this._alternatives[i].addTo(this._map);
				this._hookAltEvents(this._alternatives[i]);
			}, this);

			this._line = this.options.routeLine(routes.route,
				L.extend({
					addWaypoints: addWaypoints,
					extendToWaypoints: this.options.waypointMode === 'connect'
				}, this.options.lineOptions));
			this._line.addTo(this._map);
			this._hookEvents(this._line);
		},

		_hookEvents: function(l) {
			l.on('linetouched', function(e) {
				this._plan.dragNewWaypoint(e);
			}, this);
		},

		_hookAltEvents: function(l) {
			l.on('linetouched', function(e) {
				var alts = this._routes.slice();
				var selected = alts.splice(e.target._route.routesIndex, 1)[0];
				this.fire('routeselected', {route: selected, alternatives: alts});
			}, this);
		},

		_onWaypointsChanged: function(e) {
			if (this.options.autoRoute) {
				this.route({});
			}
			if (!this._plan.isReady()) {
				this._clearLines();
				this._clearAlts();
			}
			this.fire('waypointschanged', {waypoints: e.waypoints});
		},

		_setupRouteDragging: function() {
			var timer = 0,
				waypoints;

			this._plan.on('waypointdrag', L.bind(function(e) {
				waypoints = e.waypoints;

				if (!timer) {
					timer = setTimeout(L.bind(function() {
						this.route({
							waypoints: waypoints,
							geometryOnly: true,
							callback: L.bind(this._updateLineCallback, this)
						});
						timer = undefined;
					}, this), this.options.routeDragInterval);
				}
			}, this));
			this._plan.on('waypointdragend', function() {
				if (timer) {
					clearTimeout(timer);
					timer = undefined;
				}
				this.route();
			}, this);
		},

		_updateLineCallback: function(err, routes) {
			if (!err) {
				routes = routes.slice();
				var selected = routes.splice(this._selectedRoute.routesIndex, 1)[0];
				this._updateLines({route: selected, alternatives: routes });
			} else if (err.type !== 'abort') {
				this._clearLines();
			}
		},

		route: function(options) {
			var ts = ++this._requestCount,
				wps;

			if (this._pendingRequest && this._pendingRequest.abort) {
				this._pendingRequest.abort();
				this._pendingRequest = null;
			}

			options = options || {};

			if (this._plan.isReady()) {
				if (this.options.useZoomParameter) {
					options.z = this._map && this._map.getZoom();
				}

				wps = options && options.waypoints || this._plan.getWaypoints();
				this.fire('routingstart', {waypoints: wps});
				this._pendingRequest = this._router.route(wps, function(err, routes) {
					this._pendingRequest = null;

					if (options.callback) {
						return options.callback.call(this, err, routes);
					}

					// Prevent race among multiple requests,
					// by checking the current request's count
					// against the last request's; ignore result if
					// this isn't the last request.
					if (ts === this._requestCount) {
						this._clearLines();
						this._clearAlts();
						if (err && err.type !== 'abort') {
							this.fire('routingerror', {error: err});
							return;
						}

						routes.forEach(function(route, i) { route.routesIndex = i; });

						if (!options.geometryOnly) {
							this.fire('routesfound', {waypoints: wps, routes: routes});
							this.setAlternatives(routes);
						} else {
							var selectedRoute = routes.splice(0,1)[0];
							this._routeSelected({route: selectedRoute, alternatives: routes});
						}
					}
				}, this, options);
			}
		},

		_clearLines: function() {
			if (this._line) {
				this._map.removeLayer(this._line);
				delete this._line;
			}
			if (this._alternatives && this._alternatives.length) {
				for (var i in this._alternatives) {
					this._map.removeLayer(this._alternatives[i]);
				}
				this._alternatives = [];
			}
		}
	});

	L.Routing.control = function(options) {
		return new L.Routing.Control(options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.ErrorControl":5,"./L.Routing.Itinerary":8,"./L.Routing.Line":10,"./L.Routing.Mapbox":12,"./L.Routing.OSRMv1":13,"./L.Routing.Plan":14}],5:[function(require,module,exports){
(function() {
	'use strict';

	L.Routing = L.Routing || {};

	L.Routing.ErrorControl = L.Control.extend({
		options: {
			header: 'Routing error',
			formatMessage: function(error) {
				if (error.status < 0) {
					return 'Calculating the route caused an error. Technical description follows: <code><pre>' +
						error.message + '</pre></code';
				} else {
					return 'The route could not be calculated. ' +
						error.message;
				}
			}
		},

		initialize: function(routingControl, options) {
			L.Control.prototype.initialize.call(this, options);
			routingControl
				.on('routingerror', L.bind(function(e) {
					if (this._element) {
						this._element.children[1].innerHTML = this.options.formatMessage(e.error);
						this._element.style.visibility = 'visible';
					}
				}, this))
				.on('routingstart', L.bind(function() {
					if (this._element) {
						this._element.style.visibility = 'hidden';
					}
				}, this));
		},

		onAdd: function() {
			var header,
				message;

			this._element = L.DomUtil.create('div', 'leaflet-bar leaflet-routing-error');
			this._element.style.visibility = 'hidden';

			header = L.DomUtil.create('h3', null, this._element);
			message = L.DomUtil.create('span', null, this._element);

			header.innerHTML = this.options.header;

			return this._element;
		},

		onRemove: function() {
			delete this._element;
		}
	});

	L.Routing.errorControl = function(routingControl, options) {
		return new L.Routing.ErrorControl(routingControl, options);
	};
})();

},{}],6:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	L.Routing = L.Routing || {};

	L.extend(L.Routing, require('./L.Routing.Localization'));

	L.Routing.Formatter = L.Class.extend({
		options: {
			units: 'metric',
			unitNames: null,
			language: 'en',
			roundingSensitivity: 1,
			distanceTemplate: '{value} {unit}'
		},

		initialize: function(options) {
			L.setOptions(this, options);

			var langs = L.Util.isArray(this.options.language) ?
				this.options.language :
				[this.options.language, 'en'];
			this._localization = new L.Routing.Localization(langs);
		},

		formatDistance: function(d /* Number (meters) */, sensitivity) {
			var un = this.options.unitNames || this._localization.localize('units'),
				simpleRounding = sensitivity <= 0,
				round = simpleRounding ? function(v) { return v; } : L.bind(this._round, this),
			    v,
			    yards,
				data,
				pow10;

			if (this.options.units === 'imperial') {
				yards = d / 0.9144;
				if (yards >= 1000) {
					data = {
						value: round(d / 1609.344, sensitivity),
						unit: un.miles
					};
				} else {
					data = {
						value: round(yards, sensitivity),
						unit: un.yards
					};
				}
			} else {
				v = round(d, sensitivity);
				data = {
					value: v >= 1000 ? (v / 1000) : v,
					unit: v >= 1000 ? un.kilometers : un.meters
				};
			}

			if (simpleRounding) {
				data.value = data.value.toFixed(-sensitivity);
			}

			return L.Util.template(this.options.distanceTemplate, data);
		},

		_round: function(d, sensitivity) {
			var s = sensitivity || this.options.roundingSensitivity,
				pow10 = Math.pow(10, (Math.floor(d / s) + '').length - 1),
				r = Math.floor(d / pow10),
				p = (r > 5) ? pow10 : pow10 / 2;

			return Math.round(d / p) * p;
		},

		formatTime: function(t /* Number (seconds) */) {
			var un = this.options.unitNames || this._localization.localize('units');
			// More than 30 seconds precision looks ridiculous
			t = Math.round(t / 30) * 30;

			if (t > 86400) {
				return Math.round(t / 3600) + ' ' + un.hours;
			} else if (t > 3600) {
				return Math.floor(t / 3600) + ' ' + un.hours + ' ' +
					Math.round((t % 3600) / 60) + ' ' + un.minutes;
			} else if (t > 300) {
				return Math.round(t / 60) + ' ' + un.minutes;
			} else if (t > 60) {
				return Math.floor(t / 60) + ' ' + un.minutes +
					(t % 60 !== 0 ? ' ' + (t % 60) + ' ' + un.seconds : '');
			} else {
				return t + ' ' + un.seconds;
			}
		},

		formatInstruction: function(instr, i) {
			if (instr.text === undefined) {
				return this.capitalize(L.Util.template(this._getInstructionTemplate(instr, i),
					L.extend({}, instr, {
						exitStr: instr.exit ? this._localization.localize('formatOrder')(instr.exit) : '',
						dir: this._localization.localize(['directions', instr.direction]),
						modifier: this._localization.localize(['directions', instr.modifier])
					})));
			} else {
				return instr.text;
			}
		},

		getIconName: function(instr, i) {
			switch (instr.type) {
			case 'Head':
				if (i === 0) {
					return 'depart';
				}
				break;
			case 'WaypointReached':
				return 'via';
			case 'Roundabout':
				return 'enter-roundabout';
			case 'DestinationReached':
				return 'arrive';
			}

			switch (instr.modifier) {
			case 'Straight':
				return 'continue';
			case 'SlightRight':
				return 'bear-right';
			case 'Right':
				return 'turn-right';
			case 'SharpRight':
				return 'sharp-right';
			case 'TurnAround':
			case 'Uturn':
				return 'u-turn';
			case 'SharpLeft':
				return 'sharp-left';
			case 'Left':
				return 'turn-left';
			case 'SlightLeft':
				return 'bear-left';
			}
		},

		capitalize: function(s) {
			return s.charAt(0).toUpperCase() + s.substring(1);
		},

		_getInstructionTemplate: function(instr, i) {
			var type = instr.type === 'Straight' ? (i === 0 ? 'Head' : 'Continue') : instr.type,
				strings = this._localization.localize(['instructions', type]);

			if (!strings) {
				strings = [
					this._localization.localize(['directions', type]),
					' ' + this._localization.localize(['instructions', 'Onto'])
				];
			}

			return strings[0] + (strings.length > 1 && instr.road ? strings[1] : '');
		}
	});

	module.exports = L.Routing;
})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Localization":11}],7:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Autocomplete'));

	function selectInputText(input) {
		if (input.setSelectionRange) {
			// On iOS, select() doesn't work
			input.setSelectionRange(0, 9999);
		} else {
			// On at least IE8, setSeleectionRange doesn't exist
			input.select();
		}
	}

	L.Routing.GeocoderElement = L.Class.extend({
		includes: L.Mixin.Events,

		options: {
			createGeocoder: function(i, nWps, options) {
				var container = L.DomUtil.create('div', 'leaflet-routing-geocoder'),
					input = L.DomUtil.create('input', '', container),
					remove = options.addWaypoints ? L.DomUtil.create('span', 'leaflet-routing-remove-waypoint', container) : undefined;

				input.disabled = !options.addWaypoints;

				return {
					container: container,
					input: input,
					closeButton: remove
				};
			},
			geocoderPlaceholder: function(i, numberWaypoints, geocoderElement) {
				var l = new L.Routing.Localization(geocoderElement.options.language).localize('ui');
				return i === 0 ?
					l.startPlaceholder :
					(i < numberWaypoints - 1 ?
						L.Util.template(l.viaPlaceholder, {viaNumber: i}) :
						l.endPlaceholder);
			},

			geocoderClass: function() {
				return '';
			},

			waypointNameFallback: function(latLng) {
				var ns = latLng.lat < 0 ? 'S' : 'N',
					ew = latLng.lng < 0 ? 'W' : 'E',
					lat = (Math.round(Math.abs(latLng.lat) * 10000) / 10000).toString(),
					lng = (Math.round(Math.abs(latLng.lng) * 10000) / 10000).toString();
				return ns + lat + ', ' + ew + lng;
			},
			maxGeocoderTolerance: 200,
			autocompleteOptions: {},
			language: 'en',
		},

		initialize: function(wp, i, nWps, options) {
			L.setOptions(this, options);

			var g = this.options.createGeocoder(i, nWps, this.options),
				closeButton = g.closeButton,
				geocoderInput = g.input;
			geocoderInput.setAttribute('placeholder', this.options.geocoderPlaceholder(i, nWps, this));
			geocoderInput.className = this.options.geocoderClass(i, nWps);

			this._element = g;
			this._waypoint = wp;

			this.update();
			// This has to be here, or geocoder's value will not be properly
			// initialized.
			// TODO: look into why and make _updateWaypointName fix this.
			geocoderInput.value = wp.name;

			L.DomEvent.addListener(geocoderInput, 'click', function() {
				selectInputText(this);
			}, geocoderInput);

			if (closeButton) {
				L.DomEvent.addListener(closeButton, 'click', function() {
					this.fire('delete', { waypoint: this._waypoint });
				}, this);
			}

			new L.Routing.Autocomplete(geocoderInput, function(r) {
					geocoderInput.value = r.name;
					wp.name = r.name;
					wp.latLng = r.center;
					this.fire('geocoded', { waypoint: wp, value: r });
				}, this, L.extend({
					resultFn: this.options.geocoder.geocode,
					resultContext: this.options.geocoder,
					autocompleteFn: this.options.geocoder.suggest,
					autocompleteContext: this.options.geocoder
				}, this.options.autocompleteOptions));
		},

		getContainer: function() {
			return this._element.container;
		},

		setValue: function(v) {
			this._element.input.value = v;
		},

		update: function(force) {
			var wp = this._waypoint,
				wpCoords;

			wp.name = wp.name || '';

			if (wp.latLng && (force || !wp.name)) {
				wpCoords = this.options.waypointNameFallback(wp.latLng);
				if (this.options.geocoder && this.options.geocoder.reverse) {
					this.options.geocoder.reverse(wp.latLng, 67108864 /* zoom 18 */, function(rs) {
						if (rs.length > 0 && rs[0].center.distanceTo(wp.latLng) < this.options.maxGeocoderTolerance) {
							wp.name = rs[0].name;
						} else {
							wp.name = wpCoords;
						}
						this._update();
					}, this);
				} else {
					wp.name = wpCoords;
					this._update();
				}
			}
		},

		focus: function() {
			var input = this._element.input;
			input.focus();
			selectInputText(input);
		},

		_update: function() {
			var wp = this._waypoint,
			    value = wp && wp.name ? wp.name : '';
			this.setValue(value);
			this.fire('reversegeocoded', {waypoint: wp, value: value});
		}
	});

	L.Routing.geocoderElement = function(wp, i, nWps, plan) {
		return new L.Routing.GeocoderElement(wp, i, nWps, plan);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Autocomplete":3}],8:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Formatter'));
	L.extend(L.Routing, require('./L.Routing.ItineraryBuilder'));

	L.Routing.Itinerary = L.Control.extend({
		includes: L.Mixin.Events,

		options: {
			pointMarkerStyle: {
				radius: 5,
				color: '#03f',
				fillColor: 'white',
				opacity: 1,
				fillOpacity: 0.7
			},
			summaryTemplate: '<h2>{name}</h2><h3>{distance}, {time}</h3>',
			timeTemplate: '{time}',
			containerClassName: '',
			alternativeClassName: '',
			minimizedClassName: '',
			itineraryClassName: '',
			totalDistanceRoundingSensitivity: -1,
			show: true,
			collapsible: undefined,
			collapseBtn: function(itinerary) {
				var collapseBtn = L.DomUtil.create('span', itinerary.options.collapseBtnClass);
				L.DomEvent.on(collapseBtn, 'click', itinerary._toggle, itinerary);
				itinerary._container.insertBefore(collapseBtn, itinerary._container.firstChild);
			},
			collapseBtnClass: 'leaflet-routing-collapse-btn'
		},

		initialize: function(options) {
			L.setOptions(this, options);
			this._formatter = this.options.formatter || new L.Routing.Formatter(this.options);
			this._itineraryBuilder = this.options.itineraryBuilder || new L.Routing.ItineraryBuilder({
				containerClassName: this.options.itineraryClassName
			});
		},

		onAdd: function(map) {
			var collapsible = this.options.collapsible;

			collapsible = collapsible || (collapsible === undefined && map.getSize().x <= 640);

			this._container = L.DomUtil.create('div', 'leaflet-routing-container leaflet-bar ' +
				(!this.options.show ? 'leaflet-routing-container-hide ' : '') +
				(collapsible ? 'leaflet-routing-collapsible ' : '') +
				this.options.containerClassName);
			this._altContainer = this.createAlternativesContainer();
			this._container.appendChild(this._altContainer);
			L.DomEvent.disableClickPropagation(this._container);
			L.DomEvent.addListener(this._container, 'mousewheel', function(e) {
				L.DomEvent.stopPropagation(e);
			});

			if (collapsible) {
				this.options.collapseBtn(this);
			}

			return this._container;
		},

		onRemove: function() {
		},

		createAlternativesContainer: function() {
			return L.DomUtil.create('div', 'leaflet-routing-alternatives-container');
		},

		setAlternatives: function(routes) {
			var i,
			    alt,
			    altDiv;

			this._clearAlts();

			this._routes = routes;

			for (i = 0; i < this._routes.length; i++) {
				alt = this._routes[i];
				altDiv = this._createAlternative(alt, i);
				this._altContainer.appendChild(altDiv);
				this._altElements.push(altDiv);
			}

			this._selectRoute({route: this._routes[0], alternatives: this._routes.slice(1)});

			return this;
		},

		show: function() {
			L.DomUtil.removeClass(this._container, 'leaflet-routing-container-hide');
		},

		hide: function() {
			L.DomUtil.addClass(this._container, 'leaflet-routing-container-hide');
		},

		_toggle: function() {
			var collapsed = L.DomUtil.hasClass(this._container, 'leaflet-routing-container-hide');
			this[collapsed ? 'show' : 'hide']();
		},

		_createAlternative: function(alt, i) {
			var altDiv = L.DomUtil.create('div', 'leaflet-routing-alt ' +
				this.options.alternativeClassName +
				(i > 0 ? ' leaflet-routing-alt-minimized ' + this.options.minimizedClassName : '')),
				template = this.options.summaryTemplate,
				data = L.extend({
					name: alt.name,
					distance: this._formatter.formatDistance(alt.summary.totalDistance, this.options.totalDistanceRoundingSensitivity),
					time: this._formatter.formatTime(alt.summary.totalTime)
				}, alt);
			altDiv.innerHTML = typeof(template) === 'function' ? template(data) : L.Util.template(template, data);
			L.DomEvent.addListener(altDiv, 'click', this._onAltClicked, this);
			this.on('routeselected', this._selectAlt, this);

			altDiv.appendChild(this._createItineraryContainer(alt));
			return altDiv;
		},

		_clearAlts: function() {
			var el = this._altContainer;
			while (el && el.firstChild) {
				el.removeChild(el.firstChild);
			}

			this._altElements = [];
		},

		_createItineraryContainer: function(r) {
			var container = this._itineraryBuilder.createContainer(),
			    steps = this._itineraryBuilder.createStepsContainer(),
			    i,
			    instr,
			    step,
			    distance,
			    text,
			    icon;

			container.appendChild(steps);

			for (i = 0; i < r.instructions.length; i++) {
				instr = r.instructions[i];
				text = this._formatter.formatInstruction(instr, i);
				distance = this._formatter.formatDistance(instr.distance);
				icon = this._formatter.getIconName(instr, i);
				step = this._itineraryBuilder.createStep(text, distance, icon, steps);

				this._addRowListeners(step, r.coordinates[instr.index]);
			}

			return container;
		},

		_addRowListeners: function(row, coordinate) {
			L.DomEvent.addListener(row, 'mouseover', function() {
				this._marker = L.circleMarker(coordinate,
					this.options.pointMarkerStyle).addTo(this._map);
			}, this);
			L.DomEvent.addListener(row, 'mouseout', function() {
				if (this._marker) {
					this._map.removeLayer(this._marker);
					delete this._marker;
				}
			}, this);
			L.DomEvent.addListener(row, 'click', function(e) {
				this._map.panTo(coordinate);
				L.DomEvent.stopPropagation(e);
			}, this);
		},

		_onAltClicked: function(e) {
			var altElem = e.target || window.event.srcElement;
			while (!L.DomUtil.hasClass(altElem, 'leaflet-routing-alt')) {
				altElem = altElem.parentElement;
			}

			var j = this._altElements.indexOf(altElem);
			var alts = this._routes.slice();
			var route = alts.splice(j, 1)[0];

			this.fire('routeselected', {
				route: route,
				alternatives: alts
			});
		},

		_selectAlt: function(e) {
			var altElem,
			    j,
			    n,
			    classFn;

			altElem = this._altElements[e.route.routesIndex];

			if (L.DomUtil.hasClass(altElem, 'leaflet-routing-alt-minimized')) {
				for (j = 0; j < this._altElements.length; j++) {
					n = this._altElements[j];
					classFn = j === e.route.routesIndex ? 'removeClass' : 'addClass';
					L.DomUtil[classFn](n, 'leaflet-routing-alt-minimized');
					if (this.options.minimizedClassName) {
						L.DomUtil[classFn](n, this.options.minimizedClassName);
					}

					if (j !== e.route.routesIndex) n.scrollTop = 0;
				}
			}

			L.DomEvent.stop(e);
		},

		_selectRoute: function(routes) {
			if (this._marker) {
				this._map.removeLayer(this._marker);
				delete this._marker;
			}
			this.fire('routeselected', routes);
		}
	});

	L.Routing.itinerary = function(options) {
		return new L.Routing.Itinerary(options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Formatter":6,"./L.Routing.ItineraryBuilder":9}],9:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
	L.Routing = L.Routing || {};

	L.Routing.ItineraryBuilder = L.Class.extend({
		options: {
			containerClassName: ''
		},

		initialize: function(options) {
			L.setOptions(this, options);
		},

		createContainer: function(className) {
			var table = L.DomUtil.create('table', className || ''),
				colgroup = L.DomUtil.create('colgroup', '', table);

			L.DomUtil.create('col', 'leaflet-routing-instruction-icon', colgroup);
			L.DomUtil.create('col', 'leaflet-routing-instruction-text', colgroup);
			L.DomUtil.create('col', 'leaflet-routing-instruction-distance', colgroup);

			return table;
		},

		createStepsContainer: function() {
			return L.DomUtil.create('tbody', '');
		},

		createStep: function(text, distance, icon, steps) {
			var row = L.DomUtil.create('tr', '', steps),
				span,
				td;
			td = L.DomUtil.create('td', '', row);
			span = L.DomUtil.create('span', 'leaflet-routing-icon leaflet-routing-icon-'+icon, td);
			td.appendChild(span);
			td = L.DomUtil.create('td', '', row);
			td.appendChild(document.createTextNode(text));
			td = L.DomUtil.create('td', '', row);
			td.appendChild(document.createTextNode(distance));
			return row;
		}
	});

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	L.Routing = L.Routing || {};

	L.Routing.Line = L.LayerGroup.extend({
		includes: L.Mixin.Events,

		options: {
			styles: [
				{color: 'black', opacity: 0.15, weight: 9},
				{color: 'white', opacity: 0.8, weight: 6},
				{color: 'red', opacity: 1, weight: 2}
			],
			missingRouteStyles: [
				{color: 'black', opacity: 0.15, weight: 7},
				{color: 'white', opacity: 0.6, weight: 4},
				{color: 'gray', opacity: 0.8, weight: 2, dashArray: '7,12'}
			],
			addWaypoints: true,
			extendToWaypoints: true,
			missingRouteTolerance: 10
		},

		initialize: function(route, options) {
			L.setOptions(this, options);
			L.LayerGroup.prototype.initialize.call(this, options);
			this._route = route;

			if (this.options.extendToWaypoints) {
				this._extendToWaypoints();
			}

			this._addSegment(
				route.coordinates,
				this.options.styles,
				this.options.addWaypoints);
		},
		
		getBounds: function() {
			return L.latLngBounds(this._route.coordinates);
		},

		_findWaypointIndices: function() {
			var wps = this._route.inputWaypoints,
			    indices = [],
			    i;
			for (i = 0; i < wps.length; i++) {
				indices.push(this._findClosestRoutePoint(wps[i].latLng));
			}

			return indices;
		},

		_findClosestRoutePoint: function(latlng) {
			var minDist = Number.MAX_VALUE,
				minIndex,
			    i,
			    d;

			for (i = this._route.coordinates.length - 1; i >= 0 ; i--) {
				// TODO: maybe do this in pixel space instead?
				d = latlng.distanceTo(this._route.coordinates[i]);
				if (d < minDist) {
					minIndex = i;
					minDist = d;
				}
			}

			return minIndex;
		},

		_extendToWaypoints: function() {
			var wps = this._route.inputWaypoints,
				wpIndices = this._getWaypointIndices(),
			    i,
			    wpLatLng,
			    routeCoord;

			for (i = 0; i < wps.length; i++) {
				wpLatLng = wps[i].latLng;
				routeCoord = L.latLng(this._route.coordinates[wpIndices[i]]);
				if (wpLatLng.distanceTo(routeCoord) >
					this.options.missingRouteTolerance) {
					this._addSegment([wpLatLng, routeCoord],
						this.options.missingRouteStyles);
				}
			}
		},

		_addSegment: function(coords, styles, mouselistener) {
			var i,
				pl;

			for (i = 0; i < styles.length; i++) {
				pl = L.polyline(coords, styles[i]);
				this.addLayer(pl);
				if (mouselistener) {
					pl.on('mousedown', this._onLineTouched, this);
				}
			}
		},

		_findNearestWpBefore: function(i) {
			var wpIndices = this._getWaypointIndices(),
				j = wpIndices.length - 1;
			while (j >= 0 && wpIndices[j] > i) {
				j--;
			}

			return j;
		},

		_onLineTouched: function(e) {
			var afterIndex = this._findNearestWpBefore(this._findClosestRoutePoint(e.latlng));
			this.fire('linetouched', {
				afterIndex: afterIndex,
				latlng: e.latlng
			});
		},

		_getWaypointIndices: function() {
			if (!this._wpIndices) {
				this._wpIndices = this._route.waypointIndices || this._findWaypointIndices();
			}

			return this._wpIndices;
		}
	});

	L.Routing.line = function(route, options) {
		return new L.Routing.Line(route, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function() {
	'use strict';

	var spanish = {
		directions: {
			N: 'norte',
			NE: 'noreste',
			E: 'este',
			SE: 'sureste',
			S: 'sur',
			SW: 'suroeste',
			W: 'oeste',
			NW: 'noroeste',
			SlightRight: 'leve giro a la derecha',
			Right: 'derecha',
			SharpRight: 'giro pronunciado a la derecha',
			SlightLeft: 'leve giro a la izquierda',
			Left: 'izquierda',
			SharpLeft: 'giro pronunciado a la izquierda',
			Uturn: 'media vuelta'
		},
		instructions: {
			// instruction, postfix if the road is named
			'Head':
				['Derecho {dir}', ' sobre {road}'],
			'Continue':
				['Continuar {dir}', ' en {road}'],
			'TurnAround':
				['Dar vuelta'],
			'WaypointReached':
				['Llegó a un punto del camino'],
			'Roundabout':
				['Tomar {exitStr} salida en la rotonda', ' en {road}'],
			'DestinationReached':
				['Llegada a destino'],
			'Fork': ['En el cruce gira a {modifier}', ' hacia {road}'],
			'Merge': ['Incorpórate {modifier}', ' hacia {road}'],
			'OnRamp': ['Gira {modifier} en la salida', ' hacia {road}'],
			'OffRamp': ['Toma la salida {modifier}', ' hacia {road}'],
			'EndOfRoad': ['Gira {modifier} al final de la carretera', ' hacia {road}'],
			'Onto': 'hacia {road}'
		},
		formatOrder: function(n) {
			return n + 'º';
		},
		ui: {
			startPlaceholder: 'Inicio',
			viaPlaceholder: 'Via {viaNumber}',
			endPlaceholder: 'Destino'
		},
		units: {
			meters: 'm',
			kilometers: 'km',
			yards: 'yd',
			miles: 'mi',
			hours: 'h',
			minutes: 'min',
			seconds: 's'
		}
	};

	L.Routing = L.Routing || {};

	L.Routing.Localization = L.Class.extend({
		initialize: function(langs) {
			this._langs = L.Util.isArray(langs) ? langs : [langs, 'en'];

			for (var i = 0, l = this._langs.length; i < l; i++) {
				if (!L.Routing.Localization[this._langs[i]]) {
					throw new Error('No localization for language "' + this._langs[i] + '".');
				}
			}
		},

		localize: function(keys) {
			var dict,
				key,
				value;

			keys = L.Util.isArray(keys) ? keys : [keys];

			for (var i = 0, l = this._langs.length; i < l; i++) {
				dict = L.Routing.Localization[this._langs[i]];
				for (var j = 0, nKeys = keys.length; dict && j < nKeys; j++) {
					key = keys[j];
					value = dict[key];
					dict = value;
				}

				if (value) {
					return value;
				}
			}
		}
	});

	L.Routing.Localization = L.extend(L.Routing.Localization, {
		'en': {
			directions: {
				N: 'north',
				NE: 'northeast',
				E: 'east',
				SE: 'southeast',
				S: 'south',
				SW: 'southwest',
				W: 'west',
				NW: 'northwest',
				SlightRight: 'slight right',
				Right: 'right',
				SharpRight: 'sharp right',
				SlightLeft: 'slight left',
				Left: 'left',
				SharpLeft: 'sharp left',
				Uturn: 'Turn around'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Head {dir}', ' on {road}'],
				'Continue':
					['Continue {dir}'],
				'TurnAround':
					['Turn around'],
				'WaypointReached':
					['Waypoint reached'],
				'Roundabout':
					['Take the {exitStr} exit in the roundabout', ' onto {road}'],
				'DestinationReached':
					['Destination reached'],
				'Fork': ['At the fork, turn {modifier}', ' onto {road}'],
				'Merge': ['Merge {modifier}', ' onto {road}'],
				'OnRamp': ['Turn {modifier} on the ramp', ' onto {road}'],
				'OffRamp': ['Take the ramp on the {modifier}', ' onto {road}'],
				'EndOfRoad': ['Turn {modifier} at the end of the road', ' onto {road}'],
				'Onto': 'onto {road}'
			},
			formatOrder: function(n) {
				var i = n % 10 - 1,
				suffix = ['st', 'nd', 'rd'];

				return suffix[i] ? n + suffix[i] : n + 'th';
			},
			ui: {
				startPlaceholder: 'Start',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'End'
			},
			units: {
				meters: 'm',
				kilometers: 'km',
				yards: 'yd',
				miles: 'mi',
				hours: 'h',
				minutes: 'min',
				seconds: 's'
			}
		},

		'de': {
			directions: {
				N: 'Norden',
				NE: 'Nordosten',
				E: 'Osten',
				SE: 'Südosten',
				S: 'Süden',
				SW: 'Südwesten',
				W: 'Westen',
				NW: 'Nordwesten'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Richtung {dir}', ' auf {road}'],
				'Continue':
					['Geradeaus Richtung {dir}', ' auf {road}'],
				'SlightRight':
					['Leicht rechts abbiegen', ' auf {road}'],
				'Right':
					['Rechts abbiegen', ' auf {road}'],
				'SharpRight':
					['Scharf rechts abbiegen', ' auf {road}'],
				'TurnAround':
					['Wenden'],
				'SharpLeft':
					['Scharf links abbiegen', ' auf {road}'],
				'Left':
					['Links abbiegen', ' auf {road}'],
				'SlightLeft':
					['Leicht links abbiegen', ' auf {road}'],
				'WaypointReached':
					['Zwischenhalt erreicht'],
				'Roundabout':
					['Nehmen Sie die {exitStr} Ausfahrt im Kreisverkehr', ' auf {road}'],
				'DestinationReached':
					['Sie haben ihr Ziel erreicht'],
			},
			formatOrder: function(n) {
				return n + '.';
			},
			ui: {
				startPlaceholder: 'Start',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Ziel'
			}
		},

		'sv': {
			directions: {
				N: 'norr',
				NE: 'nordost',
				E: 'öst',
				SE: 'sydost',
				S: 'syd',
				SW: 'sydväst',
				W: 'väst',
				NW: 'nordväst',
				SlightRight: 'svagt höger',
				Right: 'höger',
				SharpRight: 'skarpt höger',
				SlightLeft: 'svagt vänster',
				Left: 'vänster',
				SharpLeft: 'skarpt vänster',
				Uturn: 'Vänd'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Åk åt {dir}', ' till {road}'],
				'Continue':
					['Fortsätt {dir}'],
				'SlightRight':
					['Svagt höger', ' till {road}'],
				'Right':
					['Sväng höger', ' till {road}'],
				'SharpRight':
					['Skarpt höger', ' till {road}'],
				'TurnAround':
					['Vänd'],
				'SharpLeft':
					['Skarpt vänster', ' till {road}'],
				'Left':
					['Sväng vänster', ' till {road}'],
				'SlightLeft':
					['Svagt vänster', ' till {road}'],
				'WaypointReached':
					['Viapunkt nådd'],
				'Roundabout':
					['Tag {exitStr} avfarten i rondellen', ' till {road}'],
				'DestinationReached':
					['Framme vid resans mål'],
				'Fork': ['Tag av {modifier}', ' till {road}'],
				'Merge': ['Anslut {modifier} ', ' till {road}'],
				'OnRamp': ['Tag påfarten {modifier}', ' till {road}'],
				'OffRamp': ['Tag avfarten {modifier}', ' till {road}'],
				'EndOfRoad': ['Sväng {modifier} vid vägens slut', ' till {road}'],
				'Onto': 'till {road}'
			},
			formatOrder: function(n) {
				return ['första', 'andra', 'tredje', 'fjärde', 'femte',
					'sjätte', 'sjunde', 'åttonde', 'nionde', 'tionde'
					/* Can't possibly be more than ten exits, can there? */][n - 1];
			},
			ui: {
				startPlaceholder: 'Från',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Till'
			}
		},

		'es': spanish,
    'sp': spanish,
		
		'nl': {
			directions: {
				N: 'noordelijke',
				NE: 'noordoostelijke',
				E: 'oostelijke',
				SE: 'zuidoostelijke',
				S: 'zuidelijke',
				SW: 'zuidewestelijke',
				W: 'westelijke',
				NW: 'noordwestelijke'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Vertrek in {dir} richting', ' de {road} op'],
				'Continue':
					['Ga in {dir} richting', ' de {road} op'],
				'SlightRight':
					['Volg de weg naar rechts', ' de {road} op'],
				'Right':
					['Ga rechtsaf', ' de {road} op'],
				'SharpRight':
					['Ga scherpe bocht naar rechts', ' de {road} op'],
				'TurnAround':
					['Keer om'],
				'SharpLeft':
					['Ga scherpe bocht naar links', ' de {road} op'],
				'Left':
					['Ga linksaf', ' de {road} op'],
				'SlightLeft':
					['Volg de weg naar links', ' de {road} op'],
				'WaypointReached':
					['Aangekomen bij tussenpunt'],
				'Roundabout':
					['Neem de {exitStr} afslag op de rotonde', ' de {road} op'],
				'DestinationReached':
					['Aangekomen op eindpunt'],
			},
			formatOrder: function(n) {
				if (n === 1 || n >= 20) {
					return n + 'ste';
				} else {
					return n + 'de';
				}
			},
			ui: {
				startPlaceholder: 'Vertrekpunt',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Bestemming'
			}
		},
		'fr': {
			directions: {
				N: 'nord',
				NE: 'nord-est',
				E: 'est',
				SE: 'sud-est',
				S: 'sud',
				SW: 'sud-ouest',
				W: 'ouest',
				NW: 'nord-ouest'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Tout droit au {dir}', ' sur {road}'],
				'Continue':
					['Continuer au {dir}', ' sur {road}'],
				'SlightRight':
					['Légèrement à droite', ' sur {road}'],
				'Right':
					['A droite', ' sur {road}'],
				'SharpRight':
					['Complètement à droite', ' sur {road}'],
				'TurnAround':
					['Faire demi-tour'],
				'SharpLeft':
					['Complètement à gauche', ' sur {road}'],
				'Left':
					['A gauche', ' sur {road}'],
				'SlightLeft':
					['Légèrement à gauche', ' sur {road}'],
				'WaypointReached':
					['Point d\'étape atteint'],
				'Roundabout':
					['Au rond-point, prenez la {exitStr} sortie', ' sur {road}'],
				'DestinationReached':
					['Destination atteinte'],
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Départ',
				viaPlaceholder: 'Intermédiaire {viaNumber}',
				endPlaceholder: 'Arrivée'
			}
		},
		'it': {
			directions: {
				N: 'nord',
				NE: 'nord-est',
				E: 'est',
				SE: 'sud-est',
				S: 'sud',
				SW: 'sud-ovest',
				W: 'ovest',
				NW: 'nord-ovest'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Dritto verso {dir}', ' su {road}'],
				'Continue':
					['Continuare verso {dir}', ' su {road}'],
				'SlightRight':
					['Mantenere la destra', ' su {road}'],
				'Right':
					['A destra', ' su {road}'],
				'SharpRight':
					['Strettamente a destra', ' su {road}'],
				'TurnAround':
					['Fare inversione di marcia'],
				'SharpLeft':
					['Strettamente a sinistra', ' su {road}'],
				'Left':
					['A sinistra', ' sur {road}'],
				'SlightLeft':
					['Mantenere la sinistra', ' su {road}'],
				'WaypointReached':
					['Punto di passaggio raggiunto'],
				'Roundabout':
					['Alla rotonda, prendere la {exitStr} uscita'],
				'DestinationReached':
					['Destinazione raggiunta'],
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Partenza',
				viaPlaceholder: 'Intermedia {viaNumber}',
				endPlaceholder: 'Destinazione'
			}
		},
		'pt': {
			directions: {
				N: 'norte',
				NE: 'nordeste',
				E: 'leste',
				SE: 'sudeste',
				S: 'sul',
				SW: 'sudoeste',
				W: 'oeste',
				NW: 'noroeste',
				SlightRight: 'curva ligeira a direita',
				Right: 'direita',
				SharpRight: 'curva fechada a direita',
				SlightLeft: 'ligeira a esquerda',
				Left: 'esquerda',
				SharpLeft: 'curva fechada a esquerda',
				Uturn: 'Meia volta'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Siga {dir}', ' na {road}'],
				'Continue':
					['Continue {dir}', ' na {road}'],
				'SlightRight':
					['Curva ligeira a direita', ' na {road}'],
				'Right':
					['Curva a direita', ' na {road}'],
				'SharpRight':
					['Curva fechada a direita', ' na {road}'],
				'TurnAround':
					['Retorne'],
				'SharpLeft':
					['Curva fechada a esquerda', ' na {road}'],
				'Left':
					['Curva a esquerda', ' na {road}'],
				'SlightLeft':
					['Curva ligueira a esquerda', ' na {road}'],
				'WaypointReached':
					['Ponto de interesse atingido'],
				'Roundabout':
					['Pegue a {exitStr} saída na rotatória', ' na {road}'],
				'DestinationReached':
					['Destino atingido'],
				'Fork': ['Na encruzilhada, vire a {modifier}', ' na {road}'],
				'Merge': ['Entre à {modifier}', ' na {road}'],
				'OnRamp': ['Vire {modifier} na rampa', ' na {road}'],
				'OffRamp': ['Entre na rampa na {modifier}', ' na {road}'],
				'EndOfRoad': ['Vire {modifier} no fim da rua', ' na {road}'],
				'Onto': 'na {road}'
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Origem',
				viaPlaceholder: 'Intermédio {viaNumber}',
				endPlaceholder: 'Destino'
			}
		},
		'sk': {
			directions: {
				N: 'sever',
				NE: 'serverovýchod',
				E: 'východ',
				SE: 'juhovýchod',
				S: 'juh',
				SW: 'juhozápad',
				W: 'západ',
				NW: 'serverozápad'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Mierte na {dir}', ' na {road}'],
				'Continue':
					['Pokračujte na {dir}', ' na {road}'],
				'SlightRight':
					['Mierne doprava', ' na {road}'],
				'Right':
					['Doprava', ' na {road}'],
				'SharpRight':
					['Prudko doprava', ' na {road}'],
				'TurnAround':
					['Otočte sa'],
				'SharpLeft':
					['Prudko doľava', ' na {road}'],
				'Left':
					['Doľava', ' na {road}'],
				'SlightLeft':
					['Mierne doľava', ' na {road}'],
				'WaypointReached':
					['Ste v prejazdovom bode.'],
				'Roundabout':
					['Odbočte na {exitStr} výjazde', ' na {road}'],
				'DestinationReached':
					['Prišli ste do cieľa.'],
			},
			formatOrder: function(n) {
				var i = n % 10 - 1,
				suffix = ['.', '.', '.'];

				return suffix[i] ? n + suffix[i] : n + '.';
			},
			ui: {
				startPlaceholder: 'Začiatok',
				viaPlaceholder: 'Cez {viaNumber}',
				endPlaceholder: 'Koniec'
			}
		},
		'el': {
			directions: {
				N: 'βόρεια',
				NE: 'βορειοανατολικά',
				E: 'ανατολικά',
				SE: 'νοτιοανατολικά',
				S: 'νότια',
				SW: 'νοτιοδυτικά',
				W: 'δυτικά',
				NW: 'βορειοδυτικά'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Κατευθυνθείτε {dir}', ' στην {road}'],
				'Continue':
					['Συνεχίστε {dir}', ' στην {road}'],
				'SlightRight':
					['Ελαφρώς δεξιά', ' στην {road}'],
				'Right':
					['Δεξιά', ' στην {road}'],
				'SharpRight':
					['Απότομη δεξιά στροφή', ' στην {road}'],
				'TurnAround':
					['Κάντε αναστροφή'],
				'SharpLeft':
					['Απότομη αριστερή στροφή', ' στην {road}'],
				'Left':
					['Αριστερά', ' στην {road}'],
				'SlightLeft':
					['Ελαφρώς αριστερά', ' στην {road}'],
				'WaypointReached':
					['Φτάσατε στο σημείο αναφοράς'],
				'Roundabout':
					['Ακολουθήστε την {exitStr} έξοδο στο κυκλικό κόμβο', ' στην {road}'],
				'DestinationReached':
					['Φτάσατε στον προορισμό σας'],
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Αφετηρία',
				viaPlaceholder: 'μέσω {viaNumber}',
				endPlaceholder: 'Προορισμός'
			}
		},
		'ca': {
			directions: {
				N: 'nord',
				NE: 'nord-est',
				E: 'est',
				SE: 'sud-est',
				S: 'sud',
				SW: 'sud-oest',
				W: 'oest',
				NW: 'nord-oest',
				SlightRight: 'lleu gir a la dreta',
				Right: 'dreta',
				SharpRight: 'gir pronunciat a la dreta',
				SlightLeft: 'gir pronunciat a l\'esquerra',
				Left: 'esquerra',
				SharpLeft: 'lleu gir a l\'esquerra',
				Uturn: 'mitja volta'
			},
			instructions: {
				'Head':
					['Recte {dir}', ' sobre {road}'],
				'Continue':
					['Continuar {dir}'],
				'TurnAround':
					['Donar la volta'],
				'WaypointReached':
					['Ha arribat a un punt del camí'],
				'Roundabout':
					['Agafar {exitStr} sortida a la rotonda', ' a {road}'],
				'DestinationReached':
					['Arribada al destí'],
				'Fork': ['A la cruïlla gira a la {modifier}', ' cap a {road}'],
				'Merge': ['Incorpora\'t {modifier}', ' a {road}'],
				'OnRamp': ['Gira {modifier} a la sortida', ' cap a {road}'],
				'OffRamp': ['Pren la sortida {modifier}', ' cap a {road}'],
				'EndOfRoad': ['Gira {modifier} al final de la carretera', ' cap a {road}'],
				'Onto': 'cap a {road}'
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Origen',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Destí'
			},
			units: {
				meters: 'm',
				kilometers: 'km',
				yards: 'yd',
				miles: 'mi',
				hours: 'h',
				minutes: 'min',
				seconds: 's'
			}
		}
	});

	module.exports = L.Routing;
})();

},{}],12:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.OSRMv1'));

	/**
	 * Works against OSRM's new API in version 5.0; this has
	 * the API version v1.
	 */
	L.Routing.Mapbox = L.Routing.OSRMv1.extend({
		options: {
			serviceUrl: 'https://api.mapbox.com/directions/v5',
			profile: 'mapbox/driving',
			useHints: false
		},

		initialize: function(accessToken, options) {
			L.Routing.OSRMv1.prototype.initialize.call(this, options);
			this.options.requestParameters = this.options.requestParameters || {};
			/* jshint camelcase: false */
			this.options.requestParameters.access_token = accessToken;
			/* jshint camelcase: true */
		}
	});

	L.Routing.mapbox = function(accessToken, options) {
		return new L.Routing.Mapbox(accessToken, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.OSRMv1":13}],13:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null),
		corslite = require('corslite'),
		polyline = require('polyline');

	// Ignore camelcase naming for this file, since OSRM's API uses
	// underscores.
	/* jshint camelcase: false */

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Waypoint'));

	/**
	 * Works against OSRM's new API in version 5.0; this has
	 * the API version v1.
	 */
	L.Routing.OSRMv1 = L.Class.extend({
		options: {
			serviceUrl: 'https://router.project-osrm.org/route/v1',
			profile: 'driving',
			timeout: 30 * 1000,
			routingOptions: {
				alternatives: true,
				steps: true
			},
			polylinePrecision: 5,
			useHints: true
		},

		initialize: function(options) {
			L.Util.setOptions(this, options);
			this._hints = {
				locations: {}
			};
		},

		route: function(waypoints, callback, context, options) {
			var timedOut = false,
				wps = [],
				url,
				timer,
				wp,
				i,
				xhr;

			options = L.extend({}, this.options.routingOptions, options);
			url = this.buildRouteUrl(waypoints, options);
			if (this.options.requestParameters) {
				url += L.Util.getParamString(this.options.requestParameters, url);
			}

			timer = setTimeout(function() {
				timedOut = true;
				callback.call(context || callback, {
					status: -1,
					message: 'OSRM request timed out.'
				});
			}, this.options.timeout);

			// Create a copy of the waypoints, since they
			// might otherwise be asynchronously modified while
			// the request is being processed.
			for (i = 0; i < waypoints.length; i++) {
				wp = waypoints[i];
				wps.push(new L.Routing.Waypoint(wp.latLng, wp.name, wp.options));
			}

			return xhr = corslite(url, L.bind(function(err, resp) {
				var data,
					error =  {};

				clearTimeout(timer);
				if (!timedOut) {
					if (!err) {
						try {
							data = JSON.parse(resp.responseText);
							try {
								return this._routeDone(data, wps, options, callback, context);
							} catch (ex) {
								error.status = -3;
								error.error = ex.toString();
							}
						} catch (ex) {
							error.status = -2;
							error.error = 'Error parsing OSRM response: ' + ex.toString();
						}
					} else {
						error = L.extend({}, err, {
							error: 'HTTP request failed: ' + err.type,
							status: -1
						})
					}

					callback.call(context || callback, error);
				} else {
					xhr.abort();
				}
			}, this));
		},

		requiresMoreDetail: function(route, zoom, bounds) {
			if (!route.properties.isSimplified) {
				return false;
			}

			var waypoints = route.inputWaypoints,
				i;
			for (i = 0; i < waypoints.length; ++i) {
				if (!bounds.contains(waypoints[i].latLng)) {
					return true;
				}
			}

			return false;
		},

		_routeDone: function(response, inputWaypoints, options, callback, context) {
			var alts = [],
			    actualWaypoints,
			    i,
			    route;

			context = context || callback;
			if (response.code !== 'Ok') {
				callback.call(context, {
					status: response.code
				});
				return;
			}

			actualWaypoints = this._toWaypoints(inputWaypoints, response.waypoints);

			for (i = 0; i < response.routes.length; i++) {
				route = this._convertRoute(response.routes[i]);
				route.inputWaypoints = inputWaypoints;
				route.waypoints = actualWaypoints;
				route.properties = {isSimplified: !options || !options.geometryOnly || options.simplifyGeometry};
				alts.push(route);
			}

			this._saveHintData(response.waypoints, inputWaypoints);

			callback.call(context, null, alts);
		},

		_convertRoute: function(responseRoute) {
			var result = {
					name: '',
					coordinates: [],
					instructions: [],
					summary: {
						totalDistance: responseRoute.distance,
						totalTime: responseRoute.duration
					}
				},
				legNames = [],
				index = 0,
				legCount = responseRoute.legs.length,
				hasSteps = responseRoute.legs[0].steps.length > 0,
				i,
				j,
				leg,
				step,
				geometry,
				type,
				modifier;

			for (i = 0; i < legCount; i++) {
				leg = responseRoute.legs[i];
				legNames.push(leg.summary && leg.summary.charAt(0).toUpperCase() + leg.summary.substring(1));
				for (j = 0; j < leg.steps.length; j++) {
					step = leg.steps[j];
					geometry = this._decodePolyline(step.geometry);
					result.coordinates.push.apply(result.coordinates, geometry);
					type = this._maneuverToInstructionType(step.maneuver, i === legCount - 1);
					modifier = this._maneuverToModifier(step.maneuver);

					if (type) {
						result.instructions.push({
							type: type,
							distance: step.distance,
							time: step.duration,
							road: step.name,
							direction: this._bearingToDirection(step.maneuver.bearing_after),
							exit: step.maneuver.exit,
							index: index,
							mode: step.mode,
							modifier: modifier
						});
					}

					index += geometry.length;
				}
			}

			result.name = legNames.join(', ');
			if (!hasSteps) {
				result.coordinates = this._decodePolyline(responseRoute.geometry);
			}

			return result;
		},

		_bearingToDirection: function(bearing) {
			var oct = Math.round(bearing / 45) % 8;
			return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][oct];
		},

		_maneuverToInstructionType: function(maneuver, lastLeg) {
			switch (maneuver.type) {
			case 'new name':
				return 'Continue';
			case 'depart':
				return 'Head';
			case 'arrive':
				return lastLeg ? 'DestinationReached' : 'WaypointReached';
			case 'roundabout':
			case 'rotary':
				return 'Roundabout';
			case 'merge':
			case 'fork':
			case 'on ramp':
			case 'off ramp':
			case 'end of road':
				return this._camelCase(maneuver.type);
			// These are all reduced to the same instruction in the current model
			//case 'turn':
			//case 'ramp': // deprecated in v5.1
			default:
				return this._camelCase(maneuver.modifier);
			}
		},

		_maneuverToModifier: function(maneuver) {
			var modifier = maneuver.modifier;

			switch (maneuver.type) {
			case 'merge':
			case 'fork':
			case 'on ramp':
			case 'off ramp':
			case 'end of road':
				modifier = this._leftOrRight(modifier);
			}

			return modifier && this._camelCase(modifier);
		},

		_camelCase: function(s) {
			var words = s.split(' '),
				result = '';
			for (var i = 0, l = words.length; i < l; i++) {
				result += words[i].charAt(0).toUpperCase() + words[i].substring(1);
			}

			return result;
		},

		_leftOrRight: function(d) {
			return d.indexOf('left') >= 0 ? 'Left' : 'Right';
		},

		_decodePolyline: function(routeGeometry) {
			var cs = polyline.decode(routeGeometry, this.options.polylinePrecision),
				result = new Array(cs.length),
				i;
			for (i = cs.length - 1; i >= 0; i--) {
				result[i] = L.latLng(cs[i]);
			}

			return result;
		},

		_toWaypoints: function(inputWaypoints, vias) {
			var wps = [],
			    i,
			    viaLoc;
			for (i = 0; i < vias.length; i++) {
				viaLoc = vias[i].location;
				wps.push(L.Routing.waypoint(L.latLng(viaLoc[1], viaLoc[0]),
				                            inputWaypoints[i].name,
											inputWaypoints[i].options));
			}

			return wps;
		},

		buildRouteUrl: function(waypoints, options) {
			var locs = [],
				hints = [],
				wp,
				latLng,
			    computeInstructions,
			    computeAlternative = true;

			for (var i = 0; i < waypoints.length; i++) {
				wp = waypoints[i];
				latLng = wp.latLng;
				locs.push(latLng.lng + ',' + latLng.lat);
				hints.push(this._hints.locations[this._locationKey(latLng)] || '');
			}

			computeInstructions =
				!(options && options.geometryOnly);

			return this.options.serviceUrl + '/' + this.options.profile + '/' +
				locs.join(';') + '?' +
				(options.geometryOnly ? (options.simplifyGeometry ? '' : 'overview=full') : 'overview=false') +
				'&alternatives=' + computeAlternative.toString() +
				'&steps=' + computeInstructions.toString() +
				(this.options.useHints ? '&hints=' + hints.join(';') : '') +
				(options.allowUTurns ? '&continue_straight=' + !options.allowUTurns : '');
		},

		_locationKey: function(location) {
			return location.lat + ',' + location.lng;
		},

		_saveHintData: function(actualWaypoints, waypoints) {
			var loc;
			this._hints = {
				locations: {}
			};
			for (var i = actualWaypoints.length - 1; i >= 0; i--) {
				loc = waypoints[i].latLng;
				this._hints.locations[this._locationKey(loc)] = actualWaypoints[i].hint;
			}
		},
	});

	L.Routing.osrmv1 = function(options) {
		return new L.Routing.OSRMv1(options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Waypoint":15,"corslite":1,"polyline":2}],14:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.GeocoderElement'));
	L.extend(L.Routing, require('./L.Routing.Waypoint'));

	L.Routing.Plan = (L.Layer || L.Class).extend({
		includes: L.Mixin.Events,

		options: {
			dragStyles: [
				{color: 'black', opacity: 0.15, weight: 9},
				{color: 'white', opacity: 0.8, weight: 6},
				{color: 'red', opacity: 1, weight: 2, dashArray: '7,12'}
			],
			draggableWaypoints: true,
			routeWhileDragging: false,
			addWaypoints: true,
			reverseWaypoints: false,
			addButtonClassName: '',
			language: 'en',
			createGeocoderElement: L.Routing.geocoderElement,
			createMarker: function(i, wp) {
				var options = {
						draggable: this.draggableWaypoints
					},
				    marker = L.marker(wp.latLng, options);

				return marker;
			},
			geocodersClassName: ''
		},

		initialize: function(waypoints, options) {
			L.Util.setOptions(this, options);
			this._waypoints = [];
			this.setWaypoints(waypoints);
		},

		isReady: function() {
			var i;
			for (i = 0; i < this._waypoints.length; i++) {
				if (!this._waypoints[i].latLng) {
					return false;
				}
			}

			return true;
		},

		getWaypoints: function() {
			var i,
				wps = [];

			for (i = 0; i < this._waypoints.length; i++) {
				wps.push(this._waypoints[i]);
			}

			return wps;
		},

		setWaypoints: function(waypoints) {
			var args = [0, this._waypoints.length].concat(waypoints);
			this.spliceWaypoints.apply(this, args);
			return this;
		},

		spliceWaypoints: function() {
			var args = [arguments[0], arguments[1]],
			    i;

			for (i = 2; i < arguments.length; i++) {
				args.push(arguments[i] && arguments[i].hasOwnProperty('latLng') ? arguments[i] : L.Routing.waypoint(arguments[i]));
			}

			[].splice.apply(this._waypoints, args);

			// Make sure there's always at least two waypoints
			while (this._waypoints.length < 2) {
				this.spliceWaypoints(this._waypoints.length, 0, null);
			}

			this._updateMarkers();
			this._fireChanged.apply(this, args);
		},

		onAdd: function(map) {
			this._map = map;
			this._updateMarkers();
		},

		onRemove: function() {
			var i;
			this._removeMarkers();

			if (this._newWp) {
				for (i = 0; i < this._newWp.lines.length; i++) {
					this._map.removeLayer(this._newWp.lines[i]);
				}
			}

			delete this._map;
		},

		createGeocoders: function() {
			var container = L.DomUtil.create('div', 'leaflet-routing-geocoders ' + this.options.geocodersClassName),
				waypoints = this._waypoints,
			    addWpBtn,
			    reverseBtn;

			this._geocoderContainer = container;
			this._geocoderElems = [];


			if (this.options.addWaypoints) {
				addWpBtn = L.DomUtil.create('button', 'leaflet-routing-add-waypoint ' + this.options.addButtonClassName, container);
				addWpBtn.setAttribute('type', 'button');
				L.DomEvent.addListener(addWpBtn, 'click', function() {
					this.spliceWaypoints(waypoints.length, 0, null);
				}, this);
			}

			if (this.options.reverseWaypoints) {
				reverseBtn = L.DomUtil.create('button', 'leaflet-routing-reverse-waypoints', container);
				reverseBtn.setAttribute('type', 'button');
				L.DomEvent.addListener(reverseBtn, 'click', function() {
					this._waypoints.reverse();
					this.setWaypoints(this._waypoints);
				}, this);
			}

			this._updateGeocoders();
			this.on('waypointsspliced', this._updateGeocoders);

			return container;
		},

		_createGeocoder: function(i) {
			var geocoder = this.options.createGeocoderElement(this._waypoints[i], i, this._waypoints.length, this.options);
			geocoder
			.on('delete', function() {
				if (i > 0 || this._waypoints.length > 2) {
					this.spliceWaypoints(i, 1);
				} else {
					this.spliceWaypoints(i, 1, new L.Routing.Waypoint());
				}
			}, this)
			.on('geocoded', function(e) {
				this._updateMarkers();
				this._fireChanged();
				this._focusGeocoder(i + 1);
				this.fire('waypointgeocoded', {
					waypointIndex: i,
					waypoint: e.waypoint
				});
			}, this)
			.on('reversegeocoded', function(e) {
				this.fire('waypointgeocoded', {
					waypointIndex: i,
					waypoint: e.waypoint
				});
			}, this);

			return geocoder;
		},

		_updateGeocoders: function() {
			var elems = [],
				i,
			    geocoderElem;

			for (i = 0; i < this._geocoderElems.length; i++) {
				this._geocoderContainer.removeChild(this._geocoderElems[i].getContainer());
			}

			for (i = this._waypoints.length - 1; i >= 0; i--) {
				geocoderElem = this._createGeocoder(i);
				this._geocoderContainer.insertBefore(geocoderElem.getContainer(), this._geocoderContainer.firstChild);
				elems.push(geocoderElem);
			}

			this._geocoderElems = elems.reverse();
		},

		_removeMarkers: function() {
			var i;
			if (this._markers) {
				for (i = 0; i < this._markers.length; i++) {
					if (this._markers[i]) {
						this._map.removeLayer(this._markers[i]);
					}
				}
			}
			this._markers = [];
		},

		_updateMarkers: function() {
			var i,
			    m;

			if (!this._map) {
				return;
			}

			this._removeMarkers();

			for (i = 0; i < this._waypoints.length; i++) {
				if (this._waypoints[i].latLng) {
					m = this.options.createMarker(i, this._waypoints[i], this._waypoints.length);
					if (m) {
						m.addTo(this._map);
						if (this.options.draggableWaypoints) {
							this._hookWaypointEvents(m, i);
						}
					}
				} else {
					m = null;
				}
				this._markers.push(m);
			}
		},

		_fireChanged: function() {
			this.fire('waypointschanged', {waypoints: this.getWaypoints()});

			if (arguments.length >= 2) {
				this.fire('waypointsspliced', {
					index: Array.prototype.shift.call(arguments),
					nRemoved: Array.prototype.shift.call(arguments),
					added: arguments
				});
			}
		},

		_hookWaypointEvents: function(m, i, trackMouseMove) {
			var eventLatLng = function(e) {
					return trackMouseMove ? e.latlng : e.target.getLatLng();
				},
				dragStart = L.bind(function(e) {
					this.fire('waypointdragstart', {index: i, latlng: eventLatLng(e)});
				}, this),
				drag = L.bind(function(e) {
					this._waypoints[i].latLng = eventLatLng(e);
					this.fire('waypointdrag', {index: i, latlng: eventLatLng(e)});
				}, this),
				dragEnd = L.bind(function(e) {
					this._waypoints[i].latLng = eventLatLng(e);
					this._waypoints[i].name = '';
					if (this._geocoderElems) {
						this._geocoderElems[i].update(true);
					}
					this.fire('waypointdragend', {index: i, latlng: eventLatLng(e)});
					this._fireChanged();
				}, this),
				mouseMove,
				mouseUp;

			if (trackMouseMove) {
				mouseMove = L.bind(function(e) {
					this._markers[i].setLatLng(e.latlng);
					drag(e);
				}, this);
				mouseUp = L.bind(function(e) {
					this._map.dragging.enable();
					this._map.off('mouseup', mouseUp);
					this._map.off('mousemove', mouseMove);
					dragEnd(e);
				}, this);
				this._map.dragging.disable();
				this._map.on('mousemove', mouseMove);
				this._map.on('mouseup', mouseUp);
				dragStart({latlng: this._waypoints[i].latLng});
			} else {
				m.on('dragstart', dragStart);
				m.on('drag', drag);
				m.on('dragend', dragEnd);
			}
		},

		dragNewWaypoint: function(e) {
			var newWpIndex = e.afterIndex + 1;
			if (this.options.routeWhileDragging) {
				this.spliceWaypoints(newWpIndex, 0, e.latlng);
				this._hookWaypointEvents(this._markers[newWpIndex], newWpIndex, true);
			} else {
				this._dragNewWaypoint(newWpIndex, e.latlng);
			}
		},

		_dragNewWaypoint: function(newWpIndex, initialLatLng) {
			var wp = new L.Routing.Waypoint(initialLatLng),
				prevWp = this._waypoints[newWpIndex - 1],
				nextWp = this._waypoints[newWpIndex],
				marker = this.options.createMarker(newWpIndex, wp, this._waypoints.length + 1),
				lines = [],
				mouseMove = L.bind(function(e) {
					var i;
					if (marker) {
						marker.setLatLng(e.latlng);
					}
					for (i = 0; i < lines.length; i++) {
						lines[i].spliceLatLngs(1, 1, e.latlng);
					}
				}, this),
				mouseUp = L.bind(function(e) {
					var i;
					if (marker) {
						this._map.removeLayer(marker);
					}
					for (i = 0; i < lines.length; i++) {
						this._map.removeLayer(lines[i]);
					}
					this._map.off('mousemove', mouseMove);
					this._map.off('mouseup', mouseUp);
					this.spliceWaypoints(newWpIndex, 0, e.latlng);
				}, this),
				i;

			if (marker) {
				marker.addTo(this._map);
			}

			for (i = 0; i < this.options.dragStyles.length; i++) {
				lines.push(L.polyline([prevWp.latLng, initialLatLng, nextWp.latLng],
					this.options.dragStyles[i]).addTo(this._map));
			}

			this._map.on('mousemove', mouseMove);
			this._map.on('mouseup', mouseUp);
		},

		_focusGeocoder: function(i) {
			if (this._geocoderElems[i]) {
				this._geocoderElems[i].focus();
			} else {
				document.activeElement.blur();
			}
		}
	});

	L.Routing.plan = function(waypoints, options) {
		return new L.Routing.Plan(waypoints, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.GeocoderElement":7,"./L.Routing.Waypoint":15}],15:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
	L.Routing = L.Routing || {};

	L.Routing.Waypoint = L.Class.extend({
			options: {
				allowUTurn: false,
			},
			initialize: function(latLng, name, options) {
				L.Util.setOptions(this, options);
				this.latLng = L.latLng(latLng);
				this.name = name;
			}
		});

	L.Routing.waypoint = function(latLng, name, options) {
		return new L.Routing.Waypoint(latLng, name, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[4])(4)
});
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(require,module,exports){
'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};

function encode(coordinate, factor) {
    coordinate = Math.round(coordinate * factor);
    coordinate <<= 1;
    if (coordinate < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], factor) + encode(coordinates[0][1], factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0] - b[0], factor);
        output += encode(a[1] - b[1], factor);
    }

    return output;
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        flipped.push(coords[i].slice().reverse());
    }
    return flipped;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }
    return polyline.encode(flipped(geojson.coordinates), precision);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords = polyline.decode(str, precision);
    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}

},{}],3:[function(require,module,exports){
(function (global){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
var MapzenRouter = require('./mapzenRouter');
var MapzenLine = require('./mapzenLine');
var MapzenFormatter = require('./mapzenFormatter');

L.Routing = L.Routing || {};
L.routing = L.routing || {};

L.Routing.Mapzen = MapzenRouter;
L.Routing.MapzenLine = MapzenLine;
L.Routing.MapzenFormatter = MapzenFormatter;


L.routing.mapzen = function(key, options) {
  return new MapzenRouter(key, options);
}

L.routing.mapzenLine = function(route, options) {
  return new MapzenLine(route, options);
}

L.routing.mapzenFormatter = function(options) {
  return new MapzenFormatter(options);
}

// deperecate these parts later

L.Routing.mapzen = L.routing.mapzen;
L.Routing.mapzenLine = L.routing.mapzenLine;
L.Routing.mapzenFormatter = L.routing.mapzenFormatter;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mapzenFormatter":4,"./mapzenLine":5,"./mapzenRouter":6}],4:[function(require,module,exports){
(function (global){
(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

  //L.extend(L.Routing, require('./L.Routing.Localization'));
  module.exports = L.Class.extend({
    options: {
      units: 'metric',
      unitNames: {
        meters: 'm',
        kilometers: 'km',
        yards: 'yd',
        miles: 'mi',
        hours: 'h',
        minutes: 'mín',
        seconds: 's'
      },
      language: 'en',
      roundingSensitivity: 1,
      distanceTemplate: '{value} {unit}'
    },

    initialize: function(options) {
      L.setOptions(this, options);
    },

    formatDistance: function(d /* Number (meters) */) {
      var un = this.options.unitNames,
          v,
        data;
      if (this.options.units === 'imperial') {
        //valhalla returns distance in km
        d  = d * 1000;
        d = d / 1.609344;
        if (d >= 1000) {
          data = {
            value: (this._round(d) / 1000),
            unit: un.miles
          };
        } else {
          data = {
            value: this._round(d / 1.760),
            unit: un.yards
          };
        }
      } else {
        v = d;
        data = {
          value: v >= 1 ? v: v*1000,
          unit: v >= 1 ? un.kilometers : un.meters
        };
      }

       return L.Util.template(this.options.distanceTemplate, data);
    },

    _round: function(d) {
      var pow10 = Math.pow(10, (Math.floor(d / this.options.roundingSensitivity) + '').length - 1),
        r = Math.floor(d / pow10),
        p = (r > 5) ? pow10 : pow10 / 2;

      return Math.round(d / p) * p;
    },

    formatTime: function(t /* Number (seconds) */) {
      if (t > 86400) {
        return Math.round(t / 3600) + ' h';
      } else if (t > 3600) {
        return Math.floor(t / 3600) + ' h ' +
          Math.round((t % 3600) / 60) + ' min';
      } else if (t > 300) {
        return Math.round(t / 60) + ' min';
      } else if (t > 60) {
        return Math.floor(t / 60) + ' min' +
          (t % 60 !== 0 ? ' ' + (t % 60) + ' s' : '');
      } else {
        return t + ' s';
      }
    },

    formatInstruction: function(instr, i) {
      // Valhalla returns instructions itself.
      return instr.instruction;
    },

    getIconName: function(instr, i) {
      // you can find all Valhalla's direction types at https://github.com/valhalla/odin/blob/master/proto/tripdirections.proto
      switch (instr.type) {
        case 0:
          return 'kNone';
        case 1:
          return 'kStart';
        case 2:
          return 'kStartRight';
        case 3:
          return 'kStartLeft';
        case 4:
          return 'kDestination';
        case 5:
          return 'kDestinationRight';
        case 6:
          return 'kDestinationLeft';
        case 7:
          return 'kBecomes';
        case 8:
          return 'kContinue';
        case 9:
          return 'kSlightRight';
        case 10:
          return 'kRight';
        case 11:
          return 'kSharpRight';
        case 12:
          return 'kUturnRight';
        case 13:
          return 'kUturnLeft';
        case 14:
          return 'kSharpLeft';
        case 15:
          return 'kLeft';
        case 16:
          return 'kSlightLeft';
        case 17:
          return 'kRampStraight';
        case 18:
          return 'kRampRight';
        case 19:
          return 'kRampLeft';
        case 20:
          return 'kExitRight';
        case 21:
          return 'kExitLeft';
        case 22:
          return 'kStayStraight';
        case 23:
          return 'kStayRight';
        case 24:
          return 'kStayLeft';
        case 25:
          return 'kMerge';
        case 26:
          return 'kRoundaboutEnter';
        case 27:
          return 'kRoundaboutExit';
        case 28:
          return 'kFerryEnter';
        case 29:
          return 'kFerryExit';
        // lrm-mapzen unifies transit commands and give them same icons
        case 30:
        case 31: //'kTransitTransfer'
        case 32: //'kTransitRemainOn'
        case 33: //'kTransitConnectionStart'
        case 34: //'kTransitConnectionTransfer'
        case 35: //'kTransitConnectionDestination'
        case 36: //'kTransitConnectionDestination'
          if (instr.edited_travel_type) return 'kTransit' + this._getCapitalizedName(instr.edited_travel_type);
          else return 'kTransit';
      }
    },

    _getInstructionTemplate: function(instr, i) {
      return instr.instruction + " " +instr.length;
    },
    _getCapitalizedName: function(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  });

})();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

	module.exports = L.LayerGroup.extend({
		includes: L.Mixin.Events,

		options: {
			styles: [
				{color: 'black', opacity: 0.15, weight: 9},
				{color: 'white', opacity: 0.8, weight: 6},
				{color: 'red', opacity: 1, weight: 2}
			],
			missingRouteStyles: [
				{color: 'black', opacity: 0.15, weight: 7},
				{color: 'white', opacity: 0.6, weight: 4},
				{color: 'gray', opacity: 0.8, weight: 2, dashArray: '7,12'}
			],
			addWaypoints: true,
			extendToWaypoints: true,
			missingRouteTolerance: 10
		},

		initialize: function(route, options) {
			L.setOptions(this, options);
			L.LayerGroup.prototype.initialize.call(this, options);
			this._route = route;

			if (this.options.extendToWaypoints) {
				this._extendToWaypoints();
			}

			if (route.subRoutes) {
				for(var i = 0; i < route.subRoutes.length; i++) {
					if(!route.subRoutes[i].styles) route.subRoutes[i].styles = this.options.styles;
					this._addSegment(
						route.subRoutes[i].coordinates,
						route.subRoutes[i].styles,
						this.options.addWaypoints);
				}
			} else {
			 this._addSegment(
			 	route.coordinates,
			 	this.options.styles,
			 	this.options.addWaypoints);
			}
		},

		addTo: function(map) {
			map.addLayer(this);
			return this;
		},
		getBounds: function() {
			return L.latLngBounds(this._route.coordinates);
		},

		_findWaypointIndices: function() {
			var wps = this._route.inputWaypoints,
			    indices = [],
			    i;
			for (i = 0; i < wps.length; i++) {
				indices.push(this._findClosestRoutePoint(wps[i].latLng));
			}

			return indices;
		},

		_findClosestRoutePoint: function(latlng) {
			var minDist = Number.MAX_VALUE,
				minIndex,
			    i,
			    d;

			for (i = this._route.coordinates.length - 1; i >= 0 ; i--) {
				// TODO: maybe do this in pixel space instead?
				d = latlng.distanceTo(this._route.coordinates[i]);
				if (d < minDist) {
					minIndex = i;
					minDist = d;
				}
			}

			return minIndex;
		},

		_extendToWaypoints: function() {
			var wps = this._route.inputWaypoints,
				wpIndices = this._getWaypointIndices(),
			    i,
			    wpLatLng,
			    routeCoord;

			for (i = 0; i < wps.length; i++) {
				wpLatLng = wps[i].latLng;
				routeCoord = L.latLng(this._route.coordinates[wpIndices[i]]);
				if (wpLatLng.distanceTo(routeCoord) >
					this.options.missingRouteTolerance) {
					this._addSegment([wpLatLng, routeCoord],
						this.options.missingRouteStyles);
				}
			}
		},

		_addSegment: function(coords, styles, mouselistener) {
			var i,
				pl;
			for (i = 0; i < styles.length; i++) {
				pl = L.polyline(coords, styles[i]);
				this.addLayer(pl);
				if (mouselistener) {
					pl.on('mousedown', this._onLineTouched, this);
				}
			}
		},

		_findNearestWpBefore: function(i) {
			var wpIndices = this._getWaypointIndices(),
				j = wpIndices.length - 1;
			while (j >= 0 && wpIndices[j] > i) {
				j--;
			}

			return j;
		},

		_onLineTouched: function(e) {
			var afterIndex = this._findNearestWpBefore(this._findClosestRoutePoint(e.latlng));
			this.fire('linetouched', {
				afterIndex: afterIndex,
				latlng: e.latlng
			});
		},

		_getWaypointIndices: function() {
			if (!this._wpIndices) {
				this._wpIndices = this._route.waypointIndices || this._findWaypointIndices();
			}

			return this._wpIndices;
		}
	});

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
  var corslite = require('corslite');
  var polyline = require('polyline');

  var Waypoint = require('./waypoint');

  module.exports = L.Class.extend({
    options: {
      timeout: 30 * 1000
    },

    initialize: function(accessToken, options) {
      L.Util.setOptions(this, options);
      this._accessToken = accessToken;
      this._hints = {
        locations: {}
      };
    },

    route: function(waypoints, callback, context, options) {
      var timedOut = false,
        wps = [],
        routeOptions = {},
        url,
        timer,
        wp,
        i;

      routeOptions = this.options || {};
      //waypoints = options.waypoints || waypoints;

      url = this.buildRouteUrl(waypoints, routeOptions);

      timer = setTimeout(function() {
                timedOut = true;
                callback.call(context || callback, {
                  status: -1,
                  message: 'Time out.'
                });
              }, this.options.timeout);

      // Create a copy of the waypoints, since they
      // might otherwise be asynchronously modified while
      // the request is being processed.
      for (i = 0; i < waypoints.length; i++) {
        wp = waypoints[i];
        wps.push(new Waypoint(L.latLng(wp.latLng), wp.name || "", wp.options || {}))
      }

      corslite(url, L.bind(function(err, resp) {
        var data;

        clearTimeout(timer);
        if (!timedOut) {
          if (!err) {
            data = JSON.parse(resp.responseText);
            this._routeDone(data, wps, routeOptions, callback, context);
          } else {
            console.log("Error : " + err.response);
            callback.call(context || callback, {
              status: err.status,
              message: err.response
            });
          }
        }
      }, this), true);

      return this;
    },

    _routeDone: function(response, inputWaypoints, routeOptions, callback, context) {

      var coordinates,
          alts,
          actualWaypoints,
          i;
      context = context || callback;
      if (response.trip.status !== 0) {
        callback.call(context, {
          status: response.status,
          message: response.status_message
        });
        return;
      }

      var insts = [];
      var coordinates = [];
      var shapeIndex =  0;

      for(var i = 0; i < response.trip.legs.length; i++){
        var coord = polyline.decode(response.trip.legs[i].shape, 6);

        for(var k = 0; k < coord.length; k++){
          coordinates.push(L.latLng(coord[k][0], coord[k][1]));
        }

        for(var j =0; j < response.trip.legs[i].maneuvers.length; j++){
          var res = response.trip.legs[i].maneuvers[j];
          res.distance = response.trip.legs[i].maneuvers[j]["length"];
          res.index = shapeIndex + response.trip.legs[i].maneuvers[j]["begin_shape_index"];
          insts.push(res);
        }

        if(routeOptions.costing === 'multimodal') insts = this._unifyTransitManeuver(insts);

        shapeIndex += response.trip.legs[i].maneuvers[response.trip.legs[i].maneuvers.length-1]["begin_shape_index"];
      }

      actualWaypoints = this._toWaypoints(inputWaypoints, response.trip.locations);

      var subRoutes;
      if(routeOptions.costing == 'multimodal') subRoutes = this._getSubRoutes(response.trip.legs)

      alts = [{
        name: this._trimLocationKey(inputWaypoints[0].latLng) + " , " + this._trimLocationKey(inputWaypoints[1].latLng) ,
        unit: response.trip.units,
        costing: routeOptions.costing,
        coordinates: coordinates,
        subRoutes: subRoutes,
        instructions: insts,//response.route_instructions ? this._convertInstructions(response.route_instructions) : [],
        summary: response.trip.summary ? this._convertSummary(response.trip.summary) : [],
        inputWaypoints: inputWaypoints,
        waypoints: actualWaypoints,
        waypointIndices: this._clampIndices([0,response.trip.legs[0].maneuvers.length], coordinates)
      }];

      // only versions <4.5.0 will support this flag
        if (response.hint_data) {
          this._saveHintData(response.hint_data, inputWaypoints);
        }
      callback.call(context, null, alts);
    },

    // lrm mapzen is trying to unify manuver of subroutes,
    // travle type number including transit routing is > 30 including entering the station, exiting the station
    // look at the api docs for more info (docs link coming soon)
    _unifyTransitManeuver: function(insts) {

      var transitType;
      var newInsts = insts;

      for(var i = 0; i < newInsts.length; i++) {
        if(newInsts[i].type == 30) {
          transitType = newInsts[i].travel_type;
          break;
        }
      }

      for(var j = 0; j < newInsts.length; j++) {
        if(newInsts[j].type > 29) newInsts[j].edited_travel_type = transitType;
      }

      return newInsts;

    },

    //creates section of the polyline based on change of travel mode for multimodal
    _getSubRoutes: function(legs) {

      var subRoute = [];

      for (var i = 0; i < legs.length; i++) {

        var coords = polyline.decode(legs[i].shape, 6);

        var lastTravelType;
        var transitIndices = [];
        for(var j = 0; j < legs[i].maneuvers.length; j++){

          var res = legs[i].maneuvers[j];
          var travelType = res.travel_type;

          if(travelType !== lastTravelType || res.type === 31 /*this is for transfer*/) {
            //transit_info only exists in the transit maneuvers
            //loop thru maneuvers and populate indices array with begin shape index
            //also populate subRoute array to contain the travel type & color associated with the transit polyline sub-section
            //otherwise just populate with travel type and use fallback style
            if(res.begin_shape_index > 0) transitIndices.push(res.begin_shape_index);
            if(res.transit_info) subRoute.push({ travel_type: travelType, styles: this._getPolylineColor(res.transit_info.color) })
            else subRoute.push({travel_type: travelType})
          }

          lastTravelType = travelType;
        }

        //add coords length to indices array
        transitIndices.push(coords.length);

        //logic to create the subsets of the polyline by indexing into the shape
        var index_marker = 0;
        for(var index = 0; index < transitIndices.length; index++) {
          var subRouteArr = [];
          var overwrapping = 0;
          //if index != the last indice, we want to overwrap (or add 1) so that routes connect
          if(index !== transitIndices.length-1) overwrapping = 1;
          for (var ti = index_marker; ti < transitIndices[index] + overwrapping; ti++){
            subRouteArr.push(coords[ti]);
          }

          var temp_array = subRouteArr;
          index_marker = transitIndices[index];
          subRoute[index].coordinates = temp_array;
        }
      }
      return subRoute;
    },

    _getPolylineColor: function(intColor) {

      // isolate red, green, and blue components
      var red = (intColor >> 16) & 0xff,
          green = (intColor >> 8) & 0xff,
          blue = (intColor >> 0) & 0xff;

      // calculate luminance in YUV colorspace based on
      // https://en.wikipedia.org/wiki/YUV#Conversion_to.2Ffrom_RGB
      var lum = 0.299 * red + 0.587 * green + 0.114 * blue,
          is_light = (lum > 0xbb);

      // generate a CSS color string like 'RRGGBB'
      var paddedHex = 0x1000000 | (intColor & 0xffffff),
          lineColor = paddedHex.toString(16).substring(1, 7);

      var polylineColor = [
              // Color of outline depending on luminance against background.
              (is_light ? {color: '#000', opacity: 0.4, weight: 10}
                        : {color: '#fff', opacity: 0.8, weight: 10}),

              // Color of the polyline subset.
              {color: '#'+lineColor.toUpperCase(), opacity: 1, weight: 6}
            ]

      return polylineColor;
   },


    _saveHintData: function(hintData, waypoints) {
      var loc;
      this._hints = {
        checksum: hintData.checksum,
        locations: {}
      };
      for (var i = hintData.locations.length - 1; i >= 0; i--) {
        loc = waypoints[i].latLng;
        this._hints.locations[this._locationKey(loc)] = hintData.locations[i];
      }
    },

    _toWaypoints: function(inputWaypoints, vias) {
      var wps = [],
          i;
      for (i = 0; i < vias.length; i++) {
        wps.push(new Waypoint(L.latLng([vias[i]["lat"],vias[i]["lon"]]),
                                    "name",
                                    {}));
      }

      return wps;
    },
    ///mapzen example
    buildRouteUrl: function(waypoints, options) {
      var serviceUrl = 'https://valhalla.mapzen.com';
      var locs = [],
          locationKey,
          hint;

      var costing = options.costing;
      var costingOptions = options.costing_options;
      var directionsOptions = options.directions_options;
      var dateTime = options.date_time;

      for (var i = 0; i < waypoints.length; i++) {
        var loc;
        locationKey = this._locationKey(waypoints[i].latLng).split(',');
        if(i === 0 || i === waypoints.length-1){
          loc = {
            lat: parseFloat(locationKey[0]),
            lon: parseFloat(locationKey[1]),
            type: "break"
          }
        }else{
          loc = {
            lat: parseFloat(locationKey[0]),
            lon: parseFloat(locationKey[1]),
            type: "through"
          }
        }
        locs.push(loc);
      }

      var params = JSON.stringify({
        locations: locs,
        costing: costing,
        costing_options: costingOptions,
        directions_options: directionsOptions,
        date_time: dateTime
     });

      return serviceUrl + '/route?json=' +
              params + '&api_key=' + this._accessToken;
    },

    _locationKey: function(location) {
      return location.lat + ',' + location.lng;
    },

    _trimLocationKey: function(location){
      var lat = location.lat;
      var lng = location.lng;

      var nameLat = Math.floor(location.lat * 1000)/1000;
      var nameLng = Math.floor(location.lng * 1000)/1000;

      return nameLat + ' , ' + nameLng;

    },

    _convertSummary: function(route) {
      return {
        totalDistance: route.length,
        totalTime: route.time
      };
    },

    _convertInstructions: function(instructions) {
      var result = [],
          i,
          instr,
          type,
          driveDir;

      for (i = 0; i < instructions.length; i++) {
        instr = instructions[i];
        type = this._drivingDirectionType(instr[0]);
        driveDir = instr[0].split('-');
        if (type) {
          result.push({
            type: type,
            distance: instr[2],
            time: instr[4],
            road: instr[1],
            direction: instr[6],
            exit: driveDir.length > 1 ? driveDir[1] : undefined,
            index: instr[3]
          });
        }
      }
      return result;
    },

    _clampIndices: function(indices, coords) {
      var maxCoordIndex = coords.length - 1,
        i;
      for (i = 0; i < indices.length; i++) {
        indices[i] = Math.min(maxCoordIndex, Math.max(indices[i], 0));
      }
    }
  });

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./waypoint":7,"corslite":1,"polyline":2}],7:[function(require,module,exports){
(function (global){
(function() {
  'use strict';

  var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

  module.exports = L.Class.extend({
    options: {
      allowUTurn: false,
    },
    initialize: function(latLng, name, options) {
      L.Util.setOptions(this, options);
      this.latLng = L.latLng(latLng);
      this.name = name;
    }
  });
})();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[3,4,5,6,7]);

(function (factory) {
	// Packaging/modules magic dance
	var L;
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet'], factory);
	} else if (typeof module !== 'undefined') {
		// Node/CommonJS
		L = require('leaflet');
		module.exports = factory(L);
	} else {
		// Browser globals
		if (typeof window.L === 'undefined')
			throw 'Leaflet must be loaded first';
		factory(window.L);
	}
}(function (L) {
	'use strict';
	L.Control.Geocoder = L.Control.extend({
		options: {
			showResultIcons: false,
			collapsed: true,
			expand: 'click',
			position: 'topright',
			placeholder: 'Search...',
			errorMessage: 'Nothing found.'
		},

		_callbackId: 0,

		initialize: function (options) {
			L.Util.setOptions(this, options);
			if (!this.options.geocoder) {
				this.options.geocoder = new L.Control.Geocoder.Nominatim();
			}
		},

		onAdd: function (map) {
			var className = 'leaflet-control-geocoder',
			    container = L.DomUtil.create('div', className),
				icon = L.DomUtil.create('div', 'leaflet-control-geocoder-icon', container),
			    form = this._form = L.DomUtil.create('form', className + '-form', container),
			    input;

			this._map = map;
			this._container = container;
			input = this._input = L.DomUtil.create('input');
			input.type = 'text';
			input.placeholder = this.options.placeholder;

			L.DomEvent.addListener(input, 'keydown', this._keydown, this);
			//L.DomEvent.addListener(input, 'onpaste', this._clearResults, this);
			//L.DomEvent.addListener(input, 'oninput', this._clearResults, this);

			this._errorElement = document.createElement('div');
			this._errorElement.className = className + '-form-no-error';
			this._errorElement.innerHTML = this.options.errorMessage;

			this._alts = L.DomUtil.create('ul', className + '-alternatives leaflet-control-geocoder-alternatives-minimized');

			form.appendChild(input);
			form.appendChild(this._errorElement);
			container.appendChild(this._alts);

			L.DomEvent.addListener(form, 'submit', this._geocode, this);

			if (this.options.collapsed) {
				if (this.options.expand === 'click') {
					L.DomEvent.addListener(icon, 'click', function(e) {
						// TODO: touch
						if (e.button === 0 && e.detail !== 2) {
							this._toggle();
						}
					}, this);
				} else {
					L.DomEvent.addListener(icon, 'mouseover', this._expand, this);
					L.DomEvent.addListener(icon, 'mouseout', this._collapse, this);
					this._map.on('movestart', this._collapse, this);
				}
			} else {
				this._expand();
			}

			L.DomEvent.disableClickPropagation(container);

			return container;
		},

		_geocodeResult: function (results) {
			L.DomUtil.removeClass(this._container, 'leaflet-control-geocoder-throbber');
			if (results.length === 1) {
				this._geocodeResultSelected(results[0]);
			} else if (results.length > 0) {
				this._alts.innerHTML = '';
				this._results = results;
				L.DomUtil.removeClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
				for (var i = 0; i < results.length; i++) {
					this._alts.appendChild(this._createAlt(results[i], i));
				}
			} else {
				L.DomUtil.addClass(this._errorElement, 'leaflet-control-geocoder-error');
			}
		},

		markGeocode: function(result) {
			this._map.fitBounds(result.bbox);

			if (this._geocodeMarker) {
				this._map.removeLayer(this._geocodeMarker);
			}

			this._geocodeMarker = new L.Marker(result.center)
				.bindPopup(result.html || result.name)
				.addTo(this._map)
				.openPopup();

			return this;
		},

		_geocode: function(event) {
			L.DomEvent.preventDefault(event);

			L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-throbber');
			this._clearResults();
			this.options.geocoder.geocode(this._input.value, this._geocodeResult, this);

			return false;
		},

		_geocodeResultSelected: function(result) {
			if (this.options.collapsed) {
				this._collapse();
			} else {
				this._clearResults();
			}
			this.markGeocode(result);
		},

		_toggle: function() {
			if (this._container.className.indexOf('leaflet-control-geocoder-expanded') >= 0) {
				this._collapse();
			} else {
				this._expand();
			}
		},

		_expand: function () {
			L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-expanded');
			this._input.select();
		},

		_collapse: function () {
			this._container.className = this._container.className.replace(' leaflet-control-geocoder-expanded', '');
			L.DomUtil.addClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
			L.DomUtil.removeClass(this._errorElement, 'leaflet-control-geocoder-error');
		},

		_clearResults: function () {
			L.DomUtil.addClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
			this._selection = null;
			L.DomUtil.removeClass(this._errorElement, 'leaflet-control-geocoder-error');
		},

		_createAlt: function(result, index) {
			var li = document.createElement('li'),
			    a = L.DomUtil.create('a', '', li),
			    icon = this.options.showResultIcons && result.icon ? L.DomUtil.create('img', '', a) : null,
			    text = result.html ? undefined : document.createTextNode(result.name);

			if (icon) {
				icon.src = result.icon;
			}

			a.href = '#';
			a.setAttribute('data-result-index', index);

			if (result.html) {
				a.innerHTML = result.html;
			} else {
				a.appendChild(text);
			}

			L.DomEvent.addListener(li, 'click', function clickHandler(e) {
				L.DomEvent.preventDefault(e);
				this._geocodeResultSelected(result);
			}, this);

			return li;
		},

		_keydown: function(e) {
			var _this = this,
				select = function select(dir) {
					if (_this._selection) {
						L.DomUtil.removeClass(_this._selection.firstChild, 'leaflet-control-geocoder-selected');
						_this._selection = _this._selection[dir > 0 ? 'nextSibling' : 'previousSibling'];
					}
					if (!_this._selection) {
						_this._selection = _this._alts[dir > 0 ? 'firstChild' : 'lastChild'];
					}

					if (_this._selection) {
						L.DomUtil.addClass(_this._selection.firstChild, 'leaflet-control-geocoder-selected');
					}
				};

			switch (e.keyCode) {
			// Escape
			case 27:
				if (this.options.collapsed) {
					this._collapse();
				}
				break;
			// Up
			case 38:
				select(-1);
				L.DomEvent.preventDefault(e);
				break;
			// Up
			case 40:
				select(1);
				L.DomEvent.preventDefault(e);
				break;
			// Enter
			case 13:
				if (this._selection) {
					var index = parseInt(this._selection.firstChild.getAttribute('data-result-index'), 10);
					this._geocodeResultSelected(this._results[index]);
					this._clearResults();
					L.DomEvent.preventDefault(e);
				}
			}
			return true;
		}
	});

	L.Control.geocoder = function(id, options) {
		return new L.Control.Geocoder(id, options);
	};

	L.Control.Geocoder.callbackId = 0;
	L.Control.Geocoder.jsonp = function(url, params, callback, context, jsonpParam) {
		var callbackId = '_l_geocoder_' + (L.Control.Geocoder.callbackId++);
		params[jsonpParam || 'callback'] = callbackId;
		window[callbackId] = L.Util.bind(callback, context);
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url + L.Util.getParamString(params);
		script.id = callbackId;
		document.getElementsByTagName('head')[0].appendChild(script);
	};
	L.Control.Geocoder.getJSON = function(url, params, callback) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", url + L.Util.getParamString(params), true);
		xmlHttp.send(null);
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState != 4) return;
			if (xmlHttp.status != 200 && req.status != 304) return;
			callback(JSON.parse(xmlHttp.response));
		};
	};

	L.Control.Geocoder.template = function (str, data, htmlEscape) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				value = '';
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return L.Control.Geocoder.htmlEscape(value);
		});
	};

	// Adapted from handlebars.js
	// https://github.com/wycats/handlebars.js/
	L.Control.Geocoder.htmlEscape = (function() {
		var badChars = /[&<>"'`]/g;
		var possible = /[&<>"'`]/;
		var escape = {
		  '&': '&amp;',
		  '<': '&lt;',
		  '>': '&gt;',
		  '"': '&quot;',
		  '\'': '&#x27;',
		  '`': '&#x60;'
		};

		function escapeChar(chr) {
		  return escape[chr];
		}

		return function(string) {
			if (string == null) {
				return '';
			} else if (!string) {
				return string + '';
			}

			// Force a string conversion as this will be done by the append regardless and
			// the regex test will do this transparently behind the scenes, causing issues if
			// an object's to string has escaped characters in it.
			string = '' + string;

			if (!possible.test(string)) {
				return string;
			}
			return string.replace(badChars, escapeChar);
		};
	})();

	L.Control.Geocoder.Nominatim = L.Class.extend({
		options: {
			serviceUrl: '//nominatim.openstreetmap.org/',
			geocodingQueryParams: {},
			reverseQueryParams: {},
			htmlTemplate: function(r) {
				var a = r.address,
					parts = [];
				if (a.road || a.building) {
					parts.push('{building} {road} {house_number}');
				}

				if (a.city || a.town || a.village) {
					parts.push('<span class="' + (parts.length > 0 ? 'leaflet-control-geocoder-address-detail' : '') +
						'">{postcode} {city} {town} {village}</span>');
				}

				if (a.state || a.country) {
					parts.push('<span class="' + (parts.length > 0 ? 'leaflet-control-geocoder-address-context' : '') +
						'">{state} {country}</span>');
				}

				return L.Control.Geocoder.template(parts.join('<br/>'), a, true);
			}
		},

		initialize: function(options) {
			L.Util.setOptions(this, options);
		},

		geocode: function(query, cb, context) {
			L.Control.Geocoder.jsonp(this.options.serviceUrl + 'search/', L.extend({
				q: query,
				limit: 5,
				format: 'json',
				addressdetails: 1
			}, this.options.geocodingQueryParams),
			function(data) {
				var results = [];
				for (var i = data.length - 1; i >= 0; i--) {
					var bbox = data[i].boundingbox;
					for (var j = 0; j < 4; j++) bbox[j] = parseFloat(bbox[j]);
					results[i] = {
						icon: data[i].icon,
						name: data[i].display_name,
						html: this.options.htmlTemplate ?
							this.options.htmlTemplate(data[i])
							: undefined,
						bbox: L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
						center: L.latLng(data[i].lat, data[i].lon),
						properties: data[i]
					};
				}
				cb.call(context, results);
			}, this, 'json_callback');
		},

		reverse: function(location, scale, cb, context) {
			L.Control.Geocoder.jsonp(this.options.serviceUrl + 'reverse/', L.extend({
				lat: location.lat,
				lon: location.lng,
				zoom: Math.round(Math.log(scale / 256) / Math.log(2)),
				addressdetails: 1,
				format: 'json'
			}, this.options.reverseQueryParams), function(data) {
				var result = [],
				    loc;

				if (data && data.lat && data.lon) {
					loc = L.latLng(data.lat, data.lon);
					result.push({
						name: data.display_name,
						html: this.options.htmlTemplate ?
							this.options.htmlTemplate(data)
							: undefined,
						center: loc,
						bounds: L.latLngBounds(loc, loc),
						properties: data
					});
				}

				cb.call(context, result);
			}, this, 'json_callback');
		}
	});

	L.Control.Geocoder.nominatim = function(options) {
		return new L.Control.Geocoder.Nominatim(options);
	};

	L.Control.Geocoder.Bing = L.Class.extend({
		initialize: function(key) {
			this.key = key;
		},

		geocode : function (query, cb, context) {
			L.Control.Geocoder.jsonp('//dev.virtualearth.net/REST/v1/Locations', {
				query: query,
				key : this.key
			}, function(data) {
				var results = [];
				for (var i = data.resourceSets[0].resources.length - 1; i >= 0; i--) {
					var resource = data.resourceSets[0].resources[i],
						bbox = resource.bbox;
					results[i] = {
						name: resource.name,
						bbox: L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
						center: L.latLng(resource.point.coordinates)
					};
				}
				cb.call(context, results);
			}, this, 'jsonp');
		},

		reverse: function(location, scale, cb, context) {
			L.Control.Geocoder.jsonp('//dev.virtualearth.net/REST/v1/Locations/' + location.lat + ',' + location.lng, {
				key : this.key
			}, function(data) {
				var results = [];
				for (var i = data.resourceSets[0].resources.length - 1; i >= 0; i--) {
					var resource = data.resourceSets[0].resources[i],
						bbox = resource.bbox;
					results[i] = {
						name: resource.name,
						bbox: L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
						center: L.latLng(resource.point.coordinates)
					};
				}
				cb.call(context, results);
			}, this, 'jsonp');
		}
	});

	L.Control.Geocoder.bing = function(key) {
		return new L.Control.Geocoder.Bing(key);
	};

	L.Control.Geocoder.RaveGeo = L.Class.extend({
		options: {
			querySuffix: '',
			deepSearch: true,
			wordBased: false
		},

		jsonp: function(params, callback, context) {
			var callbackId = '_l_geocoder_' + (L.Control.Geocoder.callbackId++),
				paramParts = [];
			params.prepend = callbackId + '(';
			params.append = ')';
			for (var p in params) {
				paramParts.push(p + '=' + escape(params[p]));
			}

			window[callbackId] = L.Util.bind(callback, context);
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = this._serviceUrl + '?' + paramParts.join('&');
			script.id = callbackId;
			document.getElementsByTagName('head')[0].appendChild(script);
		},

		initialize: function(serviceUrl, scheme, options) {
			L.Util.setOptions(this, options);

			this._serviceUrl = serviceUrl;
			this._scheme = scheme;
		},

		geocode: function(query, cb, context) {
			L.Control.Geocoder.jsonp(this._serviceUrl, {
				address: query + this.options.querySuffix,
				scheme: this._scheme,
				outputFormat: 'jsonp',
				deepSearch: this.options.deepSearch,
				wordBased: this.options.wordBased
			}, function(data) {
				var results = [];
				for (var i = data.length - 1; i >= 0; i--) {
					var r = data[i],
						c = L.latLng(r.y, r.x);
					results[i] = {
						name: r.address,
						bbox: L.latLngBounds([c]),
						center: c
					};
				}
				cb.call(context, results);
			}, this);
		}
	});

	L.Control.Geocoder.raveGeo = function(serviceUrl, scheme, options) {
		return new L.Control.Geocoder.RaveGeo(serviceUrl, scheme, options);
	};

	L.Control.Geocoder.MapQuest = L.Class.extend({
		initialize: function(key) {
			// MapQuest seems to provide URI encoded API keys,
			// so to avoid encoding them twice, we decode them here
			this._key = decodeURIComponent(key);
		},

		_formatName: function() {
			var r = [],
				i;
			for (i = 0; i < arguments.length; i++) {
				if (arguments[i]) {
					r.push(arguments[i]);
				}
			}

			return r.join(', ');
		},

		geocode: function(query, cb, context) {
			L.Control.Geocoder.jsonp('//www.mapquestapi.com/geocoding/v1/address', {
				key: this._key,
				location: query,
				limit: 5,
				outFormat: 'json'
			}, function(data) {
				var results = [],
					loc,
					latLng;
				if (data.results && data.results[0].locations) {
					for (var i = data.results[0].locations.length - 1; i >= 0; i--) {
						loc = data.results[0].locations[i];
						latLng = L.latLng(loc.latLng);
						results[i] = {
							name: this._formatName(loc.street, loc.adminArea4, loc.adminArea3, loc.adminArea1),
							bbox: L.latLngBounds(latLng, latLng),
							center: latLng
						};
					}
				}

				cb.call(context, results);
			}, this);
		},

		reverse: function(location, scale, cb, context) {
			L.Control.Geocoder.jsonp('//www.mapquestapi.com/geocoding/v1/reverse', {
				key: this._key,
				location: location.lat + ',' + location.lng,
				outputFormat: 'json'
			}, function(data) {
				var results = [],
					loc,
					latLng;
				if (data.results && data.results[0].locations) {
					for (var i = data.results[0].locations.length - 1; i >= 0; i--) {
						loc = data.results[0].locations[i];
						latLng = L.latLng(loc.latLng);
						results[i] = {
							name: this._formatName(loc.street, loc.adminArea4, loc.adminArea3, loc.adminArea1),
							bbox: L.latLngBounds(latLng, latLng),
							center: latLng
						};
					}
				}

				cb.call(context, results);
			}, this);
		}
	});

	L.Control.Geocoder.mapQuest = function(key) {
		return new L.Control.Geocoder.MapQuest(key);
	};

	L.Control.Geocoder.Mapbox = L.Class.extend({
		options: {
			service_url: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/'
		},

		initialize: function(access_token) {
			this._access_token = access_token;
		},

		geocode: function(query, cb, context) {
			L.Control.Geocoder.getJSON(this.options.service_url + encodeURIComponent(query) + '.json', {
				access_token: this._access_token,
			}, function(data) {
				var results = [],
				loc,
				latLng,
				latLngBounds;
				if (data.features && data.features.length) {
					for (var i = 0; i <= data.features.length - 1; i++) {
						loc = data.features[i];
						latLng = L.latLng(loc.center.reverse());
						if(loc.hasOwnProperty('bbox'))
							{
								latLngBounds = L.latLngBounds(L.latLng(loc.bbox.slice(0, 2).reverse()), L.latLng(loc.bbox.slice(2, 4).reverse()));
							}
							else
							{
								latLngBounds = L.latLngBounds(latLng, latLng);
							}
							results[i] = {
								name: loc.place_name,
								bbox: latLngBounds,
								center: latLng
							};
						}
					}

					cb.call(context, results);
			});
		},

		suggest: function(query, cb, context) {
			return this.geocode(query, cb, context);
		},

		reverse: function(location, scale, cb, context) {
			L.Control.Geocoder.getJSON(this.options.service_url + encodeURIComponent(location.lng) + ',' + encodeURIComponent(location.lat) + '.json', {
				access_token: this._access_token,
			}, function(data) {
				var results = [],
				loc,
				latLng,
				latLngBounds;
				if (data.features && data.features.length) {
					for (var i = 0; i <= data.features.length - 1; i++) {
						loc = data.features[i];
						latLng = L.latLng(loc.center.reverse());
						if(loc.hasOwnProperty('bbox'))
						{
							latLngBounds = L.latLngBounds(L.latLng(loc.bbox.slice(0, 2).reverse()), L.latLng(loc.bbox.slice(2, 4).reverse()));
						}
						else
						{
							latLngBounds = L.latLngBounds(latLng, latLng);
						}
						results[i] = {
							name: loc.place_name,
							bbox: latLngBounds,
							center: latLng
						};
					}
				}

				cb.call(context, results);
			});
		}
	});

	L.Control.Geocoder.mapbox = function(access_token) {
			return new L.Control.Geocoder.Mapbox(access_token);
	};

	L.Control.Geocoder.Google = L.Class.extend({
		options: {
			service_url: 'https://maps.googleapis.com/maps/api/geocode/json'
		},

		initialize: function(key) {
				this._key = key;
		},

		geocode: function(query, cb, context) {
			var params = {
				address: query,
			};
			if(this._key && this._key.length)
			{
				params['key'] = this._key
			}

			L.Control.Geocoder.getJSON(this.options.service_url, params, function(data) {
					var results = [],
							loc,
							latLng,
							latLngBounds;
					if (data.results && data.results.length) {
						for (var i = 0; i <= data.results.length - 1; i++) {
							loc = data.results[i];
							latLng = L.latLng(loc.geometry.location);
							latLngBounds = L.latLngBounds(L.latLng(loc.geometry.viewport.northeast), L.latLng(loc.geometry.viewport.southwest));
							results[i] = {
									name: loc.formatted_address,
									bbox: latLngBounds,
									center: latLng
							};
						}
					}

					cb.call(context, results);
			});
		},

		reverse: function(location, scale, cb, context) {
			var params = {
				latlng: encodeURIComponent(location.lat) + ',' + encodeURIComponent(location.lng)
			};
			if(this._key && this._key.length)
			{
				params['key'] = this._key
			}
			L.Control.Geocoder.getJSON(this.options.service_url, params, function(data) {
				var results = [],
						loc,
						latLng,
						latLngBounds;
				if (data.results && data.results.length) {
					for (var i = 0; i <= data.results.length - 1; i++) {
						loc = data.results[i];
						latLng = L.latLng(loc.geometry.location);
						latLngBounds = L.latLngBounds(L.latLng(loc.geometry.viewport.northeast), L.latLng(loc.geometry.viewport.southwest));
						results[i] = {
							name: loc.formatted_address,
							bbox: latLngBounds,
							center: latLng
						};
					}
				}

				cb.call(context, results);
			});
		}
	});

	L.Control.Geocoder.google = function(key) {
		return new L.Control.Geocoder.Google(key);
	};
	
	L.Control.Geocoder.ICGC = L.Class.extend({
		initialize: function() {
		
		},

		geocode : function (query, cb, context) {
			L.Control.Geocoder.jsonp('http://www.icc.cat/geocodificador/json', {
				metode: 'cercaCaixaUnica',
				entrada : query,
				configuracio: 4,
				obtenirCoordGeografiques:'si'
			}, function(data) {
				var results = [];
				var resultsIndex=0;
				if (data.length==0){
					 new L.Control.Geocoder.nominatim().geocode(query,cb,context);
				}
				else{
					for (var i = 0; i <=data.length; i++) {
						var resource = data[i];
						if (resource!=null){
							for (var j=resource.length-1;j>=0;j--){
								if (resource[j].adrecaXY!=undefined) {
									results[resultsIndex] = {
										name: resource[j].adrecaXY,
										center: L.latLng(resource[j].coordenadesETRS89LonLat.y,resource[j].coordenadesETRS89LonLat.x)
									};
								}
								else {
									results[resultsIndex] = {
											name: resource[j].nom,
											center: L.latLng(resource[j].coordenadesETRS89LonLat.y,resource[j].coordenadesETRS89LonLat.x)
										};
								}
								resultsIndex++;
							}
						}
					}
				}
				if (results.length==0){
					new L.Control.Geocoder.nominatim().geocode(query, cb, context);
				}
				cb.call(context, results);
			}, this, 'jsonp');
		},

		reverse: function(location, scale, cb, context) {
			L.Control.Geocoder.jsonp('http://www.icc.cat/geocodificador/json' , {
				metode: 'geocodificacioInversa',
				x_lonlatetrs89:location.lng,
				y_lonlatetrs89:location.lat
				
			}, function(data) {
				var results = [];
				for (var i = data.length - 1; i >= 0; i--) {
					var resource = data[i];
					if (resource.incidencia){
						 new L.Control.Geocoder.nominatim().reverse(location,scale,cb,context);
					}
					else{
						var resultStr="";
						if (resource.via!=null && resource.via!="\"null\"") resultStr += resource.via+ " ";
						if (resource.portalSenar!=null && resource.portalSenar!="\"null\"") resultStr += resource.portalSenar+" ";
						if (resource.portalParell!=null && resource.portalParell!="\"null\"") resultStr += resource.portalParell+" ";
						if (resource.municipi!=null && resource.municipi!="\"null\"")  {
							if (resultStr!="") resultStr +=",";
							resultStr+=" "+resource.municipi;
						}
						results[i] = {
							name: resultStr,
							//bbox: L.latLngBounds([bbox[0], bbox[1]], [bbox[2], bbox[3]]),
							center: L.latLng(location.lat,location.lng)
						};
					}
				}
				cb.call(context, results);
			}, this, 'jsonp');
		}
	});

	L.Control.Geocoder.icgc = function() {
		return new L.Control.Geocoder.ICGC();
	};
	return L.Control.Geocoder;
}));

//# sourceMappingURL=leaflet-10eb3d074a.js.map
