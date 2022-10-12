(function () {
  var ns = $.namespace('pxtr.controller');

  ns.LayersListController = function (pixetorController) {
    this.pixetorController = pixetorController;
    this.layerPreviewShortcut = pxtr.service.keyboard.Shortcuts.MISC.LAYER_PREVIEW;
    this.startRenamingCurrentLayer_ = this.startRenamingCurrentLayer_.bind(this);
    this.onRenameInput_ = this.onRenameInput_.bind(this);
  };

  ns.LayersListController.prototype.init = function () {
    this.isRenaming = false;

    this.layerItemTemplate_ = pxtr.utils.Template.get('layer-item-template');
    this.layerNameInputTemplate_ = pxtr.utils.Template.get('layer-name-input-template');
    this.rootEl = document.querySelector('.layers-list-container');
    this.layersListEl = document.querySelector('.layers-list');
    this.toggleLayerPreviewEl = document.querySelector('.layers-toggle-preview');

    this.rootEl.addEventListener('click', this.onClick_.bind(this));
    this.toggleLayerPreviewEl.addEventListener('click', this.toggleLayerPreview_.bind(this));

    this.createButtonTooltips_();
    this.initToggleLayerPreview_();

    this.renderLayerList_();
    this.updateToggleLayerPreview_();

    $.subscribe(Events.PIXETOR_RESET, this.renderLayerList_.bind(this));
    $.subscribe(Events.USER_SETTINGS_CHANGED, this.onUserSettingsChange_.bind(this));
  };

  ns.LayersListController.prototype.renderLayerList_ = function () {
    // Backup scroll before refresh.
    var scrollTop = this.layersListEl.scrollTop;

    this.layersListEl.innerHTML = '';
    var layers = this.pixetorController.getLayers();
    layers.forEach(this.addLayerItem.bind(this));
    this.updateButtonStatus_();

    // Restore scroll
    this.layersListEl.scrollTop = scrollTop;

    // Ensure the currently the selected layer is visible.
    var currentLayerEl = this.layersListEl.querySelector('.current-layer-item');
    if (currentLayerEl) {
      currentLayerEl.scrollIntoViewIfNeeded(false);
    }
  };

  ns.LayersListController.prototype.createButtonTooltips_ = function () {
    var addTooltip = pxtr.utils.TooltipFormatter.format('Create a layer', null, [
      {key : 'shift', description : 'Clone current layer'}
    ]);
    var addButton = this.rootEl.querySelector('[data-action="add"]');
    addButton.setAttribute('title', addTooltip);

    var moveDownTooltip = pxtr.utils.TooltipFormatter.format('Move layer down', null, [
      {key : 'shift', description : 'Move to the bottom'}
    ]);
    var moveDownButton = this.rootEl.querySelector('[data-action="down"]');
    moveDownButton.setAttribute('title', moveDownTooltip);

    var moveUpTooltip = pxtr.utils.TooltipFormatter.format('Move layer up', null, [
      {key : 'shift', description : 'Move to the top'}
    ]);
    var moveUpButton = this.rootEl.querySelector('[data-action="up"]');
    moveUpButton.setAttribute('title', moveUpTooltip);
  };

  ns.LayersListController.prototype.initToggleLayerPreview_ = function () {
    var descriptors = [{description : 'Opacity defined in PREFERENCES'}];
    var helpText = 'Preview all layers';

    pxtr.app.shortcutService.registerShortcut(this.layerPreviewShortcut, this.toggleLayerPreview_.bind(this));
    var tooltip = pxtr.utils.TooltipFormatter.format(helpText, this.layerPreviewShortcut, descriptors);
    this.toggleLayerPreviewEl.setAttribute('title', tooltip);
  };

  ns.LayersListController.prototype.updateButtonStatus_ = function () {
    var layers = this.pixetorController.getLayers();
    var index = this.pixetorController.getCurrentLayerIndex();

    var isLast = index === 0;
    var isOnly = layers.length === 1;
    var isFirst = index === layers.length - 1;

    this.toggleButtonDisabledState_('up', isFirst);
    this.toggleButtonDisabledState_('down', isLast);
    this.toggleButtonDisabledState_('merge', isLast);
    this.toggleButtonDisabledState_('delete', isOnly);
  };

  ns.LayersListController.prototype.toggleButtonDisabledState_ = function (buttonAction, isDisabled) {
    var button = document.querySelector('.layers-button[data-action="' + buttonAction + '"]');
    if (isDisabled) {
      button.setAttribute('disabled', 'disabled');
      // Disabled/focused buttons consume key events on Firefox, so make sure to blur.
      button.blur();
    } else {
      button.removeAttribute('disabled');
    }
  };

  ns.LayersListController.prototype.updateToggleLayerPreview_ = function () {
    var enabledClassname = 'layers-toggle-preview-enabled';
    if (pxtr.UserSettings.get(pxtr.UserSettings.LAYER_PREVIEW)) {
      this.toggleLayerPreviewEl.classList.add(enabledClassname);
    } else {
      this.toggleLayerPreviewEl.classList.remove(enabledClassname);
    }
  };

  ns.LayersListController.prototype.onUserSettingsChange_ = function (evt, name, value) {
    if (name == pxtr.UserSettings.LAYER_PREVIEW) {
      this.updateToggleLayerPreview_();
    }
  };

  ns.LayersListController.prototype.addLayerItem = function (layer, index) {
    var isSelected = this.pixetorController.getCurrentLayer() === layer;
    var isRenaming = isSelected && this.isRenaming;
    var layerItemHtml = pxtr.utils.Template.replace(this.layerItemTemplate_, {
      'layername' : layer.getName(),
      'layerindex' : index,
      'isselected:current-layer-item' : isSelected,
      'opacity' : layer.getOpacity()
    });
    var layerItem = pxtr.utils.Template.createFromHTML(layerItemHtml);
    this.layersListEl.insertBefore(layerItem, this.layersListEl.firstChild);
    if (layerItem.offsetWidth < layerItem.scrollWidth) {
      var layerNameEl = layerItem.querySelector('.layer-name');
      layerNameEl.classList.add('overflowing-name');
      layerNameEl.setAttribute('title', layer.getName());
      layerNameEl.setAttribute('rel', 'tooltip');
    }
    if (isSelected) {
      layerItem.removeEventListener('dblclick', this.startRenamingCurrentLayer_);
      layerItem.addEventListener('dblclick', this.startRenamingCurrentLayer_);
    }
    if (isRenaming) {
      var layerNameInputHtml = pxtr.utils.Template.replace(this.layerNameInputTemplate_, {
        'layername' : layer.getName()
      });
      var layerNameInput = pxtr.utils.Template.createFromHTML(layerNameInputHtml);
      var layerNameEl = layerItem.querySelector('.layer-name');
      layerItem.replaceChild(layerNameInput, layerNameEl);
      layerNameInput.removeEventListener('blur', this.onRenameInput_);
      layerNameInput.removeEventListener('keydown', this.onRenameInput_);
      layerNameInput.addEventListener('blur', this.onRenameInput_);
      layerNameInput.addEventListener('keydown', this.onRenameInput_);
      layerNameInput.focus();
      layerNameInput.select();
    }
    var opacity = layer.getOpacity();
    if (opacity == 1) {
      layerItem.querySelector('.layer-item-opacity').style.color = '#ffd700';
    } else if (opacity == 0) {
      layerItem.querySelector('.layer-item-opacity').style.color = '#969696';
    } else {
      layerItem.querySelector('.layer-item-opacity').style.color = '#ffffff';
    }
  };

  ns.LayersListController.prototype.onClick_ = function (evt) {
    var el = evt.target || evt.srcElement;
    var index;
    if (el.classList.contains('button')) {
      this.onButtonClick_(el, evt);
    } else if (el.classList.contains('layer-name')) {
      var currentIndex = this.pixetorController.getCurrentLayerIndex();
      index = pxtr.utils.Dom.getData(el, 'layerIndex');
      if (index != currentIndex) {
        var currentItem = el.parentElement.parentElement.querySelector('.current-layer-item');
        currentItem.removeEventListener('dblclick', this.startRenamingCurrentLayer_);
        this.pixetorController.setCurrentLayerIndex(parseInt(index, 10));
      }
    } else if (el.classList.contains('layer-item-opacity')) {
      index = pxtr.utils.Dom.getData(el, 'layerIndex');
      var layer = this.pixetorController.getLayerAt(parseInt(index, 10));
      var opacity = window.prompt('Set layer opacity (value between 0 and 1)', layer.getOpacity());
      this.pixetorController.setLayerOpacityAt(index, opacity);
    }
  };

  ns.LayersListController.prototype.startRenamingCurrentLayer_ = function () {
    this.isRenaming = true;
    this.renderLayerList_();
  };

  ns.LayersListController.prototype.onRenameInput_ = function (evt) {
    var el = evt.target || evt.srcElement;
    if (evt.key === 'Enter') {
      this.finishRenamingCurrentLayer_(el, el.value);
    } else if (!evt.key || evt.key === 'Escape') {
      this.finishRenamingCurrentLayer_(el);
    }
  };

  ns.LayersListController.prototype.finishRenamingCurrentLayer_ = function (input, newName) {
    if (newName) {
      var index = this.pixetorController.getCurrentLayerIndex();
      this.pixetorController.renameLayerAt(index, newName);
    }
    input.removeEventListener('blur', this.onRenameInput_);
    input.removeEventListener('keydown', this.onRenameInput_);
    this.isRenaming = false;
    this.renderLayerList_();
  };

  ns.LayersListController.prototype.mergeDownCurrentLayer_ = function () {
    var index = this.pixetorController.getCurrentLayerIndex();
    this.pixetorController.mergeDownLayerAt(index);
    this.renderLayerList_();
  };

  ns.LayersListController.prototype.onButtonClick_ = function (button, evt) {
    var action = button.getAttribute('data-action');
    if (action == 'up') {
      this.pixetorController.moveLayerUp(evt.shiftKey);
    } else if (action == 'down') {
      this.pixetorController.moveLayerDown(evt.shiftKey);
    } else if (action == 'add') {
      if (evt.shiftKey) {
        this.pixetorController.duplicateCurrentLayer();
      } else {
        this.pixetorController.createLayer();
      }
    } else if (action == 'delete') {
      this.pixetorController.removeCurrentLayer();
    } else if (action == 'merge') {
      this.mergeDownCurrentLayer_();
    } else if (action == 'edit') {
      this.startRenamingCurrentLayer_();
    }
  };

  ns.LayersListController.prototype.toggleLayerPreview_ = function () {
    var currentValue = pxtr.UserSettings.get(pxtr.UserSettings.LAYER_PREVIEW);
    var currentLayerOpacity = pxtr.UserSettings.get(pxtr.UserSettings.LAYER_OPACITY);

    var showLayerPreview = !currentValue;
    pxtr.UserSettings.set(pxtr.UserSettings.LAYER_PREVIEW, showLayerPreview);

    if (showLayerPreview && currentLayerOpacity === 0) {
      pxtr.UserSettings.set(pxtr.UserSettings.LAYER_OPACITY, Constants.DEFAULT.LAYER_OPACITY);
    }
  };
})();
