/**
 * @provide pxtr.tools.drawing.selection.RectangleSelect
 *
 * @require pxtr.utils
 */
(function() {
  var ns = $.namespace('pxtr.tools.drawing.selection');

  ns.RectangleSelect = function() {
    ns.AbstractDragSelect.call(this);

    this.toolId = 'tool-rectangle-select';
    this.helpText = 'Rectangle selection';
    this.shortcut = pxtr.service.keyboard.Shortcuts.TOOL.RECTANGLE_SELECT;

  };

  pxtr.utils.inherit(ns.RectangleSelect, ns.AbstractDragSelect);

  /** @override */
  ns.RectangleSelect.prototype.onDragSelectStart_ = function (col, row) {
    $.publish(Events.DRAG_START, [col, row]);
  };

  /**
   * When creating the rectangle selection, we clear the current overlayFrame and
   * redraw the current rectangle based on the origin coordinate and
   * the current mouse coordinate in sprite.
   * @override
   */
  ns.RectangleSelect.prototype.onDragSelect_ = function (col, row, frame, overlay) {
    overlay.clear();
    this.selection = new pxtr.selection.RectangularSelection(this.startCol, this.startRow, col, row);
    $.publish(Events.SELECTION_CREATED, [this.selection]);
    this.drawSelectionOnOverlay_(overlay);
  };

  /** @override */
  ns.RectangleSelect.prototype.onDragSelectEnd_ = function (col, row, frame, overlay) {
    this.onSelect_(col, row, frame, overlay);
    $.publish(Events.DRAG_END);
  };

})();
