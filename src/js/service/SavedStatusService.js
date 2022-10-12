(function () {
  var ns = $.namespace('pxtr.service');

  ns.SavedStatusService = function (pixetorController, historyService) {
    this.pixetorController = pixetorController;
    this.historyService = historyService;
    this.lastSavedStateIndex = '';

    this.publishStatusUpdateEvent_ = this.publishStatusUpdateEvent_.bind(this);
  };

  ns.SavedStatusService.prototype.init = function () {
    $.subscribe(Events.TOOL_RELEASED, this.publishStatusUpdateEvent_);
    $.subscribe(Events.PIXETOR_RESET, this.publishStatusUpdateEvent_);
    $.subscribe(Events.PIXETOR_SAVED, this.onPixetorSaved.bind(this));
    this.lastSavedStateIndex = this.historyService.getCurrentStateId();
  };

  ns.SavedStatusService.prototype.onPixetorSaved = function () {
    this.lastSavedStateIndex = this.historyService.getCurrentStateId();
    this.publishStatusUpdateEvent_();
  };

  ns.SavedStatusService.prototype.publishStatusUpdateEvent_ = function () {
    $.publish(Events.PIXETOR_SAVED_STATUS_UPDATE);
  };

  ns.SavedStatusService.prototype.isDirty = function () {
    return (this.lastSavedStateIndex != this.historyService.getCurrentStateId());
  };
})();
