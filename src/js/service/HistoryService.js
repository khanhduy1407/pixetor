(function () {
  var ns = $.namespace('pxtr.service');

  ns.HistoryService = function (pixetorController, shortcutService, deserializer, serializer) {
    // Use the real pixetor controller that will not fire events when calling setters
    this.pixetorController = pixetorController.getWrappedPixetorController();

    this.shortcutService = shortcutService || pxtr.app.shortcutService;
    this.deserializer = deserializer || pxtr.utils.serialization.arraybuffer.ArrayBufferDeserializer;
    this.serializer = serializer || pxtr.utils.serialization.arraybuffer.ArrayBufferSerializer;

    this.stateQueue = [];
    this.currentIndex = -1;
    this.lastLoadState = -1;
  };

  // Force to save a state as a SNAPSHOT
  ns.HistoryService.SNAPSHOT = 'SNAPSHOT';

  // Default save state
  ns.HistoryService.REPLAY = 'REPLAY';

  // Period (in number of state saved) between two snapshots
  ns.HistoryService.SNAPSHOT_PERIOD = 50;

  // Interval/buffer (in milliseconds) between two state load (ctrl+z/y spamming)
  ns.HistoryService.LOAD_STATE_INTERVAL = 50;

  // Maximum number of states that can be recorded.
  ns.HistoryService.MAX_SAVED_STATES = 500;

  ns.HistoryService.prototype.init = function () {
    $.subscribe(Events.PIXETOR_SAVE_STATE, this.onSaveStateEvent.bind(this));

    var shortcuts = pxtr.service.keyboard.Shortcuts;
    this.shortcutService.registerShortcut(shortcuts.MISC.UNDO, this.undo.bind(this));
    this.shortcutService.registerShortcut(shortcuts.MISC.REDO, this.redo.bind(this));

    this.saveState({
      type : ns.HistoryService.SNAPSHOT
    });
  };

  ns.HistoryService.prototype.onSaveStateEvent = function (evt, action) {
    this.saveState(action);
  };

  ns.HistoryService.prototype.saveState = function (action) {
    this.stateQueue = this.stateQueue.slice(0, this.currentIndex + 1);
    this.currentIndex = this.currentIndex + 1;

    var state = {
      action : action,
      frameIndex : action.state ? action.state.frameIndex : this.pixetorController.currentFrameIndex,
      layerIndex : action.state ? action.state.layerIndex : this.pixetorController.currentLayerIndex,
      fps : this.pixetorController.getFPS(),
      uuid: pxtr.utils.Uuid.generate()
    };

    var isSnapshot = action.type === ns.HistoryService.SNAPSHOT;
    var isAtAutoSnapshotInterval = this.currentIndex % ns.HistoryService.SNAPSHOT_PERIOD === 0;
    if (isSnapshot || isAtAutoSnapshotInterval) {
      var pixetor = this.pixetorController.getPixetor();
      state.pixetor = this.serializer.serialize(pixetor);
    }

    // If the new state pushes over MAX_SAVED_STATES, erase all states between the first and
    // second snapshot states.
    if (this.stateQueue.length > ns.HistoryService.MAX_SAVED_STATES) {
      var firstSnapshotIndex = this.getNextSnapshotIndex_(1);
      this.stateQueue.splice(0, firstSnapshotIndex);
      this.currentIndex = this.currentIndex - firstSnapshotIndex;
    }
    this.stateQueue.push(state);
    $.publish(Events.HISTORY_STATE_SAVED);
  };

  ns.HistoryService.prototype.getCurrentStateId = function () {
    var state = this.stateQueue[this.currentIndex];
    if (!state) {
      return false;
    }

    return state.uuid;
  };

  ns.HistoryService.prototype.undo = function () {
    this.loadState(this.currentIndex - 1);
  };

  ns.HistoryService.prototype.redo = function () {
    this.loadState(this.currentIndex + 1);
  };

  ns.HistoryService.prototype.isLoadStateAllowed_ = function (index) {
    var timeOk = (Date.now() - this.lastLoadState) > ns.HistoryService.LOAD_STATE_INTERVAL;
    var indexInRange = index >= 0 && index < this.stateQueue.length;
    return timeOk && indexInRange;
  };

  ns.HistoryService.prototype.getPreviousSnapshotIndex_ = function (index) {
    while (this.stateQueue[index] && !this.stateQueue[index].pixetor) {
      index = index - 1;
    }
    return index;
  };

  ns.HistoryService.prototype.getNextSnapshotIndex_ = function (index) {
    while (this.stateQueue[index] && !this.stateQueue[index].pixetor) {
      index = index + 1;
    }
    return index;
  };

  ns.HistoryService.prototype.loadState = function (index) {
    try {
      if (this.isLoadStateAllowed_(index)) {
        this.lastLoadState = Date.now();

        var snapshotIndex = this.getPreviousSnapshotIndex_(index);
        if (snapshotIndex < 0) {
          throw 'Could not find previous SNAPSHOT saved in history stateQueue';
        }
        var serializedPixetor = this.getSnapshotFromState_(snapshotIndex);
        var onPixetorLoadedCb = this.onPixetorLoaded_.bind(this, index, snapshotIndex);
        this.deserializer.deserialize(serializedPixetor, onPixetorLoadedCb);
      }
    } catch (error) {
      console.error('[CRITICAL ERROR] : Unable to load a history state.');
      this.logError_(error);
      this.stateQueue = [];
      this.currentIndex = -1;
    }
  };

  ns.HistoryService.prototype.logError_ = function (error) {
    if (typeof error === 'string') {
      console.error(error);
    } else {
      console.error(error.message);
      console.error(error.stack);
    }
  };

  ns.HistoryService.prototype.getSnapshotFromState_ = function (stateIndex) {
    var state = this.stateQueue[stateIndex];
    var pixetorSnapshot = state.pixetor;

    state.pixetor = pixetorSnapshot;

    return pixetorSnapshot;
  };

  ns.HistoryService.prototype.onPixetorLoaded_ = function (index, snapshotIndex, pixetor) {
    var originalSize = this.getPixetorSize_();
    pixetor.setDescriptor(this.pixetorController.pixetor.getDescriptor());
    // propagate save path to the new pixetor instance
    pixetor.savePath = this.pixetorController.pixetor.savePath;
    this.pixetorController.setPixetor(pixetor);

    for (var i = snapshotIndex + 1 ; i <= index ; i++) {
      var state = this.stateQueue[i];
      this.setupState(state);
      this.replayState(state);
    }

    // Should only do this when going backwards
    var lastState = this.stateQueue[index + 1];
    if (lastState) {
      this.setupState(lastState);
    }

    this.currentIndex = index;
    $.publish(Events.PIXETOR_RESET);
    $.publish(Events.HISTORY_STATE_LOADED);
    if (originalSize !== this.getPixetorSize_()) {
      $.publish(Events.FRAME_SIZE_CHANGED);
    }
  };

  ns.HistoryService.prototype.getPixetorSize_ = function () {
    return this.pixetorController.getWidth() + 'x' + this.pixetorController.getHeight();
  };

  ns.HistoryService.prototype.setupState = function (state) {
    this.pixetorController.setCurrentFrameIndex(state.frameIndex);
    this.pixetorController.setCurrentLayerIndex(state.layerIndex);
    this.pixetorController.setFPS(state.fps);
  };

  ns.HistoryService.prototype.replayState = function (state) {
    var action = state.action;
    var type = action.type;
    var layer = this.pixetorController.getLayerAt(state.layerIndex);
    var frame = layer.getFrameAt(state.frameIndex);
    action.scope.replay(frame, action.replay);
  };

})();
