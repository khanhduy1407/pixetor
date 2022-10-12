(function () {
  var ns = $.namespace('pxtr.service.storage');
  var PIXETOR_EXTENSION = '.pixetor';

  ns.DesktopStorageService = function(pixetorController) {
    this.pixetorController = pixetorController || pxtr.app.pixetorController;
    this.hideNotificationTimeoutID = 0;
  };

  ns.DesktopStorageService.prototype.init = function () {};

  ns.DesktopStorageService.prototype.save = function (pixetor, saveAsNew) {
    if (pixetor.savePath && !saveAsNew) {
      return this.saveAtPath_(pixetor, pixetor.savePath);
    } else {
      var name = pixetor.getDescriptor().name;
      var filenamePromise = pxtr.utils.FileUtilsDesktop.chooseFilenameDialog(name, PIXETOR_EXTENSION);
      return filenamePromise.then(this.saveAtPath_.bind(this, pixetor));
    }
  };

  ns.DesktopStorageService.prototype.saveAtPath_ = function (pixetor, savePath) {
    if (!savePath) {
      return Q.reject('Invalid file name');
    }

    var serialized = pxtr.utils.serialization.Serializer.serialize(pixetor);
    savePath = this.addExtensionIfNeeded_(savePath);
    pixetor.savePath = savePath;
    pixetor.setName(this.extractFilename_(savePath));
    return pxtr.utils.FileUtilsDesktop.saveToFile(serialized, savePath);
  };

  ns.DesktopStorageService.prototype.openPixetor = function () {
    return pxtr.utils.FileUtilsDesktop.chooseFilenameDialog().then(this.load);
  };

  ns.DesktopStorageService.prototype.load = function (savePath) {
    pxtr.utils.FileUtilsDesktop.readFile(savePath).then(function (content) {
      pxtr.utils.PixetorFileUtils.decodePixetorFile(content, function (pixetor) {
        // store save path so we can re-save without opening the save dialog
        pixetor.savePath = savePath;
        pxtr.app.pixetorController.setPixetor(pixetor);
      });
    });
  };

  ns.DesktopStorageService.prototype.addExtensionIfNeeded_ = function (filename) {
    var hasExtension = filename.substr(-PIXETOR_EXTENSION.length) === PIXETOR_EXTENSION;
    if (!hasExtension) {
      return filename + PIXETOR_EXTENSION;
    }
    return filename;
  };

  ns.DesktopStorageService.prototype.extractFilename_ = function (savePath) {
    var matches = (/[\/\\]([^\/\\]*)\.pixetor$/gi).exec(savePath);
    if (matches && matches[1]) {
      return matches[1];
    }
  };
})();
