(function () {
  var ns = $.namespace('pxtr.devtools');

  ns.init = function () {
    var href = document.location.href.toLowerCase();
    // test tools
    var testModeOn = href.indexOf('test=true') !== -1;
    if (testModeOn) {
      this.testRecorder = new pxtr.devtools.DrawingTestRecorder(pxtr.app.pixetorController);
      this.testRecorder.init();

      this.testRecordController = new pxtr.devtools.TestRecordController(this.testRecorder);
      this.testRecordController.init();
    }

    // test tools
    var runTestModeOn = href.indexOf('test-run=') !== -1;
    if (runTestModeOn) {
      var testPath = href.split('test-run=')[1];
      this.testRunner = new pxtr.devtools.DrawingTestRunner(testPath);
      this.testRunner.start();
    }

    // test tools
    var runSuiteModeOn = href.indexOf('test-suite=') !== -1;
    if (runSuiteModeOn) {
      var suitePath = href.split('test-suite=')[1];
      this.testSuiteController = new pxtr.devtools.DrawingTestSuiteController(suitePath);
      this.testSuiteController.init();
      this.testSuiteController.start();
    }
  };

})();
