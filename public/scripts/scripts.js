$(document).ready(function(){

  var aDate = new Date();
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var today = months[aDate.getMonth()] + ' ' + aDate.getDate();

  defaultDate = function(date) {
    $('#datepicker').val("Today, " + today);
    $('#datepicker').attr('size', $('#datepicker').val().length+5);

  };
  defaultDate();


  // datepicker
  $("#datepicker").datepicker( {
      onSelect: function() {
        var dateObject = $(this).datepicker('getDate');
        var selectedDate = $.datepicker.formatDate( "yy-mm-dd", dateObject);
        var showDate = $.datepicker.formatDate("DD, MM d", dateObject);
        console.log(dateObject);
        console.log(selectedDate);
        console.log(showDate);
        $(this).val(showDate);
        $(this).attr('size', $(this).val().length+6);

        $.ajax({
          type: "POST",
          url: "/home/date",
          data: {date: selectedDate}
        }).done(function(response) {
          console.log("THIS IS THE RESPONSE: " + response);
          $('#eventList').val(response);
        });

      }
    });

  // get list of events based on date selecte


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

  $(function() {
    $( "#datepicker" ).datepicker();
  });

});
