(function () {
  var ns = $.namespace('pxtr.database');

  var DB_NAME = 'PixetorDatabase';
  var DB_VERSION = 1;

  // Simple wrapper to promisify a request.
  var _requestPromise = function (req) {
    var deferred = Q.defer();
    req.onsuccess = deferred.resolve.bind(deferred);
    req.onerror = deferred.reject.bind(deferred);
    return deferred.promise;
  };

  /**
   * The PixetorDatabase handles all the database interactions related
   * to the local pixetor saved that can be performed in-browser.
   */
  ns.PixetorDatabase = function (options) {
    this.db = null;
  };

  ns.PixetorDatabase.DB_NAME = DB_NAME;

  ns.PixetorDatabase.prototype.init = function () {
    var request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = this.onUpgradeNeeded_.bind(this);

    return _requestPromise(request).then(function (event) {
      this.db = event.target.result;
      return this.db;
    }.bind(this));
  };

  ns.PixetorDatabase.prototype.onUpgradeNeeded_ = function (event) {
    // Set this.db early to allow migration scripts to access it in oncomplete.
    this.db = event.target.result;

    // Create an object store "pixetors" with the autoIncrement flag set as true.
    var objectStore = this.db.createObjectStore('pixetors', { keyPath : 'name' });
    objectStore.transaction.oncomplete = function(event) {
      pxtr.database.migrate.MigrateLocalStorageToIndexedDb.migrate(this);
    }.bind(this);
  };

  ns.PixetorDatabase.prototype.openObjectStore_ = function () {
    return this.db.transaction(['pixetors'], 'readwrite').objectStore('pixetors');
  };

  /**
   * Send a get request for the provided name.
   * Returns a promise that resolves the request event.
   */
  ns.PixetorDatabase.prototype.get = function (name) {
    var objectStore = this.openObjectStore_();
    return _requestPromise(objectStore.get(name)).then(function (event) {
      return event.target.result;
    });
  };

  /**
   * List all locally saved pixetors.
   * Returns a promise that resolves an array of objects:
   * - name: name of the pixetor
   * - description: description of the pixetor
   * - date: save date
   *
   * The sprite content is not contained in the object and
   * needs to be retrieved with a separate get.
   */
  ns.PixetorDatabase.prototype.list = function () {
    var deferred = Q.defer();

    var pixetors = [];
    var objectStore = this.openObjectStore_();
    var cursor = objectStore.openCursor();
    cursor.onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        pixetors.push({
          name: cursor.value.name,
          date: cursor.value.date,
          description: cursor.value.description
        });
        cursor.continue();
      } else {
        // Cursor consumed all availabled pixetors
        deferred.resolve(pixetors);
      }
    };

    cursor.onerror = function () {
      deferred.reject();
    };

    return deferred.promise;
  };

  /**
   * Send an put request for the provided args.
   * Returns a promise that resolves the request event.
   */
  ns.PixetorDatabase.prototype.update = function (name, description, date, serialized) {
    var data = {};

    data.name = name;
    data.serialized = serialized;
    data.date = date;
    data.description = description;

    var objectStore = this.openObjectStore_();
    return _requestPromise(objectStore.put(data));
  };

  /**
   * Send an add request for the provided args.
   * Returns a promise that resolves the request event.
   */
  ns.PixetorDatabase.prototype.create = function (name, description, date, serialized) {
    var data = {};

    data.name = name;
    data.serialized = serialized;
    data.date = date;
    data.description = description;

    var objectStore = this.openObjectStore_();
    return _requestPromise(objectStore.add(data));
  };

  /**
   * Delete a saved pixetor for the provided name.
   * Returns a promise that resolves the request event.
   */
  ns.PixetorDatabase.prototype.delete = function (name) {
    var objectStore = this.openObjectStore_();
    return _requestPromise(objectStore.delete(name));
  };
})();
