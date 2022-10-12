/* @file Image and Animation import service supporting the import dialog. */
(function () {
  var ns = $.namespace('pxtr.service');
  /**
   * Image an animation import service supporting the import dialog.
   * @param {!PixetorController} pixetorController
   * @constructor
   */
  ns.ImportService = function (pixetorController) {
    this.pixetorController_ = pixetorController;
  };

  ns.ImportService.prototype.init = function () {
    $.subscribe(Events.PIXETOR_FILE_IMPORT_FAILED, this.onPixetorFileImportFailed_);
  };

  /**
   * Called when a pixetor load failed event is published. Display an appropriate error message.
   * TODO: for some failure reasons, we might want to display a dialog with more details.
   */
  ns.ImportService.prototype.onPixetorFileImportFailed_ = function (evt, reason) {
    $.publish(Events.SHOW_NOTIFICATION, [{
      'content': 'Pixetor file import failed (' + reason + ')',
      'hideDelay' : 10000
    }]);
  };

  /**
   * Given an image object and some options, create a new Pixetor and open it
   * for editing.
   * @param {Image} image
   * @param {Object} options
   *        - {String}  importType 'single' if not spritesheet
   *        - {String}  name
   *        - {Boolean} smoothing
   *        - {Number}  frameSizeX
   *        - {Number}  frameSizeY
   *        - {Number}  frameOffsetX (only used in spritesheet imports)
   *        - {Number}  frameOffsetY (only used in spritesheet imports)
   * @param {Function} onComplete
   *        Callback called when the new pixetor has been created, with the new pixetor
   *        as single argument.
   */
  ns.ImportService.prototype.newPixetorFromImage = function (image, options, onComplete) {
    onComplete = onComplete || Constants.EMPTY_FUNCTION;
    var importType = options.importType;
    var name = options.name;
    var smoothing = options.smoothing;
    var frameSizeX = options.frameSizeX;
    var frameSizeY = options.frameSizeY;
    var frameOffsetX = options.frameOffsetX;
    var frameOffsetY = options.frameOffsetY;

    var gifLoader = new window.SuperGif({
      gif: image
    });

    gifLoader.load({
      success: function () {
        var images = gifLoader.getFrames().map(function (frame) {
          return pxtr.utils.CanvasUtils.createFromImageData(frame.data);
        });

        var pixetor;
        if (importType === 'single' || images.length > 1) {
          // Single image import or animated gif
          pixetor = this.createPixetorFromImages_(images, name, frameSizeX, frameSizeY, smoothing);
        } else {
          // Spritesheet
          var frameImages = this.createImagesFromSheet_(images[0], frameSizeX, frameSizeY, frameOffsetX, frameOffsetY);
          pixetor = this.createPixetorFromImages_(frameImages, name, frameSizeX, frameSizeY, smoothing);
        }
        onComplete(pixetor);
      }.bind(this),
      error: function () {
        var pixetor;
        if (importType === 'single') {
          // Single image
          pixetor = this.createPixetorFromImages_([image], name, frameSizeX, frameSizeY, smoothing);
        } else {
          // Spritesheet
          var frameImages = this.createImagesFromSheet_(image, frameSizeX, frameSizeY, frameOffsetX, frameOffsetY);
          pixetor = this.createPixetorFromImages_(frameImages, name, frameSizeX, frameSizeY, smoothing);
        }
        onComplete(pixetor);
      }.bind(this)
    });
  };

  /**
   * @param {!Image} image
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!number} frameOffsetX
   * @param {!number} frameOffsetY
   * @returns {canvas[]}
   * @private
   */
  ns.ImportService.prototype.createImagesFromSheet_ = function (image,
    frameSizeX, frameSizeY, frameOffsetX, frameOffsetY) {
    return pxtr.utils.CanvasUtils.createFramesFromImage(
      image,
      frameOffsetX,
      frameOffsetY,
      frameSizeX,
      frameSizeY,
      /*useHorizonalStrips=*/ true,
      /*ignoreEmptyFrames=*/ true);
  };

  /**
   * @param {canvas[]} images
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!boolean} smoothing
   * @private
   */
  ns.ImportService.prototype.createPixetorFromImages_ = function (images, name,
    frameSizeX, frameSizeY, smoothing) {
    name = name || 'Imported pixetor';
    var frames = this.createFramesFromImages_(images, frameSizeX, frameSizeY, smoothing);
    var layer = pxtr.model.Layer.fromFrames('Layer 1', frames);
    var descriptor = new pxtr.model.pixetor.Descriptor(name, '');
    return pxtr.model.Pixetor.fromLayers([layer], Constants.DEFAULT.FPS, descriptor);
  };

  /**
   * @param {!canvas[]} images
   * @param {!number} frameSizeX
   * @param {!number} frameSizeY
   * @param {!boolean} smoothing
   * @returns {pxtr.model.Frame[]}
   * @private
   */
  ns.ImportService.prototype.createFramesFromImages_ = function (images, frameSizeX, frameSizeY, smoothing) {
    return images.map(function (image) {
      var resizedImage = pxtr.utils.ImageResizer.resize(image, frameSizeX, frameSizeY, smoothing);
      return pxtr.utils.FrameUtils.createFromImage(resizedImage);
    });
  };
})();
