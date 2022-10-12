(function () {
  var ns = $.namespace('pxtr.utils');

  ns.MergeUtils = {
    /**
     * Merge two pixetor instances in a new pixetor instance
     * @param  {Pixetor} pixetor
     *         The original pixetor (name and description will be preserved)
     * @param  {Pixetor} importedPixetor
     *         The imported pixetor
     * @param  {Object} options
     *         - index: {Number} index where the new frames should be appended
     *         - resize: {String} either "expand" or "keep"
     *         - origin: {String} can be any of the existing AnchorWidget origins.
     *         - insertMode: {String} either "insert" or "add"
     *
     * @return {Pixetor} The new Pixetor instance created
     */
    merge : function (pixetor, importedPixetor, options) {
      var isImportedPixetorBigger =
          importedPixetor.getWidth() > pixetor.getWidth() ||
          importedPixetor.getHeight() > pixetor.getHeight();

      // First make sure both the pixetor and the imported pixetor use the target dimensions.
      if (isImportedPixetorBigger && options.resize === 'expand') {
        pixetor = pxtr.utils.ResizeUtils.resizePixetor(pixetor, {
          width : Math.max(pixetor.getWidth(), importedPixetor.getWidth()),
          height : Math.max(pixetor.getHeight(), importedPixetor.getHeight()),
          origin : options.origin,
          resizeContent: false
        });
      } else {
        importedPixetor = pxtr.utils.ResizeUtils.resizePixetor(importedPixetor, {
          width : pixetor.getWidth(),
          height : pixetor.getHeight(),
          origin : options.origin,
          resizeContent: false
        });
      }

      var insertIndex = options.insertIndex;
      if (options.insertMode === 'insert') {
        // The index provided by the frame picker is 1-based.
        // When adding new frames, this works out fine, but if we want to
        // insert the new content in existing frames, we need to get the real
        // 0-based index of the selected frame.
        insertIndex = insertIndex - 1;
      }
      // Add necessary frames in the original pixetor.
      var importedFrameCount = importedPixetor.getFrameCount();
      for (var i = 0 ; i < importedFrameCount ; i++) {
        var index = i + insertIndex;
        // For a given index, a new frame should be added either if we are using "add" insert mode
        // or if the current index is not supported by the original pixetor.
        if (options.insertMode === 'add' || index >= pixetor.getFrameCount()) {
          ns.MergeUtils.addFrameToLayers_(pixetor, index);
        }
      }

      // Import the layers in the original pixetor.
      importedPixetor.getLayers().forEach(function (layer) {
        var name = layer.getName() + ' (imported)';
        var importedLayer = new pxtr.model.Layer(name);
        for (var i = 0 ; i < pixetor.getFrameCount() ; i++) {
          var importedIndex = i - insertIndex;
          var frame = layer.getFrameAt(importedIndex);
          if (!frame) {
            frame = ns.MergeUtils.createEmptyFrame_(pixetor);
          }

          importedLayer.addFrame(frame);
        }
        pixetor.addLayer(importedLayer);
      });

      return pixetor;
    },

    createEmptyFrame_ : function (pixetor) {
      return new pxtr.model.Frame(pixetor.getWidth(), pixetor.getHeight());
    },

    addFrameToLayers_ : function (pixetor, index) {
      pixetor.getLayers().forEach(function (l) {
        l.addFrameAt(ns.MergeUtils.createEmptyFrame_(pixetor), index);
      });
    }
  };
})();
