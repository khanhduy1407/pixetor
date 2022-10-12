(function () {
  var ns = $.namespace('pxtr.controller.dialogs.importwizard.steps');

  ns.AdjustSize = function (pixetorController, importController, container) {
    this.superclass.constructor.apply(this, arguments);
  };

  ns.AdjustSize.OPTIONS = {
    KEEP: 'keep',
    EXPAND: 'expand'
  };

  pxtr.utils.inherit(ns.AdjustSize, ns.AbstractImportStep);

  ns.AdjustSize.prototype.init = function () {
    this.superclass.init.call(this);

    // Create anchor widget
    var anchorContainer = this.container.querySelector('.import-resize-anchor-container');
    this.anchorWidget = new pxtr.widgets.AnchorWidget(anchorContainer, this.onAnchorChange_.bind(this));
    this.anchorWidget.setOrigin('TOPLEFT');

    this.resizeInfoContainer = this.container.querySelector('.import-resize-info');
    this.addEventListener(this.resizeInfoContainer, 'change', this.onResizeOptionChange_);

    // By default, set the mode to expand to avoid losing any image content.
    this.mergeData.resize = ns.AdjustSize.OPTIONS.EXPAND;
  };

  ns.AdjustSize.prototype.destroy = function () {
    this.anchorWidget.destroy();
    this.superclass.destroy.call(this);
  };

  ns.AdjustSize.prototype.onShow = function () {
    this.refresh_();
    this.superclass.onShow.call(this);
  };

  ns.AdjustSize.prototype.refresh_ = function () {
    var isBigger = this.isImportedPixetorBigger_();
    var keep = this.mergeData.resize === ns.AdjustSize.OPTIONS.KEEP;

    // Refresh resize partial
    var size = this.formatPixetorSize_(this.pixetorController.getPixetor());
    var newSize = this.formatPixetorSize_(this.mergeData.mergePixetor);
    var markup;
    if (isBigger) {
      markup = pxtr.utils.Template.getAndReplace('import-resize-bigger-partial', {
        size : size,
        newSize : newSize,
        keepChecked : keep ? 'checked="checked"' : '',
        expandChecked : keep ? '' : 'checked="checked"'
      });
    } else {
      markup = pxtr.utils.Template.getAndReplace('import-resize-smaller-partial', {
        size : size,
        newSize : newSize
      });
    }
    this.resizeInfoContainer.innerHTML = markup;

    // Update anchor widget
    if (this.mergeData.origin) {
      this.anchorWidget.setOrigin(this.mergeData.origin);
    }

    // Update anchor widget info
    var anchorInfo = this.container.querySelector('.import-resize-anchor-info');
    if (isBigger && keep) {
      anchorInfo.innerHTML = [
        '<div class="import-resize-warning">',
        '  Imported content will be cropped!',
        '</div>',
        'Select crop anchor:'
      ].join('');
    } else if (isBigger) {
      anchorInfo.innerHTML = 'Select resize anchor:';
    } else {
      anchorInfo.innerHTML = 'Select position anchor:';
    }
  };

  ns.AdjustSize.prototype.onAnchorChange_ = function (origin) {
    this.mergeData.origin = origin;
  };

  ns.AdjustSize.prototype.onResizeOptionChange_ = function () {
    var value = this.resizeInfoContainer.querySelector(':checked').value;
    if (this.mergeData.resize != value) {
      this.mergeData.resize = value;
      this.refresh_();
    }
  };

  ns.AdjustSize.prototype.isImportedPixetorBigger_ = function () {
    var pixetor = this.mergeData.mergePixetor;
    if (!pixetor) {
      return false;
    }

    return pixetor.width > this.pixetorController.getWidth() ||
           pixetor.height > this.pixetorController.getHeight();
  };

  ns.AdjustSize.prototype.formatPixetorSize_ = function (pixetor) {
    return pxtr.utils.StringUtils.formatSize(pixetor.width, pixetor.height);
  };
})();
