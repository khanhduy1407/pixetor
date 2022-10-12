/**
 * @require Constants
 * @require Events
 */
(function () {
  var ns = $.namespace('pxtr');
  /**
   * Main application controller
   */
  ns.app = {

    init : function () {
      /**
       * When started from APP Engine, appEngineToken_ (Boolean) should be set on window.pxtr
       */
      this.isAppEngineVersion = !!pxtr.appEngineToken_;

      // This id is used to keep track of sessions in the BackupService.
      this.sessionId = pxtr.utils.Uuid.generate();

      this.shortcutService = new pxtr.service.keyboard.ShortcutService();
      this.shortcutService.init();

      var size = pxtr.UserSettings.get(pxtr.UserSettings.DEFAULT_SIZE);
      var fps = Constants.DEFAULT.FPS;
      var descriptor = new pxtr.model.pixetor.Descriptor('New Pixetor', '');
      var pixetor = new pxtr.model.Pixetor(size.width, size.height, fps, descriptor);

      var layer = new pxtr.model.Layer('Layer 1');
      var frame = new pxtr.model.Frame(size.width, size.height);

      layer.addFrame(frame);
      pixetor.addLayer(layer);

      this.corePixetorController = new pxtr.controller.pixetor.PixetorController(pixetor);
      this.corePixetorController.init();

      this.pixetorController = new pxtr.controller.pixetor.PublicPixetorController(this.corePixetorController);
      this.pixetorController.init();

      this.paletteImportService = new pxtr.service.palette.PaletteImportService();
      this.paletteImportService.init();

      this.paletteService = new pxtr.service.palette.PaletteService();
      this.paletteService.addDynamicPalette(new pxtr.service.palette.CurrentColorsPalette());

      this.selectedColorsService = new pxtr.service.SelectedColorsService();
      this.selectedColorsService.init();

      this.mouseStateService = new pxtr.service.MouseStateService();
      this.mouseStateService.init();

      this.paletteController = new pxtr.controller.PaletteController();
      this.paletteController.init();

      this.currentColorsService = new pxtr.service.CurrentColorsService(this.pixetorController);
      this.currentColorsService.init();

      this.palettesListController = new pxtr.controller.PalettesListController(this.currentColorsService);
      this.palettesListController.init();

      this.cursorCoordinatesController = new pxtr.controller.CursorCoordinatesController(this.pixetorController);
      this.cursorCoordinatesController.init();

      this.drawingController = new pxtr.controller.DrawingController(
        this.pixetorController,
        document.querySelector('#drawing-canvas-container'));
      this.drawingController.init();

      this.previewController = new pxtr.controller.preview.PreviewController(
        this.pixetorController,
        document.querySelector('#animated-preview-canvas-container'));
      this.previewController.init();

      this.minimapController = new pxtr.controller.MinimapController(
        this.pixetorController,
        this.previewController,
        this.drawingController,
        document.querySelector('.minimap-container'));
      this.minimapController.init();

      this.framesListController = new pxtr.controller.FramesListController(
        this.pixetorController,
        document.querySelector('#preview-list-wrapper'));
      this.framesListController.init();

      this.layersListController = new pxtr.controller.LayersListController(this.pixetorController);
      this.layersListController.init();

      this.settingsController = new pxtr.controller.settings.SettingsController(this.pixetorController);
      this.settingsController.init();

      this.dialogsController = new pxtr.controller.dialogs.DialogsController(this.pixetorController);
      this.dialogsController.init();

      this.toolController = new pxtr.controller.ToolController();
      this.toolController.init();

      this.selectionManager = new pxtr.selection.SelectionManager(this.pixetorController);
      this.selectionManager.init();

      this.historyService = new pxtr.service.HistoryService(this.pixetorController);
      this.historyService.init();

      this.notificationController = new pxtr.controller.NotificationController();
      this.notificationController.init();

      this.transformationsController = new pxtr.controller.TransformationsController();
      this.transformationsController.init();

      this.progressBarController = new pxtr.controller.ProgressBarController();
      this.progressBarController.init();

      this.canvasBackgroundController = new pxtr.controller.CanvasBackgroundController();
      this.canvasBackgroundController.init();

      this.indexedDbStorageService = new pxtr.service.storage.IndexedDbStorageService(this.pixetorController);
      this.indexedDbStorageService.init();

      this.localStorageService = new pxtr.service.storage.LocalStorageService(this.pixetorController);
      this.localStorageService.init();

      this.fileDownloadStorageService = new pxtr.service.storage.FileDownloadStorageService(this.pixetorController);
      this.fileDownloadStorageService.init();

      this.desktopStorageService = new pxtr.service.storage.DesktopStorageService(this.pixetorController);
      this.desktopStorageService.init();

      this.galleryStorageService = new pxtr.service.storage.GalleryStorageService(this.pixetorController);
      this.galleryStorageService.init();

      this.storageService = new pxtr.service.storage.StorageService(this.pixetorController);
      this.storageService.init();

      this.importService = new pxtr.service.ImportService(this.pixetorController);
      this.importService.init();

      this.imageUploadService = new pxtr.service.ImageUploadService();
      this.imageUploadService.init();

      this.savedStatusService = new pxtr.service.SavedStatusService(
        this.pixetorController,
        this.historyService);
      this.savedStatusService.init();

      this.backupService = new pxtr.service.BackupService(this.pixetorController);
      this.backupService.init();

      this.beforeUnloadService = new pxtr.service.BeforeUnloadService(this.pixetorController);
      this.beforeUnloadService.init();

      this.headerController = new pxtr.controller.HeaderController(
        this.pixetorController,
        this.savedStatusService);
      this.headerController.init();

      this.penSizeService = new pxtr.service.pensize.PenSizeService();
      this.penSizeService.init();

      this.penSizeController = new pxtr.controller.PenSizeController();
      this.penSizeController.init();

      this.fileDropperService = new pxtr.service.FileDropperService(this.pixetorController);
      this.fileDropperService.init();

      this.userWarningController = new pxtr.controller.UserWarningController(this.pixetorController);
      this.userWarningController.init();

      this.performanceReportService = new pxtr.service.performance.PerformanceReportService(
        this.pixetorController,
        this.currentColorsService);
      this.performanceReportService.init();

      this.clipboardService = new pxtr.service.ClipboardService(this.pixetorController);
      this.clipboardService.init();

      this.drawingLoop = new pxtr.rendering.DrawingLoop();
      this.drawingLoop.addCallback(this.render, this);
      this.drawingLoop.start();

      this.initTooltips_();

      var pixetorData = this.getPixetorInitData_();
      if (pixetorData && pixetorData.pixetor) {
        this.loadPixetor_(pixetorData);
      }

      if (pxtr.devtools) {
        pxtr.devtools.init();
      }

      if (pxtr.utils.Environment.detectNodeWebkit() && pxtr.utils.UserAgent.isMac) {
        var gui = require('nw.gui');
        var mb = new gui.Menu({type : 'menubar'});
        mb.createMacBuiltin('Pixetor');
        gui.Window.get().menu = mb;
      }

      if (!pxtr.utils.Environment.isIntegrationTest() && pxtr.utils.UserAgent.isUnsupported()) {
        $.publish(Events.DIALOG_SHOW, {
          dialogId : 'unsupported-browser'
        });
      }

      if (pxtr.utils.Environment.isDebug()) {
        pxtr.app.shortcutService.registerShortcut(pxtr.service.keyboard.Shortcuts.DEBUG.RELOAD_STYLES,
          window.reloadStyles);
      }
    },

    loadPixetor_ : function (pixetorData) {
      var serializedPixetor = pixetorData.pixetor;
      pxtr.utils.serialization.Deserializer.deserialize(serializedPixetor, function (pixetor) {
        pxtr.app.pixetorController.setPixetor(pixetor);
        $.publish(Events.PIXETOR_SAVED);
        if (pixetorData.descriptor) {
          // Backward compatibility for v2 or older
          pixetor.setDescriptor(pixetorData.descriptor);
        }
      });
    },

    getPixetorInitData_ : function () {
      return pxtr.appEnginePixetorData_;
    },

    isLoggedIn : function () {
      var pixetorData = this.getPixetorInitData_();
      return pixetorData && pixetorData.isLoggedIn;
    },

    initTooltips_ : function () {
      $('body').tooltip({
        selector: '[rel=tooltip]'
      });
    },

    render : function (delta) {
      this.drawingController.render(delta);
      this.previewController.render(delta);
      this.framesListController.render(delta);
    },

    getFirstFrameAsPng : function () {
      var frame = pxtr.utils.LayerUtils.mergeFrameAt(this.pixetorController.getLayers(), 0);
      var canvas;
      if (frame instanceof pxtr.model.frame.RenderedFrame) {
        canvas = pxtr.utils.CanvasUtils.createFromImage(frame.getRenderedFrame());
      } else {
        canvas = pxtr.utils.FrameUtils.toImage(frame);
      }
      return canvas.toDataURL('image/png');
    },

    getFramesheetAsPng : function () {
      var renderer = new pxtr.rendering.PixetorRenderer(this.pixetorController);
      var framesheetCanvas = renderer.renderAsCanvas();
      return framesheetCanvas.toDataURL('image/png');
    }
  };
})();

