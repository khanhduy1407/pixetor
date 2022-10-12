(function () {
  var ns = $.namespace('pxtr.tools.transform');

  ns.Clone = function () {
    this.toolId = 'tool-clone';
    this.helpText = 'Clone current layer to all frames';
    this.tooltipDescriptors = [];
  };

  pxtr.utils.inherit(ns.Clone, ns.AbstractTransformTool);

  ns.Clone.prototype.applyTool_ = function (altKey, allFrames, allLayers) {
    var ref = pxtr.app.pixetorController.getCurrentFrame();
    var layer = pxtr.app.pixetorController.getCurrentLayer();
    layer.getFrames().forEach(function (frame) {
      if (frame !==  ref) {
        frame.setPixels(ref.getPixels());
      }
    });
  };
})();
