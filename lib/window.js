var vm = require('vm');

var Window = function (document) {
	this.window = this;
	this.document = document;
	this.location = {
		href: __dirname,
		pathname: __dirname
	};

	// monkey patch - vm.createContext only uses own properties (ignoring prototype properties)
	// so we copy things over, binding prototype methods to the instance
	(function doBind(window, context) {
		for (var prop in context) {
			if (prop !== 'constructor' && context[prop] !== window){
				if (context.hasOwnProperty(prop)) {
					if (context[prop] instanceof Object) {
						// doBind(window, context[prop]);
					}
				} else {
					if (typeof context[prop] === "function") {
						context[prop] = context.constructor.prototype[prop].bind(context);
					} else {
						context[prop] = context.constructor.prototype[prop];
					}
				}
			}
		}
	}(this, this));

	return vm.createContext(this);
};

Window.prototype = Object.create({});
Window.prototype.constructor = Window;

Window.prototype.console = console;
Window.prototype.addEventListener = function () {};
Window.prototype.removeEventListener = function () {};

module.exports = Window;
