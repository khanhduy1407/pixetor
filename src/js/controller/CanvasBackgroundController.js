(function () {
  var ns = $.namespace('pxtr.controller');

  ns.CanvasBackgroundController = function () {
    this.body = document.body;
  };

  ns.CanvasBackgroundController.prototype.init = function () {
    $.subscribe(Events.USER_SETTINGS_CHANGED, this.onUserSettingsChange_.bind(this));
    this.updateBackgroundClass_(pxtr.UserSettings.get(pxtr.UserSettings.CANVAS_BACKGROUND));
  };

  ns.CanvasBackgroundController.prototype.onUserSettingsChange_ = function (evt, settingName, settingValue) {
    if (settingName == pxtr.UserSettings.CANVAS_BACKGROUND) {
      this.updateBackgroundClass_(settingValue);
    }
  };

  ns.CanvasBackgroundController.prototype.updateBackgroundClass_ = function (newClass) {
    var currentClass = this.body.dataset.currentBackgroundClass;
    if (currentClass) {
      this.body.classList.remove(currentClass);
    }
    this.body.classList.add(newClass);
    this.body.dataset.currentBackgroundClass = newClass;
  };
})();
