$(document).ready(function(){

  $("#reset-vis-1").click(function(){
    resetVis1();
  });

  // hide the vis 1 reset button at start (it only shows when companies are on display in the center)
  $("#reset-vis-1").hide();


  var $nav = $('nav');

  // fade in .navbar
  $(function () {
    $(window).scroll(function () {
      // set distance user needs to scroll before we start fadeIn
      if ($(this).scrollTop() > 100) { //For dynamic effect use $nav.height() instead of '100'
        $nav.fadeIn();
      } else {
        $nav.fadeOut();
      }
    });
  });
});

var myFullpage = new fullpage('#fullpage', {
  anchors: ['home', 'section1', 'section2a', 'section3', 'section2b', 'section4', 'section2c', 'section5', 'section2d', 'section6', 'section7', 'section8', 'section9'],
  menu: "#mainNav",
  navigation: true,
  navigationPosition: 'right',
  showActiveTooltip: false,
  navigationTooltips: [],
  licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
  normalScrollElements: '.dropdown-container, .dropdown-container2'
});

var options = {
  strings: ['Time series search engine', 'Kernelized cross-correlation distance metric.', 'Feature-based similarity.', 'Query by example.', 'One-to-one comparisons.', 'One-to-many comparisons.'],
  typeSpeed: 75,
  startDelay: 1000,
  backDelay: 1000,
  loop: true
}

var typed = new Typed(".typedHeader", options);
