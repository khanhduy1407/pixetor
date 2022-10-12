(function () {
  var ns = $.namespace('pxtr.widgets');

  ns.Tabs = function (tabs, parentController, settingsName) {
    this.tabs = tabs;
    this.parentController = parentController;
    this.settingsName = settingsName;

    this.currentTab = null;
    this.currentController = null;
  };

  ns.Tabs.prototype.init = function (container) {
    this.tabListEl = container.querySelector('.tab-list');
    this.tabContentlEl = container.querySelector('.tab-content');
    pxtr.utils.Event.addEventListener(this.tabListEl, 'click', this.onTabsClicked_, this);

    var tab = pxtr.UserSettings.get(this.settingsName);
    if (tab) {
      this.selectTab(tab);
    }
  };

  ns.Tabs.prototype.destroy = function () {
    if (this.currentController) {
      this.currentController.destroy();
    }
    pxtr.utils.Event.removeAllEventListeners(this);
  };

  ns.Tabs.prototype.selectTab = function (tabId) {
    if (!this.tabs[tabId] || this.currentTab == tabId) {
      return;
    }

    if (this.currentController) {
      this.currentController.destroy();
    }

    this.tabContentlEl.innerHTML = pxtr.utils.Template.get(this.tabs[tabId].template);
    this.currentController = new this.tabs[tabId].controller(pxtr.app.pixetorController, this.parentController);
    this.currentController.init();
    this.currentTab = tabId;
    pxtr.UserSettings.set(this.settingsName, tabId);

    var selectedTab = this.tabListEl.querySelector('.selected');
    if (selectedTab) {
      selectedTab.classList.remove('selected');
    }
    this.tabListEl.querySelector('[data-tab-id="' + tabId + '"]').classList.add('selected');
  };

  ns.Tabs.prototype.onTabsClicked_ = function (e) {
    var tabId = pxtr.utils.Dom.getData(e.target, 'tabId');
    this.selectTab(tabId);
  };
})();
