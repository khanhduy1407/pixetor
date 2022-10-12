(function () {
  var ns = $.namespace('pxtr.utils.serialization.backward');

  ns.Deserializer_v0 = function (data, callback) {
    this.data_ = data;
    this.callback_ = callback;
  };

  ns.Deserializer_v0.prototype.deserialize = function () {
    var pixelGrids = this.data_;
    var frames = pixelGrids.map(function (grid) {
      return pxtr.model.Frame.fromPixelGrid(grid);
    });
    var descriptor = new pxtr.model.pixetor.Descriptor('Deserialized pixetor', '');
    var layer = pxtr.model.Layer.fromFrames('Layer 1', frames);

    this.callback_(pxtr.model.Pixetor.fromLayers([layer], Constants.DEFAULT.FPS, descriptor));
  };
})();
