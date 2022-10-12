(function () {
  var ns = $.namespace('pxtr.service.performance');

  /**
   * We consider that pixetor should behave correctly for a sprite with the following specs:
   * - 256*256
   * - 30 frames
   * - 5 layers
   * - 30 colors
   * Based on these assumptions, as well as a few arbitrary hard limits we try to check
   * if the provided sprite might present a performance issue.
   *
   * @param {Pixetor} pixetor the sprite to analyze
   * @param {Number} colorsCount number of colors for the current sprite
   *        (not part of the pixetor model so has to be provided separately).
   */
  ns.PerformanceReport = function (pixetor, colorsCount) {
    var pixels = pixetor.getWidth() * pixetor.getHeight();
    this.resolution = pixels > (512 * 512);

    var layersCount = pixetor.getLayers().length;
    this.layers = layersCount > 25;

    var framesCount = pixetor.getLayerAt(0).size();
    this.frames = framesCount > 100;

    this.colors = colorsCount >= 256;

    var overallScore = (pixels / 2620) + (layersCount * 4) + framesCount + (colorsCount * 100 / 256);
    this.overall = overallScore > 200;
  };

  ns.PerformanceReport.prototype.equals = function (report) {
    return (report instanceof ns.PerformanceReport &&
      this.resolution == report.resolution &&
      this.layers == report.layers &&
      this.frames == report.frames &&
      this.colors == report.colors &&
      this.overall == report.overall);
  };

  ns.PerformanceReport.prototype.hasProblem = function () {
    return this.resolution || this.layers || this.frames || this.colors || this.overall;
  };
})();
