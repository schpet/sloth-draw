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
$(document).on 'selectstart dragstart', false

$('.file-chooser').on 'mousedown', (e)->
  e.stopPropagation()

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

# http://stackoverflow.com/a/11583627/692224
handleFileSelect = (evt) ->
  files = evt.target.files # FileList object

  # Loop through the FileList and render image files as thumbnails.
  i = 0
  f = undefined

  while f = files[i]

    # Only process image files.
    continue  unless f.type.match("image.*")
    reader = new FileReader()

    # Closure to capture the file information.
    reader.onload = ((theFile) ->
      (e) ->
        $img = $("<img src=\"#{e.target.result}\" />")
        $img.on 'mousedown', ->
          event.preventDefault()
          false

        $('#image').html($img)

        localStorage.setItem "img", e.target.result
    )(f)

    # Read in the image file as a data URL.
    reader.readAsDataURL f
    i++

$(document).on 'change', handleFileSelect

