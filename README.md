# can-simple-window
A very simple, light-weight execution context (eg. browser window) which wraps around [can-simple-dom](https://github.com/canjs/can-simple-dom). This module allows for both jQuery, CanJS, ReactJS, and other scripts to be loaded in a NodeJS environment by creating a faux browser window in which the scripts are executed. A very basic implementation of the DOM API is provided by can-simple-dom.

The API was designed to be a drop in replacement for very simple [jsdom](https://github.com/tmpvar/jsdom) implementations. Please note that this does not support the *entire* `jsdom` API and that `can-simple-dom` is a very limited implementation of the WHATWG DOM specification. If you are looking for an environment which more closely resembles a real browser, please use `jsdom` - it is a wonderful library.

##simpleWindow.env(html [, scripts], callback);
**Replacement for `jsdom.env`**

```js
var simpleWindow = require('can-simple-window');

simpleWindow.env(
	'<h1>Hello World!</h1><span class="foo"><b>BAR!</b></span>',
	['http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',
	'http://canjs.com/release/2.2.9/can.jquery.min.js'],
	function (err, window) {
	   if (err) throw new Error(err);
	   
		window.$('h1').text(); //-> Hello World!
		window.$('.foo').html(); //-> <b>BAR!</b>
		window.can; //-> Reference to CanJS object
	}
);
```

**Differences from jsdom**

- You can only pass HTML in the first parameter (no URLs or file paths)
    - The html passed in is only attached to the `<body>` - no `<head>` code will be processed.
    - `<script>`, `<img>`, `<link>`, `<frame>`, and `<iframe>` sources will not be loaded or processed.
- There is no `config` object - so the following are invalid:

    ```js
    simpleWindow.env({ config_object });
    simpleWindow.env("<b>foo</b>", 'script.js', { config_object }, ...);
    ```
- There are no lifecycle events for `created` or `onLoad`

##simpleWindow.document(html);
**Replacement for `jsdom.jsdom`**

```js
var simpleWindow = require('can-simple-window');

var document = simpleWindow.document('<h1>Hello World!</h1><span class="foo"><b>BAR!</b></span>');
document.getElementsByTagName('h1'); //-> [ H1 DOM Element ]
document.getElementsByClassName("foo"); //-> [ SPAN.foo DOM Element ]
```

**Differences from jsdom**

- The html passed in is only attached to the `<body>` - no `<head>` code will be processed.
- `<script>`, `<img>`, `<link>`, `<frame>`, and `<iframe>` sources will not be loaded.
- There is no `options` parameter implemented.