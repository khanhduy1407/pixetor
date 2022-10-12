/* globals casper */

/**
 * Collection of shared methods for casperjs integration tests.
 */

function evalLine(line) {
  return casper.evaluate(
    'function () {return ' + line + '}'
  );
}

function getValue(selector) {
  return casper.evaluate(
    'function () { \
      return document.querySelector(\'' + selector + '\').value;\
    }');
}

function getClassName(selector) {
  return casper.evaluate(
    'function () { \
      return document.querySelector(\'' + selector + '\').className;\
    }');
}

function isChecked(selector) {
  return casper.evaluate(
    'function () { \
      return document.querySelector(\'' + selector + '\').checked;\
    }');
}

function setPixetorFromGrid(grid) {
  casper.evaluate(
    'function () {\
      var B = "#0000FF", T = Constants.TRANSPARENT_COLOR;\
      var R = "#FF0000", G = "#00FF00";\
      var grid = pxtr.utils.FrameUtils.toFrameGrid(' + grid + ');\
      var frame = pxtr.model.Frame.fromPixelGrid(grid);\
      var layer = pxtr.model.Layer.fromFrames("l1", [frame]);\
      var pixetor = pxtr.model.Pixetor.fromLayers([layer], 12, {name : "test", description : ""});\
      pxtr.app.pixetorController.setPixetor(pixetor);\
    }');
}

function pixetorFrameEqualsGrid(grid, layer, frame) {
  return casper.evaluate(
    'function () {\
      var B = "#0000FF", T = Constants.TRANSPARENT_COLOR;\
      var R = "#FF0000", G = "#00FF00";\
      var pixetor = pxtr.app.pixetorController.getPixetor();\
      var frame = pixetor.getLayerAt(' + layer +').getFrameAt(' + frame + ');\
      var grid = ' + grid +';\
      var isValid = true;\
      var log = [];\
      frame.forEachPixel(function (color, col, row) {\
        if (pxtr.utils.colorToInt(color) !== pxtr.utils.colorToInt(grid[row][col])) {\
          log.push(color, grid[row][col]);\
        }\
        isValid = isValid && pxtr.utils.colorToInt(color) === pxtr.utils.colorToInt(grid[row][col]);\
      });\
      return isValid;\
    }');
}

function isDrawerExpanded() {
  return casper.evaluate(function () {
    var settingsElement = document.querySelector('[data-pxtr-controller="settings"]');
    return settingsElement.classList.contains('expanded');
  });
}

/**
 * Wait for the provided pixetor specific event.
 *
 * @param  {String} eventName
 *         name of the event to listen to
 * @param  {Function} onSuccess
 *         callback to call when the event is successfully catched
 * @param  {Function} onError
 *         callback to call when failing to get the event (most likely, timeout)
 */
function waitForEvent(eventName, onSuccess, onError) {
  var cleanup = function () {
    casper.evaluate(
    'function () {\
      document.body.removeChild(document.getElementById("casper-' + eventName +'"));\
    }');
  };

  casper.echo("Waiting for casper element");
  casper.waitForSelector('#casper-' + eventName, function () {
    // success
    casper.echo("Successfully received event", eventName);
    cleanup();
    onSuccess();
  }, function () {
    // error
    casper.echo("Failed to receive event", eventName);
    cleanup();
    onError();
  }, 10000);

  casper.echo("Subscribe to event:", eventName);
  casper.evaluate(
    'function () {\
      $.subscribe("' + eventName + '", function onCasperEvent() {\
        $.unsubscribe("' + eventName + '", onCasperEvent);\
        var el = document.createElement("div");\
        el.id = "casper-' + eventName +'";\
        document.body.appendChild(el);\
      });\
    }');
}

function replaceFunction(test, path, method) {
  // Check the path provided corresponds to an existing method, otherwise the
  // test probably needs to be updated.
  test.assertEquals(evalLine('typeof ' + path), 'function',
    path + ' is still a function');

  // Replace the method in content.
  casper.evaluate('function () {' + path + ' = ' + method + '}');
}

function setPixetorFromImageSrc(src) {
  casper.evaluate(
    'function () {\
      pxtr.utils.FrameUtils.createFromImageSrc("' + src + '", false, function (frame) {\
        var layer = pxtr.model.Layer.fromFrames("l1", [frame]);\
        var pixetor = pxtr.model.Pixetor.fromLayers([layer], 12, {\
          name: "pixetor",\
          description: "description"\
        });\
        pxtr.app.pixetorController.setPixetor(pixetor);\
      });\
    }');
}

/**
 * Load the pixetor website in debug mode and call the provided callback when ready.
 */
function startTest(test, callback) {
  return casper
    // Pass "integration-test" to avoid the "unsupported browser" dialog
    .start(casper.cli.get('baseUrl')+"/?debug&integration-test")
    .then(function () {
      casper.echo("URL loaded");

      casper.evaluate(function() {
        localStorage.clear();
      }, {});
      casper.echo("Local storage cleaned");

      casper.waitForSelector('#drawing-canvas-container canvas', callback, test.timeout, 20000);
    })
    .run(function () {
      test.done();
    });
}
