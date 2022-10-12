(function () {
  var ns = $.namespace('pxtr.service.storage');

  ns.StorageService = function (pixetorController) {
    this.pixetorController = pixetorController;
    this.savingFlag_ = false;

    this.onSaveSuccess_ = this.onSaveSuccess_.bind(this);
    this.onSaveError_ = this.onSaveError_.bind(this);
  };

  ns.StorageService.prototype.init = function () {
    var shortcuts = pxtr.service.keyboard.Shortcuts;
    pxtr.app.shortcutService.registerShortcut(shortcuts.STORAGE.OPEN, this.onOpenKey_.bind(this));
    pxtr.app.shortcutService.registerShortcut(shortcuts.STORAGE.SAVE, this.onSaveKey_.bind(this));
    pxtr.app.shortcutService.registerShortcut(shortcuts.STORAGE.SAVE_AS, this.onSaveAsKey_.bind(this));

    $.subscribe(Events.BEFORE_SAVING_PIXETOR, this.setSavingFlag_.bind(this, true));
    $.subscribe(Events.AFTER_SAVING_PIXETOR, this.setSavingFlag_.bind(this, false));
  };

  ns.StorageService.prototype.isSaving = function () {
    return this.savingFlag_;
  };

  ns.StorageService.prototype.saveToGallery = function (pixetor) {
    return this.delegateSave_(pxtr.app.galleryStorageService, pixetor);
  };

  // @deprecated, use saveToIndexedDb unless indexedDb is not available.
  ns.StorageService.prototype.saveToLocalStorage = function (pixetor) {
    return this.delegateSave_(pxtr.app.localStorageService, pixetor);
  };

  ns.StorageService.prototype.saveToIndexedDb = function (pixetor) {
    return this.delegateSave_(pxtr.app.indexedDbStorageService, pixetor);
  };

  ns.StorageService.prototype.saveToFileDownload = function (pixetor) {
    return this.delegateSave_(pxtr.app.fileDownloadStorageService, pixetor);
  };

  ns.StorageService.prototype.saveToDesktop = function (pixetor, saveAsNew) {
    return this.delegateSave_(pxtr.app.desktopStorageService, pixetor, saveAsNew);
  };

  ns.StorageService.prototype.delegateSave_ = function(delegatedService, pixetor, saveAsNew) {
    if (this.savingFlag_) {
      return Q.reject('Already saving');
    }

    $.publish(Events.BEFORE_SAVING_PIXETOR);
    return delegatedService.save(pixetor, saveAsNew).then(this.onSaveSuccess_, this.onSaveError_);
  };

  ns.StorageService.prototype.onOpenKey_ = function () {
    if (pxtr.utils.Environment.detectNodeWebkit()) {
      pxtr.app.desktopStorageService.openPixetor();
    }
    // no other implementation for now
  };

  ns.StorageService.prototype.onSaveKey_ = function (charkey) {
    var pixetor = this.pixetorController.getPixetor();
    if (pxtr.app.isLoggedIn()) {
      this.saveToGallery(this.pixetorController.getPixetor());
    } else if (pxtr.utils.Environment.detectNodeWebkit()) {
      this.saveToDesktop(this.pixetorController.getPixetor());
    } else {
      // saveToLocalStorage might display a native confirm dialog
      // on Firefox, the native 'save' window will then be displayed
      // wrap in timeout in order to start saving only after event.preventDefault
      // has been done
      window.setTimeout(function () {
        this.saveToIndexedDb(this.pixetorController.getPixetor());
      }.bind(this), 0);
    }
  };

  ns.StorageService.prototype.onSaveAsKey_ = function () {
    if (pxtr.utils.Environment.detectNodeWebkit()) {
      this.saveToDesktop(this.pixetorController.getPixetor(), true);
    }
    // no other implementation for now
  };

  ns.StorageService.prototype.onSaveSuccess_ = function () {
    $.publish(Events.SHOW_NOTIFICATION, [{
      content : 'Successfully saved !',
      hideDelay : 3000
    }]);
    $.publish(Events.PIXETOR_SAVED);
    this.afterSaving_();
  };

  ns.StorageService.prototype.onSaveError_ = function (errorMessage) {
    var errorText = 'Saving failed';
    if (errorMessage) {
      errorText += ' : ' + errorMessage;
    }
    $.publish(Events.SHOW_NOTIFICATION, [{
      content : errorText,
      hideDelay : 10000
    }]);
    this.afterSaving_();
    return Q.reject(errorMessage);
  };

  ns.StorageService.prototype.afterSaving_ = function () {
    $.publish(Events.AFTER_SAVING_PIXETOR);
  };

  ns.StorageService.prototype.setSavingFlag_ = function (savingFlag) {
    this.savingFlag_ = savingFlag;
  };
})();
