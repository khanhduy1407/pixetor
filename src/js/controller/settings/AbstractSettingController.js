(function () {
  var ns = $.namespace('pxtr.controller.settings');
  ns.AbstractSettingController = function () {};

  ns.AbstractSettingController.prototype.addEventListener = function (el, type, callback) {
    pxtr.utils.Event.addEventListener(el, type, callback, this);
  };

  ns.AbstractSettingController.prototype.destroy = function () {
    pxtr.utils.Event.removeAllEventListeners(this);
    this.nullifyDomReferences_();
  };

  ns.AbstractSettingController.prototype.nullifyDomReferences_ = function () {
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        var isHTMLElement = this[key] && this[key].nodeName;
        if (isHTMLElement) {
          this[key] = null;
        }
      }
    }
  };
})();
