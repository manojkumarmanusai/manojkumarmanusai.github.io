
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
		return $(window).width() < 768 ? 100 : 120;
	}

	function getChartColors() {
		var styles = getComputedStyle(document.documentElement);
		return {
			bar: styles.getPropertyValue('--chart-bar').trim() || '#a33350',
			track: styles.getPropertyValue('--chart-track').trim() || 'rgba(255,255,255,0.12)'
		};
	}

	function initCharts() {
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
				barColor: chartColors.bar,
				trackColor: chartColors.track,
				scaleColor: false,
				lineWidth: 6,
				lineCap: 'round',
				animate: 2500,
				size: chartSize,
				onStep: function(from, to, percent) {
					$(this.el).find('.percent').text(Math.round(percent) + '%');
				}
			});
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
				initCharts();
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

	// Fallback: poll for zoom changes via devicePixelRatio
	var lastDPR = window.devicePixelRatio || 1;
	setInterval(function() {
		var currentDPR = window.devicePixelRatio || 1;
		if (currentDPR !== lastDPR) {
			lastDPR = currentDPR;
			checkChartResize();
		}
	}, 500);
	
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

	if ('IntersectionObserver' in window) {
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
					// Left through the top edge → animate out upward (follows scroll)
					entry.target.classList.toggle('exit-top', entry.boundingClientRect.top < 0);
				}
			});
		// Asymmetric margins: no inset at the bottom so elements animate in as
		// soon as they peek above the fold (important on mobile where cards are
		// tall); 10% inset at the top keeps the exit visible while scrolling down.
		// Low threshold so tall elements don't need to be deeply scrolled in.
		}, { threshold: 0.05, rootMargin: '-10% 0px 0px 0px' });

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
		if (theme === 'light') {
			document.documentElement.setAttribute('data-theme', 'light');
		} else {
			document.documentElement.removeAttribute('data-theme');
		}
		try {
			localStorage.setItem('theme', theme);
		} catch (e) { /* localStorage unavailable — theme won't persist */ }
		updateToggleUI(theme);
		// Re-render skill charts with the new theme colors
		if (chartsInitialized) {
			initCharts();
		}
	}

	// Sync the button icon with whatever the head script applied
	updateToggleUI(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

	$themeToggle.on('click', function() {
		var isLight = document.documentElement.getAttribute('data-theme') === 'light';
		applyTheme(isLight ? 'dark' : 'light');
	});

	// Scroll Progress Bar
	var $scrollProgress = $('#scroll-progress');
	$(window).on('scroll', function() {
		var aboutTop = $('#about').offset().top;
		var scrollTop = $(window).scrollTop();
		if (scrollTop < aboutTop) {
			$scrollProgress.css('width', '0%');
			return;
		}
		var docHeight = $(document).height() - $(window).height();
		var scrollPercent = ((scrollTop - aboutTop) / (docHeight - aboutTop)) * 100;
		$scrollProgress.css('width', Math.min(scrollPercent, 100) + '%');
	});

}());

}
main();
