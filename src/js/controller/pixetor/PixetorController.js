(function () {
  var ns = $.namespace('pxtr.controller.pixetor');

  ns.PixetorController = function (pixetor) {
    if (pixetor) {
      this.setPixetor(pixetor);
    } else {
      throw 'A pixetor instance is mandatory for instanciating PixetorController';
    }
  };

  /**
   * Set the current pixetor. Will reset the selected frame and layer unless specified
   * @param {Object} pixetor
   * @param {Object} options:
   *                 preserveState {Boolean} if true, keep the selected frame and layer
   *                 noSnapshot {Boolean} if true, do not save a snapshot in the pixetor
   *                            history for this call to setPixetor
   */
  ns.PixetorController.prototype.setPixetor = function (pixetor, options) {
    this.pixetor = pixetor;
    options = options || {};
    if (!options.preserveState) {
      this.currentLayerIndex = 0;
      this.currentFrameIndex = 0;
    }

    this.layerIdCounter = 1;
  };

  ns.PixetorController.prototype.init = function () {
  };

  ns.PixetorController.prototype.getHeight = function () {
    return this.pixetor.getHeight();
  };

  ns.PixetorController.prototype.getWidth = function () {
    return this.pixetor.getWidth();
  };

  ns.PixetorController.prototype.getFPS = function () {
    return this.pixetor.fps;
  };

  ns.PixetorController.prototype.setFPS = function (fps) {
    if (typeof fps !== 'number') {
      return;
    }
    this.pixetor.fps = fps;
    $.publish(Events.FPS_CHANGED);
  };

  ns.PixetorController.prototype.getLayers = function () {
    return this.pixetor.getLayers();
  };

  ns.PixetorController.prototype.getCurrentLayer = function () {
    return this.getLayerAt(this.currentLayerIndex);
  };

  ns.PixetorController.prototype.getLayerAt = function (index) {
    return this.pixetor.getLayerAt(index);
  };

  ns.PixetorController.prototype.hasLayerAt = function (index) {
    return !!this.getLayerAt(index);
  };

  // FIXME ?? No added value compared to getLayerAt ??
  // Except normalizing to null if undefined ?? ==> To merge
  ns.PixetorController.prototype.getLayerByIndex = function (index) {
    var layers = this.getLayers();
    if (layers[index]) {
      return layers[index];
    } else {
      return null;
    }
  };

  ns.PixetorController.prototype.getCurrentFrame = function () {
    var layer = this.getCurrentLayer();
    return layer.getFrameAt(this.currentFrameIndex);
  };

  ns.PixetorController.prototype.getCurrentLayerIndex = function () {
    return this.currentLayerIndex;
  };

  ns.PixetorController.prototype.getCurrentFrameIndex = function () {
    return this.currentFrameIndex;
  };

  ns.PixetorController.prototype.getPixetor = function () {
    return this.pixetor;
  };

  ns.PixetorController.prototype.isTransparent = function () {
    return this.getLayers().some(function (l) {
      return l.isTransparent();
    });
  };

  ns.PixetorController.prototype.renderFrameAt = function (index, preserveOpacity) {
    return pxtr.utils.LayerUtils.flattenFrameAt(this.getLayers(), index, preserveOpacity);
  };

  ns.PixetorController.prototype.hasFrameAt = function (index) {
    return !!this.getCurrentLayer().getFrameAt(index);
  };

  ns.PixetorController.prototype.addFrame = function () {
    this.addFrameAt(this.getFrameCount());
  };

  ns.PixetorController.prototype.addFrameAtCurrentIndex = function () {
    this.addFrameAt(this.currentFrameIndex + 1);
  };

  ns.PixetorController.prototype.addFrameAt = function (index) {
    this.getLayers().forEach(function (l) {
      l.addFrameAt(this.createEmptyFrame_(), index);
    }.bind(this));

    this.onFrameAddedAt_(index);
  };

  ns.PixetorController.prototype.onFrameAddedAt_ = function (index) {
    this.pixetor.hiddenFrames = this.pixetor.hiddenFrames.map(function (hiddenIndex) {
      if (hiddenIndex >= index) {
        return hiddenIndex + 1;
      }
      return hiddenIndex;
    });

    this.setCurrentFrameIndex(index);
  };

  ns.PixetorController.prototype.createEmptyFrame_ = function () {
    var w = this.pixetor.getWidth();
    var h = this.pixetor.getHeight();
    return new pxtr.model.Frame(w, h);
  };

  ns.PixetorController.prototype.removeFrameAt = function (index) {
    this.getLayers().forEach(function (l) {
      l.removeFrameAt(index);
    });

    // Update the array of hidden frames since some hidden indexes might have shifted.
    this.pixetor.hiddenFrames = this.pixetor.hiddenFrames.map(function (hiddenIndex) {
      if (hiddenIndex > index) {
        return hiddenIndex - 1;
      }
      return hiddenIndex;
    });

    // Current frame index is impacted if the removed frame was before the current frame
    if (this.currentFrameIndex >= index && this.currentFrameIndex > 0) {
      this.setCurrentFrameIndex(this.currentFrameIndex - 1);
    }
  };

  ns.PixetorController.prototype.duplicateCurrentFrame = function () {
    this.duplicateFrameAt(this.currentFrameIndex);
  };

  ns.PixetorController.prototype.duplicateFrameAt = function (index) {
    this.getLayers().forEach(function (l) {
      l.duplicateFrameAt(index);
    });
    this.onFrameAddedAt_(index + 1);
  };

  /**
   * Toggle frame visibility for the frame at the provided index.
   * A visible frame will be included in the animated preview.
   */
  ns.PixetorController.prototype.toggleFrameVisibilityAt = function (index) {
    var hiddenFrames = this.pixetor.hiddenFrames;
    if (hiddenFrames.indexOf(index) === -1) {
      hiddenFrames.push(index);
    } else {
      hiddenFrames = hiddenFrames.filter(function (i) {
        return i !== index;
      });
    }

    // Keep the hiddenFrames array sorted.
    this.pixetor.hiddenFrames = hiddenFrames.sort();
  };

  ns.PixetorController.prototype.moveFrame = function (fromIndex, toIndex) {
    this.getLayers().forEach(function (l) {
      l.moveFrame(fromIndex, toIndex);
    });

    // Update the array of hidden frames since some hidden indexes might have shifted.
    this.pixetor.hiddenFrames = this.pixetor.hiddenFrames.map(function (index) {
      if (index === fromIndex) {
        return toIndex;
      }

      // All the frames between fromIndex and toIndex changed their index.
      var isImpacted = index >= Math.min(fromIndex, toIndex) &&
                       index <= Math.max(fromIndex, toIndex);
      if (isImpacted) {
        if (fromIndex < toIndex) {
          // If the frame moved to a higher index, all impacted frames had their index
          // reduced by 1.
          return index - 1;
        } else {
          // Otherwise, they had their index increased by 1.
          return index + 1;
        }
      }
    });
  };

  ns.PixetorController.prototype.hasVisibleFrameAt = function (index) {
    return this.pixetor.hiddenFrames.indexOf(index) === -1;
  };

  ns.PixetorController.prototype.getVisibleFrameIndexes = function () {
    return this.getCurrentLayer().getFrames().map(function (frame, index) {
      return index;
    }).filter(function (index) {
      return this.pixetor.hiddenFrames.indexOf(index) === -1;
    }.bind(this));
  };

  ns.PixetorController.prototype.getFrameCount = function () {
    return this.pixetor.getFrameCount();
  };

  ns.PixetorController.prototype.setCurrentFrameIndex = function (index) {
    if (this.hasFrameAt(index)) {
      this.currentFrameIndex = index;
    } else {
      window.console.error('Could not set current frame index to ' + index);
    }
  };

  ns.PixetorController.prototype.selectNextFrame = function () {
    var nextIndex = this.currentFrameIndex + 1;
    if (nextIndex < this.getFrameCount()) {
      this.setCurrentFrameIndex(nextIndex);
    }
  };

  ns.PixetorController.prototype.selectPreviousFrame = function () {
    var nextIndex = this.currentFrameIndex - 1;
    if (nextIndex >= 0) {
      this.setCurrentFrameIndex(nextIndex);
    }
  };

  ns.PixetorController.prototype.setCurrentLayerIndex = function (index) {
    if (this.hasLayerAt(index)) {
      this.currentLayerIndex = index;
    } else {
      window.console.error('Could not set current layer index to ' + index);
    }
  };

  ns.PixetorController.prototype.selectLayer = function (layer) {
    var index = this.getLayers().indexOf(layer);
    if (index != -1) {
      this.setCurrentLayerIndex(index);
    }
  };

  ns.PixetorController.prototype.renameLayerAt = function (index, name) {
    var layer = this.getLayerByIndex(index);
    if (layer) {
      layer.setName(name);
    }
  };

  ns.PixetorController.prototype.setLayerOpacityAt = function (index, opacity) {
    var layer = this.getLayerByIndex(index);
    if (layer) {
      layer.setOpacity(opacity);
    }
  };

  ns.PixetorController.prototype.mergeDownLayerAt = function (index) {
    var layer = this.getLayerByIndex(index);
    var downLayer = this.getLayerByIndex(index - 1);
    if (layer && downLayer) {
      var mergedLayer = pxtr.utils.LayerUtils.mergeLayers(layer, downLayer);
      this.removeLayerAt(index);
      this.pixetor.addLayerAt(mergedLayer, index);
      this.removeLayerAt(index - 1);
      this.selectLayer(mergedLayer);
    }
  };

  ns.PixetorController.prototype.generateLayerName_ = function () {
    var name = 'Layer ' + this.layerIdCounter;
    while (this.hasLayerForName_(name)) {
      this.layerIdCounter++;
      name = 'Layer ' + this.layerIdCounter;
    }
    return name;
  };

  ns.PixetorController.prototype.duplicateCurrentLayer = function () {
    var layer = this.getCurrentLayer();
    var clone = pxtr.utils.LayerUtils.clone(layer);
    var currentLayerIndex = this.getCurrentLayerIndex();
    this.pixetor.addLayerAt(clone, currentLayerIndex + 1);
    this.setCurrentLayerIndex(currentLayerIndex + 1);
  };

  ns.PixetorController.prototype.createLayer = function (name) {
    if (!name) {
      name = this.generateLayerName_();
    }
    if (!this.hasLayerForName_(name)) {
      var layer = new pxtr.model.Layer(name);
      for (var i = 0 ; i < this.getFrameCount() ; i++) {
        layer.addFrame(this.createEmptyFrame_());
      }
      var currentLayerIndex = this.getCurrentLayerIndex();
      this.pixetor.addLayerAt(layer, currentLayerIndex + 1);
      this.setCurrentLayerIndex(currentLayerIndex + 1);
    } else {
      throw 'Layer name should be unique';
    }
  };

  ns.PixetorController.prototype.hasLayerForName_ = function (name) {
    return this.pixetor.getLayersByName(name).length > 0;
  };

  ns.PixetorController.prototype.moveLayerUp = function (toTop) {
    var layer = this.getCurrentLayer();
    this.pixetor.moveLayerUp(layer, toTop);
    this.selectLayer(layer);
  };

  ns.PixetorController.prototype.moveLayerDown = function (toBottom) {
    var layer = this.getCurrentLayer();
    this.pixetor.moveLayerDown(layer, toBottom);
    this.selectLayer(layer);
  };

  ns.PixetorController.prototype.removeCurrentLayer = function () {
    var currentLayerIndex = this.getCurrentLayerIndex();
    this.removeLayerAt(currentLayerIndex);
  };

  ns.PixetorController.prototype.removeLayerAt = function (index) {
    if (!this.hasLayerAt(index)) {
      return;
    }

    var layer = this.getLayerAt(index);
    this.pixetor.removeLayer(layer);

    // Update the selected layer if needed.
    if (this.getCurrentLayerIndex() === index) {
      this.setCurrentLayerIndex(Math.max(0, index - 1));
    }
  };

  ns.PixetorController.prototype.serialize = function () {
    return pxtr.utils.serialization.Serializer.serialize(this.pixetor);
  };

  /**
   * Check if the current sprite is empty. Emptiness here means no pixel has been filled
   * on any layer or frame for the current sprite.
   */
  ns.PixetorController.prototype.isEmpty = function () {
    return pxtr.app.currentColorsService.getCurrentColors().length === 0;
  };
})();
