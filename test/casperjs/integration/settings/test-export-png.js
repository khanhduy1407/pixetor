/* globals casper, setPixetorFromGrid, isDrawerExpanded, getValue, isChecked,
   evalLine, waitForEvent, pixetorFrameEqualsGrid, replaceFunction, setPixetorFromImageSrc */

casper.test.begin('PNG export test', 13, function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Pixetor ready, test starting');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    // Setup test Pixetor
    setPixetorFromGrid('['+
      '[B, T],' +
      '[T, B],' +
    ']');

    // Open export panel.
    test.assertDoesntExist('.settings-section-export', 'Check if export panel is closed');
    casper.click('[data-setting="export"]');

    casper.waitForSelector('.settings-section-export', onExportPanelReady, test.timeout, 10000);
  }

  function onExportPanelReady() {
    casper.echo('Export panel ready');

    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-export', 'Check if export panel is opened');

    // Switch to PNG export tab.
    test.assertDoesntExist('.export-panel-png', 'Check if PNG export panel is hidden');
    casper.click('[data-tab-id="png"]');

    casper.waitForSelector('.export-panel-png', onPngExportTabReady, test.timeout, 10000);
  }

  function onPngExportTabReady() {
    casper.echo('Png export tab ready');

    replaceFunction(test,
      'pxtr.controller.settings.exportimage.PngExportController.prototype.downloadCanvas_',
      function (canvas) {
        window.casperImageData = canvas.toDataURL('image/png');
        var el = document.createElement("div");
        el.id = "casper-imagedata-ready";
        document.body.appendChild(el);
      }
    );

    test.assertExists('.png-download-button', 'The png download button is available');

    casper.echo('Clicking on Download PNG button');
    casper.click('.png-download-button');

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
    test.assert(imageData.indexOf('data:image/png;base64') === 0, 'The png image data was generated');

    // Recreate a new pixetor from the source
    waitForEvent('PIXETOR_RESET', onPixetorReset, test.timeout);
    setPixetorFromImageSrc(imageData);
  }

  function onPixetorReset() {
    casper.echo('Received PIXETOR_RESET event after loading pixetor from GIF source');

    // Check the expected pixetor was correctly loaded.
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getWidth()'), 2, 'Pixetor width is now 2 pixels');
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getHeight()'), 2, 'Pixetor height is now 2 pixels');

    // Check that the pixetor content has been resized.
    test.assert(pixetorFrameEqualsGrid('['+
      '[B, T],' +
      '[T, B],' +
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
