var vm = require('vm');
var path = require('path');
var fs = require('fs');
var http = require('http');
var SimpleDOM = require('can-simple-dom');
var SimpleDOMCompat = require('./simple-dom-compat');
var Window = require('./window');

module.exports.loadScripts = function (scripts, window, done) {
	var i = 0;

	(function getScript() {
		var url = scripts[i],
			code = '';

		function onData (chunk) {
			code += chunk;
		}

		function onEnd () {
			try {
				vm.runInContext(code, window, url);
			} catch (ex) {
				console.log("VM EXCEPTION:", ex.stack);
				done(ex);
			}

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

module.exports.createDocument = function (source) {
	var document = new SimpleDOM.Document();
	document.defaultView = new Window(document);

	// Add compatability layer
	SimpleDOMCompat(document);

	if (source) {
		// TODO: "source" should allow URLs, file paths, or FULL html - for now, just BODY html
		// If a File or URL is use, update window.location
		document.body.innerHTML = source;
	}

	return document;
}
