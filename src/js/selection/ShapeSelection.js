(function () {
  var ns = $.namespace('pxtr.selection');

  ns.ShapeSelection = function (pixels) {
    this.pixels = pixels;
  };

  pxtr.utils.inherit(ns.ShapeSelection, ns.BaseSelection);
})();
