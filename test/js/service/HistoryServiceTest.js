var callFactory = function (method) {
  return {
    times : function (times) {
      var results = [];
      for (var i = 0 ; i < times ; i++) {
        results.push(method());
      }
      return results;
    },
    once : function () {
      return method();
    }
  };
};

describe("History Service suite", function() {
  var SERIALIZED_PIXETOR = 'serialized-pixetor';
  var historyService = null;

  var getLastState = function () {
    return historyService.stateQueue[historyService.currentIndex];
  };

  var createMockHistoryService = function () {
    var mockPixetorController = {
      getWrappedPixetorController: function () {
        return {
          getPixetor : function () {},
          getFPS : function () {
            return 12;
          }
        }
      }
    };
    var mockShortcutService = {
      registerShortcuts : function () {},
      registerShortcut : function () {}
    };
    return new pxtr.service.HistoryService(mockPixetorController, mockShortcutService,
      { deserialize : function () {}},
      { serialize : function () { return SERIALIZED_PIXETOR }}
    );
  };

  it("starts at -1", function() {
    historyService = createMockHistoryService();
    expect(historyService.currentIndex).toBe(-1);
  });

  it("is at 0 after init", function() {
    historyService = createMockHistoryService();
    historyService.init();
    expect(historyService.currentIndex).toBe(0);
  });

  var sendSaveEvents = function (type) {
    return callFactory (function () {
      $.publish(Events.PIXETOR_SAVE_STATE, {
        type : type,
        scope : {},
        replay : {}
      });
    });
  };

  it("stores a pixetor snapshot after 5 SAVE", function () {
    // BEFORE
    var SNAPSHOT_PERIOD_BACKUP = pxtr.service.HistoryService.SNAPSHOT_PERIOD;
    pxtr.service.HistoryService.SNAPSHOT_PERIOD = 5;

    historyService = createMockHistoryService();
    historyService.init();

    sendSaveEvents(pxtr.service.HistoryService.REPLAY).times(5);

    expect(historyService.currentIndex).toBe(5);

    expect(getLastState().pixetor).toBe(SERIALIZED_PIXETOR);

    sendSaveEvents(pxtr.service.HistoryService.REPLAY).times(4);
    expect(getLastState().pixetor).toBeUndefined();

    sendSaveEvents(pxtr.service.HistoryService.REPLAY).once();
    expect(getLastState().pixetor).toBe(SERIALIZED_PIXETOR);

    // AFTER
    pxtr.service.HistoryService.SNAPSHOT_PERIOD = SNAPSHOT_PERIOD_BACKUP;

  });
});