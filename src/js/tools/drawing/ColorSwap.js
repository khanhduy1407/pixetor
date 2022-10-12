/**
 * @provide pxtr.tools.drawing.ColorSwap
 *
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');

  ns.ColorSwap = function() {
    this.toolId = 'tool-colorswap';
    this.helpText = 'Paint all pixels of the same color';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.COLORSWAP;

    this.tooltipDescriptors = [
      {key : 'ctrl', description : 'Apply to all layers'},
      {key : 'shift', description : 'Apply to all frames'}
    ];
  };

  pxtr.utils.inherit(ns.ColorSwap, ns.BaseTool);

  /**
   * @override
   */
  ns.ColorSwap.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    if (frame.containsPixel(col, row)) {
      var oldColor = frame.getPixel(col, row);
      var newColor = this.getToolColor();

      var allLayers = pxtr.utils.UserAgent.isMac ?  event.metaKey : event.ctrlKey;
      var allFrames = event.shiftKey;
      this.swapColors_(oldColor, newColor, allLayers, allFrames);

      this.raiseSaveStateEvent({
        allLayers : allLayers,
        allFrames : allFrames,
        oldColor : oldColor,
        newColor : newColor
      });
    }
  };

  ns.ColorSwap.prototype.replay = function (frame, replayData) {
    this.swapColors_(replayData.oldColor, replayData.newColor, replayData.allLayers, replayData.allFrames);
  };

  ns.ColorSwap.prototype.swapColors_ = function(oldColor, newColor, allLayers, allFrames) {
    var currentFrameIndex = pxtr.app.pixetorController.getCurrentFrameIndex();
    var layers = allLayers ? pxtr.app.pixetorController.getLayers() : [pxtr.app.pixetorController.getCurrentLayer()];
    layers.forEach(function (layer) {
      var frames = allFrames ? layer.getFrames() : [layer.getFrameAt(currentFrameIndex)];
      frames.forEach(function (frame) {
        this.applyToolOnFrame_(frame, oldColor, newColor);
      }.bind(this));
    }.bind(this));
  };

  ns.ColorSwap.prototype.applyToolOnFrame_ = function (frame, oldColor, newColor) {
    oldColor = pxtr.utils.colorToInt(oldColor);
    newColor = pxtr.utils.colorToInt(newColor);
    frame.forEachPixel(function (color, col, row) {
      if (color !== null && color == oldColor) {
        frame.setPixel(col, row, newColor);
      }
    });
  };
})();
