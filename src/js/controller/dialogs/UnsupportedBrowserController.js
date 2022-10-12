(function () {
  var ns = $.namespace('pxtr.controller.dialogs');

  ns.UnsupportedBrowserController = function () {};

  pxtr.utils.inherit(ns.UnsupportedBrowserController, ns.AbstractDialogController);

  ns.UnsupportedBrowserController.prototype.init = function () {
    this.superclass.init.call(this);
    var currentUserAgentElement = document.querySelector('#current-user-agent');
    currentUserAgentElement.innerText = pxtr.utils.UserAgent.getDisplayName();
  };
})();
