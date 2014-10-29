$(document).ready(function(){

  //Check to see if the window is top if not then display button
  $(window).scroll(function(){
    if ($(this).scrollTop() > 100) {
      $('.scrollToTop').fadeIn();
    } else {
      $('.scrollToTop').fadeOut();
    }
  });

  //Click event to scroll to top
  $('.scrollToTop').click(function(){
    $('html, body').animate({scrollTop : 0},700);
    return false;
  });

// sticky
  var stickyNavTop = $('.subnav-date').offset().top;
  var stickyNav = function(){
  var scrollTop = $(window).scrollTop();

  if (scrollTop > stickyNavTop) {
      $('.subnav-date').addClass('sticky');
  } else {
      $('.subnav-date').removeClass('sticky');
  }
  };

  stickyNav();

  $(window).scroll(function() {
      stickyNav();
  });

});
