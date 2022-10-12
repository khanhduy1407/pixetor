describe("FrameUtils suite", function() {
  var black = '#000000';
  var red = '#ff0000';
  var transparent = Constants.TRANSPARENT_COLOR;

  // shortcuts
  var toFrameGrid = test.testutils.toFrameGrid;
  var frameEqualsGrid = test.testutils.frameEqualsGrid;

  it("merges 2 frames", function () {
    var B = black, R = red, T = transparent;
    var frame1 = pxtr.model.Frame.fromPixelGrid([
      [B, T],
      [T, B]
    ]);

    var frame2 = pxtr.model.Frame.fromPixelGrid([
      [T, R],
      [R, T]
    ]);

    var mergedFrame = pxtr.utils.FrameUtils.merge([frame1, frame2]);
    frameEqualsGrid(mergedFrame, [
      [B, R],
      [R, B]
    ]);
  });

  it("returns same frame when merging single frame", function () {
    var B = black, T = transparent;
    var frame1 = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [B, T],
      [B, T]
    ]));

    var mergedFrame = pxtr.utils.FrameUtils.merge([frame1]);
    frameEqualsGrid(mergedFrame, [
      [B, T],
      [B, T]
    ]);
  });

  var checkPixelsColor = function (frame, pixels, color) {
    pixels.forEach(function (pixel) {
      var pixelColor = frame.getPixel(pixel[0], pixel[1]);
      expect(pixelColor).toBe(color);
    });
  };

  it ("converts an image to a frame", function () {
    var B = black, T = transparent;
    var frame1 = pxtr.model.Frame.fromPixelGrid([
      [B, T],
      [T, B]
    ]);

    var image = pxtr.utils.FrameUtils.toImage(frame1);
    expect(image.width).toBe(2);
    expect(image.height).toBe(2);

    var biggerImage = pxtr.utils.FrameUtils.toImage(frame1, 3);
    expect(biggerImage.width).toBe(6);
    expect(biggerImage.height).toBe(6);

    var biggerFrame = pxtr.utils.FrameUtils.createFromImage(biggerImage);

    frameEqualsGrid(biggerFrame, [
      [B, B, B, T, T, T],
      [B, B, B, T, T, T],
      [B, B, B, T, T, T],
      [T, T, T, B, B, B],
      [T, T, T, B, B, B],
      [T, T, T, B, B, B]
    ]);
  });

  it ("[LayerUtils] creates frames from a simple spritesheet", function () {
    var B = black, R = red;

    // original image in 4x2
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [B, R, B, R],
      [R, B, B, R]
    ]));

    var spritesheet = pxtr.utils.FrameUtils.toImage(frame);

    // split the spritesheet by 4
    var frames = pxtr.utils.FrameUtils.createFramesFromSpritesheet(spritesheet, 4);

    // expect 4 frames of 1x2
    expect(frames.length).toBe(4);

    // verify frame content
    frameEqualsGrid(frames[0], [
      [B],
      [R]
    ]);
    frameEqualsGrid(frames[1], [
      [R],
      [B]
    ]);
    frameEqualsGrid(frames[2], [
      [B],
      [B]
    ]);
    frameEqualsGrid(frames[3], [
      [R],
      [R]
    ]);
  });

  it ("supports null values in frame array", function () {
    var B = black, T = transparent;
    var frame = pxtr.model.Frame.fromPixelGrid([
      [B, null],
      [null, B]
    ]);

    var image = pxtr.utils.FrameUtils.toImage(frame);

    // transform back to frame for ease of testing
    var testFrame = pxtr.utils.FrameUtils.createFromImage(image);
    frameEqualsGrid(testFrame, [
      [B, T],
      [T, B]
    ]);
  });
});