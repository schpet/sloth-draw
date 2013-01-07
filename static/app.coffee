slothdrawin = ->
  touchDevice = 'ontouchstart' of document.documentElement
  clickEvent = if touchDevice then 'touchstart' else 'click'
  dragging = false
  prev = { x: -100, y: -100 }
  slothcount = 0

  sloth = new Image()
  imageLoaded = false

  # set up canvas
  canvas = document.getElementById('sloth-board')
  $canvas = $(canvas)
  offset = $canvas.offset()

  canvas.width = $(window).width() - $('#tools').width() - 1 # border!!
  canvas.height = $(window).height()
  ctx = canvas.getContext '2d'

  # set up bg canvas
  bgCanvas = document.getElementById 'bg-canvas'
  bgCanvas.width = canvas.width
  bgCanvas.height = canvas.height
  bgCtx = bgCanvas.getContext '2d'

  sloth.onload = ->
    imageLoaded = true

  size = $('#brush-size').val()
  sloth.src = "static/img/scaled/slothpal_#{size}.png"

  drawSlothEvent = (e) ->
    return unless imageLoaded

    threshhold = sloth.width / 3 # maybe an adjustment for this
    switch e.type
      when 'mousemove', 'mousedown'
        x = e.pageX - offset.left
        y = e.pageY - offset.top

        if e.type == 'mousemove' and Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold
          return

        drawSloth x, y

      when 'touchmove', 'touchstart'
        e.preventDefault()
        for touch in e.originalEvent.touches
          x = touch.pageX - offset.left
          y = touch.pageY - offset.top
          if Math.abs(x - prev.x) < threshhold && Math.abs(y - prev.y) < threshhold
            return

          drawSloth x, y

  drawSloth = (x, y) ->
    w = sloth.width
    h = sloth.height

    slothsetX = -w / 2
    slothsetY = -h / 2

    ctx.globalCompositeOperation = "source-over"
    ctx.drawImage(sloth, x + slothsetX, y + slothsetY, w, h)

    prev.x = x
    prev.y = y
    slothcount++
    console.log slothcount

  eraseEvent = (e) ->
    switch e.type
      when 'mousemove', 'mousedown'
        x = e.pageX - offset.left
        y = e.pageY - offset.top
        erase x, y
      when 'touchmove', 'touchstart'
        e.preventDefault()
        for touch in e.originalEvent.touches
          x = touch.pageX - offset.left - 20
          y = touch.pageY - offset.top - 20
          erase x, y

  erase = (x, y) ->
    diameter = Math.min size, 128
    radius = diameter / 2
    ctx.globalCompositeOperation = "destination-out"
    ctx.strokeStyle = "rgba(0,0,0,1)"
    ctx.beginPath()
    ctx.arc(x, y, radius, 0 , 2 * Math.PI, false)
    ctx.closePath()
    ctx.fill()

  reset = ->
    yousure = confirm 'you sure you want to get rid of this one?'
    if yousure
      ctx.clearRect(0,0, canvas.width, canvas.height)
      bgCtx.clearRect(0, 0, canvas.width, canvas.height)

  drawAction = null

  $('#sloth-board').on 'mousedown touchstart', (e)->
    if e.which > 1
      return

    dragging = true
    drawAction(e)

  $('#sloth-board').on 'mouseup mouseout touchend', (e)->
    dragging = false

  $('#sloth-board').on 'mousemove touchmove', (e)->
    if !dragging
      return

    drawAction(e)

  activateButton = ($b)->
    $(".active").removeClass 'active'
    $b.addClass 'active'

  slothMode = ->
    $('#sloth-board')
      .removeClass('erase')
      .css('cursor', '')
    $('#sloth').addClass('active')
    activateButton($('#sloth'))
    drawAction = drawSlothEvent

  setMoonCursor = ->
    moonSize = Math.min size, 128
    hMoonSize = Math.round(moonSize / 2)
    $('#sloth-board')
      .css('cursor', "url('static/img/scaled/moonraser_#{moonSize}.png') #{hMoonSize} #{hMoonSize}, auto")

  eraseMode = ->
    $('#sloth-board')
      .addClass('erase')

    setMoonCursor()

    activateButton($('#eraser'))
    drawAction = eraseEvent

  slothMode()

  $('#eraser').on clickEvent, eraseMode
  $('#sloth').on clickEvent, slothMode
  $('#reset').on clickEvent, reset

  $('#brush-size').on 'change', ->
    size = $(this).val()
    size = Math.min size, 260
    size = Math.max size, 1
    sloth.src = "static/img/scaled/slothpal_#{size}.png"
    if $('#sloth-board').hasClass 'erase'
      setMoonCursor()

  # http://stackoverflow.com/questions/6388284
  $(document).on 'selectstart dragstart', (e)->
    e.preventDefault()

  ## http://stackoverflow.com/a/2931668/692224
  document.body.style.MozUserSelect="none"

  $('#save').on clickEvent, (e)->
    e.preventDefault()
    e.stopPropagation()

    slothWords = prompt "Give this sloth some words (or leave it blank)"

    # handle user cancel
    if slothWords == null
      return

    slothWords = new Date().getTime() if slothWords == ''

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
        if response.path?
          window.location.href = response.path
        else
          $('.uploading').hide()
          _gaq?.push ['_trackEvent', 'error', 'failed upload', JSON.stringify(response)]
          console.log response
          window.alert "oh dang sorry this failed to upload sloth draw is REALLY sorry! the image is probably too big or some other bad thing happened"

      error: (response)->
        $('.uploading').hide()
        if response.status == 409
          _gaq?.push ['_trackEvent', 'error', 'url taken', slothWords]
          alert 'yo that url is taken :-( try saving again with a different one'
        else
          _gaq?.push ['_trackEvent', 'error', 'weird response', response.status]
          alert 'somethings fucked tell peter@peterschilling.org'

  $('#help').on 'mouseenter', ->
    $('.help-layover').addClass('visible')
    $('#canvas-container').addClass('dimmed')

  $('#help').on 'mouseleave', ->
    $('.help-layover').removeClass('visible')
    $('#canvas-container').removeClass('dimmed')

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
          # TODO figure out if it's over 2MB and reject it or
          # figure out how to make it not fuckup on the server
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

            bgCtx.drawImage(img, gapX / 2, gapY / 2, w, h)

          img.src = e.target.result
      )(f)

      reader.readAsDataURL f
      i++

  $('#files').on 'change', handleFileSelect

  $('.help-layover').show()

  if document.getElementById('brush-size').type != 'range'
    $('#brush-size').hide()

  $.fn.tipsy.elementOptions = (ele, options) ->
    #return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    $.extend {}, options, {gravity: $(ele).attr('data-tipsy-gravity') || 'n' }

  $('.js-tipsy').tipsy() unless touchDevice

tryToSetup = ->
  # weird bug when opening tab from facebook and it would
  # have a zero height and width
  if $(window).width() == 0 || $(window).height() == 0
    setTimeout(tryToSetup, 20)
    return

  slothdrawin()

$(window).load tryToSetup


