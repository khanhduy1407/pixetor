(function () {
  var ns = $.namespace('pxtr.controller.settings.exportimage');

  var BLACK = '#000000';

  ns.MiscExportController = function (pixetorController) {
    this.pixetorController = pixetorController;
  };

  pxtr.utils.inherit(ns.MiscExportController, pxtr.controller.settings.AbstractSettingController);

  ns.MiscExportController.prototype.init = function () {
    var cDownloadButton = document.querySelector('.c-download-button');
    this.addEventListener(cDownloadButton, 'click', this.onDownloadCFileClick_);
  };

  ns.MiscExportController.prototype.onDownloadCFileClick_ = function (evt) {
    var fileName = this.getPixetorName_() + '.c';
    var cName = this.getPixetorName_().replace(' ','_');
    var width = this.pixetorController.getWidth();
    var height = this.pixetorController.getHeight();
    var frameCount = this.pixetorController.getFrameCount();

    // Useful defines for C routines
    var frameStr = '#include <stdint.h>\n\n';
    frameStr += '#define ' + cName.toUpperCase() + '_FRAME_COUNT ' +  this.pixetorController.getFrameCount() + '\n';
    frameStr += '#define ' + cName.toUpperCase() + '_FRAME_WIDTH ' + width + '\n';
    frameStr += '#define ' + cName.toUpperCase() + '_FRAME_HEIGHT ' + height + '\n\n';

    frameStr += '/* Pixetor data for \"' + this.getPixetorName_() + '\" */\n\n';

    frameStr += 'static const uint32_t ' + cName.toLowerCase();
    frameStr += '_data[' + frameCount + '][' + width * height + '] = {\n';

    for (var i = 0 ; i < frameCount ; i++) {
      var render = this.pixetorController.renderFrameAt(i, true);
      var context = render.getContext('2d');
      var imgd = context.getImageData(0, 0, width, height);
      var pix = imgd.data;

      frameStr += '{\n';
      for (var j = 0; j < pix.length; j += 4) {
        frameStr += this.rgbToCHex(pix[j], pix[j + 1], pix[j + 2], pix[j + 3]);
        if (j != pix.length - 4) {
          frameStr += ', ';
        }
        if (((j + 4) % (width * 4)) === 0) {
          frameStr += '\n';
        }
      }
      if (i != (frameCount - 1)) {
        frameStr += '},\n';
      } else {
        frameStr += '}\n';
      }
    }

    frameStr += '};\n';
    pxtr.utils.BlobUtils.stringToBlob(frameStr, function(blob) {
      pxtr.utils.FileUtils.downloadAsFile(blob, fileName);
    }.bind(this), 'application/text');
  };

  ns.MiscExportController.prototype.getPixetorName_ = function () {
    return this.pixetorController.getPixetor().getDescriptor().name;
  };

  ns.MiscExportController.prototype.rgbToCHex = function (r, g, b, a) {
    var hexStr = '0x';
    hexStr += ('00' + a.toString(16)).substr(-2);
    hexStr += ('00' + b.toString(16)).substr(-2);
    hexStr += ('00' + g.toString(16)).substr(-2);
    hexStr += ('00' + r.toString(16)).substr(-2);
    return hexStr;
  };
})();
