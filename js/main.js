
function main() {
function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemTop <= docViewBottom) && (elemBottom >= docViewTop));
}
(function () {
   'use strict';

	// Initialize SmoothScroll for anchor links
	var scroll = new SmoothScroll('a.page-scroll', {
		speed: 800,
		speedAsDuration: true,
		offset: 70,
		easing: 'easeInOutCubic',
		updateURL: false
	});

	// Sticky nav — keep it visible on resize
	var wasScrolledPastNav = false;

	$(window).scroll(function() {
		wasScrolledPastNav = $(window).scrollTop() >= $('#nav').offset().top;
	});

	$(window).resize(function() {
		if (wasScrolledPastNav) {
			var navTop = $('#nav').offset().top;
			if (navTop > $(window).scrollTop() + 10) {
				$(window).scrollTop(navTop);
			}
		}
	});	

	// skills chart
	function getChartSize() {
		var w = $(window).width();
		if (w <= 480) { return 110; }  // matches the ≤480px CSS chart size
		if (w < 768) { return 190; }   // matches the mobile CSS chart size
		return 120;                    // desktop
	}

	function getChartColors() {
		var styles = getComputedStyle(document.documentElement);
		return {
			bar: styles.getPropertyValue('--chart-bar').trim() || '#a33350',
			barHover: styles.getPropertyValue('--chart-bar-hover').trim() || '#c9956b',
			track: styles.getPropertyValue('--chart-track').trim() || 'rgba(255,255,255,0.12)'
		};
	}

	function initCharts(animateMs) {
		// animateMs: duration of the fill animation. Defaults to 2500ms for the
		// first reveal; pass 0 for an instant redraw (e.g. theme switch) so the
		// donuts recolor immediately instead of slowly re-filling from zero.
		var animate = (typeof animateMs === 'number') ? animateMs : 2500;
		var chartSize = getChartSize();
		var chartColors = getChartColors();
		$('.chart').each(function() {
			var $chart = $(this);
			// Remove old canvas if re-initializing
			$chart.find('canvas').remove();
			// Reset data so easyPieChart can re-init
			$chart.removeData('easyPieChart');
			$chart.easyPieChart({
				easing: 'easeOutBounce',
				// barColor as a function lets us switch to the hover color on
				// mouseover without re-initializing the chart. The chart element
				// carries a data flag toggled by the hover handlers below.
				barColor: function() {
					return $chart.data('hovering')
						? chartColors.barHover
						: chartColors.bar;
				},
				trackColor: chartColors.track,
				scaleColor: false,
				lineWidth: 6,
				lineCap: 'round',
				animate: animate > 0 ? animate : false,
				size: chartSize,
				onStep: function(from, to, percent) {
					$(this.el).find('.percent').text(Math.round(percent) + '%');
				}
			});
		});
		bindChartHover();
	}

	// Recolor the donut arc on hover, mirroring the Experience timeline badge's
	// color change. Flips a data flag (read by the barColor function above) and
	// re-draws the arc at its current value — no full animation replay.
	var chartHoverBound = false;
	function bindChartHover() {
		if (chartHoverBound) { return; }
		chartHoverBound = true;
		$('#skillsset .skill').on('mouseenter', function() {
			var $chart = $(this).find('.chart');
			var inst = $chart.data('easyPieChart');
			if (!inst || !inst.renderer) { return; }
			$chart.data('hovering', true);
			inst.renderer.draw(parseFloat($chart.data('percent')) || 0);
		}).on('mouseleave', function() {
			var $chart = $(this).find('.chart');
			var inst = $chart.data('easyPieChart');
			if (!inst || !inst.renderer) { return; }
			$chart.data('hovering', false);
			inst.renderer.draw(parseFloat($chart.data('percent')) || 0);
		});
	}

	var chartsInitialized = false;

	if ('IntersectionObserver' in window) {
		var chartObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting && !chartsInitialized) {
					chartsInitialized = true;
					initCharts();
					// Stop observing all cards
					document.querySelectorAll('#skillsset .skill').forEach(function(el) {
						chartObserver.unobserve(el);
					});
				}
			});
		}, { threshold: 0.2 });

		// Observe each skill card instead of the whole container
		document.querySelectorAll('#skillsset .skill').forEach(function(el) {
			chartObserver.observe(el);
		});
	} else {
		$(document).ready(function() {
			$(document).scroll(function(){
				if (isScrolledIntoView('#skillsset') && !chartsInitialized){
					chartsInitialized = true;
					initCharts();
				}
			});
		});
	}

	// Re-render charts on resize or zoom
	var resizeTimer;
	var lastChartSize = getChartSize();

	function checkChartResize() {
		if (chartsInitialized) {
			var newSize = getChartSize();
			if (newSize !== lastChartSize) {
				lastChartSize = newSize;
				initCharts(0);  // instant redraw at the new size — no re-fill replay
			}
		}
	}

	$(window).resize(function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(checkChartResize, 250);
	});

	// Detect zoom changes via matchMedia (fires on zoom in most browsers)
	if (window.matchMedia) {
		var mql = window.matchMedia('(max-width: 767px)');
		mql.addEventListener('change', function() {
			setTimeout(checkChartResize, 100);
		});
	}

	// Event-driven zoom detection (replaces the old 500ms devicePixelRatio poll):
	// a media query pinned to the current DPR fires once when zoom changes it,
	// then re-arms itself against the new value. No timers, no battery tax.
	function watchZoomChanges() {
		if (!window.matchMedia) { return; }
		var mql = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
		var handler = function() {
			if (mql.removeEventListener) { mql.removeEventListener('change', handler); }
			else { mql.removeListener(handler); }
			checkChartResize();
			watchZoomChanges();
		};
		if (mql.addEventListener) { mql.addEventListener('change', handler); }
		else { mql.addListener(handler); }
	}
	watchZoomChanges();
	
	// Swap the hamburger for a close (X) icon while the mobile menu is open.
	// Bound to Bootstrap's collapse events so it stays correct regardless of
	// how the menu opens or closes (tap, link click, click-outside).
	var $navToggle = $('#navbar-toggle');
	$('.navbar-main-collapse')
		.on('show.bs.collapse', function () {
			$navToggle.find('i').attr('class', 'fa-solid fa-xmark');
			$navToggle.attr({ 'aria-label': 'Close navigation menu', 'aria-expanded': 'true' });
		})
		.on('hide.bs.collapse', function () {
			$navToggle.find('i').attr('class', 'fa-solid fa-bars');
			$navToggle.attr({ 'aria-label': 'Open navigation menu', 'aria-expanded': 'false' });
		});

	/// When you click everywhere in the document
	$(document).click(function (event) {
	  if (!$(event.target).is('.navbar-collapse *')) {
	    $('.navbar-collapse').collapse('hide');
	  }
	});

	// Mobile nav: collapse first, then scroll after collapse finishes
	$('.navbar-custom .nav li a').click(function(e) {
		var $collapse = $('.navbar-collapse');
		if ($collapse.hasClass('in')) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var target = $(this).attr('href');
			$collapse.collapse('hide');
			$collapse.one('hidden.bs.collapse', function() {
				var $target = $(target);
				if ($target.length) {
					// Use setTimeout to let the DOM fully settle after collapse
					setTimeout(function() {
						$('html,body').animate({
							scrollTop: $target.offset().top - 70
						}, 800);
					}, 50);
				}
			});
		}
	});

	// Scroll-triggered animations: elements animate in on entry and back out
	// on exit, every time they cross the viewport.
	// Extend coverage to section titles, skill cards and about content.
	// (Classes are added via JS so these stay visible if JS is unavailable.)
	document.querySelectorAll(
		'.section-title, #skillsset .skill, #about .about-text, #about .col-md-12'
	).forEach(function(el) {
		el.classList.add('animate-on-scroll');
	});

	// Give each skill card a stagger index so they cascade in one after another
	// (consumed by the transition-delay rule in the CSS).
	document.querySelectorAll('#skillsset .skill').forEach(function(el, i) {
		el.style.setProperty('--stagger-index', i);
	});

	if ('IntersectionObserver' in window) {
		// Live check for the desktop breakpoint (matches the 767px CSS boundary).
		// Below it, timeline panels animate vertically like everything else;
		// at/above it they slide horizontally, so their exit is handled specially.
		var desktopQuery = window.matchMedia('(min-width: 768px)');

		// Negative rootMargin shrinks the "visible" zone so exits start while
		// the element is still on screen — making the previous section visibly
		// animate out as you scroll into the next one.
		var animObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view');
					entry.target.classList.remove('exit-top');
				} else {
					entry.target.classList.remove('in-view');
					var leftThroughTop = entry.boundingClientRect.top < 0;
					// On desktop, timeline panels slide in horizontally
					// (fade-left/fade-right). Keep their exit symmetric with their
					// entry — let them retreat back along the same horizontal axis
					// instead of sliding up — so scrolling up mirrors scrolling
					// down. On mobile these panels animate vertically, so they
					// follow the scroll like every other element (exit upward
					// through the top). All non-timeline elements always follow
					// the scroll.
					var isHorizontalPanel =
						entry.target.classList.contains('timeline-panel') &&
						desktopQuery.matches;
					entry.target.classList.toggle(
						'exit-top',
						!isHorizontalPanel && leftThroughTop
					);
				}
			});
		// rootMargin is breakpoint-aware (below). On mobile we expand the
		// bottom margin so elements begin animating in *before* they scroll
		// into view — this prevents the "blank card waiting to animate" effect
		// when flicking quickly through the tall, stacked mobile layout. On
		// desktop we keep a top inset so exits stay visible while scrolling down.
		}, {
			threshold: 0.05,
			rootMargin: desktopQuery.matches
				? '-10% 0px 0px 0px'
				: '0px 0px 25% 0px'
		});

		document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
			animObserver.observe(el);
		});
	} else {
		// Fallback: show everything immediately
		$('.animate-on-scroll').addClass('in-view');
	}

	// Theme toggle — dark is the default; preference persisted in localStorage.
	// Two buttons share the class: one in the menu group (desktop), one in the
	// navbar header (always visible on small screens).
	var $themeToggle = $('.theme-toggle');

	function updateToggleUI(theme) {
		var $icon = $themeToggle.find('i');
		if (theme === 'light') {
			// Light active — offer switch to dark
			$icon.attr('class', 'fa-solid fa-moon');
			$themeToggle.attr('aria-label', 'Switch to dark theme');
		} else {
			// Dark active — offer switch to light
			$icon.attr('class', 'fa-solid fa-sun');
			$themeToggle.attr('aria-label', 'Switch to light theme');
		}
	}

	function applyTheme(theme) {
		// Suppress CSS transitions during the swap so themed colors (including
		// the skill chart's percent number) change instantly instead of slowly
		// cross-fading. The class is removed on the next frame, restoring the
		// normal hover/interaction transitions.
		var root = document.documentElement;
		root.classList.add('theme-switching');

		if (theme === 'light') {
			root.setAttribute('data-theme', 'light');
		} else {
			root.removeAttribute('data-theme');
		}
		try {
			localStorage.setItem('theme', theme);
		} catch (e) { /* localStorage unavailable — theme won't persist */ }
		// Keep the browser chrome (mobile address bar) matching the theme
		var metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) {
			metaThemeColor.setAttribute(
				'content',
				getComputedStyle(root).getPropertyValue('--bg').trim()
			);
		}
		updateToggleUI(theme);
		// Re-render skill charts with the new theme colors — instantly (0ms),
		// so switching theme swaps the colors immediately instead of replaying
		// the slow fill animation.
		if (chartsInitialized) {
			initCharts(0);
		}

		// Re-enable transitions after the theme has applied (next frame).
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(function() {
				root.classList.remove('theme-switching');
			});
		});
	}

	// Sync the button icon with whatever the head script applied
	updateToggleUI(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

	$themeToggle.on('click', function() {
		var isLight = document.documentElement.getAttribute('data-theme') === 'light';
		applyTheme(isLight ? 'dark' : 'light');
	});

	// Scroll Progress Bar
	var $scrollProgress = $('#scroll-progress');
	function updateScrollProgress() {
		var aboutTop = $('#about').offset().top;
		var scrollTop = $(window).scrollTop();
		if (scrollTop < aboutTop) {
			$scrollProgress.css('width', '0%');
			return;
		}
		var docHeight = $(document).height() - $(window).height();
		var scrollPercent = ((scrollTop - aboutTop) / (docHeight - aboutTop)) * 100;
		$scrollProgress.css('width', Math.min(scrollPercent, 100) + '%');
	}
	$(window).on('scroll', updateScrollProgress);
	// Set the correct width on load — the browser may restore a non-top scroll
	// position on refresh, and the scroll event won't fire until the user moves.
	$(window).on('load', updateScrollProgress);
	updateScrollProgress();

	// Click the progress bar track to jump to that position on the page.
	// Inverts the progress mapping above: 0% = top of About, 100% = page end.
	$('#scroll-progress-track').on('click', function(e) {
		var $track = $(this);
		var fraction = (e.pageX - $track.offset().left) / $track.outerWidth();
		fraction = Math.max(0, Math.min(1, fraction));
		var aboutTop = $('#about').offset().top;
		var docHeight = $(document).height() - $(window).height();
		var target = aboutTop + fraction * (docHeight - aboutTop);
		$('html,body').animate({ scrollTop: target }, 600);
	});

	// Cursor glow — a soft light that eases toward the pointer. The lag (lerp)
	// makes it feel calm rather than jittery. Skipped for coarse/touch pointers
	// and when the user prefers reduced motion. Position is written to CSS
	// custom properties consumed by the #cursor-glow radial gradient.
	(function initCursorGlow() {
		var glow = document.getElementById('cursor-glow');
		if (!glow) { return; }

		var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!finePointer || reduceMotion) { return; }

		// Target = actual pointer position; current = eased position we render.
		var targetX = window.innerWidth / 2;
		var targetY = window.innerHeight / 2;
		var currentX = targetX;
		var currentY = targetY;
		var visible = false;
		var rafId = null;

		function render() {
			// Ease current toward target (0.15 = gentle trailing lag).
			currentX += (targetX - currentX) * 0.15;
			currentY += (targetY - currentY) * 0.15;
			glow.style.setProperty('--cursor-x', currentX + 'px');
			glow.style.setProperty('--cursor-y', currentY + 'px');
			rafId = window.requestAnimationFrame(render);
		}

		document.addEventListener('mousemove', function (e) {
			targetX = e.clientX;
			targetY = e.clientY;
			if (!visible) {
				visible = true;
				glow.classList.add('is-visible');
			}
			if (rafId === null) { render(); }
		});

		// Fade out when the pointer leaves the window, back in when it returns.
		document.addEventListener('mouseleave', function () {
			visible = false;
			glow.classList.remove('is-visible');
		});
		document.addEventListener('mouseenter', function () {
			visible = true;
			glow.classList.add('is-visible');
		});
	}());

	// Social links open in a new tab, so the visitor returns to this page.
	// Briefly highlight the icon the visitor just clicked (see .social-clicked
	// in CSS), and clear the highlight as soon as they click anywhere else.
	(function () {
		var $socialLinks = $('#contact .social ul li a');
		if (!$socialLinks.length) { return; }

		function clearHighlight() {
			$socialLinks.removeClass('social-clicked');
		}

		$socialLinks.on('click', function (e) {
			// Don't let this same click bubble to the document handler that clears it
			e.stopPropagation();
			clearHighlight();
			$(this).addClass('social-clicked');
		});

		// Any click elsewhere in the document clears the highlight
		$(document).on('click', clearHighlight);
	}());

}());

}
main();
