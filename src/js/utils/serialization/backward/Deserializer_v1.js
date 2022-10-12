(function () {
  var ns = $.namespace('pxtr.utils.serialization.backward');

  ns.Deserializer_v1 = function (data, callback) {
    this.callback_ = callback;
    this.data_ = data;
  };

  ns.Deserializer_v1.prototype.deserialize = function () {
    var pixetorData = this.data_.pixetor;
    var descriptor = new pxtr.model.pixetor.Descriptor('Deserialized pixetor', '');
    var pixetor = new pxtr.model.Pixetor(pixetorData.width, pixetorData.height, Constants.DEFAULT.FPS, descriptor);

    pixetorData.layers.forEach(function (serializedLayer) {
      var layer = this.deserializeLayer(serializedLayer);
      pixetor.addLayer(layer);
    }.bind(this));

    this.callback_(pixetor);
  };

  ns.Deserializer_v1.prototype.deserializeLayer = function (layerString) {
    var layerData = JSON.parse(layerString);
    var layer = new pxtr.model.Layer(layerData.name);
    layerData.frames.forEach(function (serializedFrame) {
      var frame = this.deserializeFrame(serializedFrame);
      layer.addFrame(frame);
    }.bind(this));

    return layer;
  };

  ns.Deserializer_v1.prototype.deserializeFrame = function (frameString) {
    var framePixelGrid = JSON.parse(frameString);
    return pxtr.model.Frame.fromPixelGrid(framePixelGrid);
  };
})();
