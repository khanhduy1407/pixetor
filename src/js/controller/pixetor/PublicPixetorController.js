(function () {
  var ns = $.namespace('pxtr.controller.pixetor');

  /**
   * The PublicPixetorController is a decorator on PixetorController, provides the same API
   * but will fire RESET/SAVE events when appropriate so that other objects get notified
   * when important changes are made on the current Pixetor.
   * @param {PixetorController} pixetorController the wrapped PixetorController
   */
  ns.PublicPixetorController = function (pixetorController) {
    this.pixetorController = pixetorController;
    pxtr.utils.wrap(this, this.pixetorController);
  };

  ns.PublicPixetorController.prototype.init = function () {
    // DECORATED WITH RESET
    this.resetWrap_('setCurrentFrameIndex');
    this.resetWrap_('selectNextFrame');
    this.resetWrap_('selectPreviousFrame');
    this.resetWrap_('setCurrentLayerIndex');
    this.resetWrap_('selectLayer');
    // DECORATED WITH SAVE, NO RESET
    this.saveWrap_('renameLayerAt', false);
    // DECORATED WITH SAVE, WITH RESET
    this.saveWrap_('removeCurrentLayer', true);
    this.saveWrap_('addFrame', true);
    this.saveWrap_('addFrameAtCurrentIndex', true);
    this.saveWrap_('addFrameAt', true);
    this.saveWrap_('removeFrameAt', true);
    this.saveWrap_('duplicateCurrentFrame', true);
    this.saveWrap_('duplicateFrameAt', true);
    this.saveWrap_('moveFrame', true);
    this.saveWrap_('createLayer', true);
    this.saveWrap_('duplicateCurrentLayer', true);
    this.saveWrap_('mergeDownLayerAt', true);
    this.saveWrap_('moveLayerUp', true);
    this.saveWrap_('moveLayerDown', true);
    this.saveWrap_('removeCurrentLayer', true);
    this.saveWrap_('setLayerOpacityAt', true);
    this.saveWrap_('toggleFrameVisibilityAt', true);

    var shortcuts = pxtr.service.keyboard.Shortcuts;
    pxtr.app.shortcutService.registerShortcut(shortcuts.MISC.PREVIOUS_FRAME, this.selectPreviousFrame.bind(this));
    pxtr.app.shortcutService.registerShortcut(shortcuts.MISC.NEXT_FRAME, this.selectNextFrame.bind(this));
    pxtr.app.shortcutService.registerShortcut(shortcuts.MISC.NEW_FRAME, this.addFrameAtCurrentIndex.bind(this));
    pxtr.app.shortcutService.registerShortcut(shortcuts.MISC.DUPLICATE_FRAME, this.duplicateCurrentFrame.bind(this));
  };

  ns.PublicPixetorController.prototype.getWrappedPixetorController = function () {
    return this.pixetorController;
  };

  /**
   * Set the current pixetor. Will reset the selected frame and layer unless specified
   * @param {Object} pixetor
   * @param {Object} options:
   *                 preserveState {Boolean} if true, keep the selected frame and layer
   *                 noSnapshot {Boolean} if true, do not save a snapshot in the pixetor
   *                            history for this call to setPixetor
   */
  ns.PublicPixetorController.prototype.setPixetor = function (pixetor, options) {
    this.pixetorController.setPixetor(pixetor, options);

    $.publish(Events.FRAME_SIZE_CHANGED);
    $.publish(Events.PIXETOR_RESET);

    if (!options || !options.noSnapshot) {
      $.publish(Events.PIXETOR_SAVE_STATE, {
        type : pxtr.service.HistoryService.SNAPSHOT
      });
    }
  };

  ns.PublicPixetorController.prototype.resetWrap_ = function (methodName) {
    this[methodName] = function () {
      this.pixetorController[methodName].apply(this.pixetorController, arguments);
      $.publish(Events.PIXETOR_RESET);
    };
  };

  ns.PublicPixetorController.prototype.saveWrap_ = function (methodName, reset) {
    this[methodName] = reset ? function () {
      var stateInfo = this.getStateInfo_();
      this.pixetorController[methodName].apply(this.pixetorController, arguments);
      this.raiseSaveStateEvent_(this.pixetorController[methodName], arguments, stateInfo);
      $.publish(Events.PIXETOR_RESET);
    } : function () {
      var stateInfo = this.getStateInfo_();
      this.pixetorController[methodName].apply(this.pixetorController, arguments);
      this.raiseSaveStateEvent_(this.pixetorController[methodName], arguments, stateInfo);
    };
  };

  ns.PublicPixetorController.prototype.getStateInfo_ = function () {
    var stateInfo = {
      frameIndex : this.pixetorController.currentFrameIndex,
      layerIndex : this.pixetorController.currentLayerIndex
    };
    return stateInfo;
  };

  ns.PublicPixetorController.prototype.raiseSaveStateEvent_ = function (fn, args, stateInfo) {
    $.publish(Events.PIXETOR_SAVE_STATE, {
      type : pxtr.service.HistoryService.REPLAY,
      scope : this,
      replay : {
        fn : fn,
        args : args
      },
      state : stateInfo
    });
  };

  ns.PublicPixetorController.prototype.replay = function (frame, replayData) {
    replayData.fn.apply(this.pixetorController, replayData.args);
  };
})();
