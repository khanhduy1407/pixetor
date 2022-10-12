(function () {
  var ns = $.namespace('pxtr.controller.settings');

  ns.ImportController = function (pixetorController) {
    this.pixetorController = pixetorController;
  };

  pxtr.utils.inherit(ns.ImportController, pxtr.controller.settings.AbstractSettingController);

  ns.ImportController.prototype.init = function () {
    this.hiddenFileInput = document.querySelector('[name="file-upload-input"]');
    this.addEventListener(this.hiddenFileInput, 'change', this.onFileUploadChange_);

    this.hiddenOpenPixetorInput = document.querySelector('[name="open-pixetor-input"]');

    this.addEventListener('.browse-local-button', 'click', this.onBrowseLocalClick_);
    this.addEventListener('.browse-backups-button', 'click', this.onBrowseBackupsClick_);
    this.addEventListener('.file-input-button', 'click', this.onFileInputClick_);

    // different handlers, depending on the Environment
    if (pxtr.utils.Environment.detectNodeWebkit()) {
      this.addEventListener('.open-pixetor-button', 'click', this.openPixetorDesktop_);
    } else {
      this.addEventListener(this.hiddenOpenPixetorInput, 'change', this.onOpenPixetorChange_);
      this.addEventListener('.open-pixetor-button', 'click', this.onOpenPixetorClick_);
    }
  };

  ns.ImportController.prototype.closeDrawer_ = function () {
    $.publish(Events.CLOSE_SETTINGS_DRAWER);
  };
  ns.ImportController.prototype.onFileUploadChange_ = function (evt) {
    this.importPictureFromFile_();
  };

  ns.ImportController.prototype.onFileInputClick_ = function (evt) {
    this.hiddenFileInput.click();
  };

  ns.ImportController.prototype.onOpenPixetorChange_ = function (evt) {
    var files = this.hiddenOpenPixetorInput.files;
    if (files.length == 1) {
      this.openPixetorFile_(files[0]);
    }
  };

  ns.ImportController.prototype.openPixetorDesktop_ = function (evt) {
    this.closeDrawer_();
    pxtr.app.desktopStorageService.openPixetor();
  };

  ns.ImportController.prototype.onOpenPixetorClick_ = function (evt) {
    this.hiddenOpenPixetorInput.click();
  };

  ns.ImportController.prototype.onBrowseLocalClick_ = function (evt) {
    $.publish(Events.DIALOG_SHOW, {
      dialogId : 'browse-local'
    });
    this.closeDrawer_();
  };

  ns.ImportController.prototype.onBrowseBackupsClick_ = function (evt) {
    $.publish(Events.DIALOG_SHOW, {
      dialogId : 'browse-backups'
    });
    this.closeDrawer_();
  };

  ns.ImportController.prototype.openPixetorFile_ = function (file) {
    if (this.isPixetor_(file)) {
      $.publish(Events.DIALOG_SHOW, {
        dialogId : 'import',
        initArgs : {
          rawFiles: [file]
        }
      });
      this.closeDrawer_();
    } else {
      this.closeDrawer_();
      console.error('The selected file is not a pixetor file');
    }
  };

  ns.ImportController.prototype.importPictureFromFile_ = function () {
    var files = this.hiddenFileInput.files;
    // TODO : Simply filter and remove stuff
    var areImages = Array.prototype.every.call(files, function (file) {
      return file.type.indexOf('image') === 0;
    });
    if (areImages) {
      $.publish(Events.DIALOG_SHOW, {
        dialogId : 'import',
        initArgs : {
          rawFiles: files
        }
      });
      this.closeDrawer_();
    } else {
      this.closeDrawer_();
      console.error('Some files are not images');
    }
  };

  ns.ImportController.prototype.isPixetor_ = function (file) {
    return (/\.pixetor$/).test(file.name);
  };

  ns.ImportController.prototype.onRestorePreviousSessionClick_ = function () {
    if (window.confirm('This will erase your current workspace. Continue ?')) {
      pxtr.app.backupService.load();
      $.publish(Events.CLOSE_SETTINGS_DRAWER);
    }
  };
})();
