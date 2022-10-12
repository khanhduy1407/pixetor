describe("Serialization/Deserialization test", function() {

  beforeEach(function() {
    pxtr.app.pixetorController = {
      getFPS: function () {
        return 1;
      }
    };
  });

  afterEach(function() {
    delete pxtr.app.pixetorController;
  });

  it("serializes frames correctly", function (done) {
    // Create pixetor.
    var descriptor = new pxtr.model.pixetor.Descriptor('pixetorName', 'pixetorDesc');
    var pixetor = new pxtr.model.Pixetor(1, 1, 1, descriptor);
    // Add layer.
    pixetor.addLayer(new pxtr.model.Layer('layer1'));
    // Add frame.
    pixetor.getLayerAt(0).addFrame(pxtr.model.Frame.fromPixelGrid(test.testutils.toFrameGrid([
      ["red", "black"],
      ["blue", "green"]
    ])));

    // Verify the frame is successfully added in the layer.
    expect(pixetor.getLayerAt(0).getFrames().length).toBe(1);

    var serializedPixetor = pxtr.utils.serialization.Serializer.serialize(pixetor);

    var deserializer = pxtr.utils.serialization.Deserializer;
    deserializer.deserialize(JSON.parse(serializedPixetor), function (p) {
      // Check the frame has been properly deserialized
      expect(p.getLayerAt(0).getFrames().length).toBe(1);
      var frame = p.getLayerAt(0).getFrameAt(0);
      test.testutils.frameEqualsGrid(frame, [
        ["red", "black"],
        ["blue", "green"]
      ]);
      done();
    });
  });

  it("serializes layer opacity", function(done) {
    var descriptor = new pxtr.model.pixetor.Descriptor('pixetorName', 'pixetorDesc');
    var pixetor = new pxtr.model.Pixetor(1, 1, 1, descriptor);

    pixetor.addLayer(new pxtr.model.Layer('layer1'));
    pixetor.addLayer(new pxtr.model.Layer('layer2'));
    pixetor.addLayer(new pxtr.model.Layer('layer3'));

    pixetor.getLayerAt(0).setOpacity(0);
    pixetor.getLayerAt(1).setOpacity(0.3);
    pixetor.getLayerAt(2).setOpacity(0.9);

    var frame = new pxtr.model.Frame(1, 1);
    pixetor.getLayers().forEach(function (layer) {
      layer.addFrame(frame);
    });

    var serializedPixetor = pxtr.utils.serialization.Serializer.serialize(pixetor);

    var deserializer = pxtr.utils.serialization.Deserializer;
    deserializer.deserialize(JSON.parse(serializedPixetor), function (p) {
      expect(p.getLayerAt(0).getOpacity()).toBe(0);
      expect(p.getLayerAt(1).getOpacity()).toBe(0.3);
      expect(p.getLayerAt(2).getOpacity()).toBe(0.9);

      // Check the serialization was successful
      expect(p.getLayerAt(0).getFrames().length).toBe(1);
      done();
    });
  });
});
