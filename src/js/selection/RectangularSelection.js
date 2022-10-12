(function () {
  var ns = $.namespace('pxtr.selection');

  ns.RectangularSelection = function (x0, y0, x1, y1) {
    this.pixels = pxtr.PixelUtils.getRectanglePixels(x0, y0, x1, y1);
  };

  pxtr.utils.inherit(ns.RectangularSelection, ns.BaseSelection);
})();
