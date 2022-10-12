(function () {
  var ns = $.namespace('pxtr.service.storage');

  ns.FileDownloadStorageService = function () {};
  ns.FileDownloadStorageService.prototype.init = function () {};

  ns.FileDownloadStorageService.prototype.save = function (pixetor) {
    var serialized = pxtr.utils.serialization.Serializer.serialize(pixetor);
    var deferred = Q.defer();

    pxtr.utils.BlobUtils.stringToBlob(serialized, function(blob) {
      var pixetorName = pixetor.getDescriptor().name;
      var timestamp = pxtr.utils.DateUtils.format(new Date(), '{{Y}}{{M}}{{D}}-{{H}}{{m}}{{s}}');
      var fileName = pixetorName + '-' + timestamp + '.pixetor';

      try {
        pxtr.utils.FileUtils.downloadAsFile(blob, fileName);
        deferred.resolve();
      } catch (e) {
        deferred.reject(e.message);
      }
    }.bind(this), 'application/pixetor+json');

    return deferred.promise;
  };

})();
