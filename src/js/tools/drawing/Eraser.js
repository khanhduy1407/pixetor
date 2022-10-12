/**
 * @provide pxtr.tools.drawing.Eraser
 *
 * @require Constants
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');

  ns.Eraser = function() {
    this.superclass.constructor.call(this);

    this.toolId = 'tool-eraser';
    this.helpText = 'Eraser tool';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.ERASER;
  };

  pxtr.utils.inherit(ns.Eraser, ns.SimplePen);

  /**
   * @override
   */
  ns.Eraser.prototype.getToolColor = function() {
    return Constants.TRANSPARENT_COLOR;
  };
})();
