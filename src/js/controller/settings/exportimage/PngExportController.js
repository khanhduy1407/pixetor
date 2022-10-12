(function () {
  var ns = $.namespace('pxtr.controller.settings.exportimage');

  var dimensionInfoPattern = '{{width}} x {{height}} px, {{frames}}<br/>{{columns}}, {{rows}}.';

  var replace = pxtr.utils.Template.replace;

  // Helper to return "X items" or "1 item" if X is 1.
  var pluralize = function (word, count) {
    if (count === 1) {
      return '1 ' + word;
    }
    return count + ' ' + word + 's';
  };

  ns.PngExportController = function (pixetorController, exportController) {
    this.pixetorController = pixetorController;
    this.exportController = exportController;
    this.onScaleChanged_ = this.onScaleChanged_.bind(this);
  };

  pxtr.utils.inherit(ns.PngExportController, pxtr.controller.settings.AbstractSettingController);

  ns.PngExportController.prototype.init = function () {
    this.layoutContainer = document.querySelector('.png-export-layout-section');
    this.dimensionInfo = document.querySelector('.png-export-dimension-info');

    this.rowsInput = document.querySelector('#png-export-rows');
    this.columnsInput = document.querySelector('#png-export-columns');

    var downloadButton = document.querySelector('.png-download-button');
    var downloadPixiButton = document.querySelector('.png-pixi-download-button');
    var dataUriButton = document.querySelector('.datauri-open-button');
    var selectedFrameDownloadButton = document.querySelector('.selected-frame-download-button');

    this.pixiInlineImageCheckbox = document.querySelector('.png-pixi-inline-image-checkbox');

    this.initLayoutSection_();
    this.updateDimensionLabel_();

    this.addEventListener(this.columnsInput, 'input', this.onColumnsInput_);
    this.addEventListener(downloadButton, 'click', this.onDownloadClick_);
    this.addEventListener(downloadPixiButton, 'click', this.onPixiDownloadClick_);
    this.addEventListener(dataUriButton, 'click', this.onDataUriClick_);
    this.addEventListener(selectedFrameDownloadButton, 'click', this.onDownloadSelectedFrameClick_);
    $.subscribe(Events.EXPORT_SCALE_CHANGED, this.onScaleChanged_);
  };

  ns.PngExportController.prototype.destroy = function () {
    $.unsubscribe(Events.EXPORT_SCALE_CHANGED, this.onScaleChanged_);
    this.superclass.destroy.call(this);
  };

  /**
   * Initalize all controls related to the spritesheet layout.
   */
  ns.PngExportController.prototype.initLayoutSection_ = function () {
    var frames = this.pixetorController.getFrameCount();
    if (frames === 1) {
      // Hide the layout section if only one frame is defined.
      this.layoutContainer.style.display = 'none';
    } else {
      this.columnsInput.setAttribute('max', frames);
      this.columnsInput.value = this.getBestFit_();
      this.onColumnsInput_();
    }
  };

  ns.PngExportController.prototype.updateDimensionLabel_ = function () {
    var zoom = this.exportController.getExportZoom();
    var frames = this.pixetorController.getFrameCount();
    var width = this.pixetorController.getWidth() * zoom;
    var height = this.pixetorController.getHeight() * zoom;

    var columns = this.getColumns_();
    var rows = this.getRows_();
    width = columns * width;
    height = rows * height;

    this.dimensionInfo.innerHTML = replace(dimensionInfoPattern, {
      width: width,
      height: height,
      rows: pluralize('row', rows),
      columns: pluralize('column', columns),
      frames: pluralize('frame', frames),
    });
  };

  ns.PngExportController.prototype.getColumns_ = function () {
    return parseInt(this.columnsInput.value || 1, 10);
  };

  ns.PngExportController.prototype.getRows_ = function () {
    return parseInt(this.rowsInput.value || 1, 10);
  };

  ns.PngExportController.prototype.getBestFit_ = function () {
    var ratio = this.pixetorController.getWidth() / this.pixetorController.getHeight();
    var frameCount = this.pixetorController.getFrameCount();
    var bestFit = Math.round(Math.sqrt(frameCount / ratio));

    return pxtr.utils.Math.minmax(bestFit, 1, frameCount);
  };

  ns.PngExportController.prototype.onScaleChanged_ = function () {
    this.updateDimensionLabel_();
  };

  /**
   * Synchronise column and row inputs, called everytime a user input updates one of the
   * two inputs by the SynchronizedInputs widget.
   */
  ns.PngExportController.prototype.onColumnsInput_ = function () {
    var value = this.columnsInput.value;
    if (value === '') {
      // Skip the synchronization if the input is empty.
      return;
    }

    value = parseInt(value, 10);
    if (isNaN(value)) {
      value = 1;
    }

    // Force the value to be in bounds, if the user tried to update it by directly typing
    // a value.
    value = pxtr.utils.Math.minmax(value, 1, this.pixetorController.getFrameCount());
    this.columnsInput.value = value;

    // Update readonly rowsInput
    this.rowsInput.value = Math.ceil(this.pixetorController.getFrameCount() / value);
    this.updateDimensionLabel_();
  };

  ns.PngExportController.prototype.createPngSpritesheet_ = function () {
    var renderer = new pxtr.rendering.PixetorRenderer(this.pixetorController);
    var outputCanvas = renderer.renderAsCanvas(this.getColumns_(), this.getRows_());
    var width = outputCanvas.width;
    var height = outputCanvas.height;

    var zoom = this.exportController.getExportZoom();
    if (zoom != 1) {
      outputCanvas = pxtr.utils.ImageResizer.resize(outputCanvas, width * zoom, height * zoom, false);
    }

    return outputCanvas;
  };

  ns.PngExportController.prototype.onDownloadClick_ = function (evt) {
    // Create PNG export.
    var canvas = this.createPngSpritesheet_();
    this.downloadCanvas_(canvas);
  };

  // Used and overridden in casper integration tests.
  ns.PngExportController.prototype.downloadCanvas_ = function (canvas, name) {
    // Generate file name
    name = name || this.pixetorController.getPixetor().getDescriptor().name;
    var fileName = name + '.png';

    // Transform to blob and start download.
    pxtr.utils.BlobUtils.canvasToBlob(canvas, function(blob) {
      pxtr.utils.FileUtils.downloadAsFile(blob, fileName);
    });
  };

  ns.PngExportController.prototype.onPixiDownloadClick_ = function () {
    var zip = new window.JSZip();

    // Create PNG export.
    var canvas = this.createPngSpritesheet_();
    var name = this.pixetorController.getPixetor().getDescriptor().name;

    var image;

    if (this.pixiInlineImageCheckbox.checked) {
      image = canvas.toDataURL('image/png');
    } else {
      image = name + '.png';

      zip.file(image, pxtr.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n', {base64: true});
    }

    var width = canvas.width / this.getColumns_();
    var height = canvas.height / this.getRows_();

    var numFrames = this.pixetorController.getFrameCount();
    var frames = {};
    for (var i = 0; i < numFrames; i++) {
      var column = i % this.getColumns_();
      var row = (i - column) / this.getColumns_();
      var frame = {
        'frame': {'x': width * column,'y': height * row,'w': width,'h': height},
        'rotated': false,
        'trimmed': false,
        'spriteSourceSize': {'x': 0,'y': 0,'w': width,'h': height},
        'sourceSize': {'w': width,'h': height}
      };
      frames[name + i + '.png'] = frame;
    }

    var json = {
      'frames': frames,
      'meta': {
        'app': 'https://github.com/pixetorapp/pixetor/',
        'version': '1.0',
        'image': image,
        'format': 'RGBA8888',
        'size': {'w': canvas.width,'h': canvas.height}
      }
    };
    zip.file(name + '.json', JSON.stringify(json));

    var blob = zip.generate({
      type : 'blob'
    });

    pxtr.utils.FileUtils.downloadAsFile(blob, name + '.zip');
  };

  ns.PngExportController.prototype.onDataUriClick_ = function (evt) {
    var popup = window.open('about:blank');
    var dataUri = this.createPngSpritesheet_().toDataURL('image/png');
    window.setTimeout(function () {
      var html = pxtr.utils.Template.getAndReplace('data-uri-export-partial', {
        src: dataUri
      });
      popup.document.title = dataUri;
      popup.document.body.innerHTML = html;
    }.bind(this), 500);
  };

  ns.PngExportController.prototype.onDownloadSelectedFrameClick_ = function (evt) {
    var frameIndex = this.pixetorController.getCurrentFrameIndex();
    var name = this.pixetorController.getPixetor().getDescriptor().name;
    var canvas = this.pixetorController.renderFrameAt(frameIndex, true);
    var zoom = this.exportController.getExportZoom();
    if (zoom != 1) {
      canvas = pxtr.utils.ImageResizer.resize(canvas, canvas.width * zoom, canvas.height * zoom, false);
    }

    var fileName = name + '-' + (frameIndex + 1) + '.png';
    this.downloadCanvas_(canvas, fileName);
  };
})();
