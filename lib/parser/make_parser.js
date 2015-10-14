/*!
 * CanJS - 2.3.0-beta.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 08 Oct 2015 22:56:39 GMT
 * Licensed MIT
 */

/*can@2.3.0-beta.4#util/vdom/build_fragment/make_parser*/
var canParser = require('./parser.js');
var simpleDOM = require('can-simple-dom');

module.exports = function (document) {
    return new simpleDOM.HTMLParser(function (string) {
        var tokens = [];
        var currentTag, currentAttr;

        canParser(string, {
            start: function (tagName) {
                currentTag = {
                    type: 'StartTag',
                    attributes: [],
                    tagName: tagName
                };
            },
            end: function () {
                tokens.push(currentTag);
                currentTag = undefined;
            },
            close: function (tagName) {
                tokens.push({
                    type: 'EndTag',
                    tagName: tagName
                });
            },
            attrStart: function (attrName) {
                currentAttr = [
                    attrName,
                    ''
                ];
                currentTag.attributes.push(currentAttr);
            },
            attrEnd: function () {
            },
            attrValue: function (value) {
                currentAttr[1] += value;
            },
            chars: function (value) {
                tokens.push({
                    type: 'Chars',
                    chars: value
                });
            },
            comment: function (value) {
                tokens.push({
                    type: 'Comment',
                    chars: value
                });
            },
            special: function () {
            },
            done: function () {
            }
        });
        return tokens;
    }, document, simpleDOM.voidMap);
};
