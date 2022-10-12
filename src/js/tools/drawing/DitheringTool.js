/**
 * @provide pxtr.tools.drawing.DitheringTool
 *
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');

  ns.DitheringTool = function() {
    ns.SimplePen.call(this);
    this.toolId = 'tool-dithering';
    this.helpText = 'Dithering tool';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.DITHERING;
  };

  pxtr.utils.inherit(ns.DitheringTool, ns.SimplePen);

  ns.DitheringTool.prototype.supportsDynamicPenSize = function() {
    return true;
  };

  /**
   * @override
   */
  ns.DitheringTool.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    this.previousCol = col;
    this.previousRow = row;

    var penSize = pxtr.app.penSizeService.getPenSize();
    var points = pxtr.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(function (point) {
      this.applyToolOnPixel(point[0], point[1], frame, overlay, event);
    }.bind(this));
  };

  ns.DitheringTool.prototype.applyToolOnPixel = function(col, row, frame, overlay, event) {
    var usePrimaryColor = (col + row) % 2;

    if (pxtr.app.mouseStateService.isRightButtonPressed()) {
      usePrimaryColor = !usePrimaryColor;
    }

    var ditheringColor = usePrimaryColor ?
      pxtr.app.selectedColorsService.getPrimaryColor() :
      pxtr.app.selectedColorsService.getSecondaryColor();

    this.draw(ditheringColor, col, row, frame, overlay);
  };

})();
