(function () {
  var ns = $.namespace('pxtr.controller.settings.exportimage');

  ns.ZipExportController = function (pixetorController, exportController) {
    this.pixetorController = pixetorController;
    this.exportController = exportController;
  };

  pxtr.utils.inherit(ns.ZipExportController, pxtr.controller.settings.AbstractSettingController);

  ns.ZipExportController.prototype.init = function () {
    this.pngFilePrefixInput = document.querySelector('.zip-prefix-name');
    this.pngFilePrefixInput.value = 'sprite_';

    this.splitByLayersCheckbox = document.querySelector('.zip-split-layers-checkbox');
    this.addEventListener(this.splitByLayersCheckbox, 'change', this.onSplitLayersClick_);

    this.useLayerNamesContainer = document.querySelector('.use-layer-names-container');
    this.useLayerNamesCheckbox = document.querySelector('.zip-use-layer-names-checkbox');
    this.toggleHideUseLayerNamesCheckbox();

    var zipButton = document.querySelector('.zip-generate-button');
    this.addEventListener(zipButton, 'click', this.onZipButtonClick_);
  };

  ns.ZipExportController.prototype.toggleHideUseLayerNamesCheckbox = function () {
    this.useLayerNamesContainer.style.display = (this.splitByLayersCheckbox.checked ? 'block' : 'none');
  };

  ns.ZipExportController.prototype.onSplitLayersClick_ = function () {
    this.toggleHideUseLayerNamesCheckbox();
  };

  ns.ZipExportController.prototype.onZipButtonClick_ = function () {
    var zip = new window.JSZip();

    if (this.splitByLayersCheckbox.checked) {
      this.splittedExport_(zip);
    } else {
      this.mergedExport_(zip);
    }

    var fileName = this.getPixetorName_() + '.zip';

    var blob = zip.generate({
      type : 'blob'
    });

    pxtr.utils.FileUtils.downloadAsFile(blob, fileName);
  };

  ns.ZipExportController.prototype.mergedExport_ = function (zip) {
    var paddingLength = ('' + this.pixetorController.getFrameCount()).length;
    var zoom = this.exportController.getExportZoom();
    for (var i = 0; i < this.pixetorController.getFrameCount(); i++) {
      var render = this.pixetorController.renderFrameAt(i, true);
      var canvas = pxtr.utils.ImageResizer.scale(render, zoom);
      var basename = this.pngFilePrefixInput.value;
      var id = pxtr.utils.StringUtils.leftPad(i, paddingLength, '0');
      var filename = basename + id + '.png';
      zip.file(filename, pxtr.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n', {base64: true});
    }
  };

  ns.ZipExportController.prototype.splittedExport_ = function (zip) {
    var layers = this.pixetorController.getLayers();
    var framePaddingLength = ('' + this.pixetorController.getFrameCount()).length;
    var layerPaddingLength = ('' + layers.length).length;
    var zoom = this.exportController.getExportZoom();
    for (var j = 0; this.pixetorController.hasLayerAt(j); j++) {
      var layer = this.pixetorController.getLayerAt(j);
      var layerid = pxtr.utils.StringUtils.leftPad(j, layerPaddingLength, '0');
      for (var i = 0; i < this.pixetorController.getFrameCount(); i++) {
        var render = pxtr.utils.LayerUtils.renderFrameAt(layer, i, true);
        var canvas = pxtr.utils.ImageResizer.scale(render, zoom);
        var basename = this.pngFilePrefixInput.value;
        var frameid = pxtr.utils.StringUtils.leftPad(i + 1, framePaddingLength, '0');
        var filename = 'l' + layerid + '_' + basename + frameid + '.png';
        if (this.useLayerNamesCheckbox.checked) {
          filename = layer.getName() + '_' + basename + frameid + '.png';
        }
        zip.file(filename, pxtr.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n', {base64: true});
      }
    }
  };

  ns.ZipExportController.prototype.getPixetorName_ = function () {
    return this.pixetorController.getPixetor().getDescriptor().name;
  };
})();
