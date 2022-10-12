(function () {
  var ns = $.namespace('pxtr.rendering.layer');

  ns.LayersRenderer = function (container, renderingOptions, pixetorController) {
    pxtr.rendering.CompositeRenderer.call(this);

    this.pixetorController = pixetorController;

    // Do not use CachedFrameRenderers here, since the caching will be performed in the render method of LayersRenderer
    this.belowRenderer = new pxtr.rendering.frame.FrameRenderer(container, renderingOptions,
      ['layers-canvas', 'layers-below-canvas']);

    this.aboveRenderer = new pxtr.rendering.frame.FrameRenderer(container, renderingOptions,
      ['layers-canvas', 'layers-above-canvas']);

    this.add(this.belowRenderer);
    this.add(this.aboveRenderer);

    this.serializedRendering = '';

    this.stylesheet_ = document.createElement('style');
    document.head.appendChild(this.stylesheet_);
    this.updateLayersCanvasOpacity_(pxtr.UserSettings.get(pxtr.UserSettings.LAYER_OPACITY));

    $.subscribe(Events.PIXETOR_RESET, this.flush.bind(this));
    $.subscribe(Events.USER_SETTINGS_CHANGED, this.onUserSettingsChange_.bind(this));
  };

  pxtr.utils.inherit(pxtr.rendering.layer.LayersRenderer, pxtr.rendering.CompositeRenderer);

  ns.LayersRenderer.prototype.render = function () {
    var offset = this.getOffset();
    var size = this.getDisplaySize();
    var layers = this.pixetorController.getLayers();
    var frameIndex = this.pixetorController.getCurrentFrameIndex();
    var layerIndex = this.pixetorController.getCurrentLayerIndex();

    var belowLayers = layers.slice(0, layerIndex);
    var aboveLayers = layers.slice(layerIndex + 1, layers.length);

    var serializedRendering = [
      this.getZoom(),
      this.getGridWidth(),
      offset.x,
      offset.y,
      size.width,
      size.height,
      pxtr.utils.LayerUtils.getFrameHashAt(belowLayers, frameIndex),
      pxtr.utils.LayerUtils.getFrameHashAt(aboveLayers, frameIndex),
      layers.length
    ].join('-');

    if (this.serializedRendering != serializedRendering) {
      this.serializedRendering = serializedRendering;

      this.clear();

      if (belowLayers.length > 0) {
        var belowFrame = pxtr.utils.LayerUtils.mergeFrameAt(belowLayers, frameIndex);
        this.belowRenderer.render(belowFrame);
      }

      if (aboveLayers.length > 0) {
        var aboveFrame = pxtr.utils.LayerUtils.mergeFrameAt(aboveLayers, frameIndex);
        this.aboveRenderer.render(aboveFrame);
      }
    }
  };

  /**
   * See @pxtr.rendering.frame.CachedFrameRenderer
   * Same issue : FrameRenderer setDisplaySize destroys the canvas
   * @param {Number} width
   * @param {Number} height
   */
  ns.LayersRenderer.prototype.setDisplaySize = function (width, height) {
    var size = this.getDisplaySize();
    if (size.width !== width || size.height !== height) {
      this.superclass.setDisplaySize.call(this, width, height);
    }
  };

  ns.LayersRenderer.prototype.onUserSettingsChange_ = function (evt, settingsName, settingsValue) {
    if (settingsName == pxtr.UserSettings.LAYER_OPACITY) {
      this.updateLayersCanvasOpacity_(settingsValue);
    }
  };

  ns.LayersRenderer.prototype.updateLayersCanvasOpacity_ = function (opacity) {
    this.stylesheet_.innerHTML = '.layers-canvas { opacity : ' + opacity + '}';
  };

  ns.LayersRenderer.prototype.flush = function () {
    this.serializedRendering = '';
  };
})();
