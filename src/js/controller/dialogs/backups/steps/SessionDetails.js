(function () {
  var ns = $.namespace('pxtr.controller.dialogs.backups.steps');

  // Should match the preview dimensions defined in dialogs-browse-backups.css
  var PREVIEW_SIZE = 60;

  ns.SessionDetails = function (pixetorController, backupsController, container) {
    this.pixetorController = pixetorController;
    this.backupsController = backupsController;
    this.container = container;
  };

  ns.SessionDetails.prototype.init = function () {
    this.backButton = this.container.querySelector('.back-button');
    this.addEventListener(this.backButton, 'click', this.onBackClick_);
    this.addEventListener(this.container, 'click', this.onContainerClick_);
  };

  ns.SessionDetails.prototype.destroy = function () {
    pxtr.utils.Event.removeAllEventListeners(this);
  };

  ns.SessionDetails.prototype.addEventListener = function (el, type, cb) {
    pxtr.utils.Event.addEventListener(el, type, cb, this);
  };

  ns.SessionDetails.prototype.onShow = function () {
    var sessionId = this.backupsController.backupsData.selectedSession;
    pxtr.app.backupService.getSnapshotsBySessionId(sessionId).then(function (snapshots) {
      var html = this.getMarkupForSnapshots_(snapshots);
      this.container.querySelector('.snapshot-list').innerHTML = html;

      // Load the image of the first frame for each sprite and update the list.
      snapshots.forEach(function (snapshot) {
        this.updateSnapshotPreview_(snapshot);
      }.bind(this));
    }.bind(this)).catch(function () {
      var html = pxtr.utils.Template.get('snapshot-list-error');
      this.container.querySelector('.snapshot-list').innerHTML = html;
    }.bind(this));
  };

  ns.SessionDetails.prototype.getMarkupForSnapshots_ = function (snapshots) {
    if (snapshots.length === 0) {
      // This should normally never happen, all sessions have at least one snapshot and snapshots
      // can not be individually deleted.
      console.warn('Could not retrieve snapshots for a session');
      return pxtr.utils.Template.get('snapshot-list-empty');
    }

    var sessionItemTemplate = pxtr.utils.Template.get('snapshot-list-item');
    return snapshots.reduce(function (previous, snapshot) {
      var view = {
        id: snapshot.id,
        name: snapshot.name,
        description: snapshot.description ? '- ' + snapshot.description : '',
        date: pxtr.utils.DateUtils.format(snapshot.date, 'the {{Y}}/{{M}}/{{D}} at {{H}}:{{m}}'),
        frames: snapshot.frames === 1 ? '1 frame' : snapshot.frames + ' frames',
        resolution: pxtr.utils.StringUtils.formatSize(snapshot.width, snapshot.height),
        fps: snapshot.fps
      };
      return previous + pxtr.utils.Template.replace(sessionItemTemplate, view);
    }, '');
  };

  ns.SessionDetails.prototype.updateSnapshotPreview_ = function (snapshot) {
    pxtr.utils.serialization.Deserializer.deserialize(
      JSON.parse(snapshot.serialized),
      function (pixetor) {
        var selector = '.snapshot-item[data-snapshot-id="' + snapshot.id + '"] .snapshot-preview';
        var previewContainer = this.container.querySelector(selector);
        if (!previewContainer) {
          return;
        }
        var image = this.getFirstFrameAsImage_(pixetor);
        previewContainer.appendChild(image);
      }.bind(this)
    );
  };

  ns.SessionDetails.prototype.getFirstFrameAsImage_ = function (pixetor) {
    var frame = pxtr.utils.LayerUtils.mergeFrameAt(pixetor.getLayers(), 0);
    var wZoom = PREVIEW_SIZE / pixetor.width;
    var hZoom = PREVIEW_SIZE / pixetor.height;
    var zoom = Math.min(hZoom, wZoom);
    return pxtr.utils.FrameUtils.toImage(frame, zoom);
  };

  ns.SessionDetails.prototype.onBackClick_ = function () {
    this.backupsController.back(this);
  };

  ns.SessionDetails.prototype.onContainerClick_ = function (evt) {
    var action = evt.target.dataset.action;
    if (action == 'load' && window.confirm(Constants.CONFIRM_OVERWRITE)) {
      var snapshotId = evt.target.dataset.snapshotId * 1;
      pxtr.app.backupService.loadSnapshotById(snapshotId).then(function () {
        $.publish(Events.DIALOG_HIDE);
      });
    }
  };
})();
