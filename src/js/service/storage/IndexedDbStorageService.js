(function () {
  var ns = $.namespace('pxtr.service.storage');

  ns.IndexedDbStorageService = function (pixetorController) {
    this.pixetorController = pixetorController;
    this.pixetorDatabase = new pxtr.database.PixetorDatabase();
  };

  ns.IndexedDbStorageService.prototype.init = function () {
    this.pixetorDatabase.init().catch(function (e) {
      console.log('Failed to initialize PixetorDatabase, local browser saves will be unavailable.');
    });
  };

  ns.IndexedDbStorageService.prototype.save = function (pixetor) {
    var name = pixetor.getDescriptor().name;
    var description = pixetor.getDescriptor().description;
    var date = Date.now();
    var serialized = pxtr.utils.serialization.Serializer.serialize(pixetor);

    return this.save_(name, description, date, serialized);
  };

  ns.IndexedDbStorageService.prototype.save_ = function (name, description, date, serialized) {
    return this.pixetorDatabase.get(name).then(function (pixetorData) {
      if (typeof pixetorData !== 'undefined') {
        return this.pixetorDatabase.update(name, description, date, serialized);
      } else {
        return this.pixetorDatabase.create(name, description, date, serialized);
      }
    }.bind(this));
  };

  ns.IndexedDbStorageService.prototype.load = function (name) {
    return this.pixetorDatabase.get(name).then(function (pixetorData) {
      if (typeof pixetorData !== 'undefined') {
        var serialized = pixetorData.serialized;
        pxtr.utils.serialization.Deserializer.deserialize(
          JSON.parse(serialized),
          function (pixetor) {
            pxtr.app.pixetorController.setPixetor(pixetor);
          }
        );
      } else {
        console.log('no local browser save found for name: ' + name);
      }
    });
  };

  ns.IndexedDbStorageService.prototype.remove = function (name) {
    return this.pixetorDatabase.delete(name);
  };

  ns.IndexedDbStorageService.prototype.getKeys = function () {
    return this.pixetorDatabase.list();
  };
})();
