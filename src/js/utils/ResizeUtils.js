(function () {
  var ns = $.namespace('pxtr.utils');

  ns.ResizeUtils = {
    /**
     * Resize the provided pixetor instance and return a new instance using the provided resize options
     * @param  {Pixetor} pixetor  [description]
     * @param  {Object} options
     *         - width {Number} target width after the resize
     *         - height {Number} target height after the resize
     *         - resizeContent {Booleam} true of the sprite content should be resized
     *         - origin {String} should be a valid AnchorWidget origin
     * @return {Pixetor} The resized pixetor
     */
    resizePixetor : function (pixetor, options) {
      var fps = pixetor.getFPS();
      var resizedLayers = pixetor.getLayers().map(function (layer) {
        return ns.ResizeUtils.resizeLayer(layer, options);
      });

      var resizedPixetor = pxtr.model.Pixetor.fromLayers(resizedLayers, fps, pixetor.getDescriptor());
      // propagate savepath to new Pixetor
      resizedPixetor.savePath = pixetor.savePath;

      return resizedPixetor;
    },

    resizeLayer : function (layer, options) {
      var opacity = layer.getOpacity();
      var resizedFrames = layer.getFrames().map(function (frame) {
        return ns.ResizeUtils.resizeFrame(frame, options);
      });
      var resizedLayer = pxtr.model.Layer.fromFrames(layer.getName(), resizedFrames);
      resizedLayer.setOpacity(opacity);
      return resizedLayer;
    },

    resizeFrame : function (frame, options) {
      var width = options.width;
      var height = options.height;
      var origin = options.origin;

      if (options.resizeContent) {
        return pxtr.utils.FrameUtils.resize(frame, width, height, false);
      } else {
        var resizedFrame = new pxtr.model.Frame(width, height);
        frame.forEachPixel(function (color, x, y) {
          var translated = ns.ResizeUtils.translateCoordinates(x, y, frame, resizedFrame, origin);
          if (resizedFrame.containsPixel(translated.x, translated.y)) {
            resizedFrame.setPixel(translated.x, translated.y, color);
          }
        });

        return resizedFrame;
      }
    },

    translateCoordinates : function (x, y, frame, resizedFrame, origin) {
      return {
        x : ns.ResizeUtils.translateX(x, frame.width, resizedFrame.width, origin),
        y : ns.ResizeUtils.translateY(y, frame.height, resizedFrame.height, origin)
      };
    },

    translateX : function (x, width, resizedWidth, origin) {
      if (origin.indexOf('LEFT') != -1) {
        return x;
      } else if (origin.indexOf('RIGHT') != -1) {
        return x - (width - resizedWidth);
      } else {
        return x - Math.round((width - resizedWidth) / 2);
      }
    },

    translateY : function (y, height, resizedHeight, origin) {
      if (origin.indexOf('TOP') != -1) {
        return y;
      } else if (origin.indexOf('BOTTOM') != -1) {
        return y - (height - resizedHeight);
      } else {
        return y - Math.round((height - resizedHeight) / 2);
      }
    }
  };
})();
