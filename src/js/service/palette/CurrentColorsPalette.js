(function () {
  var ns = $.namespace('pxtr.service.palette');

  ns.CurrentColorsPalette = function () {
    this.name = 'Current colors';
    this.id = Constants.CURRENT_COLORS_PALETTE_ID;
    this.colorSorter = new pxtr.service.color.ColorSorter();
  };

  ns.CurrentColorsPalette.prototype.getColors = function () {
    var currentColors = pxtr.app.currentColorsService.getCurrentColors();
    currentColors = currentColors.slice(0, Constants.MAX_PALETTE_COLORS);
    return this.colorSorter.sort(currentColors);
  };
})();
