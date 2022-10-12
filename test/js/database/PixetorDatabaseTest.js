describe('PixetorDatabase test', function () {

  // Test object.
  var pixetorDatabase;

  var _toSnapshot = function (session_id, name, description, date, serialized) {
    return {
      session_id: session_id,
      name: name,
      description: description,
      date: date,
      serialized: serialized
    };
  };

  var _checkPixetor = function (actual, expected) {
    expect(actual.name).toBe(expected[0]);
    expect(actual.description).toBe(expected[1]);
    expect(actual.date).toBe(expected[2]);
    expect(actual.serialized).toBe(expected[3]);
  };

  var _addPixetors = function (pixetors) {
    var _add = function (index) {
      var pixetorData = pixetors[index];
      return pixetorDatabase.create.apply(pixetorDatabase, pixetorData)
        .then(function () {
          if (pixetors[index + 1]) {
            return _add(index + 1);
          } else {
            return Promise.resolve();
          }
        });
    };

    return _add(0);
  };

  beforeEach(function (done) {
    // Mock the migration script.
    spyOn(pxtr.database.migrate.MigrateLocalStorageToIndexedDb, "migrate");

    // Drop the database before each test.
    var dbName = pxtr.database.PixetorDatabase.DB_NAME;
    var req = window.indexedDB.deleteDatabase(dbName);
    req.onsuccess = done;
  });

  afterEach(function () {
    // Close the database if it was still open.
    if (pixetorDatabase && pixetorDatabase.db) {
      pixetorDatabase.db.close();
    }
  });

  it('initializes the DB and returns a promise', function (done) {
    pixetorDatabase = new pxtr.database.PixetorDatabase();
    pixetorDatabase.init().then(done);
  });

  it('can add a pixetor and retrieve it', function (done) {
    pixetorDatabase = new pxtr.database.PixetorDatabase();
    pixetorDatabase.init()
      .then(function (db) {
        return pixetorDatabase.create('name', 'desc', 0, 'serialized');
      }).then(function () {
        return pixetorDatabase.get('name');
      }).then(function (pixetor) {
        expect(pixetor.name).toBe('name');
        expect(pixetor.description).toBe('desc');
        expect(pixetor.date).toBe(0);
        expect(pixetor.serialized).toBe('serialized');
        done();
      });
  });

  it('can delete pixetor by name', function (done) {
    var pixetors = [
      ['n1', 'd1', 10, 's1'],
      ['n2', 'd2', 20, 's2'],
      ['n3', 'd3', 30, 's3'],
    ];

    pixetorDatabase = new pxtr.database.PixetorDatabase();
    pixetorDatabase.init()
      .then(function (db) {
        return _addPixetors(pixetors);
      }).then(function () {
        return pixetorDatabase.delete('n2');
      }).then(function () {
        return pixetorDatabase.get('n1');
      }).then(function (pixetorData) {
        _checkPixetor(pixetorData, pixetors[0]);
        return pixetorDatabase.get('n3');
      }).then(function (pixetorData) {
        _checkPixetor(pixetorData, pixetors[2]);
        return pixetorDatabase.get('n2');
      }).then(function (pixetorData) {
        expect(pixetorData).toBe(undefined);
        done();
      });
  });

  it('can list pixetors', function (done) {
    var pixetors = [
      ['n1', 'd1', 10, 's1'],
      ['n2', 'd2', 20, 's2'],
      ['n3', 'd3', 30, 's3'],
    ];

    pixetorDatabase = new pxtr.database.PixetorDatabase();
    pixetorDatabase.init()
      .then(function (db) {
        return _addPixetors(pixetors);
      }).then(function () {
        return pixetorDatabase.list();
      }).then(function (pixetors) {
        expect(pixetors.length).toBe(3);
        pixetors.forEach(function (pixetorData) {
          expect(pixetorData.name).toMatch(/n[1-3]/);
          expect(pixetorData.description).toMatch(/d[1-3]/);
          expect(pixetorData.date).toBeDefined();
          expect(pixetorData.serialized).not.toBeDefined();
        })
        done();
      });
  });

  it('can update pixetor with same name', function (done) {
    var pixetors = [
      ['n1', 'd1', 10, 's1'],
      ['n2', 'd2', 20, 's2'],
      ['n3', 'd3', 30, 's3'],
    ];

    pixetorDatabase = new pxtr.database.PixetorDatabase();
    pixetorDatabase.init()
      .then(function (db) {
        return _addPixetors(pixetors);
      }).then(function () {
        return pixetorDatabase.update('n2', 'd2_updated', 40, 's2_updated');
      }).then(function (pixetors) {
        return pixetorDatabase.list();
      }).then(function (pixetors) {
        expect(pixetors.length).toBe(3);
        var p2 = pixetors.filter(function (p) { return p.name === 'n2'})[0];
        expect(p2.name).toBe('n2');
        expect(p2.description).toBe('d2_updated');
        expect(p2.date).toBe(40);

        return pixetorDatabase.get('n2');
      }).then(function (pixetor) {
        _checkPixetor(pixetor, ['n2', 'd2_updated', 40, 's2_updated']);
        done();
      });
  });

});
