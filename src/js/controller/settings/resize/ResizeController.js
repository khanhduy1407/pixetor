(function () {
  var ns = $.namespace('pxtr.controller.settings.resize');

  ns.ResizeController = function (pixetorController) {
    this.pixetorController = pixetorController;

    this.container = document.querySelector('.resize-canvas');

    var anchorWidgetContainer = this.container.querySelector('.resize-anchor-container');
    this.anchorWidget = new pxtr.widgets.AnchorWidget(anchorWidgetContainer);
    this.defaultSizeController = new ns.DefaultSizeController(pixetorController);
  };

  pxtr.utils.inherit(ns.ResizeController, pxtr.controller.settings.AbstractSettingController);

  ns.ResizeController.prototype.init = function () {
    this.widthInput = this.container.querySelector('[name="resize-width"]');
    this.heightInput = this.container.querySelector('[name="resize-height"]');
    this.resizeForm = this.container.querySelector('form');
    this.resizeContentCheckbox = this.container.querySelector('.resize-content-checkbox');
    this.maintainRatioCheckbox = this.container.querySelector('.resize-ratio-checkbox');

    this.sizeInputWidget = new pxtr.widgets.SizeInput({
      widthInput: this.widthInput,
      heightInput: this.heightInput,
      initWidth: this.pixetorController.getWidth(),
      initHeight: this.pixetorController.getHeight(),
    });

    var settings = pxtr.UserSettings.get('RESIZE_SETTINGS');
    var origin = pxtr.widgets.AnchorWidget.ORIGIN[settings.origin] || 'TOPLEFT';
    this.anchorWidget.setOrigin(origin);

    if (settings.resizeContent) {
      this.resizeContentCheckbox.checked = true;
      this.anchorWidget.disable();
    }

    if (settings.maintainRatio) {
      this.maintainRatioCheckbox.checked = true;
    } else {
      // the SizeInput widget is enabled by default
      this.sizeInputWidget.disableSync();
    }

    this.addEventListener(this.resizeForm, 'submit', this.onResizeFormSubmit_);
    this.addEventListener(this.resizeContentCheckbox, 'change', this.onResizeContentChange_);
    this.addEventListener(this.maintainRatioCheckbox, 'change', this.onMaintainRatioChange_);

    this.defaultSizeController.init();
  };

  ns.ResizeController.prototype.destroy = function () {
    this.updateUserPreferences_();

    this.anchorWidget.destroy();
    this.sizeInputWidget.destroy();
    this.superclass.destroy.call(this);
  };

  ns.ResizeController.prototype.onResizeFormSubmit_ = function (evt) {
    evt.preventDefault();

    var currentPixetor = this.pixetorController.getPixetor();
    var pixetor = pxtr.utils.ResizeUtils.resizePixetor(currentPixetor, {
      width :  parseInt(this.widthInput.value, 10),
      height :  parseInt(this.heightInput.value, 10),
      origin: this.anchorWidget.getOrigin(),
      resizeContent: this.resizeContentCheckbox.checked
    });

    pxtr.app.pixetorController.setPixetor(pixetor, {
      preserveState: true
    });

    $.publish(Events.CLOSE_SETTINGS_DRAWER);
  };

  ns.ResizeController.prototype.onResizeContentChange_ = function (evt) {
    var target = evt.target;
    if (target.checked) {
      this.anchorWidget.disable();
    } else {
      this.anchorWidget.enable();
    }
  };

  ns.ResizeController.prototype.onMaintainRatioChange_ = function (evt) {
    var target = evt.target;
    if (target.checked) {
      this.sizeInputWidget.enableSync();
    } else {
      this.sizeInputWidget.disableSync();
    }
  };

  ns.ResizeController.prototype.updateUserPreferences_ = function () {
    pxtr.UserSettings.set('RESIZE_SETTINGS', {
      origin : this.anchorWidget.getOrigin(),
      resizeContent : !!this.resizeContentCheckbox.checked,
      maintainRatio : !!this.maintainRatioCheckbox.checked
    });
  };
})();
