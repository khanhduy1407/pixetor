(function () {
  var ns = $.namespace('pxtr.tools.transform');

  ns.Crop = function () {
    this.toolId = 'tool-crop';
    this.helpText = 'Crop the sprite';
    this.tooltipDescriptors = [
      {
        description : 'Crop to fit the content or the selection. ' +
                      'Applies to all frames and layers!'
      }
    ];
  };

  // This transform tool is the only one that adapts to the current selection and can't
  // rely on the default AbstractTransformTool behavior.
  pxtr.utils.inherit(ns.Crop, pxtr.tools.Tool);

  ns.Crop.prototype.applyTransformation = function (evt) {
    var frames = this.getFrames_();

    var boundaries;
    if (pxtr.app.selectionManager.currentSelection) {
      // If we have a selection, we will compute the boundaries of the selection instead
      // of looping on the frames.
      boundaries = this.getBoundariesForSelection_();
    } else {
      boundaries = pxtr.tools.transform.TransformUtils.getBoundaries(frames);
    }

    var applied = this.applyTool_(frames, boundaries);
    if (applied) {
      this.raiseSaveStateEvent({
        boundaries : boundaries
      });
    }
  };

  ns.Crop.prototype.replay = function (frame, replayData) {
    var frames = this.getFrames_();
    this.applyTool_(frames, replayData.boundaries);
  };

  ns.Crop.prototype.applyTool_ = function (frames, boundaries) {
    if (boundaries.minx >= boundaries.maxx) {
      return false;
    }

    var currentPixetor = pxtr.app.pixetorController.getPixetor();
    var width = 1 + boundaries.maxx - boundaries.minx;
    var height = 1 + boundaries.maxy - boundaries.miny;

    if (width === currentPixetor.getWidth() && height === currentPixetor.getHeight()) {
      // Do not perform an unnecessary resize if it's a noop.
      return false;
    }

    frames.forEach(function (frame) {
      pxtr.tools.transform.TransformUtils.moveFramePixels(frame, -boundaries.minx, -boundaries.miny);
    });

    var pixetor = pxtr.utils.ResizeUtils.resizePixetor(currentPixetor, {
      width :  1 + boundaries.maxx - boundaries.minx,
      height :  1 + boundaries.maxy - boundaries.miny,
      origin: 'TOP-LEFT',
      resizeContent: false
    });

    // Clear the current selection.
    $.publish(Events.SELECTION_DISMISSED);

    // Replace the current pixetor with the resized version.
    pxtr.app.pixetorController.setPixetor(pixetor, {
      preserveState: true,
      // Saving is already handled by recording the transform tool action, no need for
      // an expensive snapshot.
      noSnapshot: true
    });

    return true;
  };

  /**
   * Retrieve the list of frames for the current pixetor in a single flat array.
   */
  ns.Crop.prototype.getFrames_ = function () {
    var currentPixetor = pxtr.app.pixetorController.getPixetor();

    // Get all frames in a single array.
    var frames = currentPixetor.getLayers().map(function (l) {
      return l.getFrames();
    }).reduce(function (p, n) {
      return p.concat(n);
    });

    return frames;
  };

  /**
   * Retrieve a boundaries object {minx, maxx, miny, maxy} for the current selection.
   */
  ns.Crop.prototype.getBoundariesForSelection_ = function () {
    var selectionManager = pxtr.app.selectionManager;
    var pixels = selectionManager.currentSelection.pixels;

    // Fetch the first frame to perform out-of-bound checks.
    var currentPixetor = pxtr.app.pixetorController.getPixetor();
    var exampleFrame = currentPixetor.getLayerAt(0).getFrameAt(0);

    // Anything different from Constants.TRANSPARENT_COLOR toInt().
    var FAKE_COLOR = 1;
    // Create a fake frame reimplementing the forEachPixel API.
    var selectionFrame = {
      forEachPixel : function (callback) {
        for (var i = 0; i < pixels.length ; i++) {
          var pixel = pixels[i];
          // Selections might contain out of bound pixels, filter those out.
          if (exampleFrame.containsPixel(pixel.col, pixel.row)) {
            callback(FAKE_COLOR, pixel.col, pixel.row);
          }
        }
      }
    };

    return pxtr.tools.transform.TransformUtils.getBoundaries([selectionFrame]);
  };
})();
