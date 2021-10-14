
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
   
  	$('a.page-scroll').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 40
            }, 900);
            return false;
          }
        }
      });

	// affix the navbar after scroll below header
	$('#nav').affix({
	      offset: {
		top: $('header').height()
	      }
	});	

	// skills chart
	$(document).ready(function(e) {
	//var windowBottom = $(window).height();
	var index=0;
	$(document).scroll(function(){
		if (isScrolledIntoView('#skillsset')){
		
			if(index==0){	
			
				$('.chart').easyPieChart({
					easing: 'easeOutBounce',
					onStep: function(from, to, percent) {
						$(this.el).find('.percent').text(Math.round(percent));
					}
				});
			
				}
			index++;
		}
	})
	});
	
	/// When you click everywhere in the document
	$(document).click(function (event) {

	  /// If *navbar-collapse* is not among targets of event
	  if (!$(event.target).is('.navbar-collapse *')) {

	    /// Collapse every *navbar-collapse*
	    $('.navbar-collapse').collapse('hide');

	  }
	});
		

}());

}
main();

