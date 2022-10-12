(function () {
  var ns = $.namespace('pxtr.utils');

  ns.StringUtils = {
    leftPad : function (input, length, pad) {
      var padding = new Array(length).join(pad);
      return (padding + input).slice(-length);
    },

    formatSize : function (width, height) {
      return width + '\u00D7' + height;
    }
  };
})();
