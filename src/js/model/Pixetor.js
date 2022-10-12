(function () {
  var ns = $.namespace('pxtr.model');

  /**
   * @constructor
   * @param {Number} width
   * @param {Number} height
   * @param {String} name
   * @param {String} description
   */
  ns.Pixetor = function (width, height, fps, descriptor) {
    if (width && height && descriptor) {
      this.layers = [];
      this.width = width;
      this.height = height;
      this.descriptor = descriptor;
      this.savePath = null;
      this.fps = fps;
      this.hiddenFrames = [];
    } else {
      throw 'Missing arguments in Pixetor constructor : ' + Array.prototype.join.call(arguments, ',');
    }
  };

  /**
   * Create a pixetor instance from an existing set of (non empty) layers
   * Layers should all be synchronized : same number of frames, same dimensions
   * @param  {Array<pxtr.model.Layer>} layers
   * @return {pxtr.model.Pixetor}
   */
  ns.Pixetor.fromLayers = function (layers, fps, descriptor) {
    var pixetor = null;
    if (layers.length > 0 && layers[0].size() > 0) {
      var sampleFrame = layers[0].getFrameAt(0);
      pixetor = new pxtr.model.Pixetor(sampleFrame.getWidth(), sampleFrame.getHeight(), fps, descriptor);
      layers.forEach(pixetor.addLayer.bind(pixetor));
    } else {
      throw 'Pixetor.fromLayers expects array of non empty pxtr.model.Layer as first argument';
    }
    return pixetor;
  };

  ns.Pixetor.prototype.getLayers = function () {
    return this.layers;
  };

  ns.Pixetor.prototype.getHeight = function () {
    return this.height;
  };

  ns.Pixetor.prototype.getWidth = function () {
    return this.width;
  };

  ns.Pixetor.prototype.getFPS = function () {
    return this.fps;
  };

  ns.Pixetor.prototype.getLayers = function () {
    return this.layers;
  };

  ns.Pixetor.prototype.getLayerAt = function (index) {
    return this.layers[index];
  };

  ns.Pixetor.prototype.getLayersByName = function (name) {
    return this.layers.filter(function (l) {
      return l.getName() == name;
    });
  };

  ns.Pixetor.prototype.getFrameCount = function () {
    return this.getLayerAt(0).size();
  };

  ns.Pixetor.prototype.addLayer = function (layer) {
    this.layers.push(layer);
  };

  ns.Pixetor.prototype.addLayerAt = function (layer, index) {
    this.layers.splice(index, 0, layer);
  };

  ns.Pixetor.prototype.moveLayerUp = function (layer, toTop) {
    var index = this.layers.indexOf(layer);
    var toIndex = toTop ? this.layers.length - 1 : index + 1;
    this.moveLayer_(index, toIndex);
  };

  ns.Pixetor.prototype.moveLayerDown = function (layer, toBottom) {
    var index = this.layers.indexOf(layer);
    var toIndex = toBottom ? 0 : index - 1;
    this.moveLayer_(index, toIndex);
  };

  /**
   * Move the layer at the provided index to the provided toIndex.
   */
  ns.Pixetor.prototype.moveLayer_ = function (fromIndex, toIndex) {
    if (fromIndex == -1 || toIndex == -1 || fromIndex == toIndex) {
      return;
    }
    toIndex = pxtr.utils.Math.minmax(toIndex, 0, this.layers.length - 1);
    var layer = this.layers.splice(fromIndex, 1)[0];
    this.layers.splice(toIndex, 0, layer);
  };

  ns.Pixetor.prototype.removeLayer = function (layer) {
    var index = this.layers.indexOf(layer);
    if (index != -1) {
      this.layers.splice(index, 1);
    }
  };

  ns.Pixetor.prototype.removeLayerAt = function (index) {
    this.layers.splice(index, 1);
  };

  ns.Pixetor.prototype.getDescriptor = function () {
    return this.descriptor;
  };

  ns.Pixetor.prototype.setDescriptor = function (descriptor) {
    this.descriptor = descriptor;
    $.publish(Events.PIXETOR_DESCRIPTOR_UPDATED);
  };

  ns.Pixetor.prototype.setName = function (name) {
    this.descriptor.name = name;
    $.publish(Events.PIXETOR_DESCRIPTOR_UPDATED);
  };

  ns.Pixetor.prototype.getHash = function () {
    return this.layers.map(function (layer) {
      return layer.getHash();
    }).join('-');
  };

})();
