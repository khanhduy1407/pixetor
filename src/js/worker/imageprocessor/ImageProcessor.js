(function () {
  var ns = $.namespace('pxtr.worker.imageprocessor');

  ns.ImageProcessor = function (image, onSuccess, onStep, onError) {
    this.image = image;

    this.onStep = onStep;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.worker = pxtr.utils.WorkerUtils.createWorker(ns.ImageProcessorWorker, 'image-colors-processor');
    this.worker.onmessage = this.onWorkerMessage.bind(this);
  };

  ns.ImageProcessor.prototype.process = function () {
    var canvas = pxtr.utils.CanvasUtils.createFromImage(this.image);
    var imageData = pxtr.utils.CanvasUtils.getImageDataFromCanvas(canvas);
    this.worker.postMessage({
      imageData : imageData,
      width : this.image.width,
      height : this.image.height
    });
  };

  ns.ImageProcessor.prototype.onWorkerMessage = function (event) {
    if (event.data.type === 'STEP') {
      this.onStep(event);
    } else if (event.data.type === 'SUCCESS') {
      this.onSuccess(event);
      this.worker.terminate();
    } else if (event.data.type === 'ERROR') {
      this.onError(event);
      this.worker.terminate();
    }
  };
})();
