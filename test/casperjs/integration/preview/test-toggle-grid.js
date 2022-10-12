/* globals casper, setPixetorFromGrid, isDrawerExpanded, getValue, isChecked,
   evalLine, waitForEvent, replaceFunction, setPixetorFromImageSrc */

casper.test.begin('Test toggling the grid using the animated preview toggle grid icon', 9, function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  var GRID_BUTTON_CLASS = 'toggle-grid-button';
  var ACTIVE_GRID_BUTTON_CLASS = 'icon-minimap-grid-gold';
  var INACTIVE_GRID_BUTTON_CLASS = 'icon-minimap-grid-white';

  function isGridEnabled_() {
    return evalLine('pxtr.UserSettings.get(pxtr.UserSettings.GRID_ENABLED)');
  }

  function gridButtonHasClass_(className) {
    var gridButtonClassname = getClassName('.' + GRID_BUTTON_CLASS);
    return gridButtonClassname.indexOf(className) != -1
  }

  function isGridButtonActive_() {
    return gridButtonHasClass_(ACTIVE_GRID_BUTTON_CLASS) && !gridButtonHasClass_(INACTIVE_GRID_BUTTON_CLASS);
  }

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Pixetor ready, test starting');

    casper.echo('Check that initially grid is disabled and grid button is inactive');
    test.assertEquals(isGridEnabled_(), false, 'Grid is not enabled');
    test.assert(!isGridButtonActive_(), 'Grid button is not active');

    casper.echo('Click on grid button to enable grid');
    casper.click('.' + GRID_BUTTON_CLASS);
    casper.waitForSelector('.' + ACTIVE_GRID_BUTTON_CLASS, onGridEnabled, test.timeout, 10000);
  }

  function onGridEnabled() {
    casper.echo('Check that grid is now enabled and grid button is active');
    test.assertEquals(isGridEnabled_(), true, 'Grid is enabled');
    test.assert(isGridButtonActive_(), 'Grid button is active');

    casper.echo('Click again on grid button to disable grid');
    casper.click('.' + GRID_BUTTON_CLASS);
    casper.waitForSelector('.' + INACTIVE_GRID_BUTTON_CLASS, onGridDisabled, test.timeout, 10000);
  }

  function onGridDisabled() {
    casper.echo('Check that grid is disabled again and grid button is inactive');
    test.assertEquals(isGridEnabled_(), false, 'Grid is not enabled');
    test.assert(!isGridButtonActive_(), 'Grid button is not active');
    casper.click('.' + GRID_BUTTON_CLASS);

    casper.echo('Enable grid via user settings');
    evalLine('pxtr.UserSettings.set(pxtr.UserSettings.GRID_ENABLED, true)');
    casper.waitForSelector('.' + ACTIVE_GRID_BUTTON_CLASS, onGridEnabledViaSettings, test.timeout, 10000);
  }

  function onGridEnabledViaSettings() {
    casper.echo('Check that grid is finally enabled and grid button is active');
    test.assertEquals(isGridEnabled_(), true, 'Grid is enabled');
    test.assert(isGridButtonActive_(), 'Grid button is active');
    // Test end
  }

  startTest(test, onTestStart);
});
