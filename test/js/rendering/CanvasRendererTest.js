describe("Canvas Renderer test", function() {
  var BLACK = '#000000';
  var WHITE = '#ffffff';
  var TRANS = Constants.TRANSPARENT_COLOR;

  beforeEach(function() {});
  afterEach(function() {});

  it("draws transparent as white by default", function() {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(test.testutils.toFrameGrid([
      [BLACK, TRANS],
      [TRANS, BLACK]
    ]));

    var renderer = new pxtr.rendering.CanvasRenderer(frame, 1);
    var canvas = renderer.render();

    var frameFromCanvas = pxtr.utils.FrameUtils.createFromImage(canvas);

    test.testutils.colorEqualsColor(frameFromCanvas.getPixel(0,0), BLACK);
    test.testutils.colorEqualsColor(frameFromCanvas.getPixel(0,1), WHITE);
    test.testutils.colorEqualsColor(frameFromCanvas.getPixel(1,0), WHITE);
    test.testutils.colorEqualsColor(frameFromCanvas.getPixel(1,1), BLACK);
  });
});