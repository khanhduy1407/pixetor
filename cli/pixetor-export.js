// PhantomJS system
const system = require('system');

// Exporter
const exporter = require('./export-png');

// Get passed args
const args = system.args;

// Parse input pixetor file and options
const pixetorFile = JSON.parse(args[1]);
const options = JSON.parse(args[2]);

// Create page w/ canvas
const page = require('webpage').create();

page.content = '<html><body></body></html>';

// Inject Pixetor JS
page.injectJs(options.pixetorAppJsPath);

// Listen for page console logs
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

// Run page logic
page.evaluate(function (pixetorFile, options, onPageEvaluate) {
    // Zero out default body margin
    document.body.style.margin = 0;

    // Deserialize pixetor file and run exporter's page evaluate task
    pxtr.utils.serialization.Deserializer.deserialize(pixetorFile, function (pixetor) {
       onPageEvaluate(window, options, pixetor);
    });
}, pixetorFile, options, exporter.onPageEvaluate);

// Wait for page to trigger exit
page.onCallback = function (data) {
    // Run exporter page exit task
    exporter.onPageExit(page, options, data);

    // Exit
    phantom.exit(0);
};
