(function () {
  var ns = $.namespace('pxtr.controller.dialogs');

  ns.BrowseLocalController = function (pixetorController) {};

  pxtr.utils.inherit(ns.BrowseLocalController, ns.AbstractDialogController);

  ns.BrowseLocalController.prototype.init = function () {
    this.superclass.init.call(this);

    this.localStorageItemTemplate_ = pxtr.utils.Template.get('local-storage-item-template');

    this.service_ = pxtr.app.indexedDbStorageService;
    this.pixetorList = document.querySelector('.local-pixetor-list');

    this.fillLocalPixetorsList_();

    this.pixetorList.addEventListener('click', this.onPixetorsListClick_.bind(this));
  };

  ns.BrowseLocalController.prototype.onPixetorsListClick_ = function (evt) {
    var action = evt.target.getAttribute('data-action');
    var name = evt.target.getAttribute('data-name');
    if (action === 'load') {
      if (window.confirm('This will erase your current pixetor. Continue ?')) {
        this.service_.load(name);
        this.closeDialog();
      }
    } else if (action === 'delete') {
      if (window.confirm('This will permanently DELETE this pixetor from your computer. Continue ?')) {
        this.service_.remove(name);
        this.fillLocalPixetorsList_();
      }
    }
  };

  ns.BrowseLocalController.prototype.fillLocalPixetorsList_ = function () {
    this.service_.getKeys().then(function (keys) {
      var html = '';
      keys.sort(function (k1, k2) {
        if (k1.date < k2.date) {return 1;}
        if (k1.date > k2.date) {return -1;}
        return 0;
      });

      keys.forEach((function (key) {
        var date = pxtr.utils.DateUtils.format(key.date, '{{Y}}/{{M}}/{{D}} {{H}}:{{m}}');
        html += pxtr.utils.Template.replace(this.localStorageItemTemplate_, {
          name : key.name,
          date : date
        });
      }).bind(this));

      var tableBody_ = this.pixetorList.tBodies[0];
      tableBody_.innerHTML = html;
    }.bind(this));
  };
})();
