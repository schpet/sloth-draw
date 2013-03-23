describe "SlothDraw", ->

  beforeEach ->
    @sd = new SlothDrawin()

  it "should give me a sloth", ->
    expect(@sd.slothMe()).toEqual 'sloth'

  it "should interpolate my numbers", ->
    expect(@sd.interpolateNumbers(0, 4, 5)).toEqual [0, 1, 2, 3, 4]
    expect(@sd.interpolateNumbers(1, 5, 5)).toEqual [1, 2, 3, 4, 5]
    expect(@sd.interpolateNumbers(1, 9, 5)).toEqual [1, 3, 5, 7, 9]

    expect(@sd.interpolateNumbers(0, 1, 2)).toEqual [0, 1]
    expect(@sd.interpolateNumbers(1, 1, 2)).toEqual [1, 1]

    expect(@sd.interpolateNumbers(1, 1, 1)).toEqual [1]
    expect(@sd.interpolateNumbers(1, 3, 1)).toEqual [2]
    expect(@sd.interpolateNumbers(1, 9, 0)).toEqual []

  it "should interpolate my points", ->
    interpolated = @sd.interpolatePoints(0, 0, 0, 4, 5)
    expected = [
      [0, 0]
      [0, 1]
      [0, 2]
      [0, 3]
      [0, 4]
    ]
    expect(interpolated).toEqual expected

    interpolated = @sd.interpolatePoints(0, 0, 2, 2, 1)
    expected = [ [1, 1] ]
    expect(interpolated).toEqual expected

    interpolated = @sd.interpolatePoints(0, 0, 1, 1, 2)
    expected = [ [0, 0], [1, 1] ]
    expect(interpolated).toEqual expected

    interpolated = @sd.interpolatePoints(0, 0, 1, 1, 0)
    expected = []
    expect(interpolated).toEqual expected

  it "should tell me the distance between two points", ->
    expect(@sd.distanceBetweenTwoPoints(0, 0, 10, 0)).toEqual 10
    expect(@sd.distanceBetweenTwoPoints(10, 0, 0, 0)).toEqual 10
    expect(@sd.distanceBetweenTwoPoints(0, 0, 0, 10)).toEqual 10
    expect(@sd.distanceBetweenTwoPoints(0, 10, 0, 0)).toEqual 10
    expect(@sd.distanceBetweenTwoPoints(0, 0, -10, 0)).toEqual 10
    expect(Math.round(@sd.distanceBetweenTwoPoints(3, 2, 5, -1))).toEqual 4
