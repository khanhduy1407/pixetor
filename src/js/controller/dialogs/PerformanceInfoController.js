(function () {
  var ns = $.namespace('pxtr.controller.dialogs');

  ns.PerformanceInfoController = function () {};

  pxtr.utils.inherit(ns.PerformanceInfoController, ns.AbstractDialogController);

  ns.PerformanceInfoController.prototype.init = function () {
    this.superclass.init.call(this);
  };
})();
