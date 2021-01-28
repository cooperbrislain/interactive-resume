(function() {
	let $this = this;
	$.fn.navList = function() {
		let	$this = $(this),
			$a = $this.find('a'),
			b = [];

		$a.each((i, item) => {
			const 	$item = $(item),
					indent = Math.max(0, $item.parents('li').length - 1),
					href = $item.attr('href'),
					target = $item.attr('target');
			b.push(`
				<a 
					class="link depth-${indent}" 
					${target === undefined || target === '' ? '' : ` target="${target}"`}
					${href === undefined || href === '' ? '' : ` href="${href}"`}
				>
					<span class="indent-${indent}"></span>
					${$item.text()}
				</a>
			`);
		});

		return b.join('');
	};

	$.fn.panel = function(userConfig) {
		const 	$this = $(this),
				$body = $('body'),
				$window = $(window),
				id = $this.attr('id');
		let 	config;

		if (this.length === 0) return $this;
		if (this.length > 1) {
			for (let i = 0; i < this.length; i++) $($this[i]).panel(userConfig);
			return $this;
		}

		config = $.extend({
			delay: 0,
			hideOnClick: false,
			hideOnEscape: false,
			hideOnSwipe: false,
			resetScroll: false,
			resetForms: false,
			side: null,
			target: $this,
			visibleClass: 'visible'
		}, userConfig);

		if (typeof config.target !== 'jQuery') config.target = $(config.target);

		$this._hide = e => {
			if (!config.target.hasClass(config.visibleClass)) return;
			if (e) e.preventDefault();
			config.target.removeClass(config.visibleClass);
			window.setTimeout(() => {
				if (config.resetScroll) $this.scrollTop(0);
				if (config.resetForms) {
					$this.find('form').each((i, item) => {
						item.reset();
					});
				}
			}, config.delay);
		};

		$this
			.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
			.css('-webkit-overflow-scrolling', 'touch');

		if (config.hideOnClick) {
			$this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
			$this.on('click', 'a', e => {
				const $a = $(e.target),
					href = $a.attr('href'),
					target = $a.attr('target');
				if (!href || href === '#' || href === '' || href === `#${id}`) return;
				e.preventDefault();
				$this._hide();
				window.setTimeout(() => {
					if (target === '_blank') window.open(href);
					else window.location.href = href;
				}, config.delay + 10);
			});
		}

		$this.on('touchstart', e => {
			$this.touchPosX = e.originalEvent.touches[0].pageX;
			$this.touchPosY = e.originalEvent.touches[0].pageY;
		})
		$this.on('touchmove', e => {
			if ($this.touchPosX === null || $this.touchPosY === null) return;

			const diffX = $this.touchPosX - e.originalEvent.touches[0].pageX,
				diffY = $this.touchPosY - e.originalEvent.touches[0].pageY,
				th = $this.outerHeight(),
				ts = ($this.get(0).scrollHeight - $this.scrollTop());

			if (config.hideOnSwipe) {
				let result = false;
				const boundary = 20;
				const delta = 50;

				switch (config.side) {
					case 'left':
						result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
						break;
					case 'right':
						result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
						break;
					case 'top':
						result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
						break;
					case 'bottom':
						result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
						break;
					default:
						break;
				}

				if (result) {
					$this.touchPosX = null;
					$this.touchPosY = null;
					$this._hide();
					return false;
				}
			}

			if (($this.scrollTop() < 0 && diffY < 0)
				|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
				e.preventDefault();
			}

			$this.on('click touchend touchstart touchmove', e => e.preventDefault());

			$this.on('click', `a[href="#${id}"]`, e => {
				e.preventDefault();
				config.target.removeClass(config.visibleClass);
			});

			$body.on('click touchend', e => {
				$this._hide(e)
			});

			$body.on('click', `a[href="#${id}"]`, e => {
				e.preventDefault();
				config.target.toggleClass(config.visibleClass);
			});

			if (config.hideOnEscape) {
				$window.on('keydown', e => {
					if (e.keyCode === 27) $this._hide(e);
				});
			}

			return $this;
		});

		$.fn.placeholder = function () {
			if (document.createElement('input').placeholder !== undefined) return $(this);
			if (this.length === 0) return $this;
			if (this.length > 1) {
				for (let i = 0; i < this.length; i++) {
					$(this[i]).placeholder();
				}
				return $this;
			}

			$this.find('input[type=text],textarea').each((i, item) => {
				const $item = $(item);

				if ($item.val() === '' || $item.val() === $item.attr('placeholder')) {
					$item.addClass('polyfill-placeholder').val($item.attr('placeholder'));
				}
			}).on('blur', e => {
				const $item = $(e.target);
				if ($item.attr('name').match(/-polyfill-field$/)) return;
				if ($item.val() === '') {
					$item.addClass('polyfill-placeholder').val($item.attr('placeholder'));
				}
			}).on('focus', e => {
				const $item = $(e.target);
				if ($item.attr('name').match(/-polyfill-field$/)) return;
				if ($item.val() === $item.attr('placeholder'))
					$item.removeClass('polyfill-placeholder').val('');
			});
		};
	}

	$this.find('input[type=password]').each((i, item) => {
		const $item = $(item);
		let x = $($('<div>')
			.append($item.clone())
			.remove()
			.html()
			.replace(/type="password"/i, 'type="text"')
			.replace(/type=password/i, 'type=text'));

		if ($item.attr('id') !== '') x.attr('id', `${item.attr('id')}-polyfill-field`);
		if ($item.attr('name') !== '') x.attr('name', `${$item.attr('name')}-polyfill-field`);

		x.addClass('polyfill-placeholder').val(x.attr('placeholder')).insertAfter($item);

		if ($item.val() === '') $item.hide(); else x.hide();

		$item.on('blur', e => {
			const $item = $(e.target);
			e.preventDefault();
			let x = $item.parent().find(`input[name=${$item.name}-polyfill-field]`);
			if ($item.val() === '') {
				$item.hide();
				x.show();
			d}
		});

		$item.on('focus', e => {
			e.preventDefault();
			const $item = x.parent().find(`input[name=${x.attr('name').replace('-polyfill-field', '')}]`);
			x.hide();
			$item.show().focus();
		});

		$item.on('keypress', e => {
			e.preventDefault();
			x.val('');
		});
	});

	$this.on('submit', e => {
		$this.find('input[type=text],input[type=password],textarea')
			.each((i, item) => {
				const $item = $(item);
				if ($item.attr('name').match(/-polyfill-field$/))
					$item.attr('name', '');
				if ($item.val() === $item.attr('placeholder')) {
					$item.removeClass('polyfill-placeholder');
					$item.val('');
				}
			});
	});

	$this.on('reset', e => {
		e.preventDefault();
		$this.find('select').val($('option:first').val());
		$this.find('input,textarea').each((i, item) => {
			const $item = $(item);
			let x;

			$item.removeClass('polyfill-placeholder');

			switch (item.type) {
				case 'submit':
				case 'reset':
					break;
				case 'password':
					$item.val($item.attr('defaultValue'));
					x = $item.parent().find(`input[name=${$item.attr('name')}-polyfill-field]`);
					if ($item.val() == '') {
						$item.hide();
						x.show();
					} else {
						$item.show();
						x.hide();
					}
					break;
				case 'checkbox':
				case 'radio':
					$item.attr('checked', $item.attr('defaultValue'));
					break;
				case 'text':
				case 'textarea':
					$item.val($item.attr('defaultValue'));
					if ($item.val() == '') {
						$item.addClass('polyfill-placeholder');
						$item.val($item.attr('placeholder'));
					}
					break;
				default:
					$item.val($item.attr('defaultValue'));
					break;
			}
		});
		return $this;
	});

	$.prioritize = ($elements, condition) => {
		const key = '__prioritize';

		if (typeof $elements !== 'jQuery') $elements = $($elements);

		$elements.each((i, item) => {
			const $item = $(item);
			const $parent = $item.parent();
			let $p;
			if ($parent.length === 0) return;
			if (!$item.data(key)) {
				if (!condition) return;
				$p = $item.prev();
				if ($p.length == 0) return;
				$item.prependTo($parent);
				$item.data(key, $p);
			} else {
				if (condition) return;
				$p = $item.data(key);
				$item.insertAfter($p);
				$item.removeData(key);
			}
		});
	};
})(jQuery)