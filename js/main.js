
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

	function initCharts() {
		var chartSize = getChartSize();
		$('.chart').each(function() {
			var $chart = $(this);
			// Remove old canvas if re-initializing
			$chart.find('canvas').remove();
			// Reset data so easyPieChart can re-init
			$chart.removeData('easyPieChart');
			$chart.easyPieChart({
				easing: 'easeOutBounce',
				barColor: '#7a1530',
				trackColor: 'rgba(255,255,255,0.1)',
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

	// Scroll-triggered animations using Intersection Observer
	if ('IntersectionObserver' in window) {
		var animObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('animated');
					// After animation ends, clear animation so hover transitions work
					entry.target.addEventListener('animationend', function() {
						this.style.animation = 'none';
						this.style.opacity = '1';
					});
					animObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.15 });

		document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
			animObserver.observe(el);
		});
	} else {
		// Fallback: show everything immediately
		$('.animate-on-scroll').addClass('animated');
	}

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
