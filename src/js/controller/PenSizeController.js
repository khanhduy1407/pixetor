(function () {
  var ns = $.namespace('pxtr.controller');

  ns.PenSizeController = function () {
    this.sizePicker = new pxtr.widgets.SizePicker(this.onSizePickerChanged_.bind(this));
  };

  ns.PenSizeController.prototype.init = function () {
    this.sizePicker.init(document.querySelector('.pen-size-container'));

    $.subscribe(Events.PEN_SIZE_CHANGED, this.onPenSizeChanged_.bind(this));
    this.updateSelectedOption_();
  };

  ns.PenSizeController.prototype.onSizePickerChanged_ = function (size) {
    pxtr.app.penSizeService.setPenSize(size);
  };

  ns.PenSizeController.prototype.onPenSizeChanged_ = function (e) {
    this.updateSelectedOption_();
  };

  ns.PenSizeController.prototype.updateSelectedOption_ = function () {
    var size = pxtr.app.penSizeService.getPenSize();
    this.sizePicker.setSize(size);
  };
})();
