/**
 * @provide pxtr.tools.drawing.ColorPicker
 *
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing');

  ns.ColorPicker = function() {
    this.toolId = 'tool-colorpicker';
    this.helpText = 'Color picker';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.COLORPICKER;
  };

  pxtr.utils.inherit(ns.ColorPicker, ns.BaseTool);

  /**
   * @override
   */
  ns.ColorPicker.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    if (frame.containsPixel(col, row)) {
      var sampledColor = pxtr.utils.intToColor(frame.getPixel(col, row));
      if (pxtr.app.mouseStateService.isLeftButtonPressed()) {
        $.publish(Events.SELECT_PRIMARY_COLOR, [sampledColor]);
      } else if (pxtr.app.mouseStateService.isRightButtonPressed()) {
        $.publish(Events.SELECT_SECONDARY_COLOR, [sampledColor]);
      }
    }
  };
})();
