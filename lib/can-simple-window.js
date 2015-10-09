var vm = require('vm');
var path = require('path');
var fs = require('fs');
var http = require('http');
var Readable = require('stream').Readable;
var SimpleDOM = require('can-simple-dom');

var Window = function (document) {
	this.window = this;
	this.document = document;
	this.location = {
		href: __dirname,
		pathname: __dirname
	};

	// monkey patch - vm.createContext only uses own properties (ignoring prototype properties)
	// wrap all methods in a binding context on the instance itself
	(function doBind(window, context) {
		// console.log("========= BEGIN ==========");
		for (var prop in context) {
			if (prop !== 'constructor' && context[prop] !== window){
				// console.log("Handling prop", prop);
				if (context.hasOwnProperty(prop)) {
					if (context[prop] instanceof Object) {
						// doBind(window, context[prop]);
					}
				} else {
					if (typeof context[prop] === "function") {
						// console.log(" --- binding", prop);
						context[prop] = context.constructor.prototype[prop].bind(context);
					} else {
						context[prop] = context.constructor.prototype[prop];
					}
				}
			}
		}
		// console.log("========= END ==========");
	}(this, this));

	return vm.createContext(this);
};

Window.prototype = Object.create({});
Window.prototype.constructor = Window;

Window.prototype.require = require;
Window.prototype.console = console;
Window.prototype.addEventListener = function () {};
Window.prototype.removeEventListener = function () {};

function runScript(code, window, name) {
	try {
		vm.runInContext(code, window, name);
	} catch (ex) {
		console.log("Exception", ex.stack);
	}
}

function loadScripts (scripts, window, done) {
	var i = 0;

	(function getScript() {
		var url = scripts[i],
			body = '';

		function onData (chunk) {
			body += chunk;
		}

		function onEnd () {
			runScript(body, window, url);

			if (scripts[++i]) {
				getScript();
			} else {
				done();
			}
		}

		function onError (err) {
			done(err);
		}

		if (url.match(/^(?:https?:)?\/\//)) {
			http.get(url, function (res) {
				res
				.on('data', onData)
				.on('end', onEnd);
			})
			.on('error', onError);;
		} else {
			url = path.resolve(window.location.pathname, url);

			fs.createReadStream(url)
				.on('data', onData)
				.on('end', onEnd)
				.on('error', onError);
		}
	}());
}

module.exports.env = function (source, scripts, callback) {
	var document = new SimpleDOM.Document();
	var window = document.defaultView = new Window(document);

	// "Source" is there to provide a similar API to jsdom - we don't use it yet
	loadScripts(scripts, window, function (err) {
		if (err) return callback(err);

		callback(null, window);
	});
};
