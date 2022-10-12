/**
 * @provide pxtr.tools.drawing.BaseTool
 *
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');

  ns.BaseTool = function() {
    pxtr.tool.Tool.call(this);
    this.toolId = 'tool-base';
  };

  pxtr.utils.inherit(ns.BaseTool, pxtr.tools.Tool);

  ns.BaseTool.prototype.applyToolAt = function (col, row, frame, overlay, event) {};

  ns.BaseTool.prototype.moveToolAt = function (col, row, frame, overlay, event) {};

  ns.BaseTool.prototype.replay = Constants.ABSTRACT_FUNCTION;

  ns.BaseTool.prototype.supportsDynamicPenSize = function() {
    return false;
  };

  ns.BaseTool.prototype.getToolColor = function() {
    if (pxtr.app.mouseStateService.isRightButtonPressed()) {
      return pxtr.app.selectedColorsService.getSecondaryColor();
    }
    return pxtr.app.selectedColorsService.getPrimaryColor();
  };

  ns.BaseTool.prototype.moveUnactiveToolAt = function (col, row, frame, overlay, event) {
    if (overlay.containsPixel(col, row)) {
      this.updateHighlightedPixel(frame, overlay, col, row);
    } else {
      this.hideHighlightedPixel(overlay);
    }
  };

  ns.BaseTool.prototype.updateHighlightedPixel = function (frame, overlay, col, row) {
    if (!isNaN(this.highlightedPixelCol) &&
      !isNaN(this.highlightedPixelRow) &&
      (this.highlightedPixelRow != row ||
        this.highlightedPixelCol != col)) {

      // Clean the previously highlighted pixel:
      overlay.clear();
    }

    var frameColor = pxtr.utils.intToColor(frame.getPixel(col, row));
    var highlightColor = this.getHighlightColor_(frameColor);
    var size = this.supportsDynamicPenSize() ? pxtr.app.penSizeService.getPenSize() : 1;
    pxtr.PixelUtils.resizePixel(col, row, size).forEach(function (point) {
      overlay.setPixel(point[0], point[1], highlightColor);
    });

    this.highlightedPixelCol = col;
    this.highlightedPixelRow = row;
  };

  ns.BaseTool.prototype.getHighlightColor_ = function (frameColor) {
    if (!frameColor) {
      return Constants.TOOL_HIGHLIGHT_COLOR_DARK;
    }

    var luminance = window.tinycolor(frameColor).toHsl().l;
    if (luminance > 0.5) {
      return Constants.TOOL_HIGHLIGHT_COLOR_DARK;
    } else {
      return Constants.TOOL_HIGHLIGHT_COLOR_LIGHT;
    }
  };

  ns.BaseTool.prototype.hideHighlightedPixel = function (overlay) {
    if (this.highlightedPixelRow !== null && this.highlightedPixelCol !== null) {
      overlay.clear();
      this.highlightedPixelRow = null;
      this.highlightedPixelCol = null;
    }
  };

  ns.BaseTool.prototype.releaseToolAt = function (col, row, frame, overlay, event) {};

  /**
   * Does the tool support the ALT modifier. To be overridden by subclasses.
   *
   * @return {Boolean} true if the tool supports ALT.
   */
  ns.BaseTool.prototype.supportsAlt = function () {
    return false;
  };
})();
