(function () {

  var ns = $.namespace('pxtr.rendering');

  ns.PixetorRenderer = function (pixetorController) {
    var frames = [];
    for (var i = 0 ; i < pixetorController.getFrameCount() ; i++) {
      frames.push(pixetorController.renderFrameAt(i, true));
    }
    this.pixetorController = pixetorController;
    this.frames = frames;
  };

  ns.PixetorRenderer.prototype.renderAsCanvas = function (columns) {
    columns = columns || this.frames.length;
    var rows = Math.ceil(this.frames.length / columns);

    var canvas = this.createCanvas_(columns, rows);

    for (var i = 0 ; i < this.frames.length ; i++) {
      var frame = this.frames[i];
      var posX = (i % columns) * this.pixetorController.getWidth();
      var posY = Math.floor(i / columns) * this.pixetorController.getHeight();
      this.drawFrameInCanvas_(frame, canvas, posX, posY);
    }
    return canvas;
  };

  ns.PixetorRenderer.prototype.drawFrameInCanvas_ = function (frame, canvas, offsetWidth, offsetHeight) {
    var context = canvas.getContext('2d');
    context.drawImage(frame, offsetWidth, offsetHeight, frame.width, frame.height);
  };

  ns.PixetorRenderer.prototype.createCanvas_ = function (columns, rows) {
    var width = columns * this.pixetorController.getWidth();
    var height = rows * this.pixetorController.getHeight();
    return pxtr.utils.CanvasUtils.createCanvas(width, height);
  };
})();
