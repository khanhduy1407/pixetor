(function () {
  var ns = $.namespace('pxtr.controller.dialogs.importwizard.steps');

  ns.InsertLocation = function () {
    this.superclass.constructor.apply(this, arguments);
  };

  ns.InsertLocation.MODES = {
    ADD : 'add',
    INSERT : 'insert'
  };

  pxtr.utils.inherit(ns.InsertLocation, ns.AbstractImportStep);

  ns.InsertLocation.prototype.init = function () {
    this.superclass.init.call(this);
    this.framePreview = this.container.querySelector('.insert-frame-preview');
    this.currentPixetorFramePickerWidget = new pxtr.widgets.FramePicker(
      this.pixetorController.getPixetor(), this.framePreview);

    this.insertModeContainer = this.container.querySelector('.insert-mode-container');
    this.addEventListener(this.insertModeContainer, 'change', this.onInsertModeChange_);
    this.mergeData.insertMode = ns.InsertLocation.MODES.ADD;
  };

  ns.InsertLocation.prototype.onInsertModeChange_  = function () {
    var value = this.insertModeContainer.querySelector(':checked').value;
    this.mergeData.insertMode = value;

    if (this.mergeData.insertMode === ns.InsertLocation.MODES.ADD) {
      this.currentPixetorFramePickerWidget.setFirstFrameIndex(0);
    } else {
      this.currentPixetorFramePickerWidget.setFirstFrameIndex(1);
    }
  };

  ns.InsertLocation.prototype.onShow = function () {
    // Initialize the frame picker on show, to be able to calculate correctly the
    // container's offsetWidth and offsetHeight.
    this.currentPixetorFramePickerWidget.init();

    var currentFrameIndex = this.pixetorController.getCurrentFrameIndex();
    this.currentPixetorFramePickerWidget.setFrameIndex(currentFrameIndex + 1);
    this.currentPixetorFramePickerWidget.setFirstFrameIndex(0);

    this.superclass.onShow.call(this);
  };

  ns.InsertLocation.prototype.onNextClick = function () {
    var insertIndex = this.currentPixetorFramePickerWidget.getFrameIndex();
    this.mergeData.insertIndex = insertIndex;
    this.superclass.onNextClick.call(this);
  };

  ns.InsertLocation.prototype.destroy = function () {
    this.currentPixetorFramePickerWidget.destroy();
    this.superclass.destroy.call(this);
  };
})();
