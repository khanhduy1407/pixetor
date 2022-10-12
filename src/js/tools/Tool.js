(function () {
  var ns = $.namespace('pxtr.tools');

  ns.Tool = function () {
    this.toolId = 'tool';
    this.helpText = 'Abstract tool';
    this.tooltipDescriptors = [];
  };

  ns.Tool.prototype.getHelpText = function() {
    return this.helpText;
  };

  ns.Tool.prototype.getId = function() {
    return this.toolId;
  };

  ns.Tool.prototype.raiseSaveStateEvent = function (replayData) {
    $.publish(Events.PIXETOR_SAVE_STATE, {
      type : pxtr.service.HistoryService.REPLAY,
      scope : this,
      replay : replayData
    });
  };
})();
