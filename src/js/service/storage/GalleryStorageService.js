(function () {
  var ns = $.namespace('pxtr.service.storage');

  ns.GalleryStorageService = function (pixetorController) {
    this.pixetorController = pixetorController;
  };

  ns.GalleryStorageService.prototype.init = function () {};

  ns.GalleryStorageService.prototype.save = function (pixetor) {
    var descriptor = pixetor.getDescriptor();
    var deferred = Q.defer();

    var serialized = pxtr.utils.serialization.Serializer.serialize(pixetor);

    var data = {
      framesheet : serialized,
      fps : this.pixetorController.getFPS(),
      name : descriptor.name,
      description : descriptor.description,
      frames : this.pixetorController.getFrameCount(),
      first_frame_as_png : pxtr.app.getFirstFrameAsPng(),
      framesheet_as_png : pxtr.app.getFramesheetAsPng()
    };

    if (serialized.length > Constants.APPENGINE_SAVE_LIMIT) {
      deferred.reject('This sprite is too big to be saved on the gallery. Try saving it as a .pixetor file.');
    }

    if (descriptor.isPublic) {
      data.public = true;
    }

    var successCallback = function (response) {
      deferred.resolve();
    };

    var errorCallback = function (response) {
      deferred.reject(this.getErrorMessage_(response));
    };

    pxtr.utils.Xhr.post(Constants.APPENGINE_SAVE_URL, data, successCallback, errorCallback.bind(this));

    return deferred.promise;
  };

  ns.GalleryStorageService.prototype.getErrorMessage_ = function (response) {
    var errorMessage = '';
    if (response.status === 401) {
      errorMessage = 'Session expired, please log in again.';
    } else if (response.status === 403) {
      errorMessage = 'Unauthorized action, this sprite belongs to another account.';
    } else if (response.status === 500) {
      errorMessage = 'Unexpected server error, please contact us on Github (pixetor) or Twitter (@pixetorapp)';
    } else {
      errorMessage = 'Unknown error';
    }
    return errorMessage;
  };
})();
