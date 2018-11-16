$( window ).resize(function() {
    if($(window).width() <=768){
    $('#media-query-break').addClass("line-break");
    }
    else $('#media-query-break').removeClass("line-break");
  });