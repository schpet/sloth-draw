(function() {
  var $canvas, dragging, drawSloth, prev;

  dragging = false;

  prev = {
    x: -100,
    y: -100
  };

  $canvas = $('#sloth-board');

  drawSloth = function(e) {
    var threshhold, x, y;
    x = e.pageX;
    y = e.pageY;
    threshhold = 16;
    if (Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold) {
      return;
    }
    $canvas.append();
    $('<div class="sloth" />').css({
      'left': "" + x + "px",
      'top': "" + y + "px"
    }).appendTo($canvas);
    prev.x = x;
    return prev.y = y;
  };

  $(document).on('mousedown', function(e) {
    dragging = true;
    return drawSloth(e);
  });

  $(document).on('mouseup mouseexit', function(e) {
    return dragging = false;
  });

  $(document).on('selectstart', false);

  $(document).on('mousemove', function(e) {
    if (!dragging) return;
    return drawSloth(e);
  });

  $('.js-save').on('click', function() {
    var coords;
    coords = [];
    $('.sloth').each(function() {
      var pos;
      pos = $(this).position();
      return coords.push({
        x: pos.left,
        y: pos.top
      });
    });
    debugger;
  });

}).call(this);
