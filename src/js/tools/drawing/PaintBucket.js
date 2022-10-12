/**
 * @provide pxtr.tools.drawing.PaintBucket
 *
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');

  ns.PaintBucket = function() {
    this.toolId = 'tool-paint-bucket';
    this.helpText = 'Paint bucket tool';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.PAINT_BUCKET;
  };

  pxtr.utils.inherit(ns.PaintBucket, ns.BaseTool);

  /**
   * @override
   */
  ns.PaintBucket.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    var color = this.getToolColor();
    pxtr.PixelUtils.paintSimilarConnectedPixelsFromFrame(frame, col, row, color);

    this.raiseSaveStateEvent({
      col : col,
      row : row,
      color : color
    });
  };

  ns.PaintBucket.prototype.replay = function (frame, replayData) {
    pxtr.PixelUtils.paintSimilarConnectedPixelsFromFrame(frame, replayData.col, replayData.row, replayData.color);
  };
})();
