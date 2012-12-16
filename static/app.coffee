slothdrawin = ->
  dragging = false
  prev = { x: -100, y: -100 }
  slothcount = 0

  sloth = new Image()
  imageLoaded = false

  # set up canvas
  canvas = document.getElementById('sloth-board')
  $canvas = $(canvas)
  offset = $canvas.offset()

  canvas.width = $(window).width() - $('#tools').width()
  canvas.height = $(window).height()
  ctx = canvas.getContext '2d'

  # set up bg canvas
  bgCanvas = document.getElementById 'bg-canvas'
  bgCanvas.width = canvas.width
  bgCanvas.height = canvas.height
  bgCtx = bgCanvas.getContext '2d'

  sloth.onload = ->
    imageLoaded = true

  sloth.src = 'static/img/slothpal.png'

  drawSloth = (e) ->
    return unless imageLoaded
    x = e.pageX - offset.left
    y = e.pageY - offset.top

    slothsetX = -22
    slothsetY = -22

    threshhold =  16
    if e.type == 'mousemove' and Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold
      return

    ctx.globalCompositeOperation = "source-over"
    ctx.drawImage(sloth, x + slothsetX, y + slothsetY)

    prev.x = x
    prev.y = y
    slothcount++
    console.log slothcount

  erase = (e)->
    x = e.pageX - offset.left
    y = e.pageY - offset.top
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


  drawAction = null

  $('#sloth-board').on 'mousedown', (e)->
    if e.which > 1
      return

    dragging = true
    drawAction(e)

  $('#sloth-board').on 'mouseup mouseout', (e)->
    dragging = false

  $('#sloth-board').on 'mousemove', (e)->
    if !dragging
      return

    drawAction(e)

  activateButton = ($b)->
    $(".active").removeClass 'active'
    $b.addClass 'active'

  slothMode = ->
    $('#sloth-board').removeClass('erase')
    $('#sloth').addClass('active')
    activateButton($('#sloth'))
    drawAction = drawSloth

  eraseMode = ->
    $('#sloth-board').addClass('erase')
    activateButton($('#eraser'))
    drawAction = erase

  slothMode()

  $('#eraser').on 'click', eraseMode
  $('#sloth').on 'click', slothMode

  # http://stackoverflow.com/questions/6388284
  $(document).on 'selectstart dragstart', (e)->
    e.preventDefault()

  ## http://stackoverflow.com/a/2931668/692224
  document.body.style.MozUserSelect="none"

  $('#save').on 'click', ->
    slothWords = prompt "Give this sloth some words (or leave it blank)"

    # handle user cancel
    if slothWords == null
      return

    if slothWords == ''
      slothWords = new Date().getTime()

    $('.uploading').each ->
      $(this).css
        left: $(window).width() / 2 - $(this).width() / 2 + 'px'
        top: $(window).height() / 2 - $(this).height() / 2 + 'px'
        display: 'block'


    output = document.createElement 'canvas'
    output.width = canvas.width
    output.height = canvas.height
    oCtx = output.getContext '2d'
    oCtx.drawImage bgCanvas, 0, 0
    oCtx.drawImage canvas, 0, 0
    mime = "image/png"
    data = output.toDataURL mime
    $.ajax
      url: '/draw'
      type: 'POST'

      data:
        'image': data
        'key_name': slothWords

      success: (response)->
        window.location.href = response.path

      error: (response)->
        $('.uploading').hide()
        if response.status == 409
          alert 'yo that url is taken :-( try saving again with a different one'
        else
          alert 'somethings fucked tell peter@peterschilling.org'

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

tryToSetup = ->
  if $(window).width() == 0 || $(window).height() == 0
    setTimeout(tryToSetup, 20)
    return

  slothdrawin()

$(window).load tryToSetup
