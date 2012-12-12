(function() {
  var $canvas, dragging, drawSloth, handleFileSelect, prev;

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

  $(document).on('selectstart dragstart', function(e) {
    return e.preventDefault();
  });

  document.body.style.MozUserSelect = "none";

  $('.file-chooser').on('mousedown', function(e) {
    return e.stopPropagation();
  });

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

  handleFileSelect = function(evt) {
    var f, files, i, reader, _results;
    files = evt.target.files;
    i = 0;
    f = void 0;
    _results = [];
    while (f = files[i]) {
      if (!f.type.match("image.*")) continue;
      reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {
          var $img;
          $img = $("<img src=\"" + e.target.result + "\" />");
          $('#image').html($img);
          $('.sloth').remove();
          return localStorage.setItem("img", e.target.result);
        };
      })(f);
      reader.readAsDataURL(f);
      _results.push(i++);
    }
    return _results;
  };

  $(document).on('change', handleFileSelect);

}).call(this);
