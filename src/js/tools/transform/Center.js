(function () {
  var ns = $.namespace('pxtr.tools.transform');

  ns.Center = function () {
    this.toolId = 'tool-center';
    this.helpText = 'Align image to the center';
    this.tooltipDescriptors = [
      {key : 'ctrl', description : 'Apply to all layers'},
      {key : 'shift', description : 'Apply to all frames'}
    ];
  };

  pxtr.utils.inherit(ns.Center, ns.AbstractTransformTool);

  ns.Center.prototype.applyToolOnFrame_ = function (frame) {
    ns.TransformUtils.center(frame);
  };

})();
