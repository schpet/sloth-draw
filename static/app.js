(function() {
  var slothdrawin, tryToSetup;

  slothdrawin = function() {
    var $canvas, activateButton, bgCanvas, bgCtx, canvas, ctx, dragging, drawAction, drawSloth, erase, eraseMode, handleFileSelect, imageLoaded, offset, prev, reset, sloth, slothMode, slothcount;
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
    canvas.width = $(window).width() - $('#tools').width();
    canvas.height = $(window).height();
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
      var slothsetX, slothsetY, threshhold, x, y;
      if (!imageLoaded) return;
      x = e.pageX - offset.left;
      y = e.pageY - offset.top;
      slothsetX = -22;
      slothsetY = -22;
      threshhold = 16;
      if (e.type === 'mousemove' && Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold) {
        return;
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(sloth, x + slothsetX, y + slothsetY);
      prev.x = x;
      prev.y = y;
      slothcount++;
      return console.log(slothcount);
    };
    erase = function(e) {
      var radius, x, y;
      x = e.pageX - offset.left;
      y = e.pageY - offset.top;
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
    drawAction = null;
    $('#sloth-board').on('mousedown', function(e) {
      if (e.which > 1) return;
      dragging = true;
      return drawAction(e);
    });
    $('#sloth-board').on('mouseup mouseout', function(e) {
      return dragging = false;
    });
    $('#sloth-board').on('mousemove', function(e) {
      if (!dragging) return;
      return drawAction(e);
    });
    activateButton = function($b) {
      $(".active").removeClass('active');
      return $b.addClass('active');
    };
    slothMode = function() {
      $('#sloth-board').removeClass('erase');
      $('#sloth').addClass('active');
      activateButton($('#sloth'));
      return drawAction = drawSloth;
    };
    eraseMode = function() {
      $('#sloth-board').addClass('erase');
      activateButton($('#eraser'));
      return drawAction = erase;
    };
    slothMode();
    $('#eraser').on('click', eraseMode);
    $('#sloth').on('click', slothMode);
    $(document).on('selectstart dragstart', function(e) {
      return e.preventDefault();
    });
    document.body.style.MozUserSelect = "none";
    $('#save').on('click', function() {
      var data, mime, oCtx, output, slothWords;
      slothWords = prompt("Give this sloth some words (or leave it blank)");
      if (slothWords === null) return;
      if (slothWords === '') slothWords = new Date().getTime();
      $('.uploading').each(function() {
        return $(this).css({
          left: $(window).width() / 2 - $(this).width() / 2 + 'px',
          top: $(window).height() / 2 - $(this).height() / 2 + 'px',
          display: 'block'
        });
      });
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
          'key_name': slothWords
        },
        success: function(response) {
          return window.location.href = response.path;
        },
        error: function(response) {
          $('.uploading').hide();
          if (response.status === 409) {
            return alert('yo that url is taken :-( try saving again with a different one');
          } else {
            return alert('somethings fucked tell peter@peterschilling.org');
          }
        }
      });
    });
    $('#help').on('mouseenter', function() {
      $('.help-layover').addClass('visible');
      return $('#canvas-container').addClass('dimmed');
    });
    $('#help').on('mouseleave', function() {
      $('.help-layover').removeClass('visible');
      return $('#canvas-container').removeClass('dimmed');
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
