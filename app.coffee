$(document).ready ->

  dragging = false
  prev = { x: -100, y: -100 }

  sloth = new Image()
  imageLoaded = false

  # set up canvas
  canvas = document.getElementById('sloth-board')
  $canvas = $(canvas)
  offset = $canvas.offset()
  borderSize = parseInt($canvas.css("border-left-width"))

  canvas.width = $(document).width() - $('#tools').width() - borderSize * 2
  canvas.height = $(document).height() - $('#tools').height() - borderSize * 2
  ctx = canvas.getContext '2d'

  # set up bg canvas
  bgCanvas = document.getElementById 'bg-canvas'
  bgCanvas.width = canvas.width
  bgCanvas.height = canvas.height
  bgCtx = bgCanvas.getContext '2d'

  sloth.onload = ->
    imageLoaded = true

  sloth.src = 'img/slothpal.png'

  drawSloth = (e) ->
    return unless imageLoaded
    x = e.pageX - offset.left - borderSize
    y = e.pageY - offset.top - borderSize

    threshhold =  16
    if Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold
      return

    ctx.globalCompositeOperation = "source-over"
    ctx.drawImage(sloth, x, y)

    prev.x = x
    prev.y = y

  erase = (e)->
    x = e.pageX - offset.left - borderSize
    y = e.pageY - offset.top - borderSize
    radius = 20
    ctx.globalCompositeOperation = "destination-out"
    ctx.strokeStyle = "rgba(0,0,0,1)"
    ctx.beginPath()
    ctx.arc(x + radius, y + radius, radius, 0 , 2 * Math.PI, false)
    ctx.closePath()
    ctx.fill()

  reset = ->
    ctx.clearRect(0,0, canvas.width, canvas.height)
    bgCtx.clearRect(0, 0, canvas.width, canvas.height)

  $('#reset').on 'click', reset


  drawAction = drawSloth

  $(document).on 'mousedown', (e)->
    dragging = true
    drawAction(e)

  $(document).on 'mouseup mouseexit', (e)->
    dragging = false

  $(document).on 'mousemove', (e)->
    if !dragging
      return

    drawAction(e)

  slothMode = ->
    $('#sloth-board').removeClass('erase')
    drawAction = drawSloth

  eraseMode = ->
    $('#sloth-board').addClass('erase')
    drawAction = erase

  $('#eraser').on 'click', eraseMode
  $('#sloth').on 'click', slothMode

  # http://stackoverflow.com/questions/6388284
  $(document).on 'selectstart dragstart', (e)->
    e.preventDefault()

  ## http://stackoverflow.com/a/2931668/692224
  document.body.style.MozUserSelect="none"

  #$('.js-save').on 'click', ->
    #coords = []
    #$('.sloth').each ->
      #pos = $(this).position()
      #coords.push
        #x: pos.left
        #y: pos.top

    #debugger

  $('#save').on 'click', ->
    output = document.createElement 'canvas'
    output.width = canvas.width
    output.height = canvas.height
    oCtx = output.getContext '2d'
    oCtx.drawImage bgCanvas, 0, 0
    oCtx.drawImage canvas, 0, 0
    mime = "image/png"
    data = output.toDataURL mime
    window.open(data, 'sloth.png')

  ## http://stackoverflow.com/a/11583627/692224
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
          img = new Image()
          img.onload = ->


            w = img.width
            h = img.height
            r = w / h

            if img.width > canvas.width
              w = canvas.width
              h = w / r

            if img.height > canvas.height
              h = canvas.height
              w = h * r

            gapX = canvas.width - w
            gapY = canvas.height - h

            reset()
            bgCtx.drawImage(img, gapX / 2, gapY / 2, w, h)

          img.src = e.target.result
      )(f)

      reader.readAsDataURL f
      i++

  $(document).on 'change', handleFileSelect

