const fs = require('fs');

function onPageEvaluate(window, options, pixetor) {
    console.log("\nPixetor name: " + pixetor.descriptor.name);

    // Setup pixetorController
    var pixetorController = new pxtr.controller.pixetor.PixetorController(pixetor);

    pxtr.app.pixetorController = pixetorController;

    pixetorController.init();

    // Apply crop if enabled
    if (options.crop) {
        // Mock selection manager to avoid errors during crop
        pxtr.app.selectionManager = {};

        // Setup crop tool
        var crop = new pxtr.tools.transform.Crop();

        // Perform crop
        crop.applyTransformation();

        // Get cropped pixetor
        pixetor = pixetorController.getPixetor();
    }

    // Mock exportController to provide zoom value based on cli args
    // and to avoid errors and/or unnecessary bootstrapping
    var exportController = {
        getExportZoom: function () {
            var zoom = options.zoom;

            if (options.scaledWidth) {
                zoom = options.scaledWidth / pixetor.getWidth();
            } else if (options.scaledHeight) {
                zoom = options.scaledHeight / pixetor.getHeight();
            }

            return zoom;
        }
    };

    // Setup pngExportController
    var pngExportController = new pxtr.controller.settings.exportimage.PngExportController(pixetorController, exportController);

    // Mock getColumns and getRows to use values from cli arguments
    pngExportController.getColumns_ = function () {
        if (options.columns) return options.columns;

        if (options.rows) {
            return Math.ceil(pixetorController.getFrameCount() / pngExportController.getRows_());
        } else {
            return pngExportController.getBestFit_();
        }
    };

    pngExportController.getRows_ = function () {
        if (options.columns && !options.rows) {
            return Math.ceil(pixetorController.getFrameCount() / pngExportController.getColumns_());
        }

        return options.rows;
    };

    // Render to output canvas
    var canvas;

    if (options.frame > -1) {
        // Render a single frame
        canvas = pixetorController.renderFrameAt(options.frame, true);

        var zoom = exportController.getExportZoom();

        if (zoom != 1) {
            // Scale rendered frame
            canvas = pxtr.utils.ImageResizer.resize(canvas, canvas.width * zoom, canvas.height * zoom, false);
        }
    } else {
        // Render the sprite sheet
        canvas = pngExportController.createPngSpritesheet_();
    }

    // Add output canvas to DOM
    window.document.body.appendChild(canvas);

    // Prepare return data
    const returnData = {
        width: canvas.width,
        height: canvas.height
    };

    // Wait a tick for things to wrap up
    setTimeout(function ()  {
        // Exit and pass data to parent process
        window.callPhantom(returnData);
    }, 0);
}

function onPageExit(page, options, data) {
    // Set clip for output image
    if (data.width && data.height) {
        page.clipRect = { top: 0, left: 0, width: data.width, height: data.height };
    }

    console.log("\n" + 'Generated file(s):');

    const dest = options.dest.replace('.png', '') + '.png';

    // Render page to the output image
    page.render(dest);

    console.log(" " + dest);

    if (options.dataUri) {
        const dataUriPath = options.dest + '.datauri';

        const dataUri = 'data:image/png;base64,' + page.renderBase64('PNG');

        // Write data-uri to file
        fs.write(dataUriPath, dataUri, 'w');

        console.log(" " + dataUriPath);
    }
}

module.exports = {
    onPageEvaluate: onPageEvaluate,
    onPageExit: onPageExit
};