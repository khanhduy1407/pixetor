/**
 * @provide pxtr.tools.drawing.Lighten
 *
 * @require Constants
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');
  var DEFAULT_STEP = 3;

  ns.Lighten = function() {
    this.superclass.constructor.call(this);

    this.toolId = 'tool-lighten';
    this.helpText = 'Lighten';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.LIGHTEN;

    this.tooltipDescriptors = [
      {key : 'ctrl', description : 'Darken'},
      {key : 'shift', description : 'Apply only once per pixel'}
    ];
  };

  pxtr.utils.inherit(ns.Lighten, ns.SimplePen);

  /**
   * @Override
   */
  ns.Lighten.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    this.previousCol = col;
    this.previousRow = row;

    var penSize = pxtr.app.penSizeService.getPenSize();
    var points = pxtr.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(function (point) {
      var modifiedColor = this.getModifiedColor_(point[0], point[1], frame, overlay, event);
      this.draw(modifiedColor, point[0], point[1], frame, overlay);
    }.bind(this));
  };

  ns.Lighten.prototype.getModifiedColor_ = function(col, row, frame, overlay, event) {
    // get colors in overlay and in frame
    var overlayColor = overlay.getPixel(col, row);
    var frameColor = frame.getPixel(col, row);

    var isPixelModified = overlayColor !== pxtr.utils.colorToInt(Constants.TRANSPARENT_COLOR);
    var pixelColor = isPixelModified ? overlayColor : frameColor;

    var isTransparent = pixelColor === pxtr.utils.colorToInt(Constants.TRANSPARENT_COLOR);
    if (isTransparent) {
      return Constants.TRANSPARENT_COLOR;
    }

    var oncePerPixel = event.shiftKey;
    if (oncePerPixel && isPixelModified) {
      return pixelColor;
    }

    var step = oncePerPixel ? DEFAULT_STEP * 2 : DEFAULT_STEP;
    var isDarken = pxtr.utils.UserAgent.isMac ?  event.metaKey : event.ctrlKey;

    var color;
    if (isDarken) {
      color = window.tinycolor.darken(pxtr.utils.intToColor(pixelColor), step);
    } else {
      color = window.tinycolor.lighten(pxtr.utils.intToColor(pixelColor), step);
    }

    // Convert tinycolor color to string format.
    return color.toHexString();
  };
})();
