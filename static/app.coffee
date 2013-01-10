slothdrawin = ->
  touchDevice = 'ontouchstart' of document.documentElement
  clickEvent = if touchDevice then 'touchstart' else 'click'
  dragging = false
  prev = { x: -100, y: -100 }
  cursorPositions = [{ x: 0, y: 0 }]
  slothCount = 0
  brushSize = 0
  states =
    SLOTHING: 0
    MOONRASING: 1
  state = states.SLOTHING

  $sizeIndicator = null


  sloth = new Image()
  imageLoaded = false

  # set up canvas
  canvas = document.getElementById 'sloth-board'
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

  drawSlothEvent = (e) ->
    return unless imageLoaded

    for point in cursorPositions
      x = point.x - offset.left
      y = point.y - offset.top
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
    slothCount++

  eraseEvent = (e) ->
    for point in cursorPositions
      x = point.x - offset.left
      y = point.y - offset.top
      erase x, y

  erase = (x, y) ->
    diameter = Math.min brushSize, 128
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

  #$('#sloth-board').on 'mousemove touchmove', (e)->
  setInterval (->
    if !dragging
      return

    drawAction()
  ), 40

  $(document).on 'mousemove touchmove', (e)->
    switch e.type
      when 'mousemove', 'mousedown'
        cursorPositions = [
          { x: e.pageX, y: e.pageY}
        ]
      when 'touchmove', 'touchstart'
        e.preventDefault()
        cursorPositions = []
        for touch in e.originalEvent.touches
          cursorPositions.push
            x: touch.pageX
            y: touch.pageY

  activateButton = ($b)->
    $(".active").removeClass 'active'
    $b.addClass 'active'

  slothMode = ->
    state = states.SLOTHING
    $('#sloth-board')
      .removeClass('erase')
      .css('cursor', '')
    $('#sloth').addClass('active')
    activateButton($('#sloth'))
    drawAction = drawSlothEvent

  setMoonCursor = ->
    moonSize = Math.min brushSize, 128
    hMoonSize = Math.round(moonSize / 2)
    $('#sloth-board')
      .css('cursor', "url('static/img/scaled/moonraser_#{moonSize}.png') #{hMoonSize} #{hMoonSize}, auto")

  eraseMode = ->
    $('#sloth-board')
      .addClass('erase')

    state = states.MOONRASING
    setMoonCursor()

    activateButton($('#eraser'))
    drawAction = eraseEvent

  slothMode()

  $('#eraser').on clickEvent, eraseMode
  $('#sloth').on clickEvent, slothMode
  $('#reset').on clickEvent, reset

  brushTimeout = null
  $('#brush-size').on 'change', ->
    size = parseInt $(this).val()
    setBrushSize size, { x: 69, y: cursorPositions[0].y }

  setBrushSize = (size, feedback = null, updateRange = false)->

    if brushTimeout?
      clearTimeout brushTimeout
      brushTimeout = null

    $('#brush-size').val(size) if updateRange

    if feedback?
      if !$sizeIndicator?
        # consider using slothpal big one
        # this could be in the dom i guess w/e
        $sizeIndicator = $("<img src='/static/img/scaled/slothpal_260.png' class='size-indicator' />").appendTo($('body'))
        $(document).one 'mouseup mouseout touchend', ->
          $sizeIndicator?.remove()
          $sizeIndicator = null

      $sizeIndicator?.attr 'width', size
      $sizeIndicator?.css
        'left': "#{feedback.x}px"
        'top': "#{feedback.y}px"
        'margin-top': - $sizeIndicator.height() / 2

    brushTimeout = setTimeout (->
      setBrushImageSize(size)
    ), 200

  setBrushSize 50, null, true

  jump = 20

  $('.js-big').on clickEvent, ->
    setBrushSize brushSize + jump, null, true

  $('.js-small').on clickEvent, ->
    setBrushSize brushSize - jump, null, true

  setBrushImageSize = (size)->
    size = Math.min size, 260
    size = Math.max size, 1
    brushSize = parseInt size

    sloth.src = "static/img/scaled/slothpal_#{brushSize}.png"
    if $('#sloth-board').hasClass 'erase'
      setMoonCursor()


  $("body").on 'mousewheel DOMMouseScroll', (e)->

    if e.type == 'mousewheel'
      delta = e.originalEvent.wheelDelta
    else
      delta = e.originalEvent.detail * 5
      #console.log  e.originalEvent.detail

    downscaled = delta / 5

    if Math.abs(downscaled) > 1
      delta = downscaled

    setBrushImageSize(brushSize + delta )
    if state == states.SLOTHING
      setBrushSize brushSize, { x: cursorPositions[0].x - brushSize / 2, y: cursorPositions[0].y }, true
    else
      setBrushSize brushSize, null, true

    if @hideSizeIndicator?
      clearTimeout @hideSizeIndicator
      @hideSizeIndicator = null

    @hideSizeIndicator = setTimeout (->
      $sizeIndicator?.remove()
      $sizeIndicator = null
    ), 500

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

    _gaq.push ['_trackEvent', 'saved', 'sloth count', slothWords, slothCount]

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
  $('#files').on 'change', (evt)->
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


  $('.help-layover').show()

  # hide range slider if it's not supported by the browser
  if document.getElementById('brush-size').type != 'range'
    $('.brush-size-container').addClass 'unsupported'

  setTimeout (->
    $('.protip').css 'top', '-500px'
  ), 4000

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


