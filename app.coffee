dragging = false
prev = { x: -100, y: -100 }

$canvas = $('#sloth-board')

drawSloth = (e) ->
  x = e.pageX
  y = e.pageY

  threshhold =  16
  if Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold
    return

  $canvas.append()

  $('<div class="sloth" />')
    .css('left': "#{x}px", 'top': "#{y}px")
    .appendTo($canvas)

  prev.x = x
  prev.y = y

$(document).on 'mousedown', (e)->
  dragging = true
  drawSloth(e)

$(document).on 'mouseup mouseexit', (e)->
  dragging = false

# http://stackoverflow.com/questions/6388284
$(document).on 'selectstart', false

$(document).on 'mousemove', (e)->
  if !dragging
    return

  drawSloth(e)



$('.js-save').on 'click', ->
  coords = []
  $('.sloth').each ->
    pos = $(this).position()
    coords.push
      x: pos.left
      y: pos.top

  debugger

