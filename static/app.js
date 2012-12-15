(function() {
  var slothdrawin, tryToSetup;

  slothdrawin = function() {
    var $canvas, bgCanvas, bgCtx, borderSize, canvas, ctx, dragging, drawAction, drawSloth, erase, eraseMode, handleFileSelect, imageLoaded, offset, prev, reset, sloth, slothMode, slothcount;
    dragging = false;
    prev = {
      x: -100,
      y: -100
    };
    slothcount = 0;
    sloth = new Image();
    imageLoaded = false;
    canvas = document.getElementById('sloth-board');
    $canvas = $(canvas);
    offset = $canvas.offset();
    borderSize = parseInt($canvas.css("border-left-width"));
    console.log([$(window).width(), $('#tools').width(), borderSize * 2]);
    console.log([$(window).height(), borderSize * 2]);
    canvas.width = $(window).width() - $('#tools').width() - borderSize * 2;
    canvas.height = $(window).height() - borderSize * 2;
    ctx = canvas.getContext('2d');
    bgCanvas = document.getElementById('bg-canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCtx = bgCanvas.getContext('2d');
    sloth.onload = function() {
      return imageLoaded = true;
    };
    sloth.src = 'static/img/slothpal.png';
    drawSloth = function(e) {
      var threshhold, x, y;
      if (!imageLoaded) return;
      x = e.pageX - offset.left - borderSize;
      y = e.pageY - offset.top - borderSize;
      threshhold = 16;
      if (Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold) {
        return;
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(sloth, x, y);
      prev.x = x;
      prev.y = y;
      slothcount++;
      return console.log(slothcount);
    };
    erase = function(e) {
      var radius, x, y;
      x = e.pageX - offset.left - borderSize;
      y = e.pageY - offset.top - borderSize;
      radius = 20;
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI, false);
      ctx.closePath();
      return ctx.fill();
    };
    reset = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return bgCtx.clearRect(0, 0, canvas.width, canvas.height);
    };
    $('#reset').on('click', reset);
    drawAction = drawSloth;
    $(document).on('mousedown', function(e) {
      dragging = true;
      return drawAction(e);
    });
    $(document).on('mouseup mouseexit', function(e) {
      return dragging = false;
    });
    $(document).on('mousemove', function(e) {
      if (!dragging) return;
      return drawAction(e);
    });
    slothMode = function() {
      $('#sloth-board').removeClass('erase');
      return drawAction = drawSloth;
    };
    eraseMode = function() {
      $('#sloth-board').addClass('erase');
      return drawAction = erase;
    };
    $('#eraser').on('click', eraseMode);
    $('#sloth').on('click', slothMode);
    $(document).on('selectstart dragstart', function(e) {
      return e.preventDefault();
    });
    document.body.style.MozUserSelect = "none";
    $('#save').on('click', function() {
      var data, mime, oCtx, output;
      output = document.createElement('canvas');
      output.width = canvas.width;
      output.height = canvas.height;
      oCtx = output.getContext('2d');
      oCtx.drawImage(bgCanvas, 0, 0);
      oCtx.drawImage(canvas, 0, 0);
      mime = "image/png";
      data = output.toDataURL(mime);
      return $.ajax({
        url: '/draw',
        type: 'POST',
        data: {
          'image': data,
          'key_name': prompt("Give this sloth some words")
        },
        success: function(response) {
          return window.location.href = response.path;
        },
        error: function(response) {
          if (response.status === 409) {
            return alert('yo that url is taken :-( try saving again with a different one');
          } else {
            return alert('somethings fucked tell peter@peterschilling.org');
          }
        }
      });
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
            var img;
            img = new Image();
            img.onload = function() {
              var gapX, gapY, h, r, w;
              w = img.width;
              h = img.height;
              r = w / h;
              if (img.width > canvas.width) {
                w = canvas.width;
                h = w / r;
              }
              if (img.height > canvas.height) {
                h = canvas.height;
                w = h * r;
              }
              gapX = canvas.width - w;
              gapY = canvas.height - h;
              reset();
              return bgCtx.drawImage(img, gapX / 2, gapY / 2, w, h);
            };
            return img.src = e.target.result;
          };
        })(f);
        reader.readAsDataURL(f);
        _results.push(i++);
      }
      return _results;
    };
    return $(document).on('change', handleFileSelect);
  };

  tryToSetup = function() {
    if ($(window).width() === 0 || $(window).height() === 0) {
      setTimeout(tryToSetup, 20);
      return;
    }
    return slothdrawin();
  };

  $(window).load(tryToSetup);

}).call(this);
