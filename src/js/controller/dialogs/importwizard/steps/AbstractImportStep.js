(function () {
  var ns = $.namespace('pxtr.controller.dialogs.importwizard.steps');

  ns.AbstractImportStep = function (pixetorController, importController, container) {
    this.pixetorController = pixetorController;
    this.container = container;
    this.importController = importController;
    this.mergeData = this.importController.mergeData;
  };

  ns.AbstractImportStep.prototype.init = function () {
    this.nextButton = this.container.querySelector('.import-next-button');
    this.backButton = this.container.querySelector('.import-back-button');

    this.addEventListener(this.nextButton, 'click', this.onNextClick);
    this.addEventListener(this.backButton, 'click', this.onBackClick);
  };

  ns.AbstractImportStep.prototype.addEventListener = function (el, type, cb) {
    pxtr.utils.Event.addEventListener(el, type, cb, this);
  };

  ns.AbstractImportStep.prototype.destroy = function () {
    if (this.framePickerWidget) {
      this.framePickerWidget.destroy();
    }

    pxtr.utils.Event.removeAllEventListeners(this);
  };

  ns.AbstractImportStep.prototype.onNextClick = function () {
    this.importController.next(this);
  };

  ns.AbstractImportStep.prototype.onBackClick = function () {
    this.importController.back(this);
  };

  ns.AbstractImportStep.prototype.onShow = function () {
    var mergePixetor = this.mergeData.mergePixetor;
    if (!mergePixetor) {
      return;
    }

    if (!this.framePickerWidget) {
      var framePickerContainer = this.container.querySelector('.import-preview');
      this.framePickerWidget = new pxtr.widgets.FramePicker(mergePixetor, framePickerContainer);
      this.framePickerWidget.init();
    } else if (this.framePickerWidget.pixetor != mergePixetor) {
      // If the pixetor displayed by the frame picker is different from the previous one,
      // refresh the widget.
      this.framePickerWidget.pixetor = mergePixetor;
      this.framePickerWidget.setFrameIndex(1);
    }

    var metaHtml = pxtr.utils.Template.getAndReplace('import-meta-content', {
      name : mergePixetor.getDescriptor().name,
      dimensions : pxtr.utils.StringUtils.formatSize(mergePixetor.getWidth(), mergePixetor.getHeight()),
      frames : mergePixetor.getFrameCount(),
      layers : mergePixetor.getLayers().length
    });
    this.container.querySelector('.import-meta').innerHTML = metaHtml;
  };

})();
