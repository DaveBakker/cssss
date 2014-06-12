(function($) {

	var scrollSelectors = [];
	var watchElements = [];

	var methods = {
		rebuildCSSCache: function() {
			scrollSelectors = listCssScrollSelectors();

			for (var i = 0; i < watchElements.length; i++) {
				compileWatchElementExpressions(watchElements[i]);
			}
		},
		watch: function() {
			this.each(function() {
				var watchElement = getWatchElementByElement(this);
				if (watchElement) return;

				watchElement = {
					element: this,
					expressions: [],
					previousValue: '',
					scrollHandler: function() {
						applyStyles(watchElement);
					}
				};

				var scrollable = $(getScrollableElement(watchElement.element));
				scrollable.on('scroll', watchElement.scrollHandler);

				watchElements.push(watchElement);

				compileWatchElementExpressions(watchElement);
				applyStyles(watchElement);
			});
		},
		unwatch: function() {
			this.each(function() {
				var watchElement = getWatchElementByElement(this);
				if (!watchElement) return;

				var scrollable = $(getScrollableElement(watchElement.element));
				scrollable.off('scroll', watchElement.scrollHandler);

				var index = watchElements.indexOf(watchElement);
				watchElements.splice(index, 1);
			});
		},
		applyStyles: function() {
			if (this.length && this[0] === document) {
				for (var i = 0; i < watchElements.length; i++) {
					applyStyles(watchElements[i]);
				}
			} else {
				foreachWatchElement(this, function(watchElement) {
					applyStyles(watchElement);
				});
			}
		}
	};

	$.fn.cssss = function(method) {
		if (!method) {
			return methods['watch'].call(this);

		} else if (methods[method]) {
			return methods[method].call(this);

		} else {
			throw new Error("Unknown method: "+method);
		}
	};

	$(function() {
		$(document).cssss('rebuildCSSCache');
		

		$(window).resize(function() {
			$(document).cssss('applyStyles');
		});
	});

	function getWatchElementByElement(element) {
		for (var i = 0; i < watchElements.length; i++) {
			if (watchElements[i].element === element) return watchElements[i];
		}
		return null;
	}

	function foreachWatchElement(selection, callback) {
		for (var i = 0; i < selection.length; i++) {
			var element = selection[i];
			var watchElement = getWatchElementByElement(element);

			if (watchElement) callback(watchElement);
		}
	}

	function applyStyles(watchElement) {
		var attributeValue = "";

		for (var i = 0; i < watchElement.expressions.length; i++) {
			var expression = watchElement.expressions[i];

			if (evaluateExpression(expression)) {
				attributeValue += " " + expression.string;
			}
		}

		if (attributeValue !== watchElement.previousValue) {
			watchElement.previousValue = attributeValue;

			$(watchElement.element).attr('css-scroll', attributeValue);
		}
	}

	function compileWatchElementExpressions(watchElement) {
		watchElement.expressions = [];

		for (var j = 0; j < scrollSelectors.length; j++) {
			var scrollSelector = scrollSelectors[j];

			watchElement.expressions.push( compileExpression(watchElement.element, scrollSelector) );
		}
	}

	function compileExpression(element, expressionString) {
		return {
			element: element,
			string: expressionString,
			evaluate: new Function("top", "left", "bottom", "right", "progressX", "progressY", "return ("+expressionString+");")
		};
	}

	function evaluateExpression(expression) {
		var top = 0;
		var left = 0;

		var scrollableElement = getScrollableElement(expression.element);
		var scrollable = $(scrollableElement);

		var elementHeight = 0
		var elementWidth = 0;
		var viewportHeight = 0;
		var viewportWidth = 0;

		top = scrollable.scrollTop();
		left = scrollable.scrollLeft();

		if (scrollableElement === document) {
			elementHeight = scrollable.height();
			elementWidth = scrollable.width();
			viewportHeight = $(window).height();
			viewportWidth = $(window).width();

		} else {
			elementHeight = scrollable.prop("scrollHeight");
			elementWidth = scrollable.prop("scrollWidth");
			viewportHeight = scrollable.height();
			viewportWidth = scrollable.width();
		}

		var bottom = elementHeight - viewportHeight - top;
		var right = elementWidth - viewportWidth - left;

		var progressY = top / (elementHeight-viewportHeight);
		var progressX = left / (elementWidth-viewportWidth);
		

		return expression.evaluate(top, left, bottom, right, progressX, progressY);
	}

	function getScrollableElement(element) {
		var tagName = element.tagName.toLowerCase();
		if (tagName === 'html' || tagName === 'body') {
			return document;
		} else {
			return element;
		}
	}

	function listCssScrollSelectors() {
		var selectors = listCssSelectors();
		var scrollSelectors = [];

		for (var i = 0; i < selectors.length; i++) {
			var selector = selectors[i].replace(/\s/g, '');

			var searchPos = 0;
			while(true) {
				var selectorStartPos = selector.indexOf('[css-scroll~="', searchPos);
				if (selectorStartPos < 0) break;
				searchPos = selectorStartPos + 14;

				var selectorEndPos = selector.indexOf('"', searchPos);
				if (selectorEndPos < 0) break;
				searchPos = selectorEndPos + 1;

				var scrollSelector = selector.substring(selectorStartPos+14, selectorEndPos);
				if (scrollSelectors.indexOf(scrollSelector) < 0) scrollSelectors.push(scrollSelector);
			}
		}

		return scrollSelectors;
	}

	function listCssSelectors() {

		var selectors = [];
		var stylesheets = document.styleSheets;

		for (var i = 0; i < stylesheets.length; i++) {
			var stylesheet = stylesheets[i];
			if (stylesheet.type !== 'text/css') continue;

			var cssRules = null;
			try {
				cssRules = stylesheet.cssRules;
			} catch(e) {

			}
			if (cssRules === null) continue;

			for (var i = 0; i < cssRules.length; i++) {
				var cssRule = cssRules[i];
				if (cssRule.type !== CSSRule.STYLE_RULE) continue;

				selectors.push( cssRule.selectorText );
			}
		}

		return selectors;
	}

})(jQuery);
