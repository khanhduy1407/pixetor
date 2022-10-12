(function () {
  var ns = $.namespace('pxtr.service.storage');

  ns.LocalStorageService = function (pixetorController) {
    if (pixetorController === undefined) {
      throw 'Bad LocalStorageService initialization: <undefined pixetorController>';
    }
    this.pixetorController = pixetorController;
  };

  ns.LocalStorageService.prototype.init = function() {};

  ns.LocalStorageService.prototype.save = function(pixetor) {
    var name = pixetor.getDescriptor().name;
    var description = pixetor.getDescriptor().description;

    var serialized = pxtr.utils.serialization.Serializer.serialize(pixetor);
    if (pxtr.app.localStorageService.getPixetor(name)) {
      var confirmOverwrite = window.confirm('There is already a pixetor saved as ' + name + '. Overwrite ?');
      if (!confirmOverwrite) {
        return Q.reject('Cancelled by user, "' + name + '" already exists');
      }
    }

    try {
      this.removeFromKeys_(name);
      this.addToKeys_(name, description, Date.now());
      window.localStorage.setItem('pixetor.' + name, serialized);
      return Q.resolve();
    } catch (e) {
      return Q.reject(e.message);
    }
  };

  ns.LocalStorageService.prototype.load = function(name) {
    var pixetorString = this.getPixetor(name);
    var key = this.getKey_(name);

    pxtr.utils.serialization.Deserializer.deserialize(JSON.parse(pixetorString), function (pixetor) {
      pxtr.app.pixetorController.setPixetor(pixetor);
    });
  };

  ns.LocalStorageService.prototype.remove = function(name) {
    this.removeFromKeys_(name);
    window.localStorage.removeItem('pixetor.' + name);
  };

  ns.LocalStorageService.prototype.saveKeys_ = function(keys) {
    window.localStorage.setItem('pixetor.keys', JSON.stringify(keys));
  };

  ns.LocalStorageService.prototype.removeFromKeys_ = function(name) {
    var keys = this.getKeys();
    var otherKeys = keys.filter(function (key) {
      return key.name !== name;
    });

    this.saveKeys_(otherKeys);
  };

  ns.LocalStorageService.prototype.getKey_ = function(name) {
    var matches = this.getKeys().filter(function (key) {
      return key.name === name;
    });
    if (matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
  };

  ns.LocalStorageService.prototype.addToKeys_ = function(name, description, date) {
    var keys = this.getKeys();
    keys.push({
      name : name,
      description : description,
      date : date
    });
    this.saveKeys_(keys);
  };

  ns.LocalStorageService.prototype.getPixetor = function(name) {
    return window.localStorage.getItem('pixetor.' + name);
  };

  ns.LocalStorageService.prototype.getKeys = function(name) {
    var keysString = window.localStorage.getItem('pixetor.keys');
    return JSON.parse(keysString) || [];
  };

})();
