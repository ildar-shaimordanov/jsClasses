/*!

Implementation of the classical OOP inheritance

Copyright 2013, Ildar Shaimordanov

This implementation was inspired by the Dmitirii's work. 
It was completely re-written at the very beginning and has 
only common things with the original work: 
a) the naming convention of the base functions and 
b) the same behaviour of functions used further. 
Follow by these links below to learn more about his original work
https://github.com/devote/jsClasses
http://javascript.ru/forum/168029-post1.html

This work is a part of the Object.js file that is totally hosted at 
http://code.google.com/p/jsxt/source/browse/trunk/js/Object.js

*/

/**
 * Returns an array whose elements are strings corresponding 
 * to the enumerable properties found directly upon object. 
 *
 * @param    An object
 * @access	static
 * @link	https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
 */
(function ()
{
	if ( Object.keys ) {
		return;
	}

	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var hasDontEnumBug = ! ({toString: null}).propertyIsEnumerable('toString');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var dontEnumsLength = dontEnums.length;

	Object.keys = function(obj)
	{
		if ( typeof obj !== 'object' && typeof obj !== 'function' || obj === null ) {
			throw new TypeError('Object.keys called on non-object');
		}

		var result = [];

		for (var prop in obj) {
			if ( ! hasOwnProperty.call(obj, prop) ) {
				continue;
			}
			result.push(prop);
		}

		if ( hasDontEnumBug ) {
			for (var i = 0; i < dontEnumsLength; i++) {
				if ( ! hasOwnProperty.call(obj, dontEnums[i]) ) {
					continue;
				}
				result.push(dontEnums[i]);
			}
		}

		return result;
	};
})();

if ( ! Object.create ) {

/**
 * Creates a new object with the specified prototype object and properties. 
 * 
 * This polyfill covers the main use case which is creating a new object 
 * for which the prototype has been chosen but doesn't take the second 
 * argument into account.
 *
 * @param	The object which should be the prototype of the newly-created object.
 * @return	A new object
 * @access	static
 * @link	https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 */
Object.create = function(proto)
{
	var F = function() {};
	F.prototype = proto;
	return new F();
};

}

/**
 * Combines properties of one object to a another one. 
 * By default it implements copying of properties of the source object 
 * to the destionation object. A function provided as the third argument 
 * allows to implement another algorithm of combination. 
 *
 * @param	The destination object
 * @param	The source object
 * @param	The combinating function (optional)
 * @access	static
 * @require	Object.keys
 */
Object.mixin = function(dst, src, func)
{
	func = func || function(dst, src, prop)
	{
		dst[prop] = src[prop];
	};

	var props = Object.keys(src);
	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		if ( ! src.hasOwnProperty(prop) ) {
			continue;
		}
		func(dst, src, prop);
	}
	return dst;
};

/**
 * Another way to implement classical OOP inheritance
 *
 * Class( [Parent,] {...} )
 * Class( [Parent,] Function )
 *

// The base class "X"
var X = Class(function()
{
	// The private variable for instances of "X"
	var p;
	return {
		constructor: function(x)
		{
			p = x;
		}, 
		hello: function()
		{
			alert('Hello, world!');
		}, 
		alert: function()
		{
			alert(p);
		}
	};
});

// The class "Y" inherited from "X"
var Y = Class(X, function()
{
	// The private variable for instances of "Y"
	var p;
	return {
		constructor: function(x, y)
		{
			// Call the inherited constructor
			this.parent(x)
			p = y;
		}, 
		alert: function()
		{
			// Call the inherited method
			this.hello();
			// Call the overwritten method
			this.parent();
			alert(p);
		}
	};
});

 *
 * @param	Function	A parental class
 * @param	Object, Function	A class structure
 * @return	Function	A constructor of a new class
 * @access	static
 * @require	Object.mixin
 * @link	http://javascript.ru/forum/168029-post1.html
 * @link	https://github.com/devote/jsClasses
 */
var Class = (function()
{
	// Make wrapper for overwritten methods to allow calling of inherited, 
	// parental methods within from child methods in the form "this.parent()"
	var _wrapParent = function(dst, src, prop)
	{
		if ( typeof dst[prop] != 'function' || typeof src[prop] != 'function' ) {
			dst[prop] = src[prop];
			return;
		}
		dst[prop] = 
		src[prop] = 
		(function(parentMethod, method)
		{
			return function()
			{
				var parent = this.parent;
				this.parent = parentMethod;
				var result = method.apply(this, arguments);
				this.parent = parent;
				return result;
			};
		})(dst[prop], src[prop]);
	};

	// The stub to provide parental properties to a child class
	var F = function() {};

	var Class = function(Parent, proto)
	{
		/*
		Class( [Parent,] {...} )
		Class( [Parent,] Function )
		*/
		if ( arguments.length < 2 ) {
			proto = arguments[0];
			Parent = null;
		}
		Parent = Parent || Object;
		proto = proto || {};

		// Redefine the class structure to be a function returning it
		if ( typeof proto != 'function' ) {
			proto = (function(proto)
			{
				return function()
				{
					return proto;
				};
			})(proto);
		}

		// Implementation of the "this.instanceOf()" method
		var _instanceOf = function(Class)
		{
			var p = Child;
			while ( p ) {
				if ( p === Class ) {
					return true;
				}
				p = p.Parent;
			}
			return false;
		};

		// Common constructor of all classes
		var Child = function()
		{
			// Prepare properties for instantiating
			var object = proto();

			// Remove definitions of service methods
			delete object.parent;
			delete object.instanceOf

			// Define a constructor if it isn't defined
			object.constructor = object.constructor || function()
			{
				Parent.apply(this, arguments);
			};

			// Prepare the structure of the parental class
			// Be sure that it is object anyway
			var parent = Object(Parent.call(new F()));

			// Fill in the instance with parental properties
			// It should be the first action to provide inherited properties
			Object.mixin(this, parent);

			// Fill in the instance with the actual properties
			// It may have overwrite parental properties
			// Inherited methods will be redefined with the purpose to have 
			// possibility to call the overwritten parental method
			Object.mixin(this, object, _wrapParent);

			// Assign the "this.instanceOf" method
			this.instanceOf = _instanceOf;

			// Return the parental structure
			if ( this instanceof F ) {
				return this;
			}

			object.constructor.apply(this, arguments);
		};

		// Create a link to the parental constructor
		Child.Parent = Parent;
		return Child;
	};

	return Class;
})();
