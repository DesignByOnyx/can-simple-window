/**
 * Compatability layer for can-simple-dom - implements pieces needed by jquery and can
 */
var SimpleDOM = require("can-simple-dom");
var makeParser = require("./parser/make_parser");

module.exports = function (document) {
	// can references childNodes[0] - but simple dom does not implement indexes
	if (!document.childNodes.constructor.prototype.hasOwnProperty("0")) {
		Object.defineProperty(document.childNodes.constructor.prototype, "0", {
			get: function () {
				return this.node.firstChild;
			}
		});
	}

	// Add getElementsByClassName
	if (!document.documentElement.constructor.prototype.hasOwnProperty('getElementsByClassName')) {
		var getElementsByClassName = function (name) {
			var elements = [];
		    var cur = this.firstChild;
		    var className;
		    while (cur) {
		        if (cur.nodeType === SimpleDOM.Node.ELEMENT_NODE) {
		        	className = cur.getAttribute('class');
		            if (className && className.indexOf(name) > -1) {
		                elements.push(cur);
		            }
		            elements.push.apply(elements, cur.getElementsByClassName(name));
		        }
		        cur = cur.nextSibling;
		    }
		    return elements;
		};

		document.constructor.prototype.getElementsByClassName = getElementsByClassName;
		document.documentElement.constructor.prototype.getElementsByClassName = getElementsByClassName;
	}

	// jquery uses innerHTML for some of its tests
	if (!SimpleDOM.Element.prototype.hasOwnProperty("innerHTML")) {
		var serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
		var parser = makeParser(document);

		var nodes = [];

		var descriptor = function(){
			return {
				get: function(){
					return this.firstChild ? serializer.serialize(this.firstChild) : "";
				},
				set: function(html){
					// remove all children
					if (nodes.indexOf(this) === -1) {
						nodes.push(this);
					}
					var cur = this.firstChild;
					while(cur) {
						this.removeChild(cur);
						cur = this.firstChild;
					}
					if(""+html) {
						var frag = parser.parse(""+html);
						this.appendChild(frag);
					}
				}
			};
		};
		Object.defineProperty(SimpleDOM.Element.prototype, "innerHTML", descriptor());
	}
};
