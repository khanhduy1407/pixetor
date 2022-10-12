(function () {
  var ns = $.namespace('pxtr.model.pixetor');

  ns.Descriptor = function (name, description, isPublic) {
    this.name = name;
    this.description = description;
    this.isPublic = isPublic;
  };
})();
