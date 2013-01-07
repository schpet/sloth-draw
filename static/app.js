(function() {
  var slothdrawin, tryToSetup;

  slothdrawin = function() {
    var $canvas, activateButton, bgCanvas, bgCtx, canvas, clickEvent, ctx, dragging, drawAction, drawSloth, drawSlothEvent, erase, eraseEvent, eraseMode, handleFileSelect, imageLoaded, offset, prev, reset, setMoonCursor, size, sloth, slothMode, slothcount, touchDevice;
    touchDevice = 'ontouchstart' in document.documentElement;
    clickEvent = touchDevice ? 'touchstart' : 'click';
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
    canvas.width = $(window).width() - $('#tools').width() - 1;
    canvas.height = $(window).height();
    ctx = canvas.getContext('2d');
    bgCanvas = document.getElementById('bg-canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCtx = bgCanvas.getContext('2d');
    sloth.onload = function() {
      return imageLoaded = true;
    };
    size = $('#brush-size').val();
    sloth.src = "static/img/scaled/slothpal_" + size + ".png";
    drawSlothEvent = function(e) {
      var threshhold, touch, x, y, _i, _len, _ref;
      if (!imageLoaded) return;
      threshhold = sloth.width / 3;
      switch (e.type) {
        case 'mousemove':
        case 'mousedown':
          x = e.pageX - offset.left;
          y = e.pageY - offset.top;
          if (e.type === 'mousemove' && Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold) {
            return;
          }
          return drawSloth(x, y);
        case 'touchmove':
        case 'touchstart':
          e.preventDefault();
          _ref = e.originalEvent.touches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            touch = _ref[_i];
            x = touch.pageX - offset.left;
            y = touch.pageY - offset.top;
            if (Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold) {
              return;
            }
            drawSloth(x, y);
          }
      }
    };
    drawSloth = function(x, y) {
      var h, slothsetX, slothsetY, w;
      w = sloth.width;
      h = sloth.height;
      slothsetX = -w / 2;
      slothsetY = -h / 2;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(sloth, x + slothsetX, y + slothsetY, w, h);
      prev.x = x;
      prev.y = y;
      slothcount++;
      return console.log(slothcount);
    };
    eraseEvent = function(e) {
      var touch, x, y, _i, _len, _ref, _results;
      switch (e.type) {
        case 'mousemove':
        case 'mousedown':
          x = e.pageX - offset.left;
          y = e.pageY - offset.top;
          return erase(x, y);
        case 'touchmove':
        case 'touchstart':
          e.preventDefault();
          _ref = e.originalEvent.touches;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            touch = _ref[_i];
            x = touch.pageX - offset.left - 20;
            y = touch.pageY - offset.top - 20;
            _results.push(erase(x, y));
          }
          return _results;
      }
    };
    erase = function(x, y) {
      var diameter, radius;
      diameter = Math.min(size, 128);
      radius = diameter / 2;
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.closePath();
      return ctx.fill();
    };
    reset = function() {
      var yousure;
      yousure = confirm('you sure you want to get rid of this one?');
      if (yousure) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return bgCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    drawAction = null;
    $('#sloth-board').on('mousedown touchstart', function(e) {
      if (e.which > 1) return;
      dragging = true;
      return drawAction(e);
    });
    $('#sloth-board').on('mouseup mouseout touchend', function(e) {
      return dragging = false;
    });
    $('#sloth-board').on('mousemove touchmove', function(e) {
      if (!dragging) return;
      return drawAction(e);
    });
    activateButton = function($b) {
      $(".active").removeClass('active');
      return $b.addClass('active');
    };
    slothMode = function() {
      $('#sloth-board').removeClass('erase').css('cursor', '');
      $('#sloth').addClass('active');
      activateButton($('#sloth'));
      return drawAction = drawSlothEvent;
    };
    setMoonCursor = function() {
      var hMoonSize, moonSize;
      moonSize = Math.min(size, 128);
      hMoonSize = Math.round(moonSize / 2);
      return $('#sloth-board').css('cursor', "url('static/img/scaled/moonraser_" + moonSize + ".png') " + hMoonSize + " " + hMoonSize + ", auto");
    };
    eraseMode = function() {
      $('#sloth-board').addClass('erase');
      setMoonCursor();
      activateButton($('#eraser'));
      return drawAction = eraseEvent;
    };
    slothMode();
    $('#eraser').on(clickEvent, eraseMode);
    $('#sloth').on(clickEvent, slothMode);
    $('#reset').on(clickEvent, reset);
    $('#brush-size').on('change', function() {
      size = $(this).val();
      size = Math.min(size, 260);
      size = Math.max(size, 1);
      sloth.src = "static/img/scaled/slothpal_" + size + ".png";
      if ($('#sloth-board').hasClass('erase')) return setMoonCursor();
    });
    $(document).on('selectstart dragstart', function(e) {
      return e.preventDefault();
    });
    document.body.style.MozUserSelect = "none";
    $('#save').on(clickEvent, function(e) {
      var data, mime, oCtx, output, slothWords;
      e.preventDefault();
      e.stopPropagation();
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
          if (response.path != null) {
            return window.location.href = response.path;
          } else {
            $('.uploading').hide();
            if (typeof _gaq !== "undefined" && _gaq !== null) {
              _gaq.push(['_trackEvent', 'error', 'failed upload', JSON.stringify(response)]);
            }
            console.log(response);
            return window.alert("oh dang sorry this failed to upload sloth draw is REALLY sorry! the image is probably too big or some other bad thing happened");
          }
        },
        error: function(response) {
          $('.uploading').hide();
          if (response.status === 409) {
            if (typeof _gaq !== "undefined" && _gaq !== null) {
              _gaq.push(['_trackEvent', 'error', 'url taken', slothWords]);
            }
            return alert('yo that url is taken :-( try saving again with a different one');
          } else {
            if (typeof _gaq !== "undefined" && _gaq !== null) {
              _gaq.push(['_trackEvent', 'error', 'weird response', response.status]);
            }
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
    $('#files').on('change', handleFileSelect);
    $('.help-layover').show();
    if (document.getElementById('brush-size').type !== 'range') {
      $('#brush-size').hide();
    }
    $.fn.tipsy.elementOptions = function(ele, options) {
      return $.extend({}, options, {
        gravity: $(ele).attr('data-tipsy-gravity') || 'n'
      });
    };
    if (!touchDevice) return $('.js-tipsy').tipsy();
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
