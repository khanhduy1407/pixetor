(function () {
  var ns = $.namespace('pxtr.database.migrate');

  // Simple migration helper to move local storage saves to indexed db.
  ns.MigrateLocalStorageToIndexedDb = {};

  ns.MigrateLocalStorageToIndexedDb.migrate = function (pixetorDatabase) {
    var deferred = Q.defer();

    var localStorageService = pxtr.app.localStorageService;

    var localStorageKeys = localStorageService.getKeys();
    var migrationData = localStorageKeys.map(function (key) {
      return {
        name: key.name,
        description: key.description,
        date: key.date,
        serialized: localStorageService.getPixetor(key.name)
      };
    });

    // Define the sequential migration process.
    // Wait for each sprite to be saved before saving the next one.
    var success = true;
    var migrateSprite = function (index) {
      var data = migrationData[index];
      if (!data) {
        console.log('Data migration from local storage to indexed db finished.');
        if (success) {
          console.log('Local storage pixetors successfully migrated. Old copies will be deleted.');
          ns.MigrateLocalStorageToIndexedDb.deleteLocalStoragePixetors();
        }

        deferred.resolve();
      } else {
        ns.MigrateLocalStorageToIndexedDb.save_(pixetorDatabase, data)
          .then(function () {
            migrateSprite(index + 1);
          })
          .catch(function (e) {
            var success = false;
            console.error('Failed to migrate local storage sprite for name: ' + data.name);
            migrateSprite(index + 1);
          });
      }
    };

    // Start the migration.
    migrateSprite(0);

    return deferred.promise;
  };

  ns.MigrateLocalStorageToIndexedDb.save_ = function (pixetorDatabase, pixetorData) {
    return pixetorDatabase.get(pixetorData.name).then(function (data) {
      if (typeof data !== 'undefined') {
        return pixetorDatabase.update(pixetorData.name, pixetorData.description, pixetorData.date, pixetorData.serialized);
      } else {
        return pixetorDatabase.create(pixetorData.name, pixetorData.description, pixetorData.date, pixetorData.serialized);
      }
    });
  };

  ns.MigrateLocalStorageToIndexedDb.deleteLocalStoragePixetors = function () {
    var localStorageKeys = pxtr.app.localStorageService.getKeys();

    // Remove all sprites.
    localStorageKeys.forEach(function (key) {
      window.localStorage.removeItem('pixetor.' + key.name);
    });

    // Remove keys.
    window.localStorage.removeItem('pixetor.keys');
  };

})();
