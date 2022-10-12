/* globals casper, setPixetorFromGrid, isDrawerExpanded, getValue, isChecked,
   evalLine, waitForEvent, replaceFunction, pixetorFrameEqualsGrid, setPixetorFromImageSrc */

casper.test.begin('Simple GIF (<256 colors) export test', 14, function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Pixetor ready, test starting');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    setPixetorFromGrid('['+
      '[R, G, B, T],' +
      '[T, R, G, B],'+
      '[B, T, R, G],'+
      '[G, B, T, R],'+
    ']');

    // Check the expected pixetor was correctly loaded.
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getWidth()'), 4, 'Pixetor width is now 4 pixels');
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getHeight()'), 4, 'Pixetor height is now 4 pixels');

    // Open export panel.
    test.assertDoesntExist('.settings-section-export', 'Check if export panel is closed');
    casper.click('[data-setting="export"]');

    casper.waitForSelector('.settings-section-export', onExportPanelReady, test.timeout, 10000);
  }

  function onExportPanelReady() {
    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-export', 'Check if export panel is opened');

    // Override download method from GIF export controller to be able to retrieve the image
    // data on the content document.
    replaceFunction(test,
      'pxtr.controller.settings.exportimage.GifExportController.prototype.downloadImageData_',
      function (imageData) {
        window.casperImageData = imageData;
        var el = document.createElement("div");
        el.id = "casper-imagedata-ready";
        document.body.appendChild(el);
      }
    );

    casper.echo('Clicking on Download GIF button');
    test.assertExists('.gif-download-button', 'The gif download button is available');
    casper.click('.gif-download-button');

    casper.echo('Wait for #casper-imagedata-ready');
    casper.waitForSelector('#casper-imagedata-ready', onImageDataReady, test.timeout, 10000);
  }

  function onImageDataReady() {
    casper.echo('Found casper-imagedata-ready element');

    // cleanup
    casper.evaluate(function () {
      document.body.removeChild(document.getElementById('casper-imagedata-ready'));
    });

    var imageData = evalLine('window.casperImageData');

    // Check the exported gif is valid
    test.assert(imageData.indexOf('data:image/gif;base64') === 0, 'The gif image data was generated');

    // Recreate a new pixetor from the source
    waitForEvent('PIXETOR_RESET', onPixetorReset, test.timeout);
    setPixetorFromImageSrc(imageData);
  }

  function onPixetorReset() {
    casper.echo('Received PIXETOR_RESET event after loading pixetor from GIF source');

    // Check the expected pixetor was correctly loaded.
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getWidth()'), 4, 'Pixetor width is now 4 pixels');
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getHeight()'), 4, 'Pixetor height is now 4 pixels');

    // Check that the pixetor content has been resized.
    test.assert(pixetorFrameEqualsGrid('['+
      '[R, G, B, T],' +
      '[T, R, G, B],' +
      '[B, T, R, G],' +
      '[G, B, T, R],' +
    ']', 0, 0), 'Imported pixetor content is as expected');

    // Click on export again to close the settings drawer.
    casper.click('[data-setting="export"]');
    casper.waitForSelector('[data-pxtr-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
  }

  startTest(test, onTestStart);
});
