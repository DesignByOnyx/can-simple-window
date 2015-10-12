var DocHelper = require('./doc-helpers');

// modeled after jsdom.env
module.exports.env = function (source, scripts, callback) {
	if (arguments.length < 2) {
		throw new Error('At least two arguments are required.')
	}

	if (typeof scripts === "function") {
		callback = scripts;
		scripts = null;
	}

	var document = DocHelper.createDocument(source);
	var window = document.defaultView;

	if (scripts) {
		DocHelper.loadScripts(scripts, window, function (err) {
			if (err) return callback(err);

			callback(null, window);
		});
	} else {
		callback(null, window);
	}
};

// modeled after jsdom.jsdom
module.exports.document = function (source) {
	var document = DocHelper.createDocument(source);

	return document;
};
