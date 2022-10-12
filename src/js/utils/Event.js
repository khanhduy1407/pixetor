(function () {
  var ns = $.namespace('pxtr.utils');

  ns.Event = {};

  ns.Event.addEventListener = function (el, type, callback, scope, args) {
    if (typeof el === 'string') {
      el = document.querySelector(el);
    }

    var listener = {
      el : el,
      type : type,
      callback : callback,
      handler : args ? callback.bind(scope, args) : callback.bind(scope)
    };

    scope.__pxtr_listeners = scope.__pxtr_listeners || [];
    scope.__pxtr_listeners.push(listener);
    el.addEventListener(type, listener.handler);
  };

  ns.Event.removeEventListener = function (el, type, callback, scope) {
    if (scope && scope.__pxtr_listeners) {
      var listeners = scope.__pxtr_listeners;
      for (var i = 0 ; i < listeners.length ; i++) {
        var listener = listeners[i];
        if (listener.callback === callback && listener.el === el  && listener.type === type) {
          el.removeEventListener(type, listeners[i].handler);
          listeners.splice(i, 1);
          break;
        }
      }
    }
  };

  ns.Event.removeAllEventListeners = function (scope) {
    if (scope && scope.__pxtr_listeners) {
      var listeners = scope.__pxtr_listeners;
      for (var i = 0 ; i < listeners.length ; i++) {
        var listener = listeners[i];
        listener.el.removeEventListener(listener.type, listener.handler);
      }
      scope.__pxtr_listeners = [];
    }
  };
})();
