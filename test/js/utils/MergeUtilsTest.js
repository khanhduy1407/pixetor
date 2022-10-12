describe("MergeUtils suite", function() {
  var B = '#000000';
  var R = '#ff0000';
  var T = Constants.TRANSPARENT_COLOR;

  var createPixetorFromGrid = function (grid, name) {
    var frame = pxtr.model.Frame.fromPixelGrid(grid);
    var layer = pxtr.model.Layer.fromFrames("l1", [frame]);
    return pxtr.model.Pixetor.fromLayers([layer], 12, {
      name: name || "pixetor",
      description: "desc"
    });
  };

  /**
   * Simple helper to create a monochrome sprite for the provided color,
   * number of rows and columns.
   */
  var getPixetor = function (color, rows, cols) {
    var grid = [];
    for (var i = 0 ; i < rows ; i++) {
      grid[i] = [];
      for (var j = 0 ; j < cols ; j++) {
        grid[i][j] = color;
      }
    }
    return createPixetorFromGrid(grid);
  };

  it("merges 2 pixetor - insertMode:add same size", function () {
    var pixetor1 = getPixetor(B, 2, 2);
    var pixetor2 = getPixetor(R, 2, 2);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "add"
    });

    expect(mergedPixetor.getWidth()).toBe(2);
    expect(mergedPixetor.getHeight()).toBe(2);
    expect(mergedPixetor.getLayers().length).toBe(2);
    expect(mergedPixetor.getLayers()[0].getFrames().length).toBe(2);
  });

  it("merges 2 pixetor - insertMode:insert same size", function () {
    var pixetor1 = getPixetor(B, 2, 2);
    var pixetor2 = getPixetor(R, 2, 2);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(2);
    expect(mergedPixetor.getHeight()).toBe(2);
    expect(mergedPixetor.getLayers().length).toBe(2);
    expect(mergedPixetor.getLayers()[0].getFrames().length).toBe(1);
  });

  it("merges 2 pixetor - resize:expand with bigger imported pixetor", function () {
    var pixetor1 = getPixetor(B, 2, 2);
    var pixetor2 = getPixetor(R, 4, 4);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(4);
    expect(mergedPixetor.getHeight()).toBe(4);
  });

  it("merges 2 pixetor - resize:keep with bigger imported pixetor", function () {
    var pixetor1 = getPixetor(B, 2, 2);
    var pixetor2 = getPixetor(R, 4, 4);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "keep",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(2);
    expect(mergedPixetor.getHeight()).toBe(2);
  });

  it("merges 2 pixetor - resize:expand with taller but thinner imported pixetor", function () {
    var pixetor1 = getPixetor(B, 2, 2);
    var pixetor2 = getPixetor(R, 1, 4);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(2);
    expect(mergedPixetor.getHeight()).toBe(4);
  });

  it("merges 2 pixetor - resize:expand with wider but shorter imported pixetor", function () {
    var pixetor1 = getPixetor(B, 2, 2);
    var pixetor2 = getPixetor(R, 4, 1);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(4);
    expect(mergedPixetor.getHeight()).toBe(2);
  });

  it("merges 2 pixetor - resize:expand with bigger original pixetor", function () {
    var pixetor1 = getPixetor(B, 3, 3);
    var pixetor2 = getPixetor(R, 1, 1);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(3);
    expect(mergedPixetor.getHeight()).toBe(3);
  });

  it("merges 2 pixetor - resize:keep with bigger original pixetor", function () {
    var pixetor1 = getPixetor(B, 3, 3);
    var pixetor2 = getPixetor(R, 1, 1);

    var mergedPixetor = pxtr.utils.MergeUtils.merge(pixetor1, pixetor2, {
      index: 0,
      resize: "keep",
      origin: "TOPLEFT",
      insertMode: "insert"
    });

    expect(mergedPixetor.getWidth()).toBe(3);
    expect(mergedPixetor.getHeight()).toBe(3);
  });
});
