(function () {
  var ns  = $.namespace('pxtr.controller');

  /**
   * When embedded in pixetorapp.com, the page adds a header containing the name of the currently edited sprite
   * This controller will keep the displayed name in sync with the actual pixetor name
   */
  ns.HeaderController = function (pixetorController, savedStatusService) {
    this.pixetorController = pixetorController;
    this.savedStatusService = savedStatusService;
  };

  ns.HeaderController.prototype.init = function () {
    this.pixetorName_ = document.querySelector('.pixetor-name');

    $.subscribe(Events.BEFORE_SAVING_PIXETOR, this.onBeforeSavingPixetorEvent_.bind(this));
    $.subscribe(Events.AFTER_SAVING_PIXETOR, this.onAfterSavingPixetorEvent_.bind(this));

    $.subscribe(Events.PIXETOR_DESCRIPTOR_UPDATED, this.updateHeader_.bind(this));
    $.subscribe(Events.PIXETOR_RESET, this.updateHeader_.bind(this));
    $.subscribe(Events.PIXETOR_SAVED_STATUS_UPDATE, this.updateHeader_.bind(this));

    this.updateHeader_();
  };

  ns.HeaderController.prototype.updateHeader_ = function () {
    try {
      var name = this.pixetorController.getPixetor().getDescriptor().name;
      if (this.savedStatusService.isDirty()) {
        name = name + ' *';
      }

      if (this.pixetorName_) {
        this.pixetorName_.textContent = name;
      }
    } catch (e) {
      console.warn('Could not update header : ' + e.message);
    }
  };

  ns.HeaderController.prototype.onBeforeSavingPixetorEvent_ = function () {
    if (!this.pixetorName_) {
      return;
    }
    this.pixetorName_.classList.add('pixetor-name-saving');
  };

  ns.HeaderController.prototype.onAfterSavingPixetorEvent_ = function () {
    if (!this.pixetorName_) {
      return;
    }
    this.pixetorName_.classList.remove('pixetor-name-saving');
  };

})();
