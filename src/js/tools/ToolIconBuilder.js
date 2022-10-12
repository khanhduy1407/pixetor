(function () {
  var ns = $.namespace('pxtr.tools');

  ns.ToolIconBuilder = function () {};

  ns.ToolIconBuilder.prototype.createIcon = function (tool, tooltipPosition) {
    tooltipPosition = tooltipPosition || 'right';
    var tpl = pxtr.utils.Template.get('drawingTool-item-template');
    return pxtr.utils.Template.replace(tpl, {
      cssclass : ['tool-icon', 'icon-' + tool.toolId].join(' '),
      toolid : tool.toolId,
      title : this.getTooltipText(tool),
      tooltipposition : tooltipPosition
    });
  };

  ns.ToolIconBuilder.prototype.getTooltipText = function(tool) {
    var descriptors = tool.tooltipDescriptors;
    return pxtr.utils.TooltipFormatter.format(tool.getHelpText(), tool.shortcut, descriptors);
  };
})();
