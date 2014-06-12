CSS Scroll Selectors
=====

Conditionally apply styles depending on scroll position. **Without JavaScript***.

Take a look at [a demo](http://davebakker.github.io/cssss/demo.html).

_* it does use JavaScript_ 

Example
-----
Accomplishing the header resize effect, found in the demo:
```css
html header {
	font-size: 85px;
	transition: 0.3s ease-in-out;
}
html[css-scroll~="top>85"] header {
	font-size: 30px;
}
```
That's it! No extra JavaScript needed. No `scroll` event handlers. No `addClass/removeClass/hasClass` mess.

Enabling CSSSS
-----
```html
<html css-scroll>
	<script src="/js/jquery.cssss.js"></script>
  
	...
  
	<script type="text/javascript">
		$(function() {
			$('[css-scroll]').cssss();
		});
	</script>
</html>
```

CSSSS is a jQuery plugin. To enable CSSSS: query the elements using jQuery and call `.cssss()` on them. CSSSS needs (and should) only be enabled on elements that can actually scroll. For example elements with `overflow: auto/scroll` or the `html` or `body` elements.

Properties
------
In the example above the `font-size` of the `header` element changes depending how many pixels have been scrolled from the `top`. `top` is just one of the properties you can compare against:

Property | Description
--- | ---
top | Pixels scrolled from the top.
left | Pixels scrolled from the left.
bottom | Number of pixels left to scroll to the bottom.
right | Number of pixels left to scroll to the right.
progressY | A number from 0.0 to 1.0 (inclusive). 0 = completely scrolled to the top, 1 = completely scrolled to the bottom.
progressX | A number from 0.0 to 1.0 (inclusive). 0 = completely scrolled to the left, 1 = completely scrolled to the right.


Compatibility
-----
Currently tested in Chrome and Firefox. It doesn't use any fancy browser features, though, so it should work pretty much everywhere.
