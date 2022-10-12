(function () {
  var ns = $.namespace('pxtr.controller');

  ns.ToolController = function () {

    this.tools = [
      new pxtr.tools.drawing.SimplePen(),
      new pxtr.tools.drawing.VerticalMirrorPen(),
      new pxtr.tools.drawing.PaintBucket(),
      new pxtr.tools.drawing.ColorSwap(),
      new pxtr.tools.drawing.Eraser(),
      new pxtr.tools.drawing.Stroke(),
      new pxtr.tools.drawing.Rectangle(),
      new pxtr.tools.drawing.Circle(),
      new pxtr.tools.drawing.Move(),
      new pxtr.tools.drawing.selection.ShapeSelect(),
      new pxtr.tools.drawing.selection.RectangleSelect(),
      new pxtr.tools.drawing.selection.LassoSelect(),
      new pxtr.tools.drawing.Lighten(),
      new pxtr.tools.drawing.DitheringTool(),
      new pxtr.tools.drawing.ColorPicker()
    ];

    this.toolIconBuilder = new pxtr.tools.ToolIconBuilder();
  };

  /**
   * @public
   */
  ns.ToolController.prototype.init = function() {
    this.createToolsDom_();
    this.addKeyboardShortcuts_();

    // Initialize tool:
    // Set SimplePen as default selected tool:
    this.selectTool_(this.tools[0]);
    // Activate listener on tool panel:
    var toolSection = document.querySelector('#tool-section');
    toolSection.addEventListener('mousedown', this.onToolIconClicked_.bind(this));

    $.subscribe(Events.SELECT_TOOL, this.onSelectToolEvent_.bind(this));
    $.subscribe(Events.SHORTCUTS_CHANGED, this.createToolsDom_.bind(this));
  };

  /**
   * @private
   */
  ns.ToolController.prototype.activateToolOnStage_ = function(tool) {
    var stage = document.body;
    var previousSelectedToolClass = stage.dataset.selectedToolClass;
    if (previousSelectedToolClass) {
      stage.classList.remove(previousSelectedToolClass);
      stage.classList.remove(pxtr.tools.drawing.Move.TOOL_ID);
    }
    stage.classList.add(tool.toolId);
    stage.dataset.selectedToolClass = tool.toolId;
  };

  ns.ToolController.prototype.onSelectToolEvent_ = function(event, toolId) {
    var tool = this.getToolById_(toolId);
    if (tool) {
      this.selectTool_(tool);
    }
  };

  /**
   * @private
   */
  ns.ToolController.prototype.selectTool_ = function(tool) {
    this.currentSelectedTool = tool;
    this.activateToolOnStage_(this.currentSelectedTool);

    var selectedToolElement = document.querySelector('#tool-section .tool-icon.selected');
    if (selectedToolElement) {
      selectedToolElement.classList.remove('selected');
    }

    var toolElement = document.querySelector('[data-tool-id=' + tool.toolId + ']');
    toolElement.classList.add('selected');

    $.publish(Events.TOOL_SELECTED, [tool]);
  };

  /**
   * @private
   */
  ns.ToolController.prototype.onToolIconClicked_ = function(evt) {
    var target = evt.target;
    var clickedTool = pxtr.utils.Dom.getParentWithData(target, 'toolId');

    if (clickedTool) {
      var toolId = clickedTool.dataset.toolId;
      var tool = this.getToolById_(toolId);
      if (tool) {
        this.selectTool_(tool);
      }
    }
  };

  ns.ToolController.prototype.onKeyboardShortcut_ = function(toolId, charkey) {
    var tool = this.getToolById_(toolId);
    if (tool !== null) {
      this.selectTool_(tool);
    }
  };

  ns.ToolController.prototype.getToolById_ = function (toolId) {
    return pxtr.utils.Array.find(this.tools, function (tool) {
      return tool.toolId == toolId;
    });
  };

  /**
   * @private
   */
  ns.ToolController.prototype.createToolsDom_ = function() {
    var html = '';
    for (var i = 0 ; i < this.tools.length ; i++) {
      var tool = this.tools[i];
      html += this.toolIconBuilder.createIcon(tool);
    }
    document.querySelector('#tools-container').innerHTML = html;
  };

  ns.ToolController.prototype.addKeyboardShortcuts_ = function () {
    for (var i = 0 ; i < this.tools.length ; i++) {
      var tool = this.tools[i];
      pxtr.app.shortcutService.registerShortcut(tool.shortcut, this.onKeyboardShortcut_.bind(this, tool.toolId));
    }
  };
})();
