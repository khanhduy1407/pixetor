(function () {
  var ns = $.namespace('pxtr.service');

  ns.FileDropperService = function (pixetorController) {
    this.pixetorController = pixetorController;
    this.dropPosition_ = null;
  };

  ns.FileDropperService.prototype.init = function () {
    document.body.addEventListener('drop', this.onFileDrop.bind(this), false);
    document.body.addEventListener('dragover', this.onFileDragOver.bind(this), false);
  };

  ns.FileDropperService.prototype.onFileDragOver = function (event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  ns.FileDropperService.prototype.onFileDrop = function (event) {
    event.preventDefault();
    event.stopPropagation();

    this.dropPosition_ = {
      x : event.clientX,
      y : event.clientY
    };

    var files = event.dataTransfer.files;
    this.isMultipleFiles_ = (files.length > 1);

    for (var i = 0; i < files.length ; i++) {
      var file = files[i];
      var isImage = file.type.indexOf('image') === 0;
      var isPixetor = /\.pixetor$/i.test(file.name);
      var isPalette = /\.(gpl|txt|pal)$/i.test(file.name);
      if (isImage) {
        pxtr.utils.FileUtils.readImageFile(file, function (image) {
          this.onImageLoaded_(image, file);
        }.bind(this));
      } else if (isPixetor) {
        pxtr.utils.PixetorFileUtils.loadFromFile(file, this.onPixetorFileLoaded_, this.onPixetorFileError_);
      } else if (isPalette) {
        pxtr.app.paletteImportService.read(file, this.onPaletteLoaded_.bind(this));
      }
    }
  };

  ns.FileDropperService.prototype.onPaletteLoaded_ = function (palette) {
    pxtr.app.paletteService.savePalette(palette);
    pxtr.UserSettings.set(pxtr.UserSettings.SELECTED_PALETTE, palette.id);
  };

  ns.FileDropperService.prototype.onPixetorFileLoaded_ = function (pixetor) {
    if (window.confirm(Constants.CONFIRM_OVERWRITE)) {
      pxtr.app.pixetorController.setPixetor(pixetor);
    }
  };

  ns.FileDropperService.prototype.onPixetorFileError_ = function (reason) {
    $.publish(Events.PIXETOR_FILE_IMPORT_FAILED, [reason]);
  };

  ns.FileDropperService.prototype.onImageLoaded_ = function (importedImage, file) {
    var pixetorWidth = pxtr.app.pixetorController.getWidth();
    var pixetorHeight = pxtr.app.pixetorController.getHeight();

    if (this.isMultipleFiles_) {
      this.pixetorController.addFrameAtCurrentIndex();
      this.pixetorController.selectNextFrame();
    } else if (importedImage.width > pixetorWidth || importedImage.height > pixetorHeight) {
      // For single file imports, if the file is too big, trigger the import wizard.
      $.publish(Events.DIALOG_SHOW, {
        dialogId : 'import',
        initArgs : {
          rawFiles: [file]
        }
      });

      return;
    }

    var currentFrame = this.pixetorController.getCurrentFrame();
    // Convert client coordinates to sprite coordinates
    var spriteDropPosition = pxtr.app.drawingController.getSpriteCoordinates(
      this.dropPosition_.x,
      this.dropPosition_.y
    );

    var x = spriteDropPosition.x;
    var y = spriteDropPosition.y;

    pxtr.utils.FrameUtils.addImageToFrame(currentFrame, importedImage, x, y);

    $.publish(Events.PIXETOR_RESET);
    $.publish(Events.PIXETOR_SAVE_STATE, {
      type : pxtr.service.HistoryService.SNAPSHOT
    });
  };

})();
