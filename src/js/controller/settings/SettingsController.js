(function () {
  var ns = $.namespace('pxtr.controller.settings');

  var settings = {
    'user' : {
      template : 'templates/settings/preferences.html',
      controller : ns.PreferencesController
    },
    'resize' : {
      template : 'templates/settings/resize.html',
      controller : ns.resize.ResizeController
    },
    'export' : {
      template : 'templates/settings/export.html',
      controller : ns.exportimage.ExportController
    },
    'import' : {
      template : 'templates/settings/import.html',
      controller : ns.ImportController
    },
    'localstorage' : {
      template : 'templates/settings/localstorage.html',
      controller : ns.LocalStorageController
    },
    'save' : {
      template : 'templates/settings/save.html',
      controller : ns.SaveController
    }
  };

  var SEL_SETTING_CLS = 'has-expanded-drawer';
  var EXP_DRAWER_CLS = 'expanded';

  ns.SettingsController = function (pixetorController) {
    this.pixetorController = pixetorController;
    this.closeDrawerShortcut = pxtr.service.keyboard.Shortcuts.MISC.CLOSE_POPUP;
    this.settingsContainer = document.querySelector('[data-pxtr-controller=settings]');
    this.drawerContainer = document.getElementById('drawer-container');
    this.isExpanded = false;
    this.currentSetting = null;
  };

  /**
   * @public
   */
  ns.SettingsController.prototype.init = function() {
    pxtr.utils.Event.addEventListener(this.settingsContainer, 'click', this.onSettingsContainerClick_, this);
    pxtr.utils.Event.addEventListener(document.body, 'click', this.onBodyClick_, this);

    $.subscribe(Events.CLOSE_SETTINGS_DRAWER, this.closeDrawer_.bind(this));
  };

  ns.SettingsController.prototype.onSettingsContainerClick_ = function (evt) {
    var setting = pxtr.utils.Dom.getData(evt.target, 'setting');
    if (!setting) {
      return;
    }

    if (this.currentSetting != setting) {
      this.loadSetting_(setting);
    } else {
      this.closeDrawer_();
    }

    evt.stopPropagation();
    evt.preventDefault();
  };

  ns.SettingsController.prototype.onBodyClick_ = function (evt) {
    var target = evt.target;

    var isInDrawerContainer = pxtr.utils.Dom.isParent(target, this.drawerContainer);
    var isInSettingsIcon = target.dataset.setting;
    var isInSettingsContainer = isInDrawerContainer || isInSettingsIcon;

    if (this.isExpanded && !isInSettingsContainer) {
      this.closeDrawer_();
    }
  };

  ns.SettingsController.prototype.loadSetting_ = function (setting) {
    this.drawerContainer.innerHTML = pxtr.utils.Template.get(settings[setting].template);

    // when switching settings controller, destroy previously loaded controller
    this.destroyCurrentController_();

    this.currentSetting = setting;
    this.currentController = new settings[setting].controller(this.pixetorController);
    this.currentController.init();

    pxtr.app.shortcutService.registerShortcut(this.closeDrawerShortcut, this.closeDrawer_.bind(this));

    pxtr.utils.Dom.removeClass(SEL_SETTING_CLS);
    var selectedSettingButton = document.querySelector('[data-setting=' + setting + ']');
    if (selectedSettingButton) {
      selectedSettingButton.classList.add(SEL_SETTING_CLS);
    }
    this.settingsContainer.classList.add(EXP_DRAWER_CLS);

    this.isExpanded = true;
  };

  ns.SettingsController.prototype.closeDrawer_ = function () {
    pxtr.utils.Dom.removeClass(SEL_SETTING_CLS);
    this.settingsContainer.classList.remove(EXP_DRAWER_CLS);

    this.isExpanded = false;
    this.currentSetting = null;
    document.activeElement.blur();

    this.destroyCurrentController_();
  };

  ns.SettingsController.prototype.destroyCurrentController_ = function () {
    if (this.currentController) {
      pxtr.app.shortcutService.unregisterShortcut(this.closeDrawerShortcut);
      if (this.currentController.destroy) {
        this.currentController.destroy();
        this.currentController = null;
      }
    }
  };
})();
