(function () {
  var ns = $.namespace('pxtr.utils');

  ns.PixetorFileUtils = {
    FAILURE : {
      EMPTY : 'No data found in pixetor file',
      INVALID : 'Invalid pixetor file, contact us on twitter @pixetorapp',
      DESERIALIZATION : 'Pixetor data deserialization failed'
    },

    /**
     * Load a pixetor from a pixetor file.
     * After deserialization is successful, the provided success callback will be called.
     * Success callback is expected to receive a single Pixetor object argument
     * @param  {File} file the .pixetor file to load
     * @param  {Function} onSuccess Called if the deserialization of the pixetor is successful
     * @param  {Function} onError NOT USED YET
     */
    loadFromFile : function (file, onSuccess, onError) {
      pxtr.utils.FileUtils.readFile(file, function (content) {
        var rawPixetor = pxtr.utils.Base64.toText(content);
        ns.PixetorFileUtils.decodePixetorFile(
          rawPixetor,
          function (pixetor) {
            // if using Node-Webkit, store the savePath on load
            // Note: the 'path' property is unique to Node-Webkit, and holds the full path
            if (pxtr.utils.Environment.detectNodeWebkit()) {
              pixetor.savePath = file.path;
            }
            onSuccess(pixetor);
          },
          onError
        );
      });
    },

    decodePixetorFile : function (rawPixetor, onSuccess, onError) {
      var serializedPixetor;
      if (rawPixetor.length === 0) {
        onError(ns.PixetorFileUtils.FAILURE.EMPTY);
        return;
      }

      try {
        serializedPixetor = JSON.parse(rawPixetor);
      } catch (e) {
        onError(ns.PixetorFileUtils.FAILURE.INVALID);
        return;
      }

      var pixetor = serializedPixetor.pixetor;
      pxtr.utils.serialization.Deserializer.deserialize(serializedPixetor, onSuccess, function () {
        onError(ns.PixetorFileUtils.FAILURE.DESERIALIZATION);
      });
    }
  };
})();
