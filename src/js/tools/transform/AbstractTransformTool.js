(function () {
  var ns = $.namespace('pxtr.tools.transform');

  ns.AbstractTransformTool = function () {};

  pxtr.utils.inherit(ns.AbstractTransformTool, pxtr.tools.Tool);

  ns.AbstractTransformTool.prototype.applyTransformation = function (evt) {
    var allFrames = evt.shiftKey;
    var allLayers = pxtr.utils.UserAgent.isMac ?  evt.metaKey : evt.ctrlKey;

    this.applyTool_(evt.altKey, allFrames, allLayers);

    $.publish(Events.PIXETOR_RESET);

    this.raiseSaveStateEvent({
      altKey : evt.altKey,
      allFrames : allFrames,
      allLayers : allLayers
    });
  };

  ns.AbstractTransformTool.prototype.applyTool_ = function (altKey, allFrames, allLayers) {
    var currentFrameIndex = pxtr.app.pixetorController.getCurrentFrameIndex();
    var layers = allLayers ? pxtr.app.pixetorController.getLayers() : [pxtr.app.pixetorController.getCurrentLayer()];
    layers.forEach(function (layer) {
      var frames = allFrames ? layer.getFrames() : [layer.getFrameAt(currentFrameIndex)];
      frames.forEach(function (frame) {
        this.applyToolOnFrame_(frame, altKey);
      }.bind(this));
    }.bind(this));
  };

  ns.AbstractTransformTool.prototype.replay = function (frame, replayData) {
    this.applyTool_(replayData.altKey, replayData.allFrames, replayData.allLayers);
  };

})();
