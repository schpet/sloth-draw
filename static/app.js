// Generated by CoffeeScript 1.4.0
(function() {
  "use strict";

  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.SlothDrawin = (function() {

    function SlothDrawin() {
      this.setBrushSize = __bind(this.setBrushSize, this);

      this.setBrushImageSize = __bind(this.setBrushImageSize, this);

      this.eraseMode = __bind(this.eraseMode, this);

      this.setMoonCursor = __bind(this.setMoonCursor, this);

      this.slothMode = __bind(this.slothMode, this);

      this.activateButton = __bind(this.activateButton, this);

      this.reset = __bind(this.reset, this);

      this.erase = __bind(this.erase, this);

      this.eraseEvent = __bind(this.eraseEvent, this);

      this.drawSloth = __bind(this.drawSloth, this);

      this.drawSlothEvent = __bind(this.drawSlothEvent, this);

    }

    SlothDrawin.prototype.setUp = function() {
      var jump,
        _this = this;
      this.touchDevice = 'ontouchstart' in document.documentElement;
      this.clickEvent = this.touchDevice ? 'touchstart' : 'click';
      this.dragging = false;
      this.prev = {
        x: -100,
        y: -100
      };
      this.cursorPositions = [
        {
          x: 0,
          y: 0
        }
      ];
      this.previousPosition = null;
      this.slothCount = 0;
      this.brushSize = 0;
      this.states = {
        SLOTHING: 0,
        MOONRASING: 1
      };
      this.state = this.states.SLOTHING;
      this.$sizeIndicator = null;
      window.points = {};
      this.startTime = null;
      this.sloth = new Image();
      this.imageLoaded = false;
      this.sloth.onload = function() {
        return _this.imageLoaded = true;
      };
      this.canvas = document.getElementById('sloth-board');
      this.$canvas = $(this.canvas);
      this.offset = this.$canvas.offset();
      this.canvas.width = $(window).width() - $('#tools').width() - 1;
      this.canvas.height = $(window).height();
      this.ctx = this.canvas.getContext('2d');
      this.bgCanvas = document.getElementById('bg-canvas');
      this.bgCanvas.width = this.canvas.width;
      this.bgCanvas.height = this.canvas.height;
      this.bgCtx = this.bgCanvas.getContext('2d');
      this.$canvas.on('mousedown touchstart', function(e) {
        if (e.type === 'click' && e.which > 1) {
          return;
        }
        _this.dragging = true;
        return _this.drawAction(e);
      });
      $('#sloth-board').on('mouseup mouseout touchend', function(e) {
        _this.previousPosition = null;
        return _this.dragging = false;
      });
      setInterval((function() {
        if (!_this.dragging) {
          return;
        }
        return _this.drawAction();
      }), 40);
      $(document).on('mousemove mousedown touchmove touchstart', function(e) {
        var touch, _i, _len, _ref, _results;
        switch (e.type) {
          case 'mousemove':
          case 'mousedown':
            return _this.cursorPositions = [
              {
                x: e.pageX,
                y: e.pageY
              }
            ];
          case 'touchmove':
          case 'touchstart':
            if ($(e.target).attr('id') === 'sloth-board') {
              e.preventDefault();
            }
            _this.cursorPositions = [];
            _ref = e.originalEvent.touches;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              touch = _ref[_i];
              _results.push(_this.cursorPositions.push({
                x: touch.pageX,
                y: touch.pageY
              }));
            }
            return _results;
        }
      });
      this.drawAction = null;
      this.slothMode();
      $('#eraser').on(this.clickEvent, this.eraseMode);
      $('#sloth').on(this.clickEvent, this.slothMode);
      $('#reset').on(this.clickEvent, this.reset);
      $('#brush-size').on('change', function(e) {
        var size;
        size = parseInt($('#brush-size').val());
        return _this.setBrushSize(size, {
          x: 69,
          y: _this.cursorPositions[0].y
        });
      });
      this.brushTimeout = null;
      this.setBrushSize(50, null, true);
      jump = 5;
      $('.js-big').on(this.clickEvent, function() {
        return _this.setBrushSize(_this.brushSize + jump, null, true);
      });
      $('.js-small').on(this.clickEvent, function() {
        return _this.setBrushSize(_this.brushSize - jump, null, true);
      });
      $("body").on('mousewheel DOMMouseScroll', function(e) {
        var delta, downscaled;
        if (e.type === 'mousewheel') {
          delta = e.originalEvent.wheelDelta;
        } else {
          delta = e.originalEvent.detail * 5;
        }
        downscaled = delta / 5;
        if (Math.abs(downscaled) > 1) {
          delta = downscaled;
        }
        _this.setBrushImageSize(_this.brushSize + delta);
        if (_this.state === _this.states.SLOTHING) {
          _this.setBrushSize(_this.brushSize, {
            x: _this.cursorPositions[0].x - _this.brushSize / 2,
            y: _this.cursorPositions[0].y
          }, true);
        } else {
          _this.setBrushSize(_this.brushSize, null, true);
        }
        if (_this.hideSizeIndicator != null) {
          clearTimeout(_this.hideSizeIndicator);
          _this.hideSizeIndicator = null;
        }
        return _this.hideSizeIndicator = setTimeout((function() {
          var _ref;
          if ((_ref = _this.$sizeIndicator) != null) {
            _ref.remove();
          }
          return _this.$sizeIndicator = null;
        }), 500);
      });
      $(document).on('selectstart dragstart', function(e) {
        return e.preventDefault();
      });
      document.body.style.MozUserSelect = "none";
      $('#save').on(this.clickEvent, function(e) {
        var data, mime, oCtx, output, slothWords;
        e.preventDefault();
        e.stopPropagation();
        slothWords = prompt("Give this sloth some words (or leave it blank)");
        if (slothWords === null) {
          return;
        }
        if (slothWords === '') {
          slothWords = new Date().getTime();
        }
        _gaq.push(['_trackEvent', 'saved', 'sloth count', slothWords, _this.slothCount]);
        $('.uploading').each(function() {
          return $(this).css({
            left: $(window).width() / 2 - $(this).width() / 2 + 'px',
            top: $(window).height() / 2 - $(this).height() / 2 + 'px',
            display: 'block'
          });
        });
        output = document.createElement('canvas');
        output.width = _this.canvas.width;
        output.height = _this.canvas.height;
        oCtx = output.getContext('2d');
        oCtx.drawImage(_this.bgCanvas, 0, 0);
        oCtx.drawImage(_this.canvas, 0, 0);
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
              return window.alert("oh dang sorry sloth draw failed and is REALLY sorry! looks like you will have to take a screenshot or take a picture of your computer to save it!");
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
      $('#files').on('change', function(evt) {
        var f, files, i, reader, _results;
        files = evt.target.files;
        i = 0;
        f = void 0;
        _results = [];
        while (f = files[i]) {
          if (!f.type.match("image.*")) {
            continue;
          }
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
                if (img.width > _this.canvas.width) {
                  w = _this.canvas.width;
                  h = w / r;
                }
                if (img.height > _this.canvas.height) {
                  h = _this.canvas.height;
                  w = h * r;
                }
                gapX = _this.canvas.width - w;
                gapY = _this.canvas.height - h;
                return _this.bgCtx.drawImage(img, gapX / 2, gapY / 2, w, h);
              };
              return img.src = e.target.result;
            };
          })(f);
          reader.readAsDataURL(f);
          _results.push(i++);
        }
        return _results;
      });
      if (!($(window).width() < 500)) {
        $('.help-layover').show();
      }
      if (document.getElementById('brush-size').type !== 'range') {
        $('.brush-size-container').addClass('unsupported');
      }
      setTimeout((function() {
        return $('.protip').css('top', '-500px');
      }), 4000);
      $.fn.tipsy.elementOptions = function(ele, options) {
        return $.extend({}, options, {
          gravity: $(ele).attr('data-tipsy-gravity') || 'n'
        });
      };
      if (!this.touchDevice) {
        return $('.js-tipsy').tipsy();
      }
    };

    SlothDrawin.prototype.drawSlothEvent = function(e) {
      var dist, drawPoints, points, startTime, time, x1, x2, y1, y2,
        _this = this;
      if (!this.imageLoaded) {
        return;
      }
      time = new Date().getTime();
      if (!(typeof startTime !== "undefined" && startTime !== null)) {
        startTime = time;
      }
      drawPoints = function(pointsArray) {
        var point, x, y, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = pointsArray.length; _i < _len; _i++) {
          point = pointsArray[_i];
          if (point instanceof Array) {
            x = point[0] - _this.offset.left;
            y = point[1] - _this.offset.top;
          } else {
            x = point.x - _this.offset.left;
            y = point.y - _this.offset.top;
          }
          _results.push(_this.drawSloth(x, y));
        }
        return _results;
      };
      if (this.cursorPositions.length > 1) {
        drawPoints(this.cursorPositions);
      } else if (this.previousPosition != null) {
        x1 = this.previousPosition.x;
        y1 = this.previousPosition.y;
        x2 = this.cursorPositions[0].x;
        y2 = this.cursorPositions[0].y;
        dist = this.distanceBetweenTwoPoints(x1, y1, x2, y2);
        points = this.interpolatePoints(x1, y1, x2, y2, Math.max(1, dist / (this.brushSize / 5)));
        drawPoints(points);
      } else {
        drawPoints(this.cursorPositions);
      }
      return this.previousPosition = this.cursorPositions[0];
    };

    SlothDrawin.prototype.interpolateNumbers = function(a, b, count) {
      var dist, i, interpolated, _i, _ref;
      if (count === 0) {
        return [];
      }
      dist = b - a;
      if (count === 1) {
        return [a + dist / 2];
      }
      interpolated = [];
      for (i = _i = 0, _ref = count - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        interpolated.push((dist * (i / (count - 1))) + a);
      }
      return interpolated;
    };

    SlothDrawin.prototype.interpolatePoints = function(x1, y1, x2, y2, count) {
      var i, interpolated, interpolatedX, interpolatedY, _i, _ref;
      if (count === 0) {
        return [];
      }
      count = Math.floor(count);
      interpolatedX = this.interpolateNumbers(x1, x2, count);
      interpolatedY = this.interpolateNumbers(y1, y2, count);
      interpolated = [];
      for (i = _i = 0, _ref = count - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        interpolated.push([interpolatedX[i], interpolatedY[i]]);
      }
      return interpolated;
    };

    SlothDrawin.prototype.distanceBetweenTwoPoints = function(x1, y1, x2, y2) {
      var distX, distY;
      distY = Math.abs(y2 - y1);
      distX = Math.abs(x2 - x1);
      if (distY === 0) {
        return distX;
      }
      if (distX === 0) {
        return distY;
      }
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    SlothDrawin.prototype.drawSloth = function(x, y) {
      var h, slothsetX, slothsetY, w;
      w = this.sloth.width;
      h = this.sloth.height;
      slothsetX = -w / 2;
      slothsetY = -h / 2;
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.drawImage(this.sloth, x + slothsetX, y + slothsetY, w, h);
      this.prev.x = x;
      this.prev.y = y;
      return this.slothCount++;
    };

    SlothDrawin.prototype.eraseEvent = function(e) {
      var point, x, y, _i, _len, _ref, _results;
      _ref = this.cursorPositions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        x = point.x - this.offset.left;
        y = point.y - this.offset.top;
        _results.push(this.erase(x, y));
      }
      return _results;
    };

    SlothDrawin.prototype.erase = function(x, y) {
      var diameter, radius;
      diameter = Math.min(this.brushSize, 128);
      radius = diameter / 2;
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.strokeStyle = "rgba(0,0,0,1)";
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      this.ctx.closePath();
      return this.ctx.fill();
    };

    SlothDrawin.prototype.reset = function() {
      if (confirm('you sure you want to get rid of this one?')) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this.bgCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    SlothDrawin.prototype.activateButton = function($b) {
      $(".active").removeClass('active');
      return $b.addClass('active');
    };

    SlothDrawin.prototype.slothMode = function() {
      this.state = this.states.SLOTHING;
      $('#sloth-board').removeClass('erase').css('cursor', '');
      $('#sloth').addClass('active');
      this.activateButton($('#sloth'));
      return this.drawAction = this.drawSlothEvent;
    };

    SlothDrawin.prototype.setMoonCursor = function() {
      var hMoonSize, moonSize;
      moonSize = Math.min(this.brushSize, 128);
      hMoonSize = Math.round(moonSize / 2);
      return $('#sloth-board').css('cursor', "url('static/img/scaled/moonraser_" + moonSize + ".png') " + hMoonSize + " " + hMoonSize + ", auto");
    };

    SlothDrawin.prototype.eraseMode = function() {
      $('#sloth-board').addClass('erase');
      this.state = this.states.MOONRASING;
      this.setMoonCursor();
      this.activateButton($('#eraser'));
      return this.drawAction = this.eraseEvent;
    };

    SlothDrawin.prototype.setBrushImageSize = function(size) {
      var _this = this;
      size = Math.min(size, 260);
      size = Math.max(size, 4);
      this.brushSize = parseInt(size);
      if (this.brushTimeout != null) {
        clearTimeout(this.brushTimeout);
        this.brushTimeout = null;
      }
      return this.brushTimeout = setTimeout((function() {
        _this.sloth.src = "static/img/scaled/slothpal_" + _this.brushSize + ".png";
        if ($('#sloth-board').hasClass('erase')) {
          return _this.setMoonCursor();
        }
      }), 200);
    };

    SlothDrawin.prototype.setBrushSize = function(size, feedback, updateRange) {
      var _ref, _ref1,
        _this = this;
      if (feedback == null) {
        feedback = null;
      }
      if (updateRange == null) {
        updateRange = false;
      }
      if (this.updateRange) {
        $('#brush-size').val(size);
      }
      size = Math.min(size, 260);
      size = Math.max(size, 4);
      if (feedback != null) {
        if (!(this.$sizeIndicator != null)) {
          this.$sizeIndicator = $("<img src='/static/img/scaled/slothpal_260.png' class='size-indicator' />").appendTo($('body'));
          $(document).one('mouseup mouseout touchend', function() {
            var _ref;
            if ((_ref = _this.$sizeIndicator) != null) {
              _ref.remove();
            }
            return _this.$sizeIndicator = null;
          });
        }
        if ((_ref = this.$sizeIndicator) != null) {
          _ref.attr('width', size);
        }
        if ((_ref1 = this.$sizeIndicator) != null) {
          _ref1.css({
            'left': "" + feedback.x + "px",
            'top': "" + feedback.y + "px",
            'margin-top': -this.$sizeIndicator.height() / 2
          });
        }
      }
      return this.setBrushImageSize(size);
    };

    SlothDrawin.prototype.slothMe = function() {
      return "sloth";
    };

    return SlothDrawin;

  })();

}).call(this);
