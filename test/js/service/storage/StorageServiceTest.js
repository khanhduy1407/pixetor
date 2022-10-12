describe("Storage Service test suite", function() {
  var storageService = null;
  var pixetor = {};

  beforeEach(function() {
    pxtr.app.galleryStorageService = {
      save : function () {}
    };
    pxtr.app.desktopStorageService = {
      save : function () {}
    };
    pxtr.app.fileDownloadStorageService = {
      save : function () {}
    };
    pxtr.app.localStorageService = {
      save : function () {}
    };
    pxtr.app.shortcutService = {
      registerShortcut : function () {}
    };

    storageService = new pxtr.service.storage.StorageService();
    storageService.init();
  });

  var checkSubServiceSuccessfulSave = function (service, methodName, done) {
    spyOn(service, 'save').and.returnValue(Q.resolve());
    storageService[methodName](pixetor).then(function () {
      expect(service.save).toHaveBeenCalledWith(pixetor, undefined);
    }, function (err) {
      expect(false).toBe(true, 'Error callback should not have been called');
    }).then(function () {
      done();
    });
  };

  var checkSubServiceFailedSave = function (service, methodName, done) {
    spyOn(service, 'save').and.returnValue(Q.reject());
    storageService[methodName](pixetor).then(function () {
      expect(false).toBe(true, 'Success callback should not have been called');
    },function () {
      expect(service.save).toHaveBeenCalledWith(pixetor, undefined);
    }).then(function () {
      done();
    });
  };

  // GalleryStorage
  it("calls GalleryStorage#save in saveToGallery", function(done) {
    checkSubServiceSuccessfulSave(pxtr.app.galleryStorageService, 'saveToGallery', done);
  });
  it("calls GalleryStorage#save in saveToGallery - error case", function(done) {
    checkSubServiceFailedSave(pxtr.app.galleryStorageService, 'saveToGallery', done);
  });

  // DesktopStorage
  it("calls DesktopStorage#save in saveToDesktop", function(done) {
    checkSubServiceSuccessfulSave(pxtr.app.desktopStorageService, 'saveToDesktop', done);
  });
  it("calls DesktopStorage#save in saveToDesktop - error case", function(done) {
    checkSubServiceFailedSave(pxtr.app.desktopStorageService, 'saveToDesktop', done);
  });

  // FileDownloadStorage
  it("calls FileDownloadStorage#save in saveToFileDownload", function(done) {
    checkSubServiceSuccessfulSave(pxtr.app.fileDownloadStorageService, 'saveToFileDownload', done);
  });
  it("calls FileDownloadStorage#save in saveToFileDownload - error case", function(done) {
    checkSubServiceFailedSave(pxtr.app.fileDownloadStorageService, 'saveToFileDownload', done);
  });

  // LocalStorage
  it("calls LocalStorage#save in saveToLocalStorage", function(done) {
    checkSubServiceSuccessfulSave(pxtr.app.localStorageService, 'saveToLocalStorage', done);
  });
  it("calls LocalStorage#save in saveToLocalStorage - error case", function(done) {
    checkSubServiceFailedSave(pxtr.app.localStorageService, 'saveToLocalStorage', done);
  });

  it("updates saving status properly", function(done) {
    var deferred = Q.defer();
    spyOn(pxtr.app.galleryStorageService, 'save').and.returnValue(deferred.promise);

    // check storageService is not in saving mode
    expect(storageService.isSaving()).toBe(false);

    // save
    var storageServicePromise = storageService.saveToGallery(pixetor);

    // storageService is now in saving mode
    expect(storageService.isSaving()).toBe(true);

    // we have called save once
    expect(pxtr.app.galleryStorageService.save.calls.count()).toBe(1);

    // call save again, should be ignored
    storageService.saveToGallery(pixetor);
    expect(pxtr.app.galleryStorageService.save.calls.count()).toBe(1);

    deferred.resolve();
    storageServicePromise.then(function () {
      // after saving, isSaving() should be false again
      expect(storageService.isSaving()).toBe(false);
      done();
    });
  });

  it("updates saving status on BEFORE_SAVING_PIXETOR and AFTER_SAVING_PIXETOR events", function() {
    spyOn(pxtr.app.galleryStorageService, 'save').and.returnValue(Q.resolve());

    // check storageService is not in saving mode
    expect(storageService.isSaving()).toBe(false);

    // trigger before save event
    $.publish(Events.BEFORE_SAVING_PIXETOR);
    expect(storageService.isSaving()).toBe(true);

    // call save, should have been ignored
    storageService.saveToGallery(pixetor);
    expect(pxtr.app.galleryStorageService.save.calls.count()).toBe(0);

    // trigger before save event
    $.publish(Events.AFTER_SAVING_PIXETOR);
    expect(storageService.isSaving()).toBe(false);
  });

});